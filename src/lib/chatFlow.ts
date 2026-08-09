import { randomUUID } from 'crypto';
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
  isEscalateCrisisDraft,
} from '@/lib/conversationContext';
import { mergePatternProfile } from '@/lib/localBrain';
import {
  shouldUseEarlyCrisisHandoff,
  sanityCheckMonitor,
  debugRiskLog,
  isTrivialLowRiskMessage,
  contextHasElevatedRisk,
} from '@/lib/riskSanity';
import type { ChatChannel, RiskLevel } from '@/lib/types';

export interface ChatTurnResult {
  reply: string;
  crisis: boolean;
  showReferralCard: boolean;
  riskLevel: RiskLevel;
  mood?: string;
  topicTag?: string;
}

export async function runChatTurn(params: {
  uid: string;
  userMessage: string;
  channel?: ChatChannel;
}): Promise<ChatTurnResult> {
  const { uid, userMessage, channel = 'app' } = params;
  const store = getStore();
  const profile = await store.getOrCreateProfile(uid);
  const now = () => new Date().toISOString();

  const recentRisk = await store.getRecentRiskEventsForProfile(uid, 5);
  const recentRiskSummary = formatRecentRiskSummary(recentRisk);

  const convo = await buildConversationContext(uid, profile.language, {
    userPatternProfile: profile.userPatternProfile,
    recentRiskSummary,
  });

  await store.addMessage({
    id: randomUUID(),
    profileId: uid,
    role: 'user',
    content: userMessage,
    channel,
    createdAt: now(),
  });

  const risk = await checkRisk({
    userMessage,
    context: convo.contextString,
    userPatternProfile: profile.userPatternProfile,
    recentRiskSummary,
  });

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
    return { reply: CRISIS_MESSAGE, crisis: true, showReferralCard: false, riskLevel: 'CRISIS' };
  }

  const memory = profile.consentMemory ? await store.getLatestMemory(uid) : null;
  const draft = await draftReply({
    history: convo.historyTurns,
    conversationSummary: convo.conversationSummary,
    userMessage,
    memorySummary: memory?.summary ?? null,
    userPatternProfile: profile.userPatternProfile,
    language: profile.language,
  });

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
    return { reply: CRISIS_MESSAGE, crisis: true, showReferralCard: false, riskLevel: 'CRISIS' };
  }

  let reviewed = await reviewReply({
    userMessage,
    context: convo.contextString,
    draftReply: draft,
    escalation: risk,
    userPatternProfile: profile.userPatternProfile,
  });
  reviewed = sanityCheckMonitor(userMessage, convo.contextString, reviewed);

  debugRiskLog({
    draft: draft.slice(0, 120),
    monitorDecision: reviewed.decision,
    monitorRisk: reviewed.risk_level,
    escalation: risk,
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
    return {
      reply: reviewed.approved_or_rewritten_response,
      crisis: true,
      showReferralCard: false,
      riskLevel: 'CRISIS',
    };
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
  try {
    const mood = await tagMood(userMessage);
    taggedMood = mood.mood;
    taggedTopic = mood.topic_tag;
    await store.addMood({
      id: randomUUID(),
      profileId: uid,
      mood: mood.mood,
      valence: mood.valence,
      emotionalIntensity: mood.emotional_intensity,
      topicTag: mood.topic_tag,
      source: 'chat',
      createdAt: now(),
    });
  } catch {
    /* best-effort */
  }

  if (profile.consentMemory) {
    try {
      const prior = await store.getRecentMessages(uid, 8);
      const convoText = prior.map((m) => `${m.role}: ${m.content}`).join('\n');
      const mem = await summarizeMemory({
        conversation: convoText,
        language: profile.language,
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

  return {
    reply: finalReply,
    crisis: false,
    showReferralCard,
    riskLevel: reviewed.risk_level,
    mood: taggedMood,
    topicTag: taggedTopic,
  };
}
