import { anthropicText, isLiveBrainEnabled } from '@/lib/anthropic';
import { PRIMARY_SYSTEM_V3 } from '@/agents/prompts/v3Prompts';
import { localPrimaryReply } from '@/lib/localBrain';
import { buildPrimaryMessageBundle } from '@/lib/conversationContext';
import { NEUTRAL_FAILSAFE } from '@/lib/safetyCopy';
import type { Language } from '@/lib/types';
import type { ClaudeTurn } from '@/lib/anthropic';

export interface PrimaryInput {
  history: ClaudeTurn[];
  userMessage: string;
  memorySummary?: string | null;
  conversationSummary?: string | null;
  userPatternProfile?: string | null;
  language: Language;
}

/** Produce Dhira's warm listener draft reply. */
export async function draftReply(input: PrimaryInput): Promise<string> {
  if (!isLiveBrainEnabled()) {
    return localPrimaryReply({ userMessage: input.userMessage, language: input.language });
  }

  const bundle = buildPrimaryMessageBundle({
    historyTurns: input.history,
    conversationSummary: input.conversationSummary ?? null,
    memorySummary: input.memorySummary,
    userPatternProfile: input.userPatternProfile,
    language: input.language,
    userMessage: input.userMessage,
  });

  const system = `${PRIMARY_SYSTEM_V3}\n\n---\n${bundle.systemAppendix}`;
  const messages: ClaudeTurn[] = [...bundle.turns, { role: 'user', content: bundle.userMessage }];

  try {
    return await anthropicText({ agent: 'primaryAgent', system, messages, maxTokens: 300 });
  } catch {
    return localPrimaryReply({ userMessage: input.userMessage, language: input.language }) || NEUTRAL_FAILSAFE;
  }
}
