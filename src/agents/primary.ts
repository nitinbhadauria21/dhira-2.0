import { anthropicText, isLiveBrainEnabled } from '@/lib/anthropic';
import { PRIMARY_LIVE_SYSTEM } from '@/agents/prompts/agentPromptsLive';
import { localPrimaryReply } from '@/lib/localBrain';
import { buildPrimaryMessageBundle } from '@/lib/conversationContext';
import { LiveBrainUnavailableError, mayUseOfflineDemoTemplates } from '@/lib/brainPolicy';
import { NEUTRAL_FAILSAFE } from '@/lib/safetyCopy';
import type { ChatChannel, Language } from '@/lib/types';
import type { ClaudeTurn } from '@/lib/anthropic';

export interface PrimaryInput {
  history: ClaudeTurn[];
  userMessage: string;
  memorySummary?: string | null;
  conversationSummary?: string | null;
  userPatternProfile?: string | null;
  language: Language;
  language2?: Language | null;
  contextUnavailable?: boolean;
  channel?: ChatChannel;
}

/** Produce Dhira's warm listener draft reply. */
export async function draftReply(input: PrimaryInput): Promise<string> {
  if (!isLiveBrainEnabled()) {
    if (!mayUseOfflineDemoTemplates()) {
      throw new LiveBrainUnavailableError('no live brain key');
    }
    return localPrimaryReply({ userMessage: input.userMessage, language: input.language });
  }

  const bundle = buildPrimaryMessageBundle({
    historyTurns: input.history,
    conversationSummary: input.conversationSummary ?? null,
    memorySummary: input.memorySummary,
    userPatternProfile: input.userPatternProfile,
    language: input.language,
    language2: input.language2,
    userMessage: input.userMessage,
    contextUnavailable: input.contextUnavailable,
    channel: input.channel,
  });

  const system = `${PRIMARY_LIVE_SYSTEM}\n\n---\n${bundle.systemAppendix}`;
  const messages: ClaudeTurn[] = [...bundle.turns, { role: 'user', content: bundle.userMessage }];

  try {
    return await anthropicText({ agent: 'primaryAgent', system, messages, maxTokens: 300 });
  } catch {
    if (!mayUseOfflineDemoTemplates()) {
      throw new LiveBrainUnavailableError('primary live call failed');
    }
    return localPrimaryReply({ userMessage: input.userMessage, language: input.language }) || NEUTRAL_FAILSAFE;
  }
}
