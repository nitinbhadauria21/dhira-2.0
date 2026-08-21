import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { resolveNotificationEmail } from '@/lib/email/address';
import { getStore } from '@/lib/store';
import {
  isEmailEnabled,
  verifyEmailProvider,
  sendEmail,
  buildCheckinEmailHtml,
  checkinEmailPlainText,
} from '@/lib/email/resend';
import { emailConnectionTestMessage } from '@/lib/languages';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/email/test — send one warm test email to the profile check-in address. */
export async function POST() {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

    if (!isEmailEnabled()) {
      return NextResponse.json({ error: 'Email is not enabled on this server.' }, { status: 503 });
    }

    const providerCheck = await verifyEmailProvider();
    if (!providerCheck.ok) {
      return NextResponse.json({ error: providerCheck.reason }, { status: 503 });
    }

    const store = getStore();
    const profile = await store.getOrCreateProfile(uid);
    const to = resolveNotificationEmail(profile);

    if (!to) {
      return NextResponse.json(
        {
          error: profile.emailOptIn
            ? 'Add a valid email under Check-ins and save, then try again.'
            : 'Turn on Email notifications under Check-ins and save first.',
        },
        { status: 400 },
      );
    }

    const text = emailConnectionTestMessage(profile.alias, profile.language);
    const subject = 'Quick test from Dhira';
    const result = await sendEmail({
      to,
      subject,
      text: checkinEmailPlainText(profile.alias, text),
      html: buildCheckinEmailHtml(profile.alias, text),
      replyTo: process.env.EMAIL_REPLY_TO?.trim() || undefined,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.description ?? 'Email could not be delivered.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, messageId: result.messageId });
  } catch (err) {
    console.error('[api/email/test] error', err);
    return NextResponse.json({ error: 'Test email failed.' }, { status: 500 });
  }
}
