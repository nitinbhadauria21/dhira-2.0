import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { buildTimelineChatWeek } from '@/lib/timelineChat';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/timeline/chats → 7-day chat timeline with mood movement + highlights. */
export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    const store = getStore();
    const [messages, moods] = await Promise.all([
      store.getRecentMessages(uid, 400),
      store.getMoods(uid, 14),
    ]);

    const week = buildTimelineChatWeek(messages, moods);
    return NextResponse.json(week);
  } catch (err) {
    console.error('[api/timeline/chats] error', err);
    return NextResponse.json({ error: 'could not load chat timeline' }, { status: 500 });
  }
}
