import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { getStore } from '@/lib/store';
import type { Profile } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function publicProfile(profile: Profile) {
  const { telegramChatId: _omit, ...rest } = profile;
  return { ...rest, telegramConnected: false };
}

/** POST /api/telegram/disconnect — stop Telegram notifications and unlink chat. */
export async function POST() {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

    const store = getStore();
    const existing = await store.getOrCreateProfile(uid);
    const profile = await store.updateProfile(uid, {
      telegramChatId: null,
      telegramOptIn: false,
      telegramConnectedAt: null,
      ...(existing.preferredChannel === 'telegram' ? { preferredChannel: 'email' as const } : {}),
    });

    return NextResponse.json({
      ok: true,
      telegramConnected: false,
      profile: publicProfile(profile),
    });
  } catch (err) {
    console.error('[api/telegram/disconnect] error', err);
    return NextResponse.json({ error: 'Could not disconnect Telegram.' }, { status: 500 });
  }
}
