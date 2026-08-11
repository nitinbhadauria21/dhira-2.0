import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { setSession } from '@/lib/auth';
import { getStore } from '@/lib/store';
import type { Profile } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/onboarding';
  if (raw.startsWith('/auth/callback')) return '/onboarding';
  if (raw === '/reset-password') return '/reset-password';
  return raw;
}

/**
 * GET /auth/callback — Supabase PKCE: Google OAuth and password recovery links.
 * Exchanges ?code= for a session (PKCE cookies). Recovery stops before dhira_session.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const rawNext = requestUrl.searchParams.get('next');
  const isPasswordRecovery = rawNext === '/reset-password';
  const oauthError =
    requestUrl.searchParams.get('error_description') ||
    requestUrl.searchParams.get('error');

  if (oauthError) {
    const signIn = new URL('/sign-in', requestUrl.origin);
    signIn.searchParams.set('error', oauthError.slice(0, 200));
    return NextResponse.redirect(signIn);
  }

  if (!code) {
    const signIn = new URL('/sign-in', requestUrl.origin);
    signIn.searchParams.set(
      'error',
      isPasswordRecovery
        ? 'Password reset link did not include a valid code. Request a new link.'
        : 'Google sign-in did not return an authorization code.',
    );
    return NextResponse.redirect(signIn);
  }

  const supabase = await createServerSupabase();
  if (!supabase) {
    const signIn = new URL('/sign-in', requestUrl.origin);
    signIn.searchParams.set('error', 'Supabase is not configured for Google sign-in.');
    return NextResponse.redirect(signIn);
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.error('[auth/callback] exchangeCodeForSession', exchangeError.message);
    const pkceRecovery =
      isPasswordRecovery &&
      /pkce|code verifier/i.test(exchangeError.message);
    if (pkceRecovery) {
      const forgot = new URL('/forgot-password', requestUrl.origin);
      forgot.searchParams.set(
        'error',
        'Open the reset link in the same browser where you requested it, or request a new link from Forgot Password.',
      );
      return NextResponse.redirect(forgot);
    }
    const signIn = new URL('/sign-in', requestUrl.origin);
    signIn.searchParams.set(
      'error',
      exchangeError.message ||
        (isPasswordRecovery ? 'Could not open password reset link.' : 'Could not complete Google sign-in.'),
    );
    return NextResponse.redirect(signIn);
  }

  if (isPasswordRecovery) {
    return NextResponse.redirect(new URL('/reset-password', requestUrl.origin));
  }

  const next = safeNextPath(rawNext);

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    const signIn = new URL('/sign-in', requestUrl.origin);
    signIn.searchParams.set('error', 'Google sign-in did not return a user.');
    return NextResponse.redirect(signIn);
  }

  const user = userData.user;
  const uid = user.id;
  const email = user.email ?? undefined;
  const meta = user.user_metadata ?? {};
  const alias =
    (typeof meta.alias === 'string' && meta.alias.trim()) ||
    (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
    (typeof meta.name === 'string' && meta.name.trim()) ||
    'Friend';

  try {
    const store = getStore();
    await store.getOrCreateProfile(uid);
    const patch: Partial<Profile> = {};
    if (email) patch.email = email;
    if (alias) patch.alias = alias.slice(0, 60);
    if (Object.keys(patch).length) await store.updateProfile(uid, patch);
    await setSession(uid);
  } catch (err) {
    console.error('[auth/callback] dhira session', err);
    const signIn = new URL('/sign-in', requestUrl.origin);
    signIn.searchParams.set('error', 'Could not create your DHIRA session.');
    return NextResponse.redirect(signIn);
  }

  const redirectUrl = new URL(next, requestUrl.origin);
  redirectUrl.searchParams.set('google', '1');
  if (alias && alias !== 'Friend') {
    redirectUrl.searchParams.set('alias', alias.slice(0, 60));
  }
  return NextResponse.redirect(redirectUrl);
}
