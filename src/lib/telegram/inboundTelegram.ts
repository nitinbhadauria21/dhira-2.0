import { after } from 'next/server';
import { getStore } from '@/lib/store';
import { runChatTurn } from '@/lib/chatFlow';
import { runChatTurnPostReplyEnrichment } from '@/lib/chatTurnPostReply';
import { CRISIS_MESSAGE } from '@/lib/safetyCopy';
import { isTelegramEnabled, sendTelegramChatAction, sendTelegramMessage } from '@/lib/telegram/bot';

/** Telegram text message limit (chars). */
const TELEGRAM_REPLY_MAX = 4096;

const UNLINKED_MESSAGE =
  'Please connect Telegram from your Dhira Profile first — open your profile, tap Connect Telegram, then reply here.';

const FAILURE_MESSAGE =
  "I'm having a little trouble responding right now. Give me a moment and try again.";

function truncateForTelegram(text: string): string {
  if (text.length <= TELEGRAM_REPLY_MAX) return text;
  return `${text.slice(0, TELEGRAM_REPLY_MAX - 1)}…`;
}

/**
 * Handle an inbound Telegram text message (same Dhira pipeline as /api/chat and WhatsApp).
 */
export async function handleInboundTelegramMessage(params: {
  chatId: string;
  text: string;
}): Promise<void> {
  const { chatId, text } = params;
  const body = text.trim();
  if (!body) return;

  const store = getStore();
  const profile = await store.getProfileByTelegramChatId(chatId);

  if (!profile?.telegramOptIn || !profile.telegramChatId) {
    console.info('[telegram/inbound] unlinked chat', { chatId: '[redacted]' });
    if (!isTelegramEnabled()) {
      console.warn('[telegram/inbound] TELEGRAM_ENABLED or bot token missing — cannot reply');
      return;
    }
    await sendTelegramMessage(chatId, UNLINKED_MESSAGE);
    return;
  }

  await sendTelegramChatAction(chatId, 'typing');

  try {
    const { result: turn, postReply } = await runChatTurn({
      uid: profile.id,
      userMessage: body,
      channel: 'telegram',
    });
    if (postReply) {
      after(() => runChatTurnPostReplyEnrichment(postReply));
    }

    const outbound =
      turn.crisis && !turn.reply.includes('14416') ? CRISIS_MESSAGE : turn.reply;

    const sendResult = await sendTelegramMessage(chatId, truncateForTelegram(outbound));
    if (sendResult.ok === false && sendResult.blocked) {
      await store.updateProfile(profile.id, {
        telegramChatId: null,
        telegramOptIn: false,
        telegramConnectedAt: null,
      });
    }

    console.info('[telegram/inbound] turn complete', {
      uid: profile.id.slice(0, 8),
      brainUsed: turn.brainUsed,
      riskLevel: turn.riskLevel,
      crisis: turn.crisis,
      replyLen: outbound.length,
    });
  } catch (err) {
    console.error('[telegram/inbound] handle error', err);
    await sendTelegramMessage(chatId, FAILURE_MESSAGE);
  }
}
