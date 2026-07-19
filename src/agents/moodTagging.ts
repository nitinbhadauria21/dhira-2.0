import { anthropicJSON, isLiveBrainEnabled } from '@/lib/anthropic';
import { localMoodTag } from '@/lib/localBrain';
import type { MoodTagResult } from '@/lib/types';

/** Mood Tagging Agent (Agent Prompts spec §6.1). Background, JSON only. */
const MOOD_SYSTEM = `You classify the emotional tone of a user's entry. You NEVER talk to the user. Return only JSON. These are soft labels for the mood timeline — never a diagnosis.

Return exactly:
{
  "mood": "happy | calm | neutral | hopeful | stressed | lonely | angry | anxious | overwhelmed | sad",
  "valence": 0.0,
  "emotional_intensity": 0.0,
  "topic_tag": "work | family | relationships | health | finances | self | other"
}
Do not include anything outside the JSON.`;

export async function tagMood(text: string): Promise<MoodTagResult> {
  if (!isLiveBrainEnabled()) return localMoodTag(text);
  try {
    return await anthropicJSON<MoodTagResult>({
      agent: 'moodTagging',
      system: MOOD_SYSTEM,
      userContent: text,
      maxTokens: 120,
    });
  } catch {
    return localMoodTag(text);
  }
}
