import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/safety → aggregate safety data for the Admin Console.
 * Anonymous only: risk events carry a shortened profile id, never PII.
 */
export async function GET() {
  try {
    const store = getStore();
    const [events, stats] = await Promise.all([store.getRiskEvents(50), store.adminStats()]);
    // Shorten the anonymous id so the console shows nothing traceable.
    const safeEvents = events.map((e) => ({
      id: e.id,
      user: `anon-${e.profileId.slice(0, 6)}`,
      riskLevel: e.riskLevel,
      signal: e.signal,
      handled: e.handled,
      createdAt: e.createdAt,
    }));
    return NextResponse.json({ events: safeEvents, stats });
  } catch (err) {
    console.error('[api/admin/safety] error', err);
    return NextResponse.json({ events: [], stats: null }, { status: 200 });
  }
}
