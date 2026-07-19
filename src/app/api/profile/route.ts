import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { getStore } from '@/lib/store';
import type { Profile } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/profile → this user's profile + check-in contract. */
export async function GET() {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    const store = getStore();
    const profile = await store.getOrCreateProfile(uid);
    return NextResponse.json({ profile });
  } catch (err) {
    console.error('[api/profile] GET error', err);
    return NextResponse.json({ error: 'could not load profile' }, { status: 500 });
  }
}

/** PUT /api/profile → save alias / avatar / language / consent / check-in contract. */
export async function PUT(req: NextRequest) {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    const body = (await req.json().catch(() => ({}))) as Partial<Profile>;

    const patch: Partial<Profile> = {};
    if (typeof body.alias === 'string') patch.alias = body.alias.slice(0, 60);
    if (typeof body.avatar === 'string') patch.avatar = body.avatar;
    if (body.language === 'english' || body.language === 'hinglish') patch.language = body.language;
    if (typeof body.email === 'string') patch.email = body.email.slice(0, 200);
    if (typeof body.phoneE164 === 'string') patch.phoneE164 = body.phoneE164.slice(0, 20);
    if (body.preferredChannel === 'email' || body.preferredChannel === 'whatsapp') patch.preferredChannel = body.preferredChannel;
    if (typeof body.emailOptIn === 'boolean') patch.emailOptIn = body.emailOptIn;
    if (typeof body.whatsappOptIn === 'boolean') patch.whatsappOptIn = body.whatsappOptIn;
    if (typeof body.timezone === 'string') patch.timezone = body.timezone;
    if (typeof body.consentCheckin === 'boolean') patch.consentCheckin = body.consentCheckin;
    if (typeof body.consentMemory === 'boolean') patch.consentMemory = body.consentMemory;
    if (
      body.checkinFrequency === 'daily' ||
      body.checkinFrequency === 'every-other-day' ||
      body.checkinFrequency === 'weekly'
    ) {
      patch.checkinFrequency = body.checkinFrequency;
    }
    if (typeof body.checkinWindow === 'string') patch.checkinWindow = body.checkinWindow;

    const store = getStore();
    const profile = await store.updateProfile(uid, patch);
    return NextResponse.json({ profile });
  } catch (err) {
    console.error('[api/profile] PUT error', err);
    return NextResponse.json({ error: 'could not save profile' }, { status: 500 });
  }
}
