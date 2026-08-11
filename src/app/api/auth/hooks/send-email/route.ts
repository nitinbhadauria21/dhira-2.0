import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'standardwebhooks';
import {
  buildRecoveryConfirmUrl,
  passwordResetSiteUrl,
  sendPasswordResetViaResend,
} from '@/lib/passwordReset';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SendEmailHookPayload = {
  user: { email?: string };
  email_data: {
    token_hash?: string;
    email_action_type?: string;
  };
};

function hookSecretRaw(): string | null {
  const raw = process.env.SUPABASE_SEND_EMAIL_HOOK_SECRET?.trim();
  if (!raw) return null;
  return raw.startsWith('v1,whsec_') ? raw.replace('v1,whsec_', '') : raw;
}

/**
 * POST /api/auth/hooks/send-email — Supabase Send Email Hook (recovery only).
 * Sends token_hash → /auth/confirm links via Resend (no Emergent).
 */
export async function POST(req: NextRequest) {
  const secret = hookSecretRaw();
  if (!secret) {
    console.error('[auth/hooks/send-email] SUPABASE_SEND_EMAIL_HOOK_SECRET not set');
    return NextResponse.json({ error: { http_code: 500, message: 'Hook not configured' } }, { status: 500 });
  }

  const payloadText = await req.text();
  const headers = Object.fromEntries(req.headers.entries());

  let payload: SendEmailHookPayload;
  try {
    const wh = new Webhook(secret);
    payload = wh.verify(payloadText, headers) as SendEmailHookPayload;
  } catch (err) {
    console.error('[auth/hooks/send-email] verify', err);
    return NextResponse.json({ error: { http_code: 401, message: 'Invalid hook signature' } }, { status: 401 });
  }

  const to = payload.user?.email?.trim();
  const action = payload.email_data?.email_action_type;
  const tokenHash = payload.email_data?.token_hash;

  if (!to || action !== 'recovery' || !tokenHash) {
    return NextResponse.json(
      { error: { http_code: 501, message: 'Only recovery emails are handled by this hook' } },
      { status: 501 },
    );
  }

  const siteUrl = passwordResetSiteUrl(new URL(req.url).origin);
  const resetLink = buildRecoveryConfirmUrl(siteUrl, tokenHash);
  const sent = await sendPasswordResetViaResend({ to, resetLink });

  if (!sent) {
    console.error('[auth/hooks/send-email] Resend not configured for', to);
    return NextResponse.json(
      {
        error: {
          http_code: 500,
          message: 'Set RESEND_API_KEY and RESEND_FROM_EMAIL on Vercel for password reset emails',
        },
      },
      { status: 500 },
    );
  }

  console.log('[auth/hooks/send-email] recovery sent via Resend to', to);
  return NextResponse.json({});
}

export async function GET() {
  return NextResponse.json({ ok: true, hook: 'send-email' });
}
