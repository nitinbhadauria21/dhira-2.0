import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseAuthConfigured } from '@/lib/store';
import { verifyPassword, setSession } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/signin  { email, password }
 * Works in both modes:
 * - Live (Supabase): signs in via Supabase anon key server-side, sets session cookie.
 * - Dev: verifies password hash from local store.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json().catch(() => ({}));
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (isSupabaseAuthConfigured()) {
      // Server-side Supabase sign-in using anon key
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
        { auth: { persistSession: false } }
      );
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error || !data.session) {
        return NextResponse.json({ error: 'Wrong email or password' }, { status: 401 });
      }
      const uid = data.user.id;
      await setSession(uid);
      return NextResponse.json({ userId: uid });
    }

    // Dev mode — local store
    const { getStore } = await import('@/lib/store');
    const store = getStore();
    const user = email ? await store.getAuthUserByEmail(email) : null;
    if (!user || !verifyPassword(password ?? '', user.passwordHash)) {
      return NextResponse.json({ error: 'Wrong email or password' }, { status: 401 });
    }
    await setSession(user.id);
    return NextResponse.json({ userId: user.id });
  } catch (err) {
    console.error('[api/auth/signin] error', err);
    return NextResponse.json({ error: 'Could not sign you in' }, { status: 500 });
  }
}
