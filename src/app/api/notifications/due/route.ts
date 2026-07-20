import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { assertSchedulerSecret } from '@/lib/schedulerAuth';
import { isProactiveDue, isWeeklyDue, toDueUser } from '@/lib/dueUsers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/notifications/due?type=proactive|weekly
 *
 * Emergent calls this on a schedule to learn who should get a message.
 * Header: x-checkin-secret (when CHECKIN_SECRET is set).
 */
export async function GET(req: NextRequest) {
  try {
    const gate = assertSchedulerSecret(req);
    if ('error' in gate) {
      return NextResponse.json({ error: gate.error }, { status: gate.status });
    }

    const type = req.nextUrl.searchParams.get('type') ?? 'proactive';
    if (type !== 'proactive' && type !== 'weekly') {
      return NextResponse.json({ error: 'type must be proactive or weekly' }, { status: 400 });
    }
    const ignoreWindow = req.nextUrl.searchParams.get('force') === '1';

    const profiles = await getStore().allProfiles();
    const now = new Date();
    const users = profiles
      .filter((p) => (type === 'weekly' ? isWeeklyDue(p, now) : isProactiveDue(p, now, { ignoreWindow })))
      .map(toDueUser)
      .filter((u): u is NonNullable<typeof u> => Boolean(u));

    return NextResponse.json({ type, count: users.length, ignoreWindow, users });
  } catch (err) {
    console.error('[api/notifications/due] error', err);
    return NextResponse.json({ error: 'could not list due users' }, { status: 500 });
  }
}
