# Dhira

A private, Hinglish-first AI **listening companion** for mental wellness (India-first).  
Dhira *listens, never advises*, and always surfaces **Tele-MANAS 14416** in crisis.

**Development host:** Cursor local only — **http://localhost:4028**  
Rocket.new hosting URLs are retired. Do not open old `*.builtwithrocket.new` links for this product.

Stack: **Next.js 15 · React 19 · TypeScript · Tailwind · Supabase Auth + Postgres · Anthropic Claude (optional)**

> Team status snapshot (completed vs pending): see **[DEMO_DAY_STATUS.md](./DEMO_DAY_STATUS.md)**  
> Emergent Demo Day workflow (attach in Emergent): **[docs/emergent/EMERGENT_DEMO_DAY_WORKFLOW.md](./docs/emergent/EMERGENT_DEMO_DAY_WORKFLOW.md)**  
> Email / WhatsApp templates: **[docs/emergent/TEMPLATES.md](./docs/emergent/TEMPLATES.md)**  
> Cloud-agent notes: **[AGENTS.md](./AGENTS.md)** · Product routes/safety: **[CLAUDE.md](./CLAUDE.md)** · Data model: **[supabase/DATA_MODEL.md](./supabase/DATA_MODEL.md)**

### Re-create Emergent workflows from this repo

Anyone can rebuild the Demo Day clock + send flows without tribal knowledge:

1. Attach / follow `docs/emergent/EMERGENT_DEMO_DAY_WORKFLOW.md` inside Emergent.
2. Create the two named workflows (`Dhira — Proactive Check-in`, `Dhira — Weekly Summary`).
3. Point them at Dhira’s APIs: `GET /api/notifications/due`, `POST /api/checkin`, `POST /api/notifications/weekly`, then call `POST /api/notifications/callback` after send.
4. Use templates from `docs/emergent/TEMPLATES.md`.
5. Match env secrets listed in `.env.example` (`EMERGENT_*`, `CHECKIN_SECRET`, `APP_URL`).

### Twilio WhatsApp (inbound chat)

Users message your Twilio WhatsApp number → Twilio POSTs to **`/api/twilio/whatsapp`** → Dhira runs the same **`runChatTurn`** pipeline as web chat (escalation + monitor + Tele-MANAS **14416** on crisis) → response is **TwiML** `<Message>`.

1. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER` (+`OPENROUTER_API_KEY` or `ANTHROPIC_API_KEY`) in `.env.local` / Vercel. Use **E.164** for the number (`+17016958623`), not `whatsapp:+...`.
2. Set `APP_URL` to your public origin (required for webhook signature validation in production).
3. Twilio Console → WhatsApp sender → **When a message comes in** → `POST` `https://<host>/api/twilio/whatsapp`.
4. Local dev: tunnel (ngrok) to `http://localhost:4028/api/twilio/whatsapp`, or set `TWILIO_VALIDATE_WEBHOOK=false` and test with `curl`.
5. Legacy alias: `/api/twilio/webhook` uses the same handler. **Rotate** Auth Token if it was ever pasted in chat or committed.

---

## Quick start (any teammate)

```bash
npm install
cp .env.example .env.local   # then paste real keys (never commit .env.local)
npm run dev                  # http://localhost:4028
```

With **no keys**, the app still runs in offline/demo mode (local JSON store + offline brain).

Check live mode: open `http://localhost:4028/api/status`  
Expect something like:

```json
{ "liveBrain": false, "supabase": true, "supabaseAuth": true, "supabaseStore": true }
```

---

## Environment keys (`.env.local` only)

| Variable | What it does |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key (`sb_publishable_...`) — browser Auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key (`sb_secret_...`) — **server only**, cloud DB writes |
| `OPENROUTER_API_KEY` | **Preferred** central brain (`sk-or-v1-...` from [openrouter.ai](https://openrouter.ai)). Without a live brain key → offline brain |
| `ANTHROPIC_API_KEY` | Legacy fallback direct Claude key (`sk-...`). Not needed if OpenRouter is set |
| `DHIRA_MODEL_SONNET` | Optional override for voice/safety model (default OpenRouter: `anthropic/claude-sonnet-4.5`) |
| `DHIRA_MODEL_HAIKU` | Optional override for mood/memory model (default OpenRouter: `anthropic/claude-haiku-4.5`) |
| `EMERGENT_NOTIFY_WEBHOOK_URL` | Optional email/WhatsApp delivery via Emergent |
| `EMERGENT_WEBHOOK_SECRET` | Shared secret for Emergent callbacks |
| `WHATSAPP_ENABLED` | `true` for proactive outbound WhatsApp via Twilio (`notify.ts`) |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_WHATSAPP_NUMBER` | Twilio WhatsApp (E.164 for number, no `whatsapp:` prefix) |
| `TWILIO_VALIDATE_WEBHOOK` | Set `false` locally to POST test webhooks without Twilio signature |
| `CHECKIN_SECRET` | Protects scheduled `/api/checkin` triggers |
| `APP_URL` | Public app URL (Emergent callbacks + Twilio signature URL) |

**Never commit** `.env.local` or secret keys. `.gitignore` already blocks them.

### Supabase project setup (once per project)

1. Create/open the Supabase project.
2. **SQL Editor** → paste & run [`supabase/schema.sql`](./supabase/schema.sql).
3. **Authentication → Providers → Email** → enable Email.  
   For Demo Day: turn **Confirm email OFF** (avoids email rate limits / confirmation loops).
4. **Project Settings → API Keys** → copy URL, publishable key, secret key into `.env.local`.
5. **Google OAuth:** follow [`docs/SUPABASE_GOOGLE_AUTH.md`](./docs/SUPABASE_GOOGLE_AUTH.md) (redirect URLs + Google Cloud client).
6. Restart `npm run dev`.

---

## What the product includes

| Area | Routes / pieces |
|---|---|
| Auth | `/sign-up`, `/sign-in` — email+password and phone+OTP (phone needs SMS provider) |
| Onboarding | `/onboarding` |
| Home | `/home-dashboard` — mood, streak, proactive check-in |
| Chat | `/chat-with-dhira` — six-agent flow + crisis handoff |
| My Dhira | `/timeline` — weekly charts, journal search, chat history, notification inbox |
| Profile | `/profile` — prefs, channel opt-ins, export JSON, sign out |
| Admin | `/admin/*` — safety, mood insights, weekly analytics (placeholder admin gate) |

API routes live under `src/app/api/*`. Protected pages use `src/middleware.ts` (`dhira_session` cookie).

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server on **port 4028** |
| `npm run build` | Production build |
| `npm run serve` | `next start` (after build) |
| `npm run type-check` | TypeScript (run this — build ignores TS/ESLint errors by config) |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` | Prettier |

---

## Architecture (short)

- **Dual mode:** offline local store (`.data/dhira-store.json`) **or** Supabase Postgres when service-role key is set.
- **Auth:** Supabase Auth when URL + publishable key are set; otherwise local/dev auth APIs.
- **Brain:** Six agents in `src/agents/*` call OpenRouter (preferred via `OPENROUTER_API_KEY`) or a direct Anthropic key; else `src/lib/localBrain.ts`. Check `GET /api/status` → `liveBrain`.
- **Safety:** Escalation + Monitor + Tele-MANAS 14416; every outbound chat/notification is monitor-gated.
- **Notifications:** `src/lib/notify.ts` → Emergent webhook (or `dev-simulated` without webhook).

---

## Hosting (Cursor local only)

**Cursor local** is the only host for Dhira while we build and demo.

```bash
npm run dev
```

Open **http://localhost:4028** — that is the real product UI (landing, chat, timeline).  
Do **not** use Rocket (`*.builtwithrocket.new`) or other external preview hosts.

Frontend, backend, database wiring, and tests are all owned in this Cursor workspace.  
A public Vercel/Netlify URL is optional later — not required for day-to-day work or Demo Day.

---

## Safety promise (do not drop)

Dhira listens and does not advise. Crisis paths must keep the Tele-MANAS **14416** hand-off visible. See `/terms` and `CrisisHandoff`.
