import { anthropicJSON, isLiveBrainEnabled } from '@/lib/anthropic';
import { localMemory } from '@/lib/localBrain';
import type { MemoryResult, Language } from '@/lib/types';

/** Memory Agent — "Dhira remembers" (Agent Prompts spec §6.2). JSON only. */
const MEMORY_SYSTEM = `You summarise a finished conversation into a short, safe memory note. You NEVER talk to the user. Return only JSON.

Write a 1-2 sentence gist of what the user shared and how they seemed, in warm plain language — no clinical terms, no diagnosis. Store only what helps continuity. Never store identifying personal data (names, numbers, addresses). Anonymous-first.

Return exactly:
{
  "summary": "1-2 sentence gist in warm plain language",
  "mood": "the overall mood",
  "topic_tag": "work | family | relationships | health | finances | self | other",
  "carry_forward": "one gentle thing Dhira could softly follow up on next time"
}
Do not include anything outside the JSON.`;

export async function summarizeMemory(params: {
  conversation: string;
  language: Language;
}): Promise<MemoryResult> {
  if (!isLiveBrainEnabled()) return localMemory(params);
  try {
    return await anthropicJSON<MemoryResult>({
      agent: 'memoryAgent',
      system: MEMORY_SYSTEM,
      userContent: params.conversation,
      maxTokens: 200,
    });
  } catch {
    return localMemory(params);
  }
}
