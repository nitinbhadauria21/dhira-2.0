import { randomUUID } from 'crypto';
import { getStore } from '@/lib/store';
import { checkRisk } from '@/agents/escalation';
import { draftReply } from '@/agents/primary';
import { reviewReply } from '@/agents/monitor';
import { tagMood } from '@/agents/moodTagging';
import { summarizeMemory } from '@/agents/memory';
import { CRISIS_MESSAGE } from '@/lib/safetyCopy';
import type { ClaudeTurn } from '@/lib/anthropic';
import type { RiskLevel } from '@/lib/types';

/**
 * The normal-message flow (Agent Prompts spec §4g):
 *   User message -> Escalation Agent -> Primary Agent -> Safety & Persona Monitor
 *   -> shown to user -> Mood Tagging + Memory (store metadata)
 *
 * The golden rule holds: nothing reaches the user without passing the Monitor,
 * and a detected crisis replaces the normal reply with the crisis hand-off.
 */

export interface ChatTurnResult {
  reply: string;
  crisis: boolean;
  showReferralCard: boolean;
  riskLevel: RiskLevel;
}

export async function runChatTurn(params: {
  uid: string;
  userMessage: string;
}): Promise<ChatTurnResult> {
  const { uid, userMessage } = params;
  const store = getStore();
  const profile = await store.getOrCreateProfile(uid);
  const now = () => new Date().toISOString();

  // History BEFORE we add the new message (oldest -> newest), for the Primary Agent.
  const priorMessages = await store.getRecentMessages(uid, 12);
  const history: ClaudeTurn[] = priorMessages.map((m) => ({
    role: m.role === 'dhira' ? 'assistant' : 'user',
    content: m.content,
  }));

  // Save the user's message.
  await store.addMessage({
    id: randomUUID(),
    profileId: uid,
    role: 'user',
    content: userMessage,
    createdAt: now(),
  });

  // 1) Escalation Agent — risk check first.
  const risk = await checkRisk(userMessage);
  if (risk.risk_level === 'CRISIS' || risk.escalate) {
    await store.addRiskEvent({
      id: randomUUID(),
      profileId: uid,
      riskLevel: 'CRISIS',
      signal: risk.signal || 'self-harm / crisis language detected',
      handled: true,
      createdAt: now(),
    });
    // Crisis replaces the normal reply entirely.
    return { reply: CRISIS_MESSAGE, crisis: true, showReferralCard: false, riskLevel: 'CRISIS' };
  }

  // 2) Primary Agent — draft the warm listener reply.
  const memory = profile.consentMemory ? await store.getLatestMemory(uid) : null;
  const draft = await draftReply({
    history,
    userMessage,
    memorySummary: memory?.summary ?? null,
    language: profile.language,
  });

  // 3) Safety & Persona Monitor — approve / rewrite / block.
  const context = priorMessages
    .slice(-4)
    .map((m) => `${m.role === 'dhira' ? 'Dhira' : 'User'}: ${m.content}`)
    .join('\n');
  const reviewed = await reviewReply({ userMessage, context, draftReply: draft });

  // Monitor can still catch a crisis the escalation missed.
  if (reviewed.decision === 'BLOCK_AND_REPLACE' && reviewed.risk_level === 'CRISIS') {
    await store.addRiskEvent({
      id: randomUUID(),
      profileId: uid,
      riskLevel: 'CRISIS',
      signal: reviewed.issues_found.join('; ') || 'monitor crisis block',
      handled: true,
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

  // Save Dhira's reply.
  await store.addMessage({
    id: randomUUID(),
    profileId: uid,
    role: 'dhira',
    content: finalReply,
    createdAt: now(),
  });

  // 4) Background metadata: mood tagging + memory note (best-effort).
  try {
    const mood = await tagMood(userMessage);
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
    /* metadata is best-effort; never block the reply */
  }

  if (profile.consentMemory) {
    try {
      const convo = [...priorMessages.slice(-6).map((m) => `${m.role}: ${m.content}`), `user: ${userMessage}`, `dhira: ${finalReply}`].join('\n');
      const mem = await summarizeMemory({ conversation: convo, language: profile.language });
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

  const showReferralCard = reviewed.risk_level === 'MEDIUM' || risk.risk_level === 'MEDIUM';
  if (showReferralCard) {
    await store.addRiskEvent({
      id: randomUUID(),
      profileId: uid,
      riskLevel: 'MEDIUM',
      signal: risk.signal || 'distress (not immediate danger)',
      handled: true,
      createdAt: now(),
    });
  }

  return {
    reply: finalReply,
    crisis: false,
    showReferralCard,
    riskLevel: reviewed.risk_level,
  };
}
