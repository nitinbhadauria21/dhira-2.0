import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { sendTelegramMessage } from '@/lib/telegram/bot';
import { consumeTelegramLinkToken } from '@/lib/telegram/linkToken';
import { handleInboundTelegramMessage } from '@/lib/telegram/inboundTelegram';
import { claimTelegramUpdate } from '@/lib/telegram/updateIdempotency';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type TelegramUpdate = {
  update_id?: number;
  message?: {
    message_id: number;
    chat: { id: number; type: string };
    text?: string;
    from?: { id: number; username?: string };
  };
  my_chat_member?: {
    chat: { id: number };
    new_chat_member: { status: string };
  };
};

function verifyWebhookSecret(req: NextRequest): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (!expected) return true;
  return req.headers.get('x-telegram-bot-api-secret-token') === expected;
}

async function handleStartLink(msg: NonNullable<TelegramUpdate['message']>): Promise<void> {
  const chatId = String(msg.chat.id);
  const parts = msg.text!.trim().split(/\s+/);
  const linkToken = parts[1] ?? '';

  if (!linkToken) {
    await sendTelegramMessage(
      chatId,
      'Hi — open Connect Telegram from your Dhira Profile to link this chat safely.',
    );
    return;
  }

  const profileId = await consumeTelegramLinkToken(linkToken);
  if (!profileId) {
    await sendTelegramMessage(
      chatId,
      'That link expired or was already used. Go back to Dhira Profile and tap Connect Telegram again.',
    );
    return;
  }

  const store = getStore();
  const taken = await store.getProfileByTelegramChatId(chatId);
  if (taken && taken.id !== profileId) {
    await sendTelegramMessage(chatId, 'This Telegram account is already linked to another Dhira profile.');
    return;
  }

  const profile = await store.updateProfile(profileId, {
    telegramChatId: chatId,
    telegramOptIn: true,
    telegramConnectedAt: new Date().toISOString(),
  });

  await sendTelegramMessage(
    chatId,
    `You're connected, ${profile.alias}. I'll send gentle check-ins here when you're due — same schedule as your Dhira settings. You can disconnect anytime from Profile.`,
  );
}

/** POST /api/telegram/webhook — bot updates (link via /start TOKEN + inbound chat). */
export async function POST(req: NextRequest) {
  if (!verifyWebhookSecret(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = (await req.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }

  if (update.update_id != null) {
    const claimed = await claimTelegramUpdate(update.update_id);
    if (!claimed) {
      return NextResponse.json({ ok: true });
    }
  }

  const store = getStore();

  // User blocked the bot — unlink quietly.
  if (update.my_chat_member?.new_chat_member?.status === 'kicked') {
    const chatId = String(update.my_chat_member.chat.id);
    const profile = await store.getProfileByTelegramChatId(chatId);
    if (profile) {
      await store.updateProfile(profile.id, {
        telegramChatId: null,
        telegramOptIn: false,
        telegramConnectedAt: null,
      });
    }
    return NextResponse.json({ ok: true });
  }

  const msg = update.message;
  if (!msg?.chat?.id) {
    return NextResponse.json({ ok: true });
  }

  const chatId = String(msg.chat.id);
  const text = msg.text?.trim() ?? '';

  if (text.startsWith('/start')) {
    await handleStartLink(msg);
    return NextResponse.json({ ok: true });
  }

  if (text) {
    await handleInboundTelegramMessage({ chatId, text });
  }

  return NextResponse.json({ ok: true });
}
