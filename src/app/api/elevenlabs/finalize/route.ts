import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getUserId } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { draftReply } from '@/agents/primary';
import { reviewReply } from '@/agents/monitor';
import { tagMood } from '@/agents/moodTagging';
import { summarizeMemory } from '@/agents/memory';
import { checkRisk } from '@/agents/escalation';
import { CRISIS_MESSAGE } from '@/lib/safetyCopy';
import { normalizeMood, normalizeTopic, valenceForMood } from '@/lib/moodNormalize';
import type { ClaudeTurn } from '@/lib/anthropic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type VoiceTurn = {
  role: 'user' | 'dhira';
  content: string;
};

/**
 * POST /api/elevenlabs/finalize
 *
 * Called by the Talk to Dhira widget when a voice call ends.
 * Saves the transcript into chat_messages, tags mood, stores memory,
 * and returns one in-character Dhira reflection (through the Safety Monitor).
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

    // Persist every spoken turn into the same chat history used by /chat-with-dhira.
    for (const turn of turns) {
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

    // Mood from the voice conversation.
    let mood = normalizeMood(typeof body.mood === 'string' ? body.mood : 'neutral');
    let topicTag = normalizeTopic(typeof body.topicTag === 'string' ? body.topicTag : 'self');
    let valence = valenceForMood(mood);
    let intensity = 0.55;
    try {
      const tagged = await tagMood(userText || lastUser);
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

    // Crisis check on the spoken content before drafting a reflection.
    const risk = await checkRisk(userText || lastUser);
    if (risk.risk_level === 'CRISIS' || risk.escalate) {
      await store.addRiskEvent({
        id: randomUUID(),
        profileId: uid,
        riskLevel: 'CRISIS',
        signal: risk.signal || 'crisis language in voice session',
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
      return NextResponse.json({
        success: true,
        crisis: true,
        mood,
        topicTag,
        reply: CRISIS_MESSAGE,
        savedTurns: turns.length + 1,
      });
    }

    // In-character reflection through Primary → Safety Monitor.
    const prior = await store.getRecentMessages(uid, 12);
    const history: ClaudeTurn[] = prior.map((m) => ({
      role: m.role === 'dhira' ? 'assistant' : 'user',
      content: m.content,
    }));
    const reflectionPrompt =
      `I just finished a voice conversation with you. Here is what we covered:\n` +
      `${turns.map((t) => `${t.role === 'user' ? 'Me' : 'You'}: ${t.content}`).join('\n')}\n\n` +
      `Please respond once as Dhira — listen, reflect, no advice.`;

    const memory = profile.consentMemory ? await store.getLatestMemory(uid) : null;
    const draft = await draftReply({
      history,
      userMessage: reflectionPrompt,
      memorySummary: memory?.summary ?? null,
      language: profile.language,
    });
    const context = turns
      .slice(-6)
      .map((t) => `${t.role === 'dhira' ? 'Dhira' : 'User'}: ${t.content}`)
      .join('\n');
    const reviewed = await reviewReply({
      userMessage: lastUser,
      context,
      draftReply: draft,
    });

    let reply = reviewed.approved_or_rewritten_response;
    let crisis = false;
    if (reviewed.decision === 'BLOCK_AND_REPLACE' && reviewed.risk_level === 'CRISIS') {
      reply = CRISIS_MESSAGE;
      crisis = true;
      await store.addRiskEvent({
        id: randomUUID(),
        profileId: uid,
        riskLevel: 'CRISIS',
        signal: reviewed.issues_found.join('; ') || 'monitor crisis after voice',
        handled: true,
        createdAt: now(),
      });
    }

    await store.addMessage({
      id: randomUUID(),
      profileId: uid,
      role: 'dhira',
      content: reply,
      createdAt: now(),
    });

    if (profile.consentMemory) {
      try {
        const convo = turns.map((t) => `${t.role}: ${t.content}`).join('\n') + `\ndhira: ${reply}`;
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

    return NextResponse.json({
      success: true,
      crisis,
      mood,
      topicTag,
      reply,
      savedTurns: turns.length + 1,
    });
  } catch (err) {
    console.error('[api/elevenlabs/finalize] error', err);
    return NextResponse.json({ error: 'Could not save the voice conversation' }, { status: 500 });
  }
}
