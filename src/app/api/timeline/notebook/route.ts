import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { buildTimelineNotebookWeek } from '@/lib/timelineNotebook';
import { getStore } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/timeline/notebook → last-7-days notebook mood movement (same spirit as /api/timeline/chats). */
export async function GET() {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const store = getStore();
    const entries = await store.getNotebookEntries(uid, 100);
    const week = buildTimelineNotebookWeek(entries);

    return NextResponse.json({ week, error: null });
  } catch (err) {
    console.error('[api/timeline/notebook] error', err);
    return NextResponse.json({ error: 'could not load notebook timeline', week: null }, { status: 500 });
  }
}
