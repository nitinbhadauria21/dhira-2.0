import { randomUUID } from 'crypto';
import { isLiveBrainEnabled } from '@/lib/anthropic';
import { getStore } from '@/lib/store';
import { checkRisk } from '@/agents/escalation';
import { draftReply } from '@/agents/primary';
import { reviewReply } from '@/agents/monitor';
import { CRISIS_MESSAGE } from '@/lib/safetyCopy';
import {
  buildConversationContext,
  formatContextForMonitor,
  formatRecentRiskSummary,
  formatRiskHistory72h,
  isEscalateCrisisDraft,
  turnsForMoodTagging,
} from '@/lib/conversationContext';
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
import { sanitizeDhiraReplyForDisplay } from '@/lib/dhiraReplySanitize';
import type { ChatChannel, RiskLevel } from '@/lib/types';
import type { EscalationResult } from '@/lib/types';
import { languageForTurn } from '@/lib/inferLanguage';
import type { ChatTurnPostReplyWork } from '@/lib/chatTurnPostReply';

export interface ChatTurnOutcome {
  result: ChatTurnResult;
  postReply?: ChatTurnPostReplyWork;
}

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

function liveCriticalFailedDuringTurn(criticalFailuresAtTurnStart: number): boolean {
  return getLiveBrainTelemetry().criticalFailureCount > criticalFailuresAtTurnStart;
}

function logChatTiming(label: string, startMs: number): void {
  if (process.env.DHIRA_LOG_CHAT_TIMING === '1') {
    console.info(`CHAT_TIMING ${label}: ${Date.now() - startMs}ms`);
  }
}

function wrap(result: ChatTurnResult, postReply?: ChatTurnPostReplyWork): ChatTurnOutcome {
  return postReply ? { result, postReply } : { result };
}

export async function runChatTurn(params: {
  uid: string;
  userMessage: string;
  channel?: ChatChannel;
}): Promise<ChatTurnOutcome> {
  const turnStarted = Date.now();
  const { uid, userMessage, channel = 'app' } = params;
  setBrainCallContext({ channel });
  const liveConfigured = isLiveBrainEnabled();
  const criticalFailuresAtTurnStart = getLiveBrainTelemetry().criticalFailureCount;
  const store = getStore();

  const profile = await store.getOrCreateProfile(uid);
  const turnLanguage = languageForTurn({
    channel,
    userMessage,
    profileLanguage: profile.language,
  });

  const [risk72hEvents, convo] = await Promise.all([
    store.getRiskEventsForProfileSince(uid, hoursAgoIso(72)),
    buildConversationContext(uid, turnLanguage, {
      userPatternProfile: profile.userPatternProfile,
      channel,
    }),
  ]);
  const riskHistory72h = formatRiskHistory72h(risk72hEvents);
  const recentRiskSummary = formatRecentRiskSummary(risk72hEvents);
  if (recentRiskSummary || riskHistory72h) {
    convo.recentRiskSummary = recentRiskSummary;
    convo.riskHistory72h = riskHistory72h;
    convo.contextString = formatContextForMonitor(convo.conversationSummary, convo.historyTurns, {
      userPatternProfile: profile.userPatternProfile,
      recentRiskSummary,
      recentSentReplies: convo.recentSentReplies,
      contextUnavailable: convo.contextUnavailable,
      channel,
    });
    if (riskHistory72h) {
      convo.contextString = `${riskHistory72h}\n\n${convo.contextString}`;
    }
  }
  logChatTiming('context_ready', turnStarted);

  const now = () => new Date().toISOString();

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

  const finish = (
    partial: Omit<ChatTurnResult, 'brainUsed'>,
    brainUsedOverride?: BrainUsed,
  ): ChatTurnResult => {
    const fellBackDuringTurn = liveCriticalFailedDuringTurn(criticalFailuresAtTurnStart);
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
    logChatTiming('turn_total', turnStarted);
    return { ...partial, brainUsed };
  };

  const completeHoldingTurn = async (
    riskLevel: RiskLevel,
    escalation: EscalationResult,
  ): Promise<ChatTurnOutcome> => {
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
    return wrap(
      finish(
        {
          reply,
          crisis: false,
          showReferralCard,
          riskLevel,
        },
        'holding',
      ),
    );
  };

  const brainStarted = Date.now();
  const draftPromise = (async () => {
    const memory = profile.consentMemory ? await store.getLatestMemory(uid) : null;
    return draftReply({
      history: convo.historyTurns,
      conversationSummary: convo.conversationSummary,
      userMessage,
      memorySummary: memory?.summary ?? null,
      userPatternProfile: profile.userPatternProfile,
      language: turnLanguage,
      contextUnavailable: convo.contextUnavailable,
      channel,
    });
  })();

  const risk = await checkRisk({
    userMessage,
    context: convo.contextString,
    userPatternProfile: profile.userPatternProfile,
    recentRiskSummary,
    riskHistory72h: riskHistory72h ?? undefined,
    contextUnavailable: convo.contextUnavailable,
  });
  logChatTiming('escalation_done', brainStarted);

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
    return wrap(
      finish({
        reply: CRISIS_MESSAGE,
        crisis: true,
        showReferralCard: false,
        riskLevel: 'CRISIS',
      }),
    );
  }

  if (!liveConfigured && !mayUseOfflineDemoTemplates()) {
    return completeHoldingTurn(risk.risk_level, risk);
  }

  try {
    const draft = await draftPromise;
    logChatTiming('primary_done', brainStarted);

    if (liveCriticalFailedDuringTurn(criticalFailuresAtTurnStart) && !mayUseOfflineDemoTemplates()) {
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
      return wrap(
        finish({
          reply: CRISIS_MESSAGE,
          crisis: true,
          showReferralCard: false,
          riskLevel: 'CRISIS',
        }),
      );
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
    logChatTiming('monitor_done', brainStarted);

    if (liveCriticalFailedDuringTurn(criticalFailuresAtTurnStart) && !mayUseOfflineDemoTemplates()) {
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
      return wrap(
        finish({
          reply: reviewed.approved_or_rewritten_response,
          crisis: true,
          showReferralCard: false,
          riskLevel: 'CRISIS',
        }),
      );
    }

    const finalReply = sanitizeDhiraReplyForDisplay(reviewed.approved_or_rewritten_response);

    await store.addMessage({
      id: randomUUID(),
      profileId: uid,
      role: 'dhira',
      content: finalReply,
      channel,
      createdAt: now(),
    });

    const showReferralCard =
      reviewed.risk_level === 'MEDIUM' ||
      reviewed.risk_level === 'HIGH' ||
      risk.risk_level === 'MEDIUM' ||
      risk.risk_level === 'HIGH';

    const postReply: ChatTurnPostReplyWork = {
      uid,
      userMessage,
      channel,
      turnLanguage,
      moodContextTurns,
      consentMemory: profile.consentMemory,
      userPatternProfile: profile.userPatternProfile,
      showReferralCard,
      risk,
      reviewedRiskLevel: reviewed.risk_level,
      reviewedIssues: reviewed.issues_found,
    };

    return wrap(
      finish({
        reply: finalReply,
        crisis: false,
        showReferralCard,
        riskLevel: reviewed.risk_level,
      }),
      postReply,
    );
  } catch (err) {
    if (err instanceof LiveBrainUnavailableError || (!mayUseOfflineDemoTemplates() && liveConfigured)) {
      return completeHoldingTurn(risk.risk_level, risk);
    }
    throw err;
  }
}
