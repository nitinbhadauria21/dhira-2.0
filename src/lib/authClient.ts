'use client';

import { getBrowserSupabase } from './supabaseBrowser';

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
  const sb = getBrowserSupabase();
  if (sb) {
    const { error } = await sb.auth.signInWithOtp({ phone });
    if (error) throw new Error(error.message);
    return {};
  }
  return postJson('/api/auth/otp/request', { phone });
}

export async function verifyOtp(
  phone: string,
  code: string,
  alias?: string,
  location?: SignUpLocation,
) {
  const state = location?.state?.trim() || undefined;
  const city = location?.city?.trim() || undefined;
  const sb = getBrowserSupabase();
  if (sb) {
    const { data, error } = await sb.auth.verifyOtp({ phone, token: code, type: 'sms' });
    if (error) throw new Error(error.message);
    return postJson('/api/auth/session', {
      accessToken: data.session?.access_token,
      phone,
      state,
      city,
      alias: alias || 'Friend',
    });
  }
  return postJson('/api/auth/otp/verify', { phone, code, alias, state, city });
}

export async function signOut() {
  const sb = getBrowserSupabase();
  if (sb) await sb.auth.signOut().catch(() => {});
  await fetch('/api/auth/signout', { method: 'POST' });
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
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
  if (error) throw new Error(error.message);
}
