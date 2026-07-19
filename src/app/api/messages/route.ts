import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { getStore } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/messages → the current user's recent chat history. */
export async function GET() {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ messages: [] }, { status: 401 });
    const store = getStore();
    const messages = await store.getRecentMessages(uid, 50);
    return NextResponse.json({ messages });
  } catch (err) {
    console.error('[api/messages] error', err);
    return NextResponse.json({ messages: [] });
  }
}
