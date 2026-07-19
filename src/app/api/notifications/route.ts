import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { getStore } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/notifications → the signed-in user's notification inbox. */
export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ notifications: [] }, { status: 401 });
  try {
    const notifications = await getStore().getNotifications(uid, 30);
    return NextResponse.json({ notifications });
  } catch (err) {
    console.error('[api/notifications] error', err);
    return NextResponse.json({ notifications: [] });
  }
}
