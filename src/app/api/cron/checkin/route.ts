import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { enqueueAndSend } from '@/lib/notify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/checkin
 * Secured by CRON_SECRET header.
 * Configured to run daily at 8 PM IST (2:30 PM UTC) via vercel.json crons.
 *
 * Sends a proactive check-in WhatsApp/email message to every user who:
 *  - has consent_checkin = true
 *  - has not been contacted in the last 20 hours
 */
export async function GET(req: NextRequest) {
  // Security: verify cron secret
  const secret = req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const store = getStore();
    const profiles = await store.allProfiles();
    const now = Date.now();
    const TWENTY_HOURS = 20 * 60 * 60 * 1000;

    const eligible = profiles.filter(p => {
      if (!p.consentCheckin) return false;
      if (!p.email && !p.phoneE164) return false;
      if (p.lastProactiveAt) {
        const last = new Date(p.lastProactiveAt).getTime();
        if (now - last < TWENTY_HOURS) return false;
      }
      return true;
    });

    const CHECK_IN_MESSAGES = [
      "Hey, just checking in 🌙 How are you feeling today?",
      "Dhira here — no pressure at all. Just wanted to say hi. How's your day been?",
      "Hi! Just popping in to see how you're doing. You don't have to be okay — I'm here either way. 💛",
      "Hey, it's Dhira. How are you holding up today?",
      "Just a gentle check-in from Dhira 🙏 How's your mind and heart today?",
    ];

    const results: { id: string; sent: boolean }[] = [];

    for (const profile of eligible) {
      const message = CHECK_IN_MESSAGES[Math.floor(Math.random() * CHECK_IN_MESSAGES.length)];
      const result = await enqueueAndSend({
        profile,
        type: 'proactive_checkin',
        content: message,
      });

      if (result) {
        // Update last proactive timestamp
        await store.updateProfile(profile.id, {
          lastProactiveAt: new Date().toISOString(),
        });
        results.push({ id: profile.id, sent: result.status === 'sent' });
      }
    }

    return NextResponse.json({
      ok: true,
      checked: eligible.length,
      sent: results.filter(r => r.sent).length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[api/cron/checkin] error', err);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
