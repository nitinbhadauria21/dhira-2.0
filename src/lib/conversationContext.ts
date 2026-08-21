import { getStore } from '@/lib/store';
import type { ClaudeTurn } from '@/lib/anthropic';
import type { ChatChannel, ChatMessageRecord, Language, RiskEventRecord } from '@/lib/types';
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

/** Monitor / Escalation context block (summary + recent turns + v3 extras). */
export function formatContextForMonitor(
  summary: string | null,
  turns: ClaudeTurn[],
  extras?: {
    userPatternProfile?: string | null;
    recentRiskSummary?: string | null;
    recentSentReplies?: string | null;
    contextUnavailable?: boolean;
    channel?: ChatChannel;
  },
): string {
  const parts: string[] = [];
  if (extras?.channel === 'whatsapp') {
    parts.push(
      'CURRENT CHANNEL: WhatsApp (merge with app chat for this user when phone is linked on their profile).',
    );
  } else if (extras?.channel === 'telegram') {
    parts.push(
      'CURRENT CHANNEL: Telegram (merge with app chat for this user when Telegram is connected on their profile).',
    );
  } else if (extras?.channel === 'email') {
    parts.push(
      'CURRENT CHANNEL: Email (merge with app chat for this user when their profile check-in email is set).',
    );
  }
  if (extras?.contextUnavailable) {
    parts.push('context_unavailable: true');
  }
  if (extras?.recentRiskSummary?.trim()) {
    parts.push(`RECENT RISK SUMMARY: ${extras.recentRiskSummary.trim()}`);
  }
  if (extras?.recentSentReplies?.trim()) {
    parts.push(extras.recentSentReplies.trim());
  }
  if (extras?.userPatternProfile?.trim()) {
    parts.push(`USER PATTERN PROFILE: ${extras.userPatternProfile.trim()}`);
  }
  if (summary?.trim()) {
    parts.push(`CONVERSATION SO FAR: ${summary.trim()}`);
  }
  if (turns.length > 0) {
    parts.push(formatTurnsTranscript(turns));
  }
  return parts.join('\n\n') || '(no prior conversation)';
}

export function formatRecentRiskSummary(events: RiskEventRecord[]): string | null {
  const elevated = events.filter((e) => e.riskLevel === 'HIGH' || e.riskLevel === 'CRISIS');
  if (!elevated.length) return null;
  const lines = elevated.slice(0, 8).map((e) => {
    const cls = e.riskClassification ? ` ${e.riskClassification}` : '';
    return `${e.riskLevel}${cls} at ${e.createdAt}: ${e.signal}`;
  });
  return lines.join('; ');
}

/** Spec §2.1 — last N Dhira messages actually sent to the user (post-Monitor). */
export function formatRecentSentReplies(messages: ChatMessageRecord[], limit = 6): string | null {
  const dhira = messages.filter((m) => m.role === 'dhira').slice(-limit);
  if (!dhira.length) return null;
  const lines = dhira.map((m, i) => {
    const ch = m.channel ? ` [${m.channel}]` : '';
    return `${i + 1}. (${m.createdAt}${ch}) ${m.content.slice(0, 280)}`;
  });
  return `RECENT SENT REPLIES (do not repeat verbatim):\n${lines.join('\n')}`;
}

export function formatRiskHistory72h(events: RiskEventRecord[]): string | null {
  if (!events.length) return null;
  const lines = events.slice(0, 12).map((e) => {
    const cls = e.riskClassification ? ` ${e.riskClassification}` : '';
    return `- ${e.createdAt}: ${e.riskLevel}${cls} — ${e.signal}`;
  });
  return `RISK HISTORY (72h, cross-channel):\n${lines.join('\n')}`;
}

export function turnsForMoodTagging(turns: ClaudeTurn[], minTurns = 5): ClaudeTurn[] {
  return turns.length >= minTurns ? turns.slice(-Math.max(minTurns, turns.length)) : turns;
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
  const droppedCount = turns.length - TURNS_AFTER_TRIM;

  // Fast path: avoid an extra LLM call while building context (saves 1–3s on long threads).
  return {
    summary: `Earlier in this chat (${droppedCount} turns): emotional sharing and back-and-forth; details omitted for length.`,
    turns: kept,
  };
}

export interface ConversationContext {
  historyTurns: ClaudeTurn[];
  conversationSummary: string | null;
  contextString: string;
  userPatternProfile: string | null;
  recentRiskSummary: string | null;
  recentSentReplies: string | null;
  riskHistory72h: string | null;
  contextUnavailable: boolean;
  rawMessages: ChatMessageRecord[];
}

function hoursAgoIso(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

/** Load store history (before the current user message is saved). */
export async function buildConversationContext(
  uid: string,
  language: Language = 'english',
  opts?: {
    userPatternProfile?: string | null;
    recentRiskSummary?: string | null;
    riskHistory72h?: string | null;
    channel?: ChatChannel;
  },
): Promise<ConversationContext> {
  const store = getStore();
  let raw: ChatMessageRecord[] = [];
  let contextUnavailable = false;
  try {
    raw = await store.getRecentMessages(uid, DEFAULT_FETCH_LIMIT);
  } catch {
    contextUnavailable = true;
    raw = [];
  }
  const recentSentReplies = formatRecentSentReplies(raw);
  const allTurns = messagesToClaudeTurns(raw);
  const { summary, turns } = await trimWithRollingSummary(allTurns, DEFAULT_MAX_TURNS, language);
  const userPatternProfile = opts?.userPatternProfile ?? null;
  const recentRiskSummary = opts?.recentRiskSummary ?? null;
  const riskHistory72h = opts?.riskHistory72h ?? null;
  return {
    historyTurns: turns,
    conversationSummary: summary,
    contextString: formatContextForMonitor(summary, turns, {
      userPatternProfile,
      recentRiskSummary,
      recentSentReplies,
      contextUnavailable,
      channel: opts?.channel,
    }),
    userPatternProfile,
    recentRiskSummary,
    recentSentReplies,
    riskHistory72h,
    contextUnavailable,
    rawMessages: raw,
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
  userPatternProfile?: string | null;
  language: Language;
  userMessage: string;
  contextUnavailable?: boolean;
  channel?: ChatChannel;
}): PrimaryMessageBundle {
  const systemParts: string[] = [];
  if (params.contextUnavailable) {
    systemParts.push('context_unavailable: true');
  }
  systemParts.push(
    params.memorySummary?.trim()
      ? `MEMORY NOTE: ${params.memorySummary.trim()}`
      : 'MEMORY NOTE: none',
  );
  if (params.userPatternProfile?.trim()) {
    systemParts.push(`USER PATTERN PROFILE: ${params.userPatternProfile.trim()}`);
  }
  if (params.conversationSummary?.trim()) {
    systemParts.push(`CONVERSATION SO FAR: ${params.conversationSummary.trim()}`);
  }
  if (params.channel === 'whatsapp') {
    systemParts.push(
      'CURRENT CHANNEL: WhatsApp — same person and thread as in-app chat when their profile phone is linked. Match the language of their latest message.',
    );
  } else if (params.channel === 'telegram') {
    systemParts.push(
      'CURRENT CHANNEL: Telegram — same person and thread as in-app chat when their profile is linked via Connect Telegram. Match the language of their latest message.',
    );
  } else if (params.channel === 'email') {
    systemParts.push(
      'CURRENT CHANNEL: Email — same person and thread as in-app chat when their profile check-in email matches. Match the language of their latest message.',
    );
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
