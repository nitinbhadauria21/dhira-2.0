import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUid } from '@/lib/session';
import { getStore } from '@/lib/store';
import type { Profile } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/profile → this user's profile + check-in contract. */
export async function GET() {
  try {
    const uid = await getOrCreateUid();
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
    const uid = await getOrCreateUid();
    const body = (await req.json().catch(() => ({}))) as Partial<Profile>;

    const patch: Partial<Profile> = {};
    if (typeof body.alias === 'string') patch.alias = body.alias.slice(0, 60);
    if (typeof body.avatar === 'string') patch.avatar = body.avatar;
    if (body.language === 'english' || body.language === 'hinglish') patch.language = body.language;
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
