import { NextRequest, NextResponse } from 'next/server';
import { getStore, isSupabaseAuthConfigured } from '@/lib/store';
import { verifyPassword, setSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/signin  { email, password }
 * Dev-mode email+password sign-in. Live mode uses Supabase + /api/auth/session.
 */
export async function POST(req: NextRequest) {
  try {
    if (isSupabaseAuthConfigured()) {
      return NextResponse.json({ error: 'Use Supabase sign-in in live mode' }, { status: 400 });
    }
    const { email, password } = await req.json().catch(() => ({}));
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
