# Emergent attachable workflow (founder copy)

**Attach this file inside Emergent.** It is the plain-English recipe for Demo Day email and WhatsApp notifications. Dhira writes the AI message and safety-checks it; Emergent schedules and sends.

Also see message templates: [TEMPLATES.md](./TEMPLATES.md)

---

## What this is (one sentence)

Emergent wakes up on a schedule, asks Dhira “who needs a gentle check-in?”, Dhira writes a safe message, Emergent sends it by **email** (and **WhatsApp** when enabled), then tells Dhira whether it was delivered.

## Roles (remember this)

| Who | Does what |
|---|---|
| **You / Emergent** | Clock + sending email/WhatsApp |
| **Dhira app** | AI message + safety check + save to database |
| **Supabase** | Stores user prefs and notification history |

Dhira never talks to Gmail or Twilio directly. Emergent does.

---

## Before you start (checklist)

1. Dhira app is running on a public URL (Demo Day host) — call this `APP_URL`.
2. In Dhira secrets / `.env.local` you have:
   - `EMERGENT_NOTIFY_WEBHOOK_URL` = the webhook URL Emergent gives you to *receive* send-requests from Dhira
   - `EMERGENT_WEBHOOK_SECRET` = a shared password you invent (same in Emergent and Dhira)
   - `CHECKIN_SECRET` = another shared password (Emergent uses this when calling Dhira)
   - `APP_URL` = your public app URL
   - `WHATSAPP_ENABLED=false` until WhatsApp is approved; then `true`
3. In Supabase, run (once): `supabase/migrations/20260720_notification_orchestration.sql`
4. Users who should get messages have:
   - Check-ins allowed (`consent_checkin`)
   - Email and/or phone saved
   - Email opt-in and/or WhatsApp opt-in

---

## Workflow 1 — Gentle check-in (daily / evening)

**Name in Emergent:** `Dhira — Proactive Check-in`

### Step 1 — Schedule
- Run every **30 or 60 minutes** during Demo Day (or hourly for quieter demos).
- Also add a **Manual Run** button for on-stage demos.

### Step 2 — Ask Dhira who is due
- **Method:** GET  
- **URL:** `{{APP_URL}}/api/notifications/due?type=proactive`  
- For testing outside the evening window, add `&force=1` (skips the time-window only).  
- **Header:** `x-checkin-secret` = your `CHECKIN_SECRET`  
- **Result:** `{ "users": [ { "userId", "channel", "to", "alias" } ] }`

If the list is empty, stop (nobody is due right now).

### Step 3 — For each person, ask Dhira to prepare the message
- **Method:** POST  
- **URL:** `{{APP_URL}}/api/checkin`  
- **Header:** `x-checkin-secret` = your `CHECKIN_SECRET`  
- **Body:**
```json
{ "userId": "{{userId from step 2}}" }
```
- Dhira will: check consent → write a short message → run Safety Monitor → save a notification row → **call your Emergent send webhook** (Step 4).

### Step 4 — Send webhook (this is the workflow Emergent exposes TO Dhira)
When Dhira calls Emergent, the payload looks like:
```json
{
  "notificationId": "uuid",
  "channel": "email",
  "to": "person@email.com",
  "type": "proactive_checkin",
  "templateKey": "dhira_checkin_email_v1",
  "subject": "Just checking in — no pressure",
  "alias": "Friend",
  "language": "hinglish",
  "content": "the safety-approved message",
  "callbackUrl": "{{APP_URL}}/api/notifications/callback"
}
```
- Email uses `dhira_checkin_email_v1`; WhatsApp uses `dhira_checkin_v1` (see [TEMPLATES.md](./TEMPLATES.md)).
- **Header from Dhira:** `x-emergent-secret` must match your shared secret (`EMERGENT_WEBHOOK_SECRET`).

**What Emergent does with it:**
- If `channel` is `email` → send email (subject + body below).
- If `channel` is `whatsapp` and WhatsApp is enabled → send WhatsApp template.
- Then call the callback (Step 5).

### Step 5 — Report delivery back to Dhira
- **Method:** POST  
- **URL:** value of `callbackUrl` from the payload  
- **Header:** `x-emergent-secret` = same shared secret  
- **Body:**
```json
{
  "notificationId": "same uuid",
  "status": "delivered",
  "providerMessageId": "id from Gmail or Twilio"
}
```
Use `"failed"` if sending failed; `"sent"` if handed to provider but not confirmed.

---

## Workflow 2 — Weekly summary (Sunday)

**Name in Emergent:** `Dhira — Weekly Summary`

Same pattern as Workflow 1, with these changes:

1. Schedule: **Sunday ~10:00 AM India time** (+ Manual Run for demos).  
2. Due list: GET `{{APP_URL}}/api/notifications/due?type=weekly`  
3. Prepare: POST `{{APP_URL}}/api/notifications/weekly` with `{ "userId": "..." }` and the same secret header.  
4. Send + callback: identical to Steps 4–5 (`type` will be `weekly_summary`; email templateKey `dhira_weekly_email_v1`).

---

## Email templates (attach / configure in Emergent)

### Check-in email
**Subject:** `Just checking in — no pressure`

```
Hi {{alias}},

{{content}}

Whenever you're ready, open Dhira and talk — I'm listening, not advising.

If things feel overwhelming, India's Tele-MANAS helpline is available 24×7 at 14416.

— Dhira
```

### Weekly email
**Subject:** `Your week with Dhira`

```
Hi {{alias}},

{{content}}

Your full week view is in My Dhira → Timeline.

Tele-MANAS 14416 is always there if you need a human tonight.

— Dhira
```

---

## WhatsApp templates (submit to Meta / configure in Emergent)

Keep WhatsApp **off** until approved (`WHATSAPP_ENABLED=false`).

### `dhira_checkin_v1`
```
Dhira check-in

Hi {{1}}, {{2}}

Open Dhira anytime you're ready. If you need urgent help in India, call Tele-MANAS 14416.
```
- `{{1}}` = alias  
- `{{2}}` = short approved line from `content` (or use fixed line below if Meta is strict)

**Fixed fallback (easier Meta approval):**
```
Hi {{1}}, Dhira is thinking of you. Open the app when you're ready to talk. Tele-MANAS 14416 if you need urgent support.
```

### `dhira_weekly_v1`
```
Your week with Dhira

Hi {{1}}, {{2}}

See more in My Dhira → Timeline. Tele-MANAS 14416 if you need help.
```

---

## On-stage demo (no waiting for the clock)

1. Open Dhira → Home.  
2. Tap **Ask Dhira to check in now**.  
3. That runs the same AI + safety + Emergent send path for the signed-in person.  
4. Show Timeline → notification inbox / email that arrived.

---

## Safety rules (do not skip)

- Never send if the person turned check-ins off.  
- Every check-in message must pass Dhira’s Safety Monitor before Emergent sends.  
- Always keep Tele-MANAS **14416** in email/WhatsApp footers.  
- Dhira listens; it does not advise or diagnose.

---

## Quick troubleshooting

| What you see | What to try |
|---|---|
| Due list empty | User needs consent + email/phone + opt-in; or outside their check-in window → try `&force=1` |
| 401 Unauthorized | `CHECKIN_SECRET` / `x-emergent-secret` mismatch |
| Email not arriving | Check Emergent Gmail connection; spam folder |
| WhatsApp not sending | Keep email until Meta template approved; then set `WHATSAPP_ENABLED=true` |
| Inbox shows “sent” but not “delivered” | Emergent must call the callback URL after send |

---

## Related files in this repo

- Templates (same copy, for Meta / Emergent): [TEMPLATES.md](./TEMPLATES.md)
- SQL migration: `supabase/migrations/20260720_notification_orchestration.sql`
- Team status: `DEMO_DAY_STATUS.md`
- Env keys: `.env.example`
