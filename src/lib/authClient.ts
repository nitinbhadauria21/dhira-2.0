'use client';

import { getBrowserSupabaseAsync } from './supabaseBrowser';
import { normalizePhoneE164, phoneAuthError } from './twilio/phone';
import { formatPhoneOtpSendError } from './phoneOtpErrors';
import { formatPasswordResetError } from './passwordResetErrors';

/**
 * Client auth helpers. Each one works in both modes:
 *  - Live (Supabase configured): talk to Supabase Auth, then hand the token to
 *    /api/auth/session so the server sets our unified session cookie.
 *  - Dev: call the app's own /api/auth/* endpoints.
 */

export type SignUpLocation = {
  state: string;
  city: string;
  language?: string;
};

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export async function signUpEmail(
  email: string,
  password: string,
  alias?: string,
  location?: SignUpLocation,
) {
  const state = location?.state?.trim() || undefined;
  const city = location?.city?.trim() || undefined;
  const language = location?.language?.trim() || undefined;
  const sb = await getBrowserSupabaseAsync();
  if (sb) {
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: {
          alias: alias || 'Friend',
          ...(state ? { state } : {}),
          ...(city ? { city } : {}),
          ...(language ? { language } : {}),
        },
      },
    });
    if (error) throw new Error(error.message);
    const token = data.session?.access_token;
    if (!token) {
      // Supabase created the user but did not start a session — almost always
      // because "Confirm email" is still ON in the project Auth settings.
      throw new Error(
        'Account created. In Supabase → Authentication → Providers → Email, turn OFF “Confirm email” for Demo Day, then sign in. Or confirm via the email link first.',
      );
    }
    return postJson('/api/auth/session', { accessToken: token, email, state, city, alias: alias || 'Friend', language });
  }
  return postJson('/api/auth/signup', { email, password, alias, state, city, language });
}

export async function signInEmail(email: string, password: string) {
  // Server-side sign-in — reliable, uses live Supabase env, sets dhira_session cookie.
  return postJson('/api/auth/signin', { email, password });
}

/** Returns { devCode } in dev mode so the tester can enter it. */
export async function requestOtp(phone: string): Promise<{ devCode?: string }> {
  const authErr = phoneAuthError(phone);
  if (authErr) throw new Error(authErr);
  const normalized = normalizePhoneE164(phone);
  const sb = await getBrowserSupabaseAsync();
  if (sb) {
    const { error } = await sb.auth.signInWithOtp({ phone: normalized });
    if (error) throw new Error(formatPhoneOtpSendError(error.message));
    return {};
  }
  return postJson('/api/auth/otp/request', { phone: normalized });
}

export async function verifyOtp(
  phone: string,
  code: string,
  alias?: string,
  location?: SignUpLocation,
) {
  const authErr = phoneAuthError(phone);
  if (authErr) throw new Error(authErr);
  const normalized = normalizePhoneE164(phone);
  const state = location?.state?.trim() || undefined;
  const city = location?.city?.trim() || undefined;
  const language = location?.language?.trim() || undefined;
  const sb = await getBrowserSupabaseAsync();
  if (sb) {
    const { data, error } = await sb.auth.verifyOtp({
      phone: normalized,
      token: code,
      type: 'sms',
    });
    if (error) throw new Error(formatPhoneOtpSendError(error.message));
    return postJson('/api/auth/session', {
      accessToken: data.session?.access_token,
      phone: normalized,
      state,
      city,
      alias: alias || 'Friend',
      language,
    });
  }
  return postJson('/api/auth/otp/verify', { phone: normalized, code, alias, state, city, language });
}

const PASSWORD_RESET_DEV_MSG =
  'Password reset needs Supabase connected. Add your Supabase URL and anon key in .env.local (see docs/SUPABASE_PASSWORD_RESET.md).';

/** Where Supabase redirects after the user clicks the reset link in email (default template). */
export function passwordResetCallbackUrl(): string {
  return `${window.location.origin}/auth/callback?next=/reset-password`;
}

/** Email a reset link (Supabase Auth). Always show success in UI if no throw — avoids email enumeration. */
export async function requestPasswordReset(email: string): Promise<void> {
  const trimmed = email.trim();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error('Please enter a valid email address.');
  }
  const sb = await getBrowserSupabaseAsync();
  if (!sb) throw new Error(PASSWORD_RESET_DEV_MSG);
  const { error } = await sb.auth.resetPasswordForEmail(trimmed, {
    redirectTo: passwordResetCallbackUrl(),
  });
  if (error) throw new Error(formatPasswordResetError(error.message));
}

/** After recovery link opened: save new password in Supabase, then sign out for a fresh sign-in. */
export async function completePasswordReset(newPassword: string): Promise<void> {
  if (newPassword.length < 8) {
    throw new Error('Please use at least 8 characters for your new password.');
  }
  const sb = await getBrowserSupabaseAsync();
  if (!sb) throw new Error(PASSWORD_RESET_DEV_MSG);
  const { error: updateError } = await sb.auth.updateUser({ password: newPassword });
  if (updateError) throw new Error(updateError.message);
  await signOut();
}

export async function signOut() {
  const sb = await getBrowserSupabaseAsync();
  if (sb) await sb.auth.signOut().catch(() => {});
  await fetch('/api/auth/signout', { method: 'POST' });
}

const GOOGLE_NOT_ENABLED_MSG =
  'Google sign-in is not turned on in Supabase yet. In Supabase → Authentication → Providers → Google, turn it ON and paste your Google Client ID and secret (from Google Cloud).';

/**
 * Start Google OAuth via server route (PKCE cookies + live Supabase env).
 */
export async function signInWithGoogle(next = '/onboarding') {
  if (typeof window === 'undefined') {
    throw new Error(GOOGLE_NOT_ENABLED_MSG);
  }
  window.location.assign(`/api/auth/google?next=${encodeURIComponent(next)}`);
}
