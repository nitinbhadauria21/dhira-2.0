import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import type { NotificationStatus } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID: NotificationStatus[] = ['queued', 'sent', 'delivered', 'failed'];

/**
 * POST /api/notifications/callback
 * Called by Emergent after it attempts delivery, to update a notification's
 * status. Protected by the shared EMERGENT_WEBHOOK_SECRET (when configured).
 */
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.EMERGENT_WEBHOOK_SECRET?.trim();
    if (secret && req.headers.get('x-emergent-secret')?.trim() !== secret) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const { notificationId, status, providerMessageId } = await req.json().catch(() => ({}));
    if (!notificationId || !VALID.includes(status)) {
      return NextResponse.json({ error: 'notificationId and valid status required' }, { status: 400 });
    }
    await getStore().updateNotificationStatus(notificationId, status, providerMessageId ?? null);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/notifications/callback] error', err);
    return NextResponse.json({ error: 'could not update status' }, { status: 500 });
  }
}
