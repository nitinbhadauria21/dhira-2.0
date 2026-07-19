import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUid } from '@/lib/session';
import { runProactiveCheckin } from '@/lib/proactiveFlow';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/checkin  { userId? }  → { sent, message }
 *
 * Called by the reminder engine (n8n) on a schedule, or by the in-app
 * "send now" demo button. Protected by a shared secret header so only your
 * own tools can trigger it — UNLESS no secret is configured (dev/demo mode),
 * in which case it works for the current logged-in browser only.
 */
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.CHECKIN_SECRET?.trim();
    const provided = req.headers.get('x-checkin-secret')?.trim();
    const body = await req.json().catch(() => ({}));

    let uid: string | null = null;

    if (secret) {
      // Protected mode: caller must present the secret and a userId.
      if (provided !== secret) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
      }
      uid = typeof body.userId === 'string' ? body.userId : null;
      if (!uid) return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    } else {
      // Dev/demo mode: no secret set → act for the current browser session.
      uid = await getOrCreateUid();
    }

    const result = await runProactiveCheckin(uid);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[api/checkin] error', err);
    return NextResponse.json({ error: 'could not generate check-in' }, { status: 500 });
  }
}
