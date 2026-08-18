import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getUserId } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { tagMood } from '@/agents/moodTagging';
import { checkRisk } from '@/agents/escalation';
import { CRISIS_MESSAGE } from '@/lib/safetyCopy';
import { buildConversationContext } from '@/lib/conversationContext';
import { normalizeMood, normalizeTopic, valenceForMood } from '@/lib/moodNormalize';
import { isVoiceCustomLlmEnabled } from '@/lib/elevenlabs/customLlmAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type VoiceTurn = {
  role: 'user' | 'dhira';
  content: string;
};

function turnKey(turn: VoiceTurn): string {
  return `${turn.role}:${turn.content.trim()}`;
}

async function filterUnsavedTurns(uid: string, turns: VoiceTurn[]): Promise<VoiceTurn[]> {
  if (turns.length === 0) return [];
  const store = getStore();
  const recent = await store.getRecentMessages(uid, Math.max(turns.length * 2 + 20, 40));
  const existing = new Set(recent.map((m) => `${m.role}:${m.content.trim()}`));
  return turns.filter((t) => !existing.has(turnKey(t)));
}

/**
 * POST /api/elevenlabs/finalize
 *
 * Called when a Talk to Dhira voice call ends. With Custom LLM enabled, turns are
 * already saved per utterance via runChatTurn — this route dedupes any stragglers
 * and records session-level mood when needed.
 */
export async function POST(req: NextRequest) {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const rawTurns: unknown[] = Array.isArray(body.turns) ? body.turns : [];
    const turns: VoiceTurn[] = rawTurns
      .map((t) => {
        const row = t as { role?: string; content?: string };
        const role =
          row.role === 'user' || row.role === 'dhira'
            ? row.role
            : row.role === 'agent' || row.role === 'ai'
              ? 'dhira'
              : null;
        const content = typeof row.content === 'string' ? row.content.trim() : '';
        if (!role || !content) return null;
        return { role, content } as VoiceTurn;
      })
      .filter((t): t is VoiceTurn => Boolean(t));

    if (turns.length === 0) {
      return NextResponse.json({ error: 'No voice transcript to save' }, { status: 400 });
    }

    const store = getStore();
    const profile = await store.getOrCreateProfile(uid);
    const now = () => new Date().toISOString();
    const customLlmActive = isVoiceCustomLlmEnabled();

    const unsavedTurns = customLlmActive ? await filterUnsavedTurns(uid, turns) : turns;

    for (const turn of unsavedTurns) {
      await store.addMessage({
        id: randomUUID(),
        profileId: uid,
        role: turn.role,
        content: turn.content,
        createdAt: now(),
      });
    }

    const userText = turns
      .filter((t) => t.role === 'user')
      .map((t) => t.content)
      .join('\n')
      .slice(0, 4000);
    const lastUser =
      [...turns].reverse().find((t) => t.role === 'user')?.content ||
      'I just finished talking out loud with you.';

    let mood = normalizeMood(typeof body.mood === 'string' ? body.mood : 'neutral');
    let topicTag = normalizeTopic(typeof body.topicTag === 'string' ? body.topicTag : 'self');
    let valence = valenceForMood(mood);
    let intensity = 0.55;

    // Per-turn Custom LLM already runs mood enrichment; only tag here when legacy voice path.
    if (!customLlmActive) {
      try {
        const tagged = await tagMood({ text: userText || lastUser });
        mood = tagged.mood;
        topicTag = tagged.topic_tag;
        valence = tagged.valence;
        intensity = tagged.emotional_intensity;
      } catch {
        /* keep normalized fallbacks */
      }

      await store.addMood({
        id: randomUUID(),
        profileId: uid,
        mood,
        valence,
        emotionalIntensity: intensity,
        topicTag,
        source: 'elevenlabs',
        createdAt: now(),
      });
    } else {
      const latestMood = await store.getLatestMood(uid);
      if (latestMood) {
        mood = latestMood.mood;
        topicTag = latestMood.topicTag;
        valence = latestMood.valence;
        intensity = latestMood.emotionalIntensity;
      }
    }

    const voiceContext = turns
      .map((t) => `${t.role === 'dhira' ? 'Dhira' : 'User'}: ${t.content}`)
      .join('\n');
    const convo = await buildConversationContext(uid, profile.language);
    const contextString = [convo.contextString, `VOICE SESSION JUST NOW:\n${voiceContext}`]
      .filter(Boolean)
      .join('\n\n');

    const risk = await checkRisk({ userMessage: lastUser, context: contextString });
    if (risk.risk_level === 'CRISIS' || risk.escalate) {
      const crisisAlreadySaved = customLlmActive
        ? (await filterUnsavedTurns(uid, [{ role: 'dhira', content: CRISIS_MESSAGE }])).length === 0
        : false;

      await store.addRiskEvent({
        id: randomUUID(),
        profileId: uid,
        riskLevel: 'CRISIS',
        signal: risk.signal || 'crisis language in voice session',
        handled: true,
        createdAt: now(),
      });

      if (!crisisAlreadySaved) {
        await store.addMessage({
          id: randomUUID(),
          profileId: uid,
          role: 'dhira',
          content: CRISIS_MESSAGE,
          createdAt: now(),
        });
      }

      return NextResponse.json({
        success: true,
        crisis: true,
        mood,
        topicTag,
        savedTurns: unsavedTurns.length + (crisisAlreadySaved ? 0 : 1),
        customLlm: customLlmActive,
      });
    }

    return NextResponse.json({
      success: true,
      crisis: false,
      mood,
      topicTag,
      savedTurns: unsavedTurns.length,
      customLlm: customLlmActive,
    });
  } catch (err) {
    console.error('[api/elevenlabs/finalize] error', err);
    return NextResponse.json({ error: 'Could not save the voice conversation' }, { status: 500 });
  }
}
