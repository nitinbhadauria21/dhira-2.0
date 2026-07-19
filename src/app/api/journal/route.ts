import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { getStore } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/journal?q=... → the user's memory notes (journal), optionally searched. */
export async function GET(req: NextRequest) {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ entries: [] }, { status: 401 });
  try {
    const q = (req.nextUrl.searchParams.get('q') ?? '').trim().toLowerCase();
    const store = getStore();
    const profile = await store.getOrCreateProfile(uid);
    if (!profile.consentMemory) return NextResponse.json({ entries: [], memoryOff: true });

    const memories = await store.getMemories(uid, 100);
    const filtered = q
      ? memories.filter(
          (m) => m.summary.toLowerCase().includes(q) || m.topicTag.toLowerCase().includes(q) || m.mood.toLowerCase().includes(q),
        )
      : memories;

    return NextResponse.json({
      entries: filtered.map((m) => ({
        id: m.id,
        summary: m.summary,
        mood: m.mood,
        topic: m.topicTag,
        carryForward: m.carryForward,
        createdAt: m.createdAt,
      })),
    });
  } catch (err) {
    console.error('[api/journal] error', err);
    return NextResponse.json({ entries: [] });
  }
}
