import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function looksLikePlaceholder(value: string | undefined): boolean {
  if (!value?.trim()) return true;
  const v = value.trim().toLowerCase();
  return v.includes('dummy') || v.includes('your-') || v.includes('updateyour') || v === 'changeme';
}

/**
 * GET /api/auth/supabase-config
 *
 * Returns the live Supabase URL + publishable key from server env.
 * The browser uses this instead of only build-time NEXT_PUBLIC_* embeds so
 * sign-in keeps working after env updates without users clearing cache.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

  if (looksLikePlaceholder(url) || looksLikePlaceholder(anonKey)) {
    return NextResponse.json({ configured: false });
  }

  return NextResponse.json(
    { configured: true, url, anonKey },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}
