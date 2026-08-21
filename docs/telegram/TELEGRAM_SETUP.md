# Telegram proactive check-ins — setup

Plain English: Telegram is an **optional third delivery channel** for the same proactive check-ins you already get by email or WhatsApp. It reuses your Profile check-in contract (`consentCheckin`, frequency, window, timezone) — no second scheduler.

## What you need

1. A Telegram bot from [@BotFather](https://t.me/BotFather).
2. Server env vars (Vercel / `.env.local` — never in the browser):

| Variable | Purpose |
|----------|---------|
| `TELEGRAM_BOT_TOKEN` | Bot API token from BotFather |
| `TELEGRAM_BOT_USERNAME` | Username without `@` (for `t.me/…?start=` links) |
| `TELEGRAM_ENABLED=true` | Feature flag — must be `true` to connect or send |
| `TELEGRAM_WEBHOOK_SECRET` | Optional — verify webhook requests |

3. Apply migration `supabase/migrations/20260821_telegram_proactive.sql` on live Supabase (adds `profiles.telegram_*` columns and `telegram_link_tokens`).

## Webhook

After deploy, point Telegram at:

```text
https://<your-app>/api/telegram/webhook
```

Example production host: `https://dhira-2-0-xi.vercel.app/api/telegram/webhook`

If `TELEGRAM_WEBHOOK_SECRET` is set, configure the same value as the webhook secret token in BotFather.

## User flow

1. Profile → Check-ins → **Connect Telegram** → opens `t.me/<bot>?start=<one-time-token>`.
2. User taps **Start** in Telegram → webhook binds `telegram_chat_id` to their Dhira profile.
3. User picks **Telegram** as preferred channel and saves.
4. Optional: **Send test message** → `POST /api/telegram/test`.

`telegram_chat_id` is never accepted from the browser — only the webhook (service role) writes it.

## Scheduling (unchanged)

Proactive AI check-ins still flow through:

1. `GET /api/notifications/due?type=proactive` (with `CHECKIN_SECRET` if configured)
2. `POST /api/checkin` per due user

See `docs/emergent/EMERGENT_DEMO_DAY_WORKFLOW.md` for Emergent/n8n wiring.

**Do not** use `/api/cron/checkin` for Telegram — that path sends static copy and skips the Monitor.

## Local dev

- Without real tokens, `TELEGRAM_ENABLED=false` — Profile hides Telegram UI; existing email/WhatsApp paths unchanged.
- Link tokens in offline mode persist in `.data/telegram-link-tokens.json`.

## Disconnect / blocked bot

- Profile → **Disconnect** clears chat id and opt-in.
- If the user blocks the bot, the webhook unlinks automatically; failed sends also clear the binding.
