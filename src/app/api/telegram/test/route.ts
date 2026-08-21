import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { isTelegramEnabled, sendTelegramMessage } from '@/lib/telegram/bot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/telegram/test — send one warm test message to the connected user. */
export async function POST() {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

    if (!isTelegramEnabled()) {
      return NextResponse.json({ error: 'Telegram is not enabled on this server.' }, { status: 503 });
    }

    const store = getStore();
    const profile = await store.getOrCreateProfile(uid);

    if (!profile.telegramChatId || !profile.telegramOptIn) {
      return NextResponse.json(
        { error: 'Connect Telegram from Profile first.' },
        { status: 400 },
      );
    }

    const text =
      profile.language === 'hinglish'
        ? `Hey ${profile.alias} — yeh ek chhota test message hai. Telegram connect ho gaya. Main yahin hoon jab bhi baat karni ho.`
        : `Hey ${profile.alias} — this is a quick test from Dhira. Telegram is connected. I'm here whenever you feel like talking.`;

    const result = await sendTelegramMessage(profile.telegramChatId, text);
    if (!result.ok) {
      if (result.blocked) {
        await store.updateProfile(uid, {
          telegramChatId: null,
          telegramOptIn: false,
          telegramConnectedAt: null,
        });
      }
      return NextResponse.json(
        { error: result.description ?? 'Telegram could not deliver the test message.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, messageId: result.messageId });
  } catch (err) {
    console.error('[api/telegram/test] error', err);
    return NextResponse.json({ error: 'Test message failed.' }, { status: 500 });
  }
}
