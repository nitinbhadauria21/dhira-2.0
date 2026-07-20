import { NextRequest, NextResponse } from 'next/server';
import { resolveSchedulerUserId } from '@/lib/schedulerAuth';
import { runWeeklySummary } from '@/lib/proactiveFlow';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/notifications/weekly  { userId? }
 * Emergent Sunday (or manual) tick — builds a Monitor-gated weekly summary and
 * enqueues delivery via Emergent.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const auth = await resolveSchedulerUserId(req, body);
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const result = await runWeeklySummary(auth.uid);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[api/notifications/weekly] error', err);
    return NextResponse.json({ error: 'could not generate weekly summary' }, { status: 500 });
  }
}
