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
  isEscalateCrisisDraft,
} from '@/lib/conversationContext';
import type { RiskLevel } from '@/lib/types';

/**
 * The normal-message flow (Agent Prompts spec §4g):
 *   User message -> Escalation Agent -> Primary Agent -> Safety & Persona Monitor
 *   -> shown to user -> Mood Tagging + Memory (store metadata)
 */

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
}): Promise<ChatTurnResult> {
  const { uid, userMessage } = params;
  const store = getStore();
  const profile = await store.getOrCreateProfile(uid);
  const now = () => new Date().toISOString();

  const convo = await buildConversationContext(uid, profile.language);

  await store.addMessage({
    id: randomUUID(),
    profileId: uid,
    role: 'user',
    content: userMessage,
    createdAt: now(),
  });

  const risk = await checkRisk({ userMessage, context: convo.contextString });
  if (risk.risk_level === 'CRISIS' || risk.escalate) {
    await store.addRiskEvent({
      id: randomUUID(),
      profileId: uid,
      riskLevel: 'CRISIS',
      signal: risk.signal || 'self-harm / crisis language detected',
      handled: true,
      createdAt: now(),
    });
    await store.addMessage({
      id: randomUUID(),
      profileId: uid,
      role: 'dhira',
      content: CRISIS_MESSAGE,
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
    language: profile.language,
  });

  if (isEscalateCrisisDraft(draft)) {
    await store.addRiskEvent({
      id: randomUUID(),
      profileId: uid,
      riskLevel: 'CRISIS',
      signal: 'primary ESCALATE_CRISIS',
      handled: true,
      createdAt: now(),
    });
    await store.addMessage({
      id: randomUUID(),
      profileId: uid,
      role: 'dhira',
      content: CRISIS_MESSAGE,
      createdAt: now(),
    });
    return { reply: CRISIS_MESSAGE, crisis: true, showReferralCard: false, riskLevel: 'CRISIS' };
  }

  const reviewed = await reviewReply({
    userMessage,
    context: convo.contextString,
    draftReply: draft,
  });

  if (reviewed.decision === 'BLOCK_AND_REPLACE' && reviewed.risk_level === 'CRISIS') {
    await store.addRiskEvent({
      id: randomUUID(),
      profileId: uid,
      riskLevel: 'CRISIS',
      signal: reviewed.issues_found.join('; ') || 'monitor crisis block',
      handled: true,
      createdAt: now(),
    });
    await store.addMessage({
      id: randomUUID(),
      profileId: uid,
      role: 'dhira',
      content: reviewed.approved_or_rewritten_response,
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
      const mem = await summarizeMemory({ conversation: convoText, language: profile.language });
      await store.addMemory({
        id: randomUUID(),
        profileId: uid,
        summary: mem.summary,
        mood: mem.mood,
        topicTag: mem.topic_tag,
        carryForward: mem.carry_forward,
        createdAt: now(),
      });
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
      riskLevel: reviewed.risk_level === 'HIGH' ? 'HIGH' : 'MEDIUM',
      signal: risk.signal || reviewed.issues_found.join('; ') || 'distress',
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
