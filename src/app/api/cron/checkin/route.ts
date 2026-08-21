import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { runProactiveCheckin } from '@/lib/proactiveFlow';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/checkin
 * Secured by CRON_SECRET header.
 *
 * Uses the same Monitor-safe proactive pipeline as POST /api/checkin
 * (not static canned copy).
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const store = getStore();
    const profiles = await store.allProfiles();
    const now = Date.now();
    const TWENTY_HOURS = 20 * 60 * 60 * 1000;

    const eligible = profiles.filter((p) => {
      if (!p.consentCheckin) return false;
      if (p.lastProactiveAt) {
        const last = new Date(p.lastProactiveAt).getTime();
        if (now - last < TWENTY_HOURS) return false;
      }
      return true;
    });

    const results: { id: string; sent: boolean; reason?: string }[] = [];

    for (const profile of eligible) {
      const outcome = await runProactiveCheckin(profile.id);
      results.push({
        id: profile.id,
        sent: outcome.sent,
        reason: outcome.reason,
      });
    }

    return NextResponse.json({
      ok: true,
      checked: eligible.length,
      sent: results.filter((r) => r.sent).length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[api/cron/checkin] error', err);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
