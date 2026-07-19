import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { getStore } from '@/lib/store';
import type { MoodLabel } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function dayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

/** GET /api/home → everything the dashboard needs, computed from saved data. */
export async function GET() {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    const store = getStore();
    const profile = await store.getOrCreateProfile(uid);
    const moods = await store.getMoods(uid);
    const memories = profile.consentMemory ? await store.getMemories(uid, 3) : [];
    const messages = await store.getRecentMessages(uid, 200);

    const latestMood = moods.length ? moods[moods.length - 1] : null;

    // Build a set of day-keys that have at least one mood log.
    const moodDays = new Set(moods.map((m) => dayKey(m.createdAt)));

    // Streak = consecutive days (ending today or yesterday) with a mood log.
    let streak = 0;
    const cursor = new Date();
    // allow the streak to count from today or yesterday
    if (!moodDays.has(cursor.toISOString().slice(0, 10))) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (moodDays.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    // Last 7 days: latest mood per day (or null).
    const last7: { date: string; mood: MoodLabel | null }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayMoods = moods.filter((m) => dayKey(m.createdAt) === key);
      last7.push({ date: key, mood: dayMoods.length ? dayMoods[dayMoods.length - 1].mood : null });
    }

    const sessionDays = new Set(messages.map((m) => dayKey(m.createdAt)));

    return NextResponse.json({
      alias: profile.alias,
      language: profile.language,
      latestMood: latestMood ? { mood: latestMood.mood, intensity: latestMood.emotionalIntensity, topic: latestMood.topicTag } : null,
      memory: memories[0] ? { summary: memories[0].summary, carryForward: memories[0].carryForward } : null,
      streak,
      totalSessions: sessionDays.size,
      last7,
      recentJournal: memories.map((m) => ({ summary: m.summary, topic: m.topicTag, createdAt: m.createdAt })),
    });
  } catch (err) {
    console.error('[api/home] error', err);
    return NextResponse.json({ error: 'could not load dashboard' }, { status: 500 });
  }
}
