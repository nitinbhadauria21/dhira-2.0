import { anthropicText, isLiveBrainEnabled } from '@/lib/anthropic';
import { localProactive } from '@/lib/localBrain';
import type { Language } from '@/lib/types';

/** Proactive Check-in Agent (Agent Prompts spec §6.4). Output goes to the Monitor. */
const PROACTIVE_SYSTEM = `You write ONE short, caring, unprompted message from Dhira — like an older sibling texting to check in. You never break persona.

RULES
- Warm, brief (1-2 sentences), no pressure, easy to ignore.
- If a memory note is provided, reference it gently.
- No advice, no diagnosis, no guilt about missed days.
- Match the user's language (English / Hindi / Hinglish).

Return just the message text (no JSON).`;

export async function draftCheckin(params: {
  carryForward?: string | null;
  memorySummary?: string | null;
  language: Language;
}): Promise<string> {
  if (!isLiveBrainEnabled()) {
    return localProactive({ carryForward: params.carryForward ?? undefined, language: params.language });
  }

  const context: string[] = [`(User's language: ${params.language}. Match it.)`];
  if (params.memorySummary) context.push(`(Last time: "${params.memorySummary}")`);
  if (params.carryForward) context.push(`(Gentle thread to follow up on: "${params.carryForward}")`);

  try {
    return await anthropicText({
      agent: 'proactiveCheckin',
      system: PROACTIVE_SYSTEM,
      messages: [{ role: 'user', content: `${context.join('\n')}\n\nWrite the check-in message now.` }],
      maxTokens: 120,
    });
  } catch {
    return localProactive({ carryForward: params.carryForward ?? undefined, language: params.language });
  }
}
