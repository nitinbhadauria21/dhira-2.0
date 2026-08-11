import { createClient } from '@supabase/supabase-js';
import { isSupabaseAuthConfigured } from '@/lib/store';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeResetEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidResetEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

/** Public site origin for reset links (production or local). */
export function passwordResetSiteUrl(fallbackOrigin?: string): string {
  const fromEnv =
    process.env.DHIRA_SITE_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (fallbackOrigin) return fallbackOrigin.replace(/\/$/, '');
  return 'https://dhira-2-0-xi.vercel.app';
}

export function buildRecoveryConfirmUrl(siteUrl: string, hashedToken: string): string {
  const url = new URL('/auth/confirm', siteUrl);
  url.searchParams.set('token_hash', hashedToken);
  url.searchParams.set('type', 'recovery');
  url.searchParams.set('next', '/reset-password');
  return url.toString();
}

function serviceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url?.trim() || !key?.trim()) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Generate a cross-browser recovery link (token_hash → /auth/confirm). */
export async function generateRecoveryConfirmLink(
  email: string,
  siteUrl: string,
): Promise<{ resetLink: string } | null> {
  const admin = serviceRoleClient();
  if (!admin) return null;

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      redirectTo: `${siteUrl.replace(/\/$/, '')}/reset-password`,
    },
  });

  if (error) {
    const msg = error.message?.toLowerCase() ?? '';
    if (msg.includes('not found') || msg.includes('user not found')) return null;
    throw new Error(error.message || 'Could not start password reset');
  }

  const hashed = data?.properties?.hashed_token;
  if (!hashed) throw new Error('Supabase did not return a recovery token');
  return { resetLink: buildRecoveryConfirmUrl(siteUrl, hashed) };
}

export function passwordResetEmailPlainText(resetLink: string): string {
  return [
    'We received a request to reset your Dhira password.',
    '',
    'Tap or click this link to choose a new password (works in any browser or on your phone):',
    resetLink,
    '',
    'If you did not ask for this, you can safely ignore this email.',
    '',
    'In crisis? Call Tele-MANAS 14416 — free, 24×7, India-wide.',
  ].join('\n');
}

/** Send reset email via Resend HTTP API (Dhira server — optional if Supabase SMTP sends). */
export async function sendPasswordResetViaResend(params: {
  to: string;
  resetLink: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || 'Dhira <onboarding@resend.dev>';
  const resetLink = params.resetLink;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: 'Reset your Dhira password',
      html: `<h2>Reset your Dhira password</h2><p>We received a request to reset your password. Tap the link below on any phone or browser:</p><p><a href="${resetLink}">Reset password</a></p><p>If you did not ask for this, you can safely ignore this email.</p>`,
      text: passwordResetEmailPlainText(resetLink),
    }),
  }).catch(() => null);

  if (!res?.ok) {
    const errText = (await res?.text().catch(() => '')) ?? '';
    console.error('[passwordReset] Resend error', res?.status, errText.slice(0, 200));
  }
  return Boolean(res?.ok);
}

/**
 * Ask Supabase Auth to send the recovery email (uses custom SMTP + recovery template,
 * or the Send Email Hook if enabled).
 */
export async function sendSupabaseRecoveryEmail(
  email: string,
  siteUrl: string,
): Promise<boolean> {
  if (!isSupabaseAuthConfigured()) return false;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return false;

  const redirectTo = `${siteUrl.replace(/\/$/, '')}/auth/confirm?type=recovery&next=/reset-password`;

  const res = await fetch(`${url}/auth/v1/recover`, {
    method: 'POST',
    headers: {
      apikey: anon,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, redirect_to: redirectTo }),
  }).catch(() => null);

  if (!res?.ok) {
    const errText = (await res?.text().catch(() => '')) ?? '';
    console.error('[passwordReset] Supabase recover error', res?.status, errText.slice(0, 200));
  }
  return Boolean(res?.ok);
}

export type PasswordResetDelivery = 'supabase' | 'resend' | false;

/**
 * Send cross-browser reset email (no Emergent).
 * 1. Supabase /recover (SMTP + template, or Send Email Hook)
 * 2. Resend API with pre-built token_hash link
 */
export async function deliverPasswordResetEmail(params: {
  email: string;
  siteUrl: string;
  resetLink: string;
}): Promise<PasswordResetDelivery> {
  if (await sendPasswordResetViaResend({ to: params.email, resetLink: params.resetLink })) {
    return 'resend';
  }
  if (await sendSupabaseRecoveryEmail(params.email, params.siteUrl)) {
    return 'supabase';
  }
  return false;
}
