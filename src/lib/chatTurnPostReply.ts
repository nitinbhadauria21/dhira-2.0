import { randomUUID } from 'crypto';
import { tagMood } from '@/agents/moodTagging';
import { summarizeMemory } from '@/agents/memory';
import { getStore } from '@/lib/store';
import { mergePatternProfile } from '@/lib/localBrain';
import { LiveBrainUnavailableError, mayUseOfflineDemoTemplates } from '@/lib/brainPolicy';
import { isLiveBrainEnabled } from '@/lib/anthropic';
import type { ClaudeTurn } from '@/lib/anthropic';
import type { ChatChannel, EscalationResult, Language, RiskLevel } from '@/lib/types';

/** Work that can run after the user already received Dhira's reply (mood, memory, risk log). */
export interface ChatTurnPostReplyWork {
  uid: string;
  userMessage: string;
  channel: ChatChannel;
  turnLanguage: Language;
  moodContextTurns: ClaudeTurn[];
  consentMemory: boolean;
  userPatternProfile: string | null;
  showReferralCard: boolean;
  risk: EscalationResult;
  reviewedRiskLevel: RiskLevel;
  reviewedIssues: string[];
}

export async function runChatTurnPostReplyEnrichment(work: ChatTurnPostReplyWork): Promise<void> {
  const store = getStore();
  const now = () => new Date().toISOString();
  const liveConfigured = isLiveBrainEnabled();
  const mayTagMood = mayUseOfflineDemoTemplates() || liveConfigured;

  if (mayTagMood) {
    try {
      const mood = await tagMood({
        text: work.userMessage,
        recentTurns: work.moodContextTurns,
        channel: work.channel,
      });
      await store.addMood({
        id: randomUUID(),
        profileId: work.uid,
        mood: mood.mood,
        valence: mood.valence,
        emotionalIntensity: mood.emotional_intensity,
        topicTag: mood.topic_tag,
        source: 'chat',
        moodTagSource: mood.moodTagSource,
        createdAt: now(),
      });
    } catch (err) {
      if (!(err instanceof LiveBrainUnavailableError && !mayUseOfflineDemoTemplates())) {
        console.error('[chatTurnPostReply] mood enrichment failed', err);
      }
    }
  }

  if (work.consentMemory) {
    try {
      const prior = await store.getRecentMessages(work.uid, 8);
      const convoText = prior.map((m) => `${m.role}: ${m.content}`).join('\n');
      const mem = await summarizeMemory({
        conversation: convoText,
        language: work.turnLanguage,
        channel: work.channel,
      });
      await store.addMemory({
        id: randomUUID(),
        profileId: work.uid,
        summary: mem.summary,
        mood: mem.mood,
        topicTag: mem.topic_tag,
        carryForward: mem.carry_forward,
        createdAt: now(),
      });
      const mergedProfile = mergePatternProfile(work.userPatternProfile, mem.pattern_profile_update);
      if (mergedProfile !== work.userPatternProfile) {
        await store.updateProfile(work.uid, { userPatternProfile: mergedProfile });
      }
    } catch (err) {
      console.error('[chatTurnPostReply] memory enrichment failed', err);
    }
  }

  if (work.showReferralCard) {
    try {
      await store.addRiskEvent({
        id: randomUUID(),
        profileId: work.uid,
        riskLevel:
          work.reviewedRiskLevel === 'HIGH' || work.risk.risk_level === 'HIGH' ? 'HIGH' : 'MEDIUM',
        signal: work.risk.signal || work.reviewedIssues.join('; ') || 'distress',
        riskClassification: work.risk.classification ?? null,
        handled: true,
        createdAt: now(),
      });
    } catch (err) {
      console.error('[chatTurnPostReply] risk event failed', err);
    }
  }
}
