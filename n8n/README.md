# Dhira — Proactive Check-in reminder engine (n8n)

Plain English: this is the little robot that sends Dhira's unprompted "thinking
of you" messages on a schedule. You do **not** need it running live for the demo
— the app has a **"Ask Dhira to check in now"** button on the Home dashboard that
triggers the exact same flow on stage. Set this up when you want real, scheduled
check-ins.

## What it does

Every hour, n8n asks the app: "who is due for a check-in?" then, for each person,
calls the app's check-in endpoint. The endpoint runs the Proactive Check-in Agent,
passes the draft through the **Safety & Persona Monitor** (golden rule), and
returns the final approved message, which n8n delivers (email is easiest for the
demo; WhatsApp is a production-phase add-on).

## The endpoint (already built)

`POST /api/checkin`

- Header: `x-checkin-secret: <your CHECKIN_SECRET>`  (set this in `.env.local`)
- Body: `{ "userId": "<the anonymous profile id>" }`
- Returns: `{ "sent": true, "message": "…" }` (or `{ "sent": false, "reason": … }`
  when the user hasn't consented).

When `CHECKIN_SECRET` is **not** set, the endpoint runs in dev/demo mode and acts
for the current browser session (no secret required) — that's what the Home
dashboard button uses.

## Build the workflow (n8n Cloud, free)

1. Create a free account at [n8n.io](https://n8n.io) — no install needed.
2. New workflow → name it **"Dhira Check-in"**.
3. Add a **Schedule** node → run every hour. (Also add a **Manual Trigger** for a
   clean on-stage test.)
4. Add a node that fetches the users due for a check-in (an HTTP Request to your
   own "due users" endpoint, or a Supabase query when Supabase is connected).
5. Add an **HTTP Request** node:
   - Method: `POST`
   - URL: `https://<your-app-url>/api/checkin`
   - Header: `x-checkin-secret` = your `CHECKIN_SECRET`
   - Body (JSON): `{ "userId": "{{ $json.userId }}" }`
6. Add an **Email** node (or push service) to deliver `{{ $json.message }}`.
7. Press **Execute Workflow** once to confirm a message is produced.

## Safety note

Nothing bypasses the Safety & Persona Monitor — proactive messages are reviewed
before they are ever sent, exactly like normal replies.
