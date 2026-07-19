import { NextRequest, NextResponse } from 'next/server';

/**
 * Route protection. If someone isn't signed in (no `dhira_session` cookie),
 * they're redirected to /sign-in before reaching the private app pages.
 * Works in both modes because we always set that cookie on login.
 * (Admin pages have their own client-side guard.)
 */
const PROTECTED = ['/home-dashboard', '/chat-with-dhira', '/profile', '/timeline'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isProtected) return NextResponse.next();

  const session = req.cookies.get('dhira_session')?.value;
  if (session) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/sign-in';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/home-dashboard/:path*', '/chat-with-dhira/:path*', '/profile/:path*', '/timeline/:path*'],
};
