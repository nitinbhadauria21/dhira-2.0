import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/store';
import { createDevOtp } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PHONE_RE = /^\+?[1-9]\d{6,14}$/;

/**
 * POST /api/auth/otp/request  { phone }
 * Dev mode: generates a 6-digit code and returns it in `devCode` so you can
 * test without an SMS provider. Live mode: the browser calls Supabase
 * signInWithOtp({ phone }) directly (Supabase + Twilio send the real SMS).
 */
export async function POST(req: NextRequest) {
  try {
    if (isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Use Supabase phone OTP in live mode' }, { status: 400 });
    }
    const { phone } = await req.json().catch(() => ({}));
    const normalized = String(phone ?? '').replace(/[\s-]/g, '');
    if (!PHONE_RE.test(normalized)) {
      return NextResponse.json({ error: 'Enter a valid phone number with country code' }, { status: 400 });
    }
    const code = createDevOtp(normalized);
    // DEV ONLY: returning the code so it can be entered without real SMS.
    return NextResponse.json({ ok: true, devCode: code, phone: normalized });
  } catch (err) {
    console.error('[api/auth/otp/request] error', err);
    return NextResponse.json({ error: 'Could not send a code' }, { status: 500 });
  }
}
