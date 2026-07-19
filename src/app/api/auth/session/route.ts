import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { verifySupabaseToken, setSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/session  { accessToken, email?, phone? }
 * Live mode only: the browser signs in with Supabase, then posts its access
 * token here. We verify it server-side and set our `dhira_session` cookie so
 * server routes have a uniform identity in both modes.
 */
export async function POST(req: NextRequest) {
  try {
    const { accessToken, email, phone } = await req.json().catch(() => ({}));
    const uid = await verifySupabaseToken(accessToken ?? '');
    if (!uid) return NextResponse.json({ error: 'invalid token' }, { status: 401 });

    const store = getStore();
    await store.getOrCreateProfile(uid);
    const patch: Record<string, string> = {};
    if (typeof email === 'string') patch.email = email;
    if (typeof phone === 'string') patch.phoneE164 = phone;
    if (Object.keys(patch).length) await store.updateProfile(uid, patch);

    await setSession(uid);
    return NextResponse.json({ userId: uid });
  } catch (err) {
    console.error('[api/auth/session] error', err);
    return NextResponse.json({ error: 'Could not establish session' }, { status: 500 });
  }
}
