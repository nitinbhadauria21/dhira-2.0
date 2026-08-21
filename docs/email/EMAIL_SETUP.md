# Email check-ins — setup

Plain English: email is a **first-class delivery channel** for proactive check-ins and (optionally) two-way chat — same Dhira engine as web chat and Telegram.

## What you need

1. A [Resend](https://resend.com) account with a **verified sending domain**.
2. Server env vars (Vercel / `.env.local` — never in the browser):

| Variable | Purpose |
|----------|---------|
| `EMAIL_ENABLED=true` | Feature flag |
| `RESEND_API_KEY` | Server-only API key |
| `EMAIL_FROM` | Verified sender, e.g. `Dhira <checkin@yourdomain.com>` |
| `EMAIL_REPLY_TO` | Optional — reply address for inbound chat |
| `RESEND_WEBHOOK_SECRET` | Optional — verify inbound webhook signatures |

3. Optional fallback: if Resend is off but `EMERGENT_NOTIFY_WEBHOOK_URL` is set, email still goes through Emergent (legacy Demo Day path).

4. Apply migration `supabase/migrations/20260822_email_inbound_idempotency.sql` on live Supabase (inbound dedupe).

## Which email address Dhira uses

**Source of truth:** `profiles.email` + `emailOptIn` on the signed-in user’s profile.

| When | What happens |
|------|----------------|
| Email sign-up | Address saved to profile (normalized lowercase) |
| Google sign-in | Google email copied to profile if empty |
| Profile → Check-ins → **Email for check-ins** → Save | Updates `profiles.email` (validated) |
| Sign-in later | Login email **does not overwrite** a check-in email you already saved |

Outbound sends, **Send test email**, and inbound reply matching all use this profile field.

## Outbound

- Proactive: Emergent `GET /api/notifications/due` → `POST /api/checkin` → `runProactiveCheckin` → Resend
- Profile: **Send test email** → `POST /api/email/test`
- Verify deploy: `GET /api/status` → `email.provider` should be `"resend"` when configured

## Inbound (reply-by-email)

1. Configure Resend **Receiving** for your domain.
2. Webhook URL: `https://<your-app>/api/email/inbound/webhook`
3. Event: `email.received`
4. User replies to a check-in → mapped by sender email → `runChatTurn({ channel: 'email' })` → reply in thread

Unrecognized senders get a short “connect from Profile” message only.

## Do not use for Monitor-safe check-ins

`/api/cron/checkin` now delegates to `runProactiveCheckin` (same as `/api/checkin`). Prefer Emergent due-list + `/api/checkin` for scheduled proactive messages.

## Local dev

Without Resend keys, email notifications are marked `dev-simulated` (or Emergent if configured). Profile hides **Send test email** when `email.enabled` is false on `/api/status`.
