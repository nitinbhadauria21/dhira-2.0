import { NextRequest, NextResponse } from 'next/server';
import { getStore, isSupabaseAuthConfigured } from '@/lib/store';
import { hashPassword, setSession, newUserId } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/signup  { email, password, alias?, state?, city? }
 * Dev-mode email+password sign-up. In live mode the browser signs up against
 * Supabase directly and then calls /api/auth/session instead.
 */
export async function POST(req: NextRequest) {
  try {
    if (isSupabaseAuthConfigured()) {
      return NextResponse.json({ error: 'Use Supabase sign-up in live mode' }, { status: 400 });
    }
    const { email, password, alias, state, city } = await req.json().catch(() => ({}));
    if (!EMAIL_RE.test(email ?? '')) return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    if (typeof state !== 'string' || !state.trim()) {
      return NextResponse.json({ error: 'Please choose your state' }, { status: 400 });
    }
    if (typeof city !== 'string' || !city.trim()) {
      return NextResponse.json({ error: 'Please enter your city' }, { status: 400 });
    }

    const store = getStore();
    const existing = await store.getAuthUserByEmail(email);
    if (existing) return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });

    const id = newUserId();
    await store.createAuthUser({
      id,
      email,
      phoneE164: null,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    });
    await store.getOrCreateProfile(id);
    await store.updateProfile(id, {
      email,
      alias: alias || 'Friend',
      state: state.trim().slice(0, 80),
      city: city.trim().slice(0, 80),
    });
    await setSession(id);
    return NextResponse.json({ userId: id });
  } catch (err) {
    console.error('[api/auth/signup] error', err);
    return NextResponse.json({ error: 'Could not create your account' }, { status: 500 });
  }
}
