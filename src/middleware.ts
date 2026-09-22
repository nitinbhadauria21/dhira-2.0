import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Route protection using Supabase session validation.
 * Checks for a valid Supabase auth session OR the legacy dhira_session cookie.
 * Protected routes redirect to /sign-in when unauthenticated.
 * (Admin pages have their own client-side guard.)
 */

const PROTECTED = ['/home-dashboard', '/chat-with-dhira', '/notebook', '/profile', '/timeline'];

function getProjectRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return url.match(/https:\/\/([^.]+)\./)?.[1] ?? '';
}

function injectTokenFromHeader(request: NextRequest): void {
  const token = request.headers.get('x-sb-token');
  if (!token) return;
  const hasCookie = request.cookies.getAll().some((c) => c.name.includes('auth-token'));
  if (hasCookie) return;
  const ref = getProjectRef();
  if (ref) request.cookies.set(`sb-${ref}-auth-token`, token);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isProtected) return NextResponse.next();

  // Inject Supabase token from header (Safari iframe support)
  injectTokenFromHeader(req);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is configured, validate via Supabase session
  if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('dummy') && !supabaseUrl.includes('your-')) {
    let supabaseResponse = NextResponse.next({ request: req });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options as any);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) return supabaseResponse;

    // Fall back to legacy dhira_session cookie
    const legacySession = req.cookies.get('dhira_session')?.value;
    if (legacySession) return supabaseResponse;

    const url = req.nextUrl.clone();
    url.pathname = '/sign-in';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Dev mode: fall back to legacy dhira_session cookie
  const session = req.cookies.get('dhira_session')?.value;
  if (session) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/sign-in';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/home-dashboard/:path*', '/chat-with-dhira/:path*', '/notebook/:path*', '/profile/:path*', '/timeline/:path*'],
};
