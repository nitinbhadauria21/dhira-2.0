import { randomUUID } from 'crypto';
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

/** Deliver reset email via Emergent notify webhook (plain link — any browser/device). */
export async function sendPasswordResetEmail(params: {
  to: string;
  resetLink: string;
}): Promise<boolean> {
  const webhook = process.env.EMERGENT_NOTIFY_WEBHOOK_URL?.trim();
  if (!webhook) return false;

  const res = await fetch(webhook, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-emergent-secret': process.env.EMERGENT_WEBHOOK_SECRET ?? '',
    },
    body: JSON.stringify({
      notificationId: randomUUID(),
      channel: 'email',
      to: params.to,
      type: 'password_reset',
      templateKey: 'dhira_password_reset_v1',
      subject: 'Reset your Dhira password',
      alias: 'Friend',
      language: 'english',
      content: passwordResetEmailPlainText(params.resetLink),
    }),
  }).catch(() => null);

  return Boolean(res?.ok);
}

/** Optional Resend.com delivery (RESEND_API_KEY + RESEND_FROM_EMAIL on Vercel). */
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

  return Boolean(res?.ok);
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

/** Try Emergent, then Resend. */
export async function deliverPasswordResetEmail(params: {
  to: string;
  resetLink: string;
}): Promise<'emergent' | 'resend' | false> {
  if (await sendPasswordResetEmail(params)) return 'emergent';
  if (await sendPasswordResetViaResend(params)) return 'resend';
  return false;
}

/** Legacy Supabase /recover mailer (PKCE link — same-browser only). Last resort. */
export async function sendLegacySupabaseRecoverEmail(
  email: string,
  redirectTo: string,
): Promise<boolean> {
  if (!isSupabaseAuthConfigured()) return false;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return false;

  const res = await fetch(`${url}/auth/v1/recover`, {
    method: 'POST',
    headers: {
      apikey: anon,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, redirect_to: redirectTo }),
  }).catch(() => null);

  return Boolean(res?.ok);
}
