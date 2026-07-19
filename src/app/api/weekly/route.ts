import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { getStore } from '@/lib/store';
import type { MoodLogRecord } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Monday (local) of the week containing `d`, as YYYY-MM-DD. */
function weekStart(d: Date): string {
  const copy = new Date(d);
  const day = (copy.getDay() + 6) % 7; // 0 = Monday
  copy.setDate(copy.getDate() - day);
  return copy.toISOString().slice(0, 10);
}

/** GET /api/weekly → this-week summary + an 8-week series (from mood check-ins). */
export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const store = getStore();
    const moods = await store.getMoods(uid);

    // 8-week series
    const buckets = new Map<string, MoodLogRecord[]>();
    for (let i = 7; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      buckets.set(weekStart(d), []);
    }
    for (const m of moods) {
      const ws = weekStart(new Date(m.createdAt));
      if (buckets.has(ws)) buckets.get(ws)!.push(m);
    }
    const series = Array.from(buckets.entries()).map(([ws, ms]) => ({
      weekStart: ws,
      label: new Date(ws + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      checkins: ms.length,
      avgValence: ms.length ? Number((ms.reduce((s, m) => s + m.valence, 0) / ms.length).toFixed(2)) : 0,
    }));

    // This week's detail
    const thisWeekKey = weekStart(new Date());
    const thisWeek = buckets.get(thisWeekKey) ?? [];
    const moodMix: Record<string, number> = {};
    const topicMix: Record<string, number> = {};
    for (const m of thisWeek) {
      moodMix[m.mood] = (moodMix[m.mood] ?? 0) + 1;
      topicMix[m.topicTag] = (topicMix[m.topicTag] ?? 0) + 1;
    }
    const avgIntensity = thisWeek.length
      ? Number((thisWeek.reduce((s, m) => s + m.emotionalIntensity, 0) / thisWeek.length).toFixed(2))
      : 0;

    return NextResponse.json({
      series,
      thisWeek: {
        checkins: thisWeek.length,
        avgIntensity,
        moodMix: Object.entries(moodMix).map(([mood, count]) => ({ mood, count })).sort((a, b) => b.count - a.count),
        topTopics: Object.entries(topicMix).map(([topic, count]) => ({ topic, count })).sort((a, b) => b.count - a.count).slice(0, 3),
      },
    });
  } catch (err) {
    console.error('[api/weekly] error', err);
    return NextResponse.json({ error: 'could not load weekly data' }, { status: 500 });
  }
}
