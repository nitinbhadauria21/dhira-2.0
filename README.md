# Dhira

A private, Hinglish-first AI **listening companion** for mental wellness (India-first).  
Dhira *listens, never advises*, and always surfaces **Tele-MANAS 14416** in crisis.

Stack: **Next.js 15 · React 19 · TypeScript · Tailwind · Supabase Auth + Postgres · Anthropic Claude (optional)**

> Team status snapshot (completed vs pending): see **[DEMO_DAY_STATUS.md](./DEMO_DAY_STATUS.md)**  
> Emergent Demo Day workflow (attach in Emergent): **[docs/emergent/EMERGENT_DEMO_DAY_WORKFLOW.md](./docs/emergent/EMERGENT_DEMO_DAY_WORKFLOW.md)**  
> Cloud-agent notes: **[AGENTS.md](./AGENTS.md)** · Product routes/safety: **[CLAUDE.md](./CLAUDE.md)** · Data model: **[supabase/DATA_MODEL.md](./supabase/DATA_MODEL.md)**

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
| `ANTHROPIC_API_KEY` | Real Claude brain (`sk-...`). Without it → offline brain |
| `EMERGENT_NOTIFY_WEBHOOK_URL` | Optional email/WhatsApp delivery via Emergent |
| `EMERGENT_WEBHOOK_SECRET` | Shared secret for Emergent callbacks |
| `WHATSAPP_ENABLED` | `true` only after WhatsApp Business approval |
| `CHECKIN_SECRET` | Protects scheduled `/api/checkin` triggers |
| `APP_URL` | Public app URL for callbacks |

**Never commit** `.env.local` or secret keys. `.gitignore` already blocks them.

### Supabase project setup (once per project)

1. Create/open the Supabase project.
2. **SQL Editor** → paste & run [`supabase/schema.sql`](./supabase/schema.sql).
3. **Authentication → Providers → Email** → enable Email.  
   For Demo Day: turn **Confirm email OFF** (avoids email rate limits / confirmation loops).
4. **Project Settings → API Keys** → copy URL, publishable key, secret key into `.env.local`.
5. Restart `npm run dev`.

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
- **Brain:** Anthropic six agents in `src/agents/*` when `ANTHROPIC_API_KEY` is a real `sk-` key; else `src/lib/localBrain.ts`.
- **Safety:** Escalation + Monitor + Tele-MANAS 14416; every outbound chat/notification is monitor-gated.
- **Notifications:** `src/lib/notify.ts` → Emergent webhook (or `dev-simulated` without webhook).

---

## Deploy (Demo Day URL)

Deploy to Vercel/Netlify with the same env vars as `.env.local`.  
`@netlify/plugin-nextjs` is already a dependency. Someone with the hosting account must click deploy.

---

## Safety promise (do not drop)

Dhira listens and does not advise. Crisis paths must keep the Tele-MANAS **14416** hand-off visible. See `/terms` and `CrisisHandoff`.
