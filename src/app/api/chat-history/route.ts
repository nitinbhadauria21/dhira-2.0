import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { getStore } from '@/lib/store';
import type { ChatMessageRecord } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/chat-history → the user's chat turns, grouped by day (newest first). */
export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ days: [] }, { status: 401 });
  try {
    const messages = await getStore().getRecentMessages(uid, 200);
    const byDay = new Map<string, ChatMessageRecord[]>();
    for (const m of messages) {
      const day = new Date(m.createdAt).toISOString().slice(0, 10);
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day)!.push(m);
    }
    const days = Array.from(byDay.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, msgs]) => ({
        date,
        messages: msgs.map((m) => ({ id: m.id, role: m.role, content: m.content, createdAt: m.createdAt })),
      }));
    return NextResponse.json({ days });
  } catch (err) {
    console.error('[api/chat-history] error', err);
    return NextResponse.json({ days: [] });
  }
}
