import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { normalizeEmail } from '@/lib/email/address';
import { getStore } from '@/lib/store';
import type { Profile } from '@/lib/types';
import { isLanguage, normalizeLanguage } from '@/lib/languages';
import { isShiftPreference } from '@/lib/timeOfDay';
import { normalizePhoneE164 } from '@/lib/twilio/phone';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/profile → this user's profile + check-in contract. */
export async function GET() {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    const store = getStore();
    const profile = await store.getOrCreateProfile(uid);
    const { telegramChatId: _omit, ...safe } = profile;
    return NextResponse.json({
      profile: {
        ...safe,
        telegramConnected: !!profile.telegramChatId && profile.telegramOptIn,
      },
    });
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
    if (isLanguage(body.language)) patch.language = body.language;
    else if (typeof body.language === 'string') patch.language = normalizeLanguage(body.language);
    if (typeof body.email === 'string') {
      const trimmed = body.email.trim();
      if (!trimmed) {
        patch.email = null;
      } else {
        const normalized = normalizeEmail(trimmed);
        if (!normalized) {
          return NextResponse.json({ error: 'That email address does not look quite right.' }, { status: 400 });
        }
        patch.email = normalized;
      }
    }
    if (typeof body.phoneE164 === 'string') {
      const raw = body.phoneE164.trim();
      patch.phoneE164 = raw ? normalizePhoneE164(raw).slice(0, 20) : null;
    }
    if (body.preferredChannel === 'email' || body.preferredChannel === 'whatsapp' || body.preferredChannel === 'telegram') patch.preferredChannel = body.preferredChannel;
    if (typeof body.emailOptIn === 'boolean') patch.emailOptIn = body.emailOptIn;
    if (typeof body.whatsappOptIn === 'boolean') patch.whatsappOptIn = body.whatsappOptIn;
    if (typeof body.telegramOptIn === 'boolean') patch.telegramOptIn = body.telegramOptIn;
    if (typeof body.timezone === 'string') patch.timezone = body.timezone;
    if (typeof body.state === 'string') patch.state = body.state.slice(0, 80) || null;
    if (typeof body.city === 'string') patch.city = body.city.slice(0, 80) || null;
    if (isShiftPreference(body.shift)) patch.shift = body.shift;
    if (
      body.voicePreference === 'male_english' ||
      body.voicePreference === 'female_english' ||
      body.voicePreference === 'male_hinglish' ||
      body.voicePreference === 'female_hinglish'
    ) {
      patch.voicePreference = body.voicePreference;
    }
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
