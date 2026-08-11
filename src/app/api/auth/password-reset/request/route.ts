import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseAuthConfigured } from '@/lib/store';
import {
  generateRecoveryConfirmLink,
  isValidResetEmail,
  normalizeResetEmail,
  passwordResetSiteUrl,
  deliverPasswordResetEmail,
  sendLegacySupabaseRecoverEmail,
} from '@/lib/passwordReset';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/password-reset/request  { email }
 *
 * Cross-browser password reset: server generates token_hash link via Supabase
 * Admin API and emails it through Emergent (or legacy Supabase recover fallback).
 * Always returns { ok: true } when the address format is valid — no email enumeration.
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
    const legacyRedirect = `${siteUrl}/reset-password`;

    let generated: { resetLink: string } | null = null;
    try {
      generated = await generateRecoveryConfirmLink(email, siteUrl);
    } catch (err) {
      console.error('[password-reset/request] generateLink', err);
      // Unknown account or transient error — respond generically below.
    }

    if (generated?.resetLink) {
      const delivery = await deliverPasswordResetEmail({
        to: email,
        resetLink: generated.resetLink,
      });
      if (delivery) {
        return NextResponse.json({ ok: true, delivery });
      }

      // Emergent not configured in this environment — try Supabase mailer (legacy PKCE).
      const legacySent = await sendLegacySupabaseRecoverEmail(email, legacyRedirect);
      if (legacySent) {
        console.warn(
          '[password-reset/request] Emergent webhook missing; sent legacy Supabase recover email (same-browser link). Set EMERGENT_NOTIFY_WEBHOOK_URL on production.',
        );
        return NextResponse.json({ ok: true, delivery: 'supabase_legacy' });
      }

      console.error('[password-reset/request] No email delivery configured for', email);
    }

    // No user / no delivery — still OK (avoid revealing whether the account exists).
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[password-reset/request] error', err);
    return NextResponse.json({ error: 'Could not send reset email' }, { status: 500 });
  }
}
