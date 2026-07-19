import { NextRequest, NextResponse } from 'next/server';
import { getStore, isSupabaseConfigured } from '@/lib/store';
import { verifyDevOtp, setSession, newUserId } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/otp/verify  { phone, code, alias? }
 * Dev-mode phone OTP verification. Creates/loads the account for that phone,
 * sets the session. Live mode uses Supabase verifyOtp + /api/auth/session.
 */
export async function POST(req: NextRequest) {
  try {
    if (isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Use Supabase phone OTP in live mode' }, { status: 400 });
    }
    const { phone, code, alias } = await req.json().catch(() => ({}));
    const normalized = String(phone ?? '').replace(/[\s-]/g, '');
    if (!verifyDevOtp(normalized, String(code ?? ''))) {
      return NextResponse.json({ error: 'That code is wrong or expired' }, { status: 401 });
    }

    const store = getStore();
    let user = await store.getAuthUserByPhone(normalized);
    if (!user) {
      const id = newUserId();
      user = { id, email: null, phoneE164: normalized, passwordHash: null, createdAt: new Date().toISOString() };
      await store.createAuthUser(user);
      await store.getOrCreateProfile(id);
      await store.updateProfile(id, { phoneE164: normalized, alias: alias || 'Friend', preferredChannel: 'whatsapp', whatsappOptIn: true });
    }
    await setSession(user.id);
    return NextResponse.json({ userId: user.id });
  } catch (err) {
    console.error('[api/auth/otp/verify] error', err);
    return NextResponse.json({ error: 'Could not verify the code' }, { status: 500 });
  }
}
