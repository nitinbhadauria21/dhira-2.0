import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getOrCreateUid } from '@/lib/session';
import { getStore } from '@/lib/store';
import type { MoodLabel, TopicTag } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MOODS: MoodLabel[] = [
  'happy', 'calm', 'neutral', 'hopeful', 'stressed',
  'lonely', 'angry', 'anxious', 'overwhelmed', 'sad',
];

/** POST /api/mood  { mood, intensity?, topicTag? }  → saves a manual mood check-in. */
export async function POST(req: NextRequest) {
  try {
    const uid = await getOrCreateUid();
    const body = await req.json().catch(() => ({}));
    const mood = MOODS.includes(body.mood) ? (body.mood as MoodLabel) : null;
    if (!mood) return NextResponse.json({ error: 'valid mood is required' }, { status: 400 });

    const intensity = typeof body.intensity === 'number' ? Math.max(0, Math.min(1, body.intensity)) : 0.5;
    const topicTag: TopicTag = body.topicTag ?? 'self';
    const negative = ['stressed', 'lonely', 'angry', 'anxious', 'overwhelmed', 'sad'].includes(mood);
    const valence = negative ? -intensity : mood === 'neutral' ? 0 : intensity;

    const store = getStore();
    await store.addMood({
      id: randomUUID(),
      profileId: uid,
      mood,
      valence,
      emotionalIntensity: intensity,
      topicTag,
      source: 'manual',
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/mood] error', err);
    return NextResponse.json({ error: 'could not save mood' }, { status: 500 });
  }
}
