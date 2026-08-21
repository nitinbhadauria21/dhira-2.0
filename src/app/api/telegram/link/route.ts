import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { getStore } from '@/lib/store';
import type { Profile } from '@/lib/types';
import { buildTelegramDeepLink, isTelegramEnabled } from '@/lib/telegram/bot';
import { createTelegramLinkToken } from '@/lib/telegram/linkToken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function publicProfile(profile: Profile) {
  const { telegramChatId: _omit, ...rest } = profile;
  return { ...rest, telegramConnected: !!profile.telegramChatId && profile.telegramOptIn };
}

/** POST /api/telegram/link — create deep link for Connect Telegram. */
export async function POST() {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: 'Sign in to connect Telegram.' }, { status: 401 });

    if (!isTelegramEnabled()) {
      return NextResponse.json(
        { error: 'Telegram is not enabled on this server yet.' },
        { status: 503 },
      );
    }

    const store = getStore();
    const profile = await store.getOrCreateProfile(uid);

    if (profile.telegramChatId && profile.telegramOptIn) {
      return NextResponse.json({
        connected: true,
        telegramConnected: true,
        profile: publicProfile(profile),
      });
    }

    const { token, expiresAt } = await createTelegramLinkToken(uid);
    const botUrl = buildTelegramDeepLink(token);
    if (!botUrl) {
      return NextResponse.json(
        { error: 'Telegram bot username is not configured (TELEGRAM_BOT_USERNAME).' },
        { status: 503 },
      );
    }

    return NextResponse.json({
      connected: false,
      botUrl,
      expiresAt,
      telegramConnected: false,
    });
  } catch (err) {
    console.error('[api/telegram/link] error', err);
    return NextResponse.json({ error: 'Could not start Telegram connection.' }, { status: 500 });
  }
}

/** GET /api/telegram/link — connection status. */
export async function GET() {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    const profile = await getStore().getOrCreateProfile(uid);
    return NextResponse.json({
      telegramConnected: !!profile.telegramChatId && profile.telegramOptIn,
      telegramConnectedAt: profile.telegramConnectedAt,
      telegramEnabled: isTelegramEnabled(),
      profile: publicProfile(profile),
    });
  } catch (err) {
    console.error('[api/telegram/link] GET error', err);
    return NextResponse.json({ error: 'could not load status' }, { status: 500 });
  }
}
