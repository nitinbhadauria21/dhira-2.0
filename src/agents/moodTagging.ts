import { anthropicJSON, isLiveBrainEnabled } from '@/lib/anthropic';
import { MOOD_LIVE_SYSTEM } from '@/agents/prompts/agentPromptsLive';
import { formatTurnsTranscript } from '@/lib/conversationContext';
import { localMoodTag } from '@/lib/localBrain';
import { LiveBrainUnavailableError, mayUseOfflineDemoTemplates } from '@/lib/brainPolicy';
import { recordLiveBrainFallback, getBrainCallContext } from '@/lib/liveBrainTelemetry';
import type { MoodTagResult, ChatChannel } from '@/lib/types';
import type { ClaudeTurn } from '@/lib/anthropic';

export type MoodTagOutcome = MoodTagResult & { moodTagSource: 'live' | 'offline' };

export async function tagMood(params: {
  text: string;
  recentTurns?: ClaudeTurn[];
  channel?: ChatChannel;
}): Promise<MoodTagOutcome> {
  const { text, recentTurns = [], channel = 'app' } = params;

  if (!isLiveBrainEnabled()) {
    if (!mayUseOfflineDemoTemplates()) {
      throw new LiveBrainUnavailableError('no live brain for mood tagging');
    }
    return { ...localMoodTag(text), moodTagSource: 'offline' };
  }

  const transcript =
    recentTurns.length > 0
      ? formatTurnsTranscript(recentTurns)
      : `(single message only)\nUser: ${text}`;

  const userContent = `Channel: ${channel}\n\nRECENT CONVERSATION (newest last):\n${transcript}\n\nCLASSIFY MOOD FOR THE USER'S LATEST MESSAGE (last user line above).`;

  try {
    const result = await anthropicJSON<MoodTagResult>({
      agent: 'moodTagging',
      system: MOOD_LIVE_SYSTEM,
      userContent,
      maxTokens: 150,
    });
    return { ...result, moodTagSource: 'live' };
  } catch (err) {
    recordLiveBrainFallback({
      agent: 'moodTagging',
      reason: 'tagMood failed',
      detail: err instanceof Error ? err.message : String(err),
      channel: channel ?? getBrainCallContext().channel,
      critical: false,
    });
    if (!mayUseOfflineDemoTemplates()) {
      throw new LiveBrainUnavailableError('mood tagging live call failed');
    }
    return { ...localMoodTag(text), moodTagSource: 'offline' };
  }
}

/** @deprecated Use tagMood({ text }) — kept for callers passing a string only. */
export async function tagMoodFromText(text: string): Promise<MoodTagOutcome> {
  return tagMood({ text });
}
