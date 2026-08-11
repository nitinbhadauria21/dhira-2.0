import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseAuthConfigured } from '@/lib/store';
import {
  deliverPasswordResetEmail,
  generateRecoveryConfirmLink,
  isValidResetEmail,
  normalizeResetEmail,
  passwordResetSiteUrl,
} from '@/lib/passwordReset';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/password-reset/request  { email }
 *
 * Cross-browser password reset via Supabase Auth email (Resend SMTP + recovery
 * template, or Send Email Hook). Falls back to Resend API from Dhira if needed.
 * Always returns { ok: true } when the address format is valid — no enumeration.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = normalizeResetEmail(String(body.email ?? ''));

    if (!email || !isValidResetEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!isSupabaseAuthConfigured()) {
      return NextResponse.json(
        { error: 'Password reset needs Supabase connected. See docs/SUPABASE_PASSWORD_RESET.md.' },
        { status: 503 },
      );
    }

    const siteUrl = passwordResetSiteUrl(new URL(req.url).origin);

    let generated: { resetLink: string } | null = null;
    try {
      generated = await generateRecoveryConfirmLink(email, siteUrl);
    } catch (err) {
      console.error('[password-reset/request] generateLink', err);
    }

    if (generated?.resetLink) {
      const delivery = await deliverPasswordResetEmail({
        email,
        siteUrl,
        resetLink: generated.resetLink,
      });
      if (delivery) {
        return NextResponse.json({ ok: true, delivery });
      }
      console.error(
        '[password-reset/request] No delivery for',
        email,
        '— configure Resend SMTP on Supabase (npm run configure:password-reset) or set RESEND_API_KEY on Vercel.',
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[password-reset/request] error', err);
    return NextResponse.json({ error: 'Could not send reset email' }, { status: 500 });
  }
}
