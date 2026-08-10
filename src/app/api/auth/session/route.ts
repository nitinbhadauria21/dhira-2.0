import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { verifySupabaseToken, setSession } from '@/lib/auth';
import type { Profile } from '@/lib/types';
import { normalizePhoneE164 } from '@/lib/twilio/phone';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/session  { accessToken, email?, phone?, alias?, state?, city? }
 * Live mode only: the browser signs in with Supabase, then posts its access
 * token here. We verify it server-side and set our `dhira_session` cookie so
 * server routes have a uniform identity in both modes.
 *
 * On first sign-up, optional alias / state / city are written to the profile row
 * (Supabase Auth metadata alone is not enough for our store).
 */
export async function POST(req: NextRequest) {
  try {
    const { accessToken, email, phone, alias, state, city } = await req.json().catch(() => ({}));
    const uid = await verifySupabaseToken(accessToken ?? '');
    if (!uid) return NextResponse.json({ error: 'invalid token' }, { status: 401 });

    const store = getStore();
    await store.getOrCreateProfile(uid);
    const patch: Partial<Profile> = {};
    if (typeof email === 'string') patch.email = email;
    if (typeof phone === 'string' && phone.trim()) {
      patch.phoneE164 = normalizePhoneE164(phone).slice(0, 20);
    }
    if (typeof alias === 'string' && alias.trim()) patch.alias = alias.trim().slice(0, 60);
    if (typeof state === 'string' && state.trim()) patch.state = state.trim().slice(0, 80);
    if (typeof city === 'string' && city.trim()) patch.city = city.trim().slice(0, 80);
    if (Object.keys(patch).length) await store.updateProfile(uid, patch);

    await setSession(uid);
    return NextResponse.json({ userId: uid });
  } catch (err) {
    console.error('[api/auth/session] error', err);
    return NextResponse.json({ error: 'Could not establish session' }, { status: 500 });
  }
}
