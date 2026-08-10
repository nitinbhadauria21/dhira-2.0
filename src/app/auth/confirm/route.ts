import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createServerSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function safeNextPath(raw: string | null): string {
  if (raw === '/reset-password') return '/reset-password';
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/reset-password';
  if (raw.startsWith('/auth/')) return '/reset-password';
  return raw;
}

/**
 * GET /auth/confirm — email OTP links (recovery, signup confirm) via token_hash.
 * Avoids PKCE code_verifier (works when the email opens on another device/browser).
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const next = safeNextPath(requestUrl.searchParams.get('next'));

  const fail = (message: string) => {
    const url = new URL('/forgot-password', requestUrl.origin);
    url.searchParams.set('error', message.slice(0, 200));
    return NextResponse.redirect(url);
  };

  if (!tokenHash || !type) {
    return fail('Reset link was incomplete. Request a new password reset email.');
  }

  const supabase = await createServerSupabase();
  if (!supabase) {
    return fail('Supabase is not configured for password reset.');
  }

  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    console.error('[auth/confirm] verifyOtp', error.message);
    return fail(error.message || 'Could not verify reset link. Request a new one.');
  }

  if (type === 'recovery') {
    return NextResponse.redirect(new URL('/reset-password', requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
