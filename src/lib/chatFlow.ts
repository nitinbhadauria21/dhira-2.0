import { randomUUID } from 'crypto';
import { isLiveBrainEnabled } from '@/lib/anthropic';
import { getStore } from '@/lib/store';
import { checkRisk } from '@/agents/escalation';
import { draftReply } from '@/agents/primary';
import { reviewReply } from '@/agents/monitor';
import { tagMood } from '@/agents/moodTagging';
import { summarizeMemory } from '@/agents/memory';
import { CRISIS_MESSAGE } from '@/lib/safetyCopy';
import {
  buildConversationContext,
  formatRecentRiskSummary,
  formatRiskHistory72h,
  isEscalateCrisisDraft,
  turnsForMoodTagging,
} from '@/lib/conversationContext';
import { mergePatternProfile } from '@/lib/localBrain';
import {
  setBrainCallContext,
  recordBrainUsed,
  getLiveBrainTelemetry,
  type BrainUsed,
} from '@/lib/liveBrainTelemetry';
import { LIVE_PROMPT_VERSION } from '@/agents/prompts/agentPromptsLive';
import {
  holdingReply,
  LiveBrainUnavailableError,
  mayUseOfflineDemoTemplates,
} from '@/lib/brainPolicy';
import {
  shouldUseEarlyCrisisHandoff,
  sanityCheckMonitor,
  debugRiskLog,
  isTrivialLowRiskMessage,
  contextHasElevatedRisk,
} from '@/lib/riskSanity';
import type { ChatChannel, Language, RiskLevel } from '@/lib/types';
import type { EscalationResult } from '@/lib/types';
import { languageForTurn } from '@/lib/inferLanguage';

export interface ChatTurnResult {
  reply: string;
  crisis: boolean;
  showReferralCard: boolean;
  riskLevel: RiskLevel;
  mood?: string;
  topicTag?: string;
  moodTagSource?: 'live' | 'offline';
  brainUsed?: BrainUsed;
}

function hoursAgoIso(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function liveFailedDuringTurn(fallbackCountAtTurnStart: number): boolean {
  return getLiveBrainTelemetry().fallbackCount > fallbackCountAtTurnStart;
}

export async function runChatTurn(params: {
  uid: string;
  userMessage: string;
  channel?: ChatChannel;
}): Promise<ChatTurnResult> {
  const { uid, userMessage, channel = 'app' } = params;
  setBrainCallContext({ channel });
  const liveConfigured = isLiveBrainEnabled();
  const fallbackCountAtTurnStart = getLiveBrainTelemetry().fallbackCount;
  const store = getStore();
  const profile = await store.getOrCreateProfile(uid);
  const turnLanguage = languageForTurn({
    channel,
    userMessage,
    profileLanguage: profile.language,
  });
  const now = () => new Date().toISOString();

  const risk72hEvents = await store.getRiskEventsForProfileSince(uid, hoursAgoIso(72));
  const riskHistory72h = formatRiskHistory72h(risk72hEvents);
  const recentRiskSummary = formatRecentRiskSummary(risk72hEvents);

  const convo = await buildConversationContext(uid, turnLanguage, {
    userPatternProfile: profile.userPatternProfile,
    recentRiskSummary,
    riskHistory72h,
    channel,
  });

  await store.addMessage({
    id: randomUUID(),
    profileId: uid,
    role: 'user',
    content: userMessage,
    channel,
    createdAt: now(),
  });

  const moodContextTurns = turnsForMoodTagging([
    ...convo.historyTurns,
    { role: 'user', content: userMessage },
  ]);

  const risk = await checkRisk({
    userMessage,
    context: convo.contextString,
    userPatternProfile: profile.userPatternProfile,
    recentRiskSummary,
    riskHistory72h: riskHistory72h ?? undefined,
    contextUnavailable: convo.contextUnavailable,
  });

  const finish = (
    partial: Omit<ChatTurnResult, 'brainUsed'>,
    brainUsedOverride?: BrainUsed,
  ): ChatTurnResult => {
    const fellBackDuringTurn = liveFailedDuringTurn(fallbackCountAtTurnStart);
    let brainUsed: BrainUsed =
      brainUsedOverride ??
      (liveConfigured && !fellBackDuringTurn ? 'live' : mayUseOfflineDemoTemplates() ? 'offline' : 'holding');
    if (!brainUsedOverride && fellBackDuringTurn && !mayUseOfflineDemoTemplates()) {
      brainUsed = 'holding';
    }
    recordBrainUsed({
      brainUsed,
      channel,
      riskLevel: partial.riskLevel,
      moodLabel: partial.mood ?? (brainUsed === 'holding' ? 'untagged' : undefined),
      moodTagSource: partial.moodTagSource,
      promptVersion: LIVE_PROMPT_VERSION,
    });
    return { ...partial, brainUsed };
  };

  const completeHoldingTurn = async (
    riskLevel: RiskLevel,
    escalation: EscalationResult,
  ): Promise<ChatTurnResult> => {
    const reply = holdingReply(turnLanguage);
    await store.addMessage({
      id: randomUUID(),
      profileId: uid,
      role: 'dhira',
      content: reply,
      channel,
      createdAt: now(),
    });
    const showReferralCard =
      riskLevel === 'MEDIUM' ||
      riskLevel === 'HIGH' ||
      escalation.risk_level === 'MEDIUM' ||
      escalation.risk_level === 'HIGH';
    if (showReferralCard) {
      await store.addRiskEvent({
        id: randomUUID(),
        profileId: uid,
        riskLevel: riskLevel === 'HIGH' || escalation.risk_level === 'HIGH' ? 'HIGH' : 'MEDIUM',
        signal: escalation.signal || 'distress (holding path)',
        riskClassification: escalation.classification ?? null,
        handled: true,
        createdAt: now(),
      });
    }
    return finish(
      {
        reply,
        crisis: false,
        showReferralCard,
        riskLevel,
      },
      'holding',
    );
  };

  if (shouldUseEarlyCrisisHandoff(risk)) {
    debugRiskLog({ path: 'early_crisis', risk, userMessage: userMessage.slice(0, 80) });
    await store.addRiskEvent({
      id: randomUUID(),
      profileId: uid,
      riskLevel: 'CRISIS',
      signal: risk.signal || 'self-harm / crisis language detected',
      riskClassification: risk.classification ?? null,
      handled: true,
      createdAt: now(),
    });
    await store.addMessage({
      id: randomUUID(),
      profileId: uid,
      role: 'dhira',
      content: CRISIS_MESSAGE,
      channel,
      createdAt: now(),
    });
    return finish({
      reply: CRISIS_MESSAGE,
      crisis: true,
      showReferralCard: false,
      riskLevel: 'CRISIS',
    });
  }

  if (!liveConfigured && !mayUseOfflineDemoTemplates()) {
    return completeHoldingTurn(risk.risk_level, risk);
  }

  try {
    const memory = profile.consentMemory ? await store.getLatestMemory(uid) : null;
    const draft = await draftReply({
      history: convo.historyTurns,
      conversationSummary: convo.conversationSummary,
      userMessage,
      memorySummary: memory?.summary ?? null,
      userPatternProfile: profile.userPatternProfile,
      language: turnLanguage,
      contextUnavailable: convo.contextUnavailable,
      channel,
    });

    if (liveFailedDuringTurn(fallbackCountAtTurnStart) && !mayUseOfflineDemoTemplates()) {
      return completeHoldingTurn(risk.risk_level, risk);
    }

    const primaryEscalate =
      isEscalateCrisisDraft(draft) &&
      !(isTrivialLowRiskMessage(userMessage) && !contextHasElevatedRisk(convo.contextString));

    if (primaryEscalate) {
      debugRiskLog({ path: 'primary_escalate_crisis', draft, userMessage });
      await store.addRiskEvent({
        id: randomUUID(),
        profileId: uid,
        riskLevel: 'CRISIS',
        signal: 'primary ESCALATE_CRISIS',
        riskClassification: 'genuine_risk_self',
        handled: true,
        createdAt: now(),
      });
      await store.addMessage({
        id: randomUUID(),
        profileId: uid,
        role: 'dhira',
        content: CRISIS_MESSAGE,
        channel,
        createdAt: now(),
      });
      return finish({
        reply: CRISIS_MESSAGE,
        crisis: true,
        showReferralCard: false,
        riskLevel: 'CRISIS',
      });
    }

    let reviewed = await reviewReply({
      userMessage,
      context: convo.contextString,
      draftReply: draft,
      escalation: risk,
      userPatternProfile: profile.userPatternProfile,
      recentSentReplies: convo.recentSentReplies,
      contextUnavailable: convo.contextUnavailable,
    });
    reviewed = sanityCheckMonitor(userMessage, convo.contextString, reviewed);

    if (liveFailedDuringTurn(fallbackCountAtTurnStart) && !mayUseOfflineDemoTemplates()) {
      return completeHoldingTurn(reviewed.risk_level, risk);
    }

    debugRiskLog({
      draft: draft.slice(0, 120),
      monitorDecision: reviewed.decision,
      monitorRisk: reviewed.risk_level,
      escalation: risk,
      recentSentReplies: convo.recentSentReplies?.slice(0, 200),
      userMessage: userMessage.slice(0, 80),
    });

    if (reviewed.decision === 'BLOCK_AND_REPLACE' && reviewed.risk_level === 'CRISIS') {
      await store.addRiskEvent({
        id: randomUUID(),
        profileId: uid,
        riskLevel: 'CRISIS',
        signal: reviewed.issues_found.join('; ') || 'monitor crisis block',
        riskClassification: risk.classification ?? 'genuine_risk_self',
        handled: true,
        createdAt: now(),
      });
      await store.addMessage({
        id: randomUUID(),
        profileId: uid,
        role: 'dhira',
        content: reviewed.approved_or_rewritten_response,
        channel,
        createdAt: now(),
      });
      return finish({
        reply: reviewed.approved_or_rewritten_response,
        crisis: true,
        showReferralCard: false,
        riskLevel: 'CRISIS',
      });
    }

    const finalReply = reviewed.approved_or_rewritten_response;

    await store.addMessage({
      id: randomUUID(),
      profileId: uid,
      role: 'dhira',
      content: finalReply,
      channel,
      createdAt: now(),
    });

    let taggedMood: string | undefined;
    let taggedTopic: string | undefined;
    let moodTagSource: 'live' | 'offline' | undefined;
    const mayTagMood = mayUseOfflineDemoTemplates() || (liveConfigured && !liveFailedDuringTurn(fallbackCountAtTurnStart));
    if (mayTagMood) {
      try {
        const mood = await tagMood({
          text: userMessage,
          recentTurns: moodContextTurns,
          channel,
        });
        taggedMood = mood.mood;
        taggedTopic = mood.topic_tag;
        moodTagSource = mood.moodTagSource;
        await store.addMood({
          id: randomUUID(),
          profileId: uid,
          mood: mood.mood,
          valence: mood.valence,
          emotionalIntensity: mood.emotional_intensity,
          topicTag: mood.topic_tag,
          source: 'chat',
          moodTagSource: mood.moodTagSource,
          createdAt: now(),
        });
      } catch (err) {
        if (err instanceof LiveBrainUnavailableError && !mayUseOfflineDemoTemplates()) {
          /* holding path: no keyword mood */
        }
      }
    }

    if (profile.consentMemory) {
      try {
        const prior = await store.getRecentMessages(uid, 8);
        const convoText = prior.map((m) => `${m.role}: ${m.content}`).join('\n');
        const mem = await summarizeMemory({
          conversation: convoText,
          language: turnLanguage,
          channel,
        });
        await store.addMemory({
          id: randomUUID(),
          profileId: uid,
          summary: mem.summary,
          mood: mem.mood,
          topicTag: mem.topic_tag,
          carryForward: mem.carry_forward,
          createdAt: now(),
        });
        const mergedProfile = mergePatternProfile(profile.userPatternProfile, mem.pattern_profile_update);
        if (mergedProfile !== profile.userPatternProfile) {
          await store.updateProfile(uid, { userPatternProfile: mergedProfile });
        }
      } catch {
        /* best-effort */
      }
    }

    const showReferralCard =
      reviewed.risk_level === 'MEDIUM' ||
      reviewed.risk_level === 'HIGH' ||
      risk.risk_level === 'MEDIUM' ||
      risk.risk_level === 'HIGH';

    if (showReferralCard) {
      await store.addRiskEvent({
        id: randomUUID(),
        profileId: uid,
        riskLevel: reviewed.risk_level === 'HIGH' || risk.risk_level === 'HIGH' ? 'HIGH' : 'MEDIUM',
        signal: risk.signal || reviewed.issues_found.join('; ') || 'distress',
        riskClassification: risk.classification ?? null,
        handled: true,
        createdAt: now(),
      });
    }

    return finish({
      reply: finalReply,
      crisis: false,
      showReferralCard,
      riskLevel: reviewed.risk_level,
      mood: taggedMood,
      topicTag: taggedTopic,
      moodTagSource,
    });
  } catch (err) {
    if (err instanceof LiveBrainUnavailableError || (!mayUseOfflineDemoTemplates() && liveConfigured)) {
      return completeHoldingTurn(risk.risk_level, risk);
    }
    throw err;
  }
}
