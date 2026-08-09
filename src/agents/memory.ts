import { anthropicJSON, isLiveBrainEnabled } from '@/lib/anthropic';
import { localMemory } from '@/lib/localBrain';
import type { ChatChannel, MemoryResult, Language } from '@/lib/types';

/** Memory Agent — "Dhira remembers" (Agent Prompts v3 §6.2). JSON only. */
const MEMORY_SYSTEM = `You summarise a finished conversation into a short, safe memory note. You NEVER talk to the user. Return only JSON.

Write a 1-2 sentence gist in warm plain language — no clinical terms, no diagnosis. Anonymous-first; no PII.

Also UPDATE the user-pattern profile: how this user communicates (register, slang, humour, stress patterns). Behavioural only — no diagnosis.

Return exactly:
{
  "summary": "1-2 sentence gist",
  "mood": "overall mood label",
  "topic_tag": "work | family | relationships | health | finances | self | other",
  "carry_forward": "one gentle follow-up for next time",
  "channel": "app | whatsapp",
  "pattern_profile_update": "1-3 sentences merged with existing profile"
}`;

export async function summarizeMemory(params: {
  conversation: string;
  language: Language;
  channel?: ChatChannel;
}): Promise<MemoryResult> {
  if (!isLiveBrainEnabled()) return localMemory(params);
  try {
    const result = await anthropicJSON<MemoryResult>({
      agent: 'memoryAgent',
      system: MEMORY_SYSTEM,
      userContent: `Channel: ${params.channel ?? 'app'}\n\n${params.conversation}`,
      maxTokens: 280,
    });
    return { ...result, channel: result.channel ?? params.channel ?? 'app' };
  } catch {
    return localMemory(params);
  }
}
