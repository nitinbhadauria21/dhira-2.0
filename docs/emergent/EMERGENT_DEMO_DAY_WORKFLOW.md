# Dhira × Emergent — Demo Day workflow (attach this in Emergent)

**Who this is for:** non-technical founders setting up Emergent.  
**What it does:** Emergent wakes up on a schedule, asks Dhira who needs a gentle message, Dhira writes a *safe* message, Emergent sends **email** (and **WhatsApp** when enabled), then tells Dhira if it was delivered.

---

## One-sentence summary

Emergent = **clock + sending**. Dhira = **AI writing + safety check + saving history**. Supabase = **database**.

---

## Before you start

1. Dhira is on a public URL — call it `APP_URL` (example: `https://your-demo.vercel.app`).
2. In Dhira secrets (`.env.local` or host env) set:
   - `EMERGENT_NOTIFY_WEBHOOK_URL` — webhook URL Emergent gives you (Dhira calls this to *send*)
   - `EMERGENT_WEBHOOK_SECRET` — a shared password you invent
   - `CHECKIN_SECRET` — another shared password (Emergent uses this when calling Dhira)
   - `APP_URL` — your public app URL
   - `WHATSAPP_ENABLED=false` until WhatsApp is approved, then `true`
3. In Supabase, run the SQL file: `supabase/migrations/20260720_notification_orchestration.sql`
4. Demo users must have: check-ins allowed, email (and/or phone), and the matching opt-in.

Also see message templates: [TEMPLATES.md](./TEMPLATES.md)

---

## Workflow 1 — Gentle check-in

**Name in Emergent:** `Dhira — Proactive Check-in`

### Step 1 — Schedule
- Every **30–60 minutes** for Demo Day (or hourly).
- Add a **Manual Run** button for on-stage demos.

### Step 2 — Ask who is due
- Method: **GET**
- URL: `{{APP_URL}}/api/notifications/due?type=proactive`
- For testing any time of day, add `&force=1` (skips the evening window only).
- Header: `x-checkin-secret: {{CHECKIN_SECRET}}`
- Result: `{ "users": [ { "userId", "channel", "to", "alias" } ] }`
- If `users` is empty → stop.

### Step 3 — Prepare each person’s message
For each user in the list:
- Method: **POST**
- URL: `{{APP_URL}}/api/checkin`
- Header: `x-checkin-secret: {{CHECKIN_SECRET}}`
- Body:
```json
{ "userId": "{{userId}}" }
```
Dhira will: check consent → write message → Safety Monitor → save a notification → **call your Emergent send webhook** (Step 4).

### Step 4 — Send webhook (Emergent receives this FROM Dhira)
Payload example:
```json
{
  "notificationId": "uuid",
  "channel": "email",
  "to": "person@email.com",
  "type": "proactive_checkin",
  "templateKey": "dhira_checkin_v1",
  "subject": "Just checking in — no pressure",
  "alias": "Friend",
  "language": "hinglish",
  "content": "safety-approved message text",
  "callbackUrl": "{{APP_URL}}/api/notifications/callback"
}
```
Header: `x-emergent-secret` must match `EMERGENT_WEBHOOK_SECRET`.

Emergent should:
1. If `channel` is `email` → send email (use subject + content; see TEMPLATES.md)
2. If `channel` is `whatsapp` → send WhatsApp template
3. Then call the callback (Step 5)

### Step 5 — Report delivery
- Method: **POST**
- URL: the `callbackUrl` from the payload
- Header: `x-emergent-secret: {{EMERGENT_WEBHOOK_SECRET}}`
- Body:
```json
{
  "notificationId": "same-uuid",
  "status": "delivered",
  "providerMessageId": "id-from-gmail-or-twilio"
}
```
Use `"failed"` if send failed; `"sent"` if handed off but not confirmed.

---

## Workflow 2 — Weekly summary

**Name in Emergent:** `Dhira — Weekly Summary`

Same pattern as Workflow 1, with:

1. Schedule: **Sunday ~10:00 AM India time** (+ Manual Run)
2. Due list: `GET {{APP_URL}}/api/notifications/due?type=weekly`
3. Prepare: `POST {{APP_URL}}/api/notifications/weekly` with `{ "userId": "..." }` and the same secret header
4. Send + callback: identical (`type` will be `weekly_summary`)

---

## On-stage demo (no waiting for the clock)

1. Open Dhira → **Home**
2. Tap **Ask Dhira to check in now**
3. Same AI + safety + Emergent send path runs for the signed-in person
4. Show **Timeline** inbox / the email that arrived

---

## Safety rules (do not skip)

- Do not send if the person turned check-ins off
- Every check-in / weekly line must pass Dhira’s Safety Monitor before Emergent sends
- Keep Tele-MANAS **14416** in email/WhatsApp footers
- Dhira listens; it does not advise or diagnose

---

## Troubleshooting

| What you see | What to try |
|---|---|
| Due list empty | Need consent + email/phone + opt-in; or outside evening window → try `&force=1` |
| 401 Unauthorized | Secret mismatch (`CHECKIN_SECRET` or `EMERGENT_WEBHOOK_SECRET`) |
| Email not arriving | Check Emergent Gmail connection; spam folder |
| WhatsApp not sending | Keep `WHATSAPP_ENABLED=false` until Meta template approved |
| Inbox shows sent but not delivered | Emergent must call the callback URL after send |

---

## Related files in this repo

- Templates: [TEMPLATES.md](./TEMPLATES.md)
- SQL migration: `supabase/migrations/20260720_notification_orchestration.sql`
- Status for the team: `DEMO_DAY_STATUS.md`
