'use client';

import { getBrowserSupabase } from './supabaseBrowser';
import { normalizePhoneE164, phoneAuthError } from './twilio/phone';
import { formatPhoneOtpSendError } from './phoneOtpErrors';

/**
 * Client auth helpers. Each one works in both modes:
 *  - Live (Supabase configured): talk to Supabase Auth, then hand the token to
 *    /api/auth/session so the server sets our unified session cookie.
 *  - Dev: call the app's own /api/auth/* endpoints.
 */

export type SignUpLocation = {
  state: string;
  city: string;
};

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
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
  const sb = getBrowserSupabase();
  if (sb) {
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: {
          alias: alias || 'Friend',
          ...(state ? { state } : {}),
          ...(city ? { city } : {}),
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
    return postJson('/api/auth/session', { accessToken: token, email, state, city, alias: alias || 'Friend' });
  }
  return postJson('/api/auth/signup', { email, password, alias, state, city });
}

export async function signInEmail(email: string, password: string) {
  const sb = getBrowserSupabase();
  if (sb) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return postJson('/api/auth/session', { accessToken: data.session?.access_token, email });
  }
  return postJson('/api/auth/signin', { email, password });
}

/** Returns { devCode } in dev mode so the tester can enter it. */
export async function requestOtp(phone: string): Promise<{ devCode?: string }> {
  const authErr = phoneAuthError(phone);
  if (authErr) throw new Error(authErr);
  const normalized = normalizePhoneE164(phone);
  const sb = getBrowserSupabase();
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
  const sb = getBrowserSupabase();
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
    });
  }
  return postJson('/api/auth/otp/verify', { phone: normalized, code, alias, state, city });
}

const PASSWORD_RESET_DEV_MSG =
  'Password reset needs Supabase connected. Add your Supabase URL and anon key in .env.local (see docs/SUPABASE_PASSWORD_RESET.md).';

/** Where Supabase sends the user after they click the reset link in email. */
export function passwordResetCallbackUrl(): string {
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent('/reset-password')}`;
}

/** Email a reset link (Supabase Auth). Always show success in UI if no throw — avoids email enumeration. */
export async function requestPasswordReset(email: string): Promise<void> {
  const trimmed = email.trim();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error('Please enter a valid email address.');
  }
  const sb = getBrowserSupabase();
  if (!sb) throw new Error(PASSWORD_RESET_DEV_MSG);
  const { error } = await sb.auth.resetPasswordForEmail(trimmed, {
    redirectTo: passwordResetCallbackUrl(),
  });
  if (error) throw new Error(error.message);
}

/** After recovery link opened: set new password, then Dhira session cookie. */
export async function completePasswordReset(newPassword: string): Promise<void> {
  if (newPassword.length < 8) {
    throw new Error('Please use at least 8 characters for your new password.');
  }
  const sb = getBrowserSupabase();
  if (!sb) throw new Error(PASSWORD_RESET_DEV_MSG);
  const { error: updateError } = await sb.auth.updateUser({ password: newPassword });
  if (updateError) throw new Error(updateError.message);
  const { data: sessionData, error: sessionError } = await sb.auth.getSession();
  if (sessionError || !sessionData.session?.access_token) {
    throw new Error('Password updated but session missing. Please sign in with your new password.');
  }
  const { data: userData } = await sb.auth.getUser();
  const email = userData.user?.email ?? undefined;
  await postJson('/api/auth/session', {
    accessToken: sessionData.session.access_token,
    email,
  });
}

export async function signOut() {
  const sb = getBrowserSupabase();
  if (sb) await sb.auth.signOut().catch(() => {});
  await fetch('/api/auth/signout', { method: 'POST' });
}

const GOOGLE_NOT_ENABLED_MSG =
  'Google sign-in is not turned on in Supabase yet. In Supabase → Authentication → Providers → Google, turn it ON and paste your Google Client ID and secret (from Google Cloud).';

async function isGoogleProviderEnabled(): Promise<boolean | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon || anon.includes('your-')) return null;
  try {
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: anon },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { external?: { google?: boolean } };
    return data.external?.google === true;
  } catch {
    return null;
  }
}

/**
 * Start Google OAuth via Supabase. Requires Google to be enabled in the
 * Supabase dashboard (Authentication → Providers → Google).
 */
export async function signInWithGoogle(next = '/onboarding') {
  const sb = getBrowserSupabase();
  if (!sb) {
    throw new Error(
      'Google sign-in needs Supabase connected. Add your Supabase URL and anon key, then enable Google in Supabase → Authentication → Providers.',
    );
  }

  const googleOn = await isGoogleProviderEnabled();
  if (googleOn === false) {
    throw new Error(GOOGLE_NOT_ENABLED_MSG);
  }

  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
  if (error) {
    if (/not enabled|unsupported provider/i.test(error.message)) {
      throw new Error(GOOGLE_NOT_ENABLED_MSG);
    }
    throw new Error(error.message);
  }
}
