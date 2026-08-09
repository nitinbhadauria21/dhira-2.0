import { getStore } from '@/lib/store';
import { isLiveBrainEnabled } from '@/lib/anthropic';
import type { ClaudeTurn } from '@/lib/anthropic';
import type { ChatMessageRecord, Language } from '@/lib/types';
import { summarizeMemory } from '@/agents/memory';
import { CRISIS_MESSAGE } from '@/lib/safetyCopy';

export const ESCALATE_CRISIS_TOKEN = 'ESCALATE_CRISIS';

export const DEFAULT_FETCH_LIMIT = 32;
export const DEFAULT_MAX_TURNS = 16;
export const TURNS_AFTER_TRIM = 8;

const CRISIS_HISTORY_MARKER = '[safety resources were shared here]';

export function sanitizeAssistantContentForModel(content: string): string {
  if (content.includes('Tele-MANAS') || content.includes('14416')) {
    return CRISIS_HISTORY_MARKER;
  }
  if (content.trim() === CRISIS_MESSAGE.trim()) {
    return CRISIS_HISTORY_MARKER;
  }
  return content;
}

export function messagesToClaudeTurns(messages: ChatMessageRecord[]): ClaudeTurn[] {
  return messages.map((m) => ({
    role: m.role === 'dhira' ? 'assistant' : 'user',
    content:
      m.role === 'dhira' ? sanitizeAssistantContentForModel(m.content) : m.content,
  }));
}

export function formatTurnsTranscript(turns: ClaudeTurn[]): string {
  return turns
    .map((t) => `${t.role === 'assistant' ? 'Dhira' : 'User'}: ${t.content}`)
    .join('\n');
}

/** Monitor / Escalation context block (summary + recent turns). */
export function formatContextForMonitor(summary: string | null, turns: ClaudeTurn[]): string {
  const parts: string[] = [];
  if (summary?.trim()) {
    parts.push(`CONVERSATION SO FAR: ${summary.trim()}`);
  }
  if (turns.length > 0) {
    parts.push(formatTurnsTranscript(turns));
  }
  return parts.join('\n\n') || '(no prior conversation)';
}

export interface TrimmedConversation {
  summary: string | null;
  turns: ClaudeTurn[];
}

/** Keep up to maxTurns; if longer, summarize prefix and keep last TURNS_AFTER_TRIM turns. */
export async function trimWithRollingSummary(
  turns: ClaudeTurn[],
  maxTurns: number = DEFAULT_MAX_TURNS,
  language: Language = 'english',
): Promise<TrimmedConversation> {
  if (turns.length <= maxTurns) {
    return { summary: null, turns };
  }

  const kept = turns.slice(-TURNS_AFTER_TRIM);
  const dropped = turns.slice(0, turns.length - TURNS_AFTER_TRIM);
  const droppedText = formatTurnsTranscript(dropped);

  if (!isLiveBrainEnabled()) {
    return {
      summary: `Earlier in this chat (${dropped.length} turns): emotional sharing and back-and-forth; details omitted for length.`,
      turns: kept,
    };
  }

  try {
    const mem = await summarizeMemory({ conversation: droppedText, language });
    const arc = mem.summary;
    return {
      summary: arc || `Earlier conversation (${dropped.length} turns) included ongoing distress and personal topics.`,
      turns: kept,
    };
  } catch {
    return {
      summary: `Earlier in this chat (${dropped.length} turns): ongoing emotional conversation.`,
      turns: kept,
    };
  }
}

export interface ConversationContext {
  historyTurns: ClaudeTurn[];
  conversationSummary: string | null;
  contextString: string;
}

/** Load store history (before the current user message is saved). */
export async function buildConversationContext(
  uid: string,
  language: Language = 'english',
): Promise<ConversationContext> {
  const store = getStore();
  const raw = await store.getRecentMessages(uid, DEFAULT_FETCH_LIMIT);
  const allTurns = messagesToClaudeTurns(raw);
  const { summary, turns } = await trimWithRollingSummary(allTurns, DEFAULT_MAX_TURNS, language);
  return {
    historyTurns: turns,
    conversationSummary: summary,
    contextString: formatContextForMonitor(summary, turns),
  };
}

export interface PrimaryMessageBundle {
  systemAppendix: string;
  turns: ClaudeTurn[];
  userMessage: string;
}

/** Shape Primary Agent LLM input (system lines folded into appendix; user message clean). */
export function buildPrimaryMessageBundle(params: {
  historyTurns: ClaudeTurn[];
  conversationSummary: string | null;
  memorySummary?: string | null;
  language: Language;
  userMessage: string;
}): PrimaryMessageBundle {
  const systemParts: string[] = [];
  systemParts.push(
    params.memorySummary?.trim()
      ? `MEMORY NOTE: ${params.memorySummary.trim()}`
      : 'MEMORY NOTE: none',
  );
  if (params.conversationSummary?.trim()) {
    systemParts.push(`CONVERSATION SO FAR: ${params.conversationSummary.trim()}`);
  }
  systemParts.push(`(The user is writing in ${params.language}. Match their language.)`);

  return {
    systemAppendix: systemParts.join('\n\n'),
    turns: params.historyTurns,
    userMessage: params.userMessage,
  };
}

export function isEscalateCrisisDraft(draft: string): boolean {
  return draft.trim() === ESCALATE_CRISIS_TOKEN;
}
