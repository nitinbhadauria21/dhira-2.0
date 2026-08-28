import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { isSupabaseAuthConfigured } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GOOGLE_NOT_ENABLED_MSG =
  'Google sign-in is not turned on in Supabase yet. In Supabase → Authentication → Providers → Google, turn it ON.';

function safeNextPath(raw: string | null): string {
  if (raw && raw.startsWith('/') && !raw.startsWith('//')) return raw;
  return '/onboarding';
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });
}

/**
 * GET /api/auth/google?next=/onboarding
 *
 * Starts Google OAuth from the server (PKCE cookies + correct live Supabase env).
 */
export async function GET(req: NextRequest) {
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.redirect(
      new URL('/sign-in?error=Google+sign-in+needs+Supabase+configured', req.url),
    );
  }

  const next = safeNextPath(req.nextUrl.searchParams.get('next'));
  const origin = req.nextUrl.origin;
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

  let cookieResponse = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          cookieResponse = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });

  if (error) {
    const msg = /not enabled|unsupported provider/i.test(error.message)
      ? GOOGLE_NOT_ENABLED_MSG
      : error.message;
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(msg.slice(0, 200))}`, req.url),
    );
  }

  if (!data.url) {
    return NextResponse.redirect(
      new URL('/sign-in?error=Could+not+start+Google+sign-in', req.url),
    );
  }

  const oauthRedirect = NextResponse.redirect(data.url);
  copyCookies(cookieResponse, oauthRedirect);
  return oauthRedirect;
}
