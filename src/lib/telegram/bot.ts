/**
 * Telegram Bot API helpers — server-only. Never import from client components.
 */

const TELEGRAM_ENABLED = process.env.TELEGRAM_ENABLED === 'true';

export function isTelegramEnabled(): boolean {
  return TELEGRAM_ENABLED && !!process.env.TELEGRAM_BOT_TOKEN?.trim();
}

export function getTelegramBotUsername(): string | null {
  const u = process.env.TELEGRAM_BOT_USERNAME?.trim();
  return u ? u.replace(/^@/, '') : null;
}

export type TelegramSendResult =
  | { ok: true; messageId: number }
  | { ok: false; blocked: boolean; description?: string };

/** Send a text message via Telegram Bot API. No retries. */
export async function sendTelegramMessage(
  chatId: string,
  text: string,
): Promise<TelegramSendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    return { ok: false, blocked: false, description: 'TELEGRAM_BOT_TOKEN not configured' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });

    const body = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      description?: string;
      result?: { message_id?: number };
    };

    if (body.ok && body.result?.message_id != null) {
      return { ok: true, messageId: body.result.message_id };
    }

    const desc = body.description ?? `HTTP ${res.status}`;
    const blocked = /blocked|deactivated|not found|forbidden/i.test(desc);
    console.error('[telegram] sendMessage failed', { chatId: '[redacted]', description: desc });
    return { ok: false, blocked, description: desc };
  } catch (err) {
    console.error('[telegram] sendMessage error', err);
    return { ok: false, blocked: false, description: 'network error' };
  }
}

export function buildTelegramDeepLink(token: string): string | null {
  const username = getTelegramBotUsername();
  if (!username) return null;
  return `https://t.me/${username}?start=${encodeURIComponent(token)}`;
}
