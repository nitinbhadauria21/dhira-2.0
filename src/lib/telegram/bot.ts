/**
 * Telegram Bot API helpers — server-only. Never import from client components.
 */

const TELEGRAM_ENABLED = process.env.TELEGRAM_ENABLED === 'true';

export function isTelegramEnabled(): boolean {
  return TELEGRAM_ENABLED && !!process.env.TELEGRAM_BOT_TOKEN?.trim();
}

export function getTelegramBotUsername(): string | null {
  const u = process.env.TELEGRAM_BOT_USERNAME?.trim();
  // Telegram usernames are lowercase; normalise so t.me / tg:// links always resolve.
  return u ? u.replace(/^@/, '').toLowerCase() : null;
}

export type TelegramBotVerifyResult =
  | { ok: true; username: string }
  | { ok: false; reason: string; revoked?: boolean };

/** Confirm the server token is valid before opening Connect links or sending. */
export async function verifyTelegramBot(): Promise<TelegramBotVerifyResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    return { ok: false, reason: 'TELEGRAM_BOT_TOKEN is not configured on the server.' };
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const body = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      description?: string;
      error_code?: number;
      result?: { username?: string };
    };
    if (body.ok && body.result?.username) {
      return { ok: true, username: body.result.username };
    }
    if (body.error_code === 401) {
      return {
        ok: false,
        revoked: true,
        reason:
          'The Telegram bot token is invalid or was revoked. In @BotFather send /token, pick your bot, copy the new token, and update Vercel (TELEGRAM_BOT_TOKEN).',
      };
    }
    return { ok: false, reason: body.description ?? 'Telegram bot check failed.' };
  } catch {
    return { ok: false, reason: 'Could not reach Telegram to verify the bot.' };
  }
}

/** Register webhook so /start link tokens reach Dhira (idempotent). */
export async function ensureTelegramWebhook(): Promise<{ ok: boolean; description?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const appUrl = (process.env.APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? '').trim();
  if (!token || !appUrl) {
    return { ok: false, description: 'missing TELEGRAM_BOT_TOKEN or APP_URL' };
  }
  const webhookUrl = `${appUrl.replace(/\/$/, '')}/api/telegram/webhook`;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const payload: Record<string, unknown> = {
    url: webhookUrl,
    allowed_updates: ['message', 'my_chat_member'],
  };
  if (secret) payload.secret_token = secret;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; description?: string };
    if (body.ok) return { ok: true };
    return { ok: false, description: body.description ?? 'setWebhook failed' };
  } catch {
    return { ok: false, description: 'setWebhook network error' };
  }
}

export type TelegramSendResult =
  | { ok: true; messageId: number }
  | { ok: false; blocked: boolean; description?: string };

/** Show "typing…" while Dhira generates a reply. Best-effort; never throws. */
export async function sendTelegramChatAction(
  chatId: string,
  action: 'typing' | 'upload_photo' = 'typing',
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendChatAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, action }),
    });
  } catch {
    // Non-critical UX polish.
  }
}

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

/** Opens the bot directly in the Telegram phone app when supported. */
export function buildTelegramAppDeepLink(token: string): string | null {
  const username = getTelegramBotUsername();
  if (!username) return null;
  return `tg://resolve?domain=${username}&start=${encodeURIComponent(token)}`;
}
