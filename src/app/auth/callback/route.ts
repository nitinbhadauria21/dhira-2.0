import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { getStore, isSupabaseAuthConfigured } from '@/lib/store';
import type { Profile } from '@/lib/types';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/onboarding';
  if (raw.startsWith('/auth/callback')) return '/onboarding';
  if (raw === '/reset-password') return '/reset-password';
  return raw;
}

function redirectToSignIn(requestUrl: URL, message: string) {
  const signIn = new URL('/sign-in', requestUrl.origin);
  signIn.searchParams.set('error', message.slice(0, 200));
  return NextResponse.redirect(signIn);
}

/**
 * GET /auth/callback — Supabase PKCE: Google OAuth and password recovery links.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const rawNext = requestUrl.searchParams.get('next');
  const isPasswordRecovery = rawNext === '/reset-password';
  const oauthError =
    requestUrl.searchParams.get('error_description') ||
    requestUrl.searchParams.get('error');

  if (oauthError) {
    return redirectToSignIn(requestUrl, oauthError);
  }

  if (!code) {
    return redirectToSignIn(
      requestUrl,
      isPasswordRecovery
        ? 'Password reset link did not include a valid code. Request a new link.' :'Google sign-in did not return an authorization code.',
    );
  }

  if (!isSupabaseAuthConfigured()) {
    return redirectToSignIn(requestUrl, 'Supabase is not configured for Google sign-in.');
  }

  let cookieResponse = NextResponse.redirect(new URL('/sign-in', requestUrl.origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookieResponse = NextResponse.redirect(new URL('/sign-in', requestUrl.origin));
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.error('[auth/callback] exchangeCodeForSession', exchangeError.message);
    const pkceRecovery =
      isPasswordRecovery && /pkce|code verifier/i.test(exchangeError.message);
    if (pkceRecovery) {
      const forgot = new URL('/forgot-password', requestUrl.origin);
      forgot.searchParams.set(
        'error',
        'Open the reset link in the same browser where you requested it, or request a new link from Forgot Password.',
      );
      return NextResponse.redirect(forgot);
    }
    return redirectToSignIn(
      requestUrl,
      exchangeError.message ||
        (isPasswordRecovery ? 'Could not open password reset link.' : 'Could not complete Google sign-in.'),
    );
  }

  if (isPasswordRecovery) {
    const resetRedirect = NextResponse.redirect(new URL('/reset-password', requestUrl.origin));
    cookieResponse.cookies.getAll().forEach((c) => resetRedirect.cookies.set(c.name, c.value));
    return resetRedirect;
  }

  const next = safeNextPath(rawNext);

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return redirectToSignIn(requestUrl, 'Google sign-in did not return a user.');
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
    const existing = await store.getOrCreateProfile(uid);
    const patch: Partial<Profile> = {};
    if (email && !existing.email?.trim()) patch.email = email;
    if (alias) patch.alias = alias.slice(0, 60);
    if (Object.keys(patch).length) await store.updateProfile(uid, patch);

    const jar = await cookies();
    jar.set('dhira_session', uid, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  } catch (err) {
    console.error('[auth/callback] dhira session', err);
    return redirectToSignIn(requestUrl, 'Could not create your DHIRA session.');
  }

  const redirectUrl = new URL(next, requestUrl.origin);
  redirectUrl.searchParams.set('google', '1');
  if (alias && alias !== 'Friend') {
    redirectUrl.searchParams.set('alias', alias.slice(0, 60));
  }

  const finalRedirect = NextResponse.redirect(redirectUrl);
  cookieResponse.cookies.getAll().forEach((c) => finalRedirect.cookies.set(c.name, c.value));
  return finalRedirect;
}
