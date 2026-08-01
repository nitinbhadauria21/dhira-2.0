import { NextRequest, NextResponse } from 'next/server';
import { getStore, isSupabaseAuthConfigured } from '@/lib/store';
import { hashPassword, setSession, newUserId, verifySupabaseToken } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/signup  { email, password, alias? }
 * Works in both modes:
 * - Live (Supabase): signs up via Supabase Admin API server-side, sets session cookie.
 * - Dev (no Supabase): stores credentials in local JSON store.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password, alias } = await req.json().catch(() => ({}));
    if (!EMAIL_RE.test(email ?? '')) return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    if (isSupabaseAuthConfigured()) {
      // Server-side Supabase signup using service role key (bypasses browser NEXT_PUBLIC_ requirement)
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.SUPABASE_SERVICE_ROLE_KEY as string,
        { auth: { persistSession: false } }
      );
      const { data, error } = await sb.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { alias: alias || 'Friend' },
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      const uid = data.user.id;
      const store = getStore();
      await store.getOrCreateProfile(uid);
      await store.updateProfile(uid, { email, alias: alias || 'Friend' });
      await setSession(uid);
      return NextResponse.json({ userId: uid });
    }

    // Dev mode — local JSON store
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
    await store.updateProfile(id, { email, alias: alias || 'Friend' });
    await setSession(id);
    return NextResponse.json({ userId: id });
  } catch (err) {
    console.error('[api/auth/signup] error', err);
    return NextResponse.json({ error: 'Could not create your account' }, { status: 500 });
  }
}
