import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { getStore } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/export → all of the signed-in user's data as a JSON download. */
export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  try {
    const store = getStore();
    const [profile, messages, moods, memories, notifications] = await Promise.all([
      store.getOrCreateProfile(uid),
      store.getRecentMessages(uid, 1000),
      store.getMoods(uid),
      store.getMemories(uid, 1000),
      store.getNotifications(uid, 1000),
    ]);
    const payload = {
      exportedAt: new Date().toISOString(),
      profile,
      chatMessages: messages,
      moodLogs: moods,
      memories,
      notifications,
    };
    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="dhira-my-data.json"',
      },
    });
  } catch (err) {
    console.error('[api/export] error', err);
    return NextResponse.json({ error: 'could not export data' }, { status: 500 });
  }
}
