# Dhira — Supabase data model

How Dhira stores data once a real Supabase project is connected. Identity comes
from Supabase Auth; every other table hangs off the user's profile by `profile_id`.

## Mindmap

```mermaid
graph TD
  Auth["Supabase Auth - auth.users: email, phone, password"] --> P["profiles (id = auth user id)"]
  P --> PCols["alias, avatar, language, timezone, email, phone_e164, preferred_channel, email_opt_in, whatsapp_opt_in, consent_checkin, consent_memory, checkin_frequency, checkin_window"]
  P --> CM["chat_messages: role, content, created_at"]
  P --> ML["mood_logs: mood, valence, emotional_intensity, topic_tag, source, created_at"]
  P --> MEM["memories: summary, mood, topic_tag, carry_forward, created_at"]
  P --> RE["risk_events: risk_level, signal, handled, created_at"]
  P --> NOT["notifications: channel, type, content, status, provider_message_id, scheduled_for, sent_at, created_at"]
```

## Notification delivery (Emergent), safety-gated

```mermaid
graph LR
  Trig["n8n/Emergent schedule OR in-app trigger"] --> Consent["consent + channel check on profile"]
  Consent --> Agent["Proactive / Weekly agent draft"]
  Agent --> Mon["Safety and Persona Monitor"]
  Mon --> Row["insert notifications row (status=queued)"]
  Row --> Emg["POST to Emergent webhook (email / WhatsApp)"]
  Emg --> Cb["status callback -> update row (sent/delivered/failed)"]
```

## Tables

- profiles — one row per user (id = `auth.users.id`). Alias/avatar/language,
  contact (email, phone_e164), channel preference + opt-ins, timezone, and the
  check-in contract (consent + frequency + window).
- chat_messages — every user/Dhira turn.
- mood_logs — the mood timeline (auto-tagged from chat + manual check-ins).
- memories — short, safe "Dhira remembers" notes (no raw PII).
- risk_events — the safety log (crisis/medium events + whether the hand-off fired).
- notifications — each outbound email/WhatsApp message and its delivery status.

## Security

Row-Level Security is ON for every table and scoped to `auth.uid()`, so each
person can only ever touch their own rows. Dhira's server uses the service-role
key for agent writes and admin aggregates; that key is server-only.

## Emergent integration seam

The app never talks to Twilio/Gmail directly. It writes a `notifications` row
(status `queued`) and POSTs the payload to an Emergent workflow webhook
(`EMERGENT_NOTIFY_WEBHOOK_URL`, protected by `EMERGENT_WEBHOOK_SECRET`).
Emergent delivers via its vault-managed providers and calls
`POST /api/notifications/callback` to update the row's status. Demo over email;
WhatsApp turns on via `WHATSAPP_ENABLED` once the business sender is approved.
