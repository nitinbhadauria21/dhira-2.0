# AGENTS.md — dhira

Project-specific guidance lives in `CLAUDE.md` (routes, safety framing, backend notes). Read it first.  
Team Demo Day completed-vs-pending snapshot: `DEMO_DAY_STATUS.md`. Setup for humans: `README.md`.

## Cursor Cloud specific instructions

- **What this is:** a Next.js 15 / React 19 / TypeScript app with a real backend layer. It runs in two modes automatically:
  - **Offline/demo mode (default here):** with no real keys, Dhira uses a deterministic offline "brain" (`src/lib/localBrain.ts`) and saves to a local JSON file (`.data/dhira-store.json`, git-ignored). The full product works and is testable with **no keys** — this is how the cloud VM runs by default.
  - **Live mode:** set a real `ANTHROPIC_API_KEY` (starts with `sk-`) to use the six Claude agents. For Supabase: `NEXT_PUBLIC_SUPABASE_URL` + publishable/anon key turns on **Auth**; add `SUPABASE_SERVICE_ROLE_KEY` to also save data in Postgres (otherwise Auth works and data stays in `.data/`). Put real keys in `.env.local` (git-ignored). Check mode via `GET /api/status` (`supabaseAuth` / `supabaseStore`).
- **Architecture:** `src/agents/*` = the six agents (primary, monitor, escalation, moodTagging, memory, proactive) using the prompts in `Dhira_Agent_Prompts_Cursor.md`. `src/lib/chatFlow.ts` wires Escalation → Primary → Safety Monitor → mood/memory. `src/lib/store/*` is a pluggable store (`getStore()` picks Supabase or local file). Identity is a `dhira_session` cookie (`src/lib/auth.ts`) — email+password and phone+OTP via `/api/auth/*` (Supabase when configured, otherwise a local/dev auth that still creates real profiles). API routes live in `src/app/api/*`. Middleware protects `/home-dashboard`, `/chat-with-dhira`, `/profile`, `/timeline`.
- **Notifications:** Emergent schedules + delivers email/WhatsApp. Plain-English attach guide: `docs/emergent/EMERGENT_DEMO_DAY_WORKFLOW.md`. Dhira endpoints: `GET /api/notifications/due`, `POST /api/checkin`, `POST /api/notifications/weekly`, `POST /api/notifications/callback`. Without a webhook, status becomes `sent` with `providerMessageId: 'dev-simulated'`. WhatsApp only when `WHATSAPP_ENABLED=true`.
- **"My Dhira" page:** `/timeline` — weekly summary charts, searchable journal (`/api/journal`), chat history (`/api/chat-history`), notification inbox (`/api/notifications`). Nav "Timeline" tab points here.
- **Admin weekly:** `/api/admin/weekly` feeds mood-insights + overview (check-ins, valence, crisis, delivery, opt-ins, hour histogram).
- **Safety is server-driven:** crisis detection runs in the Escalation Agent + `src/lib/guardrails.ts` and always returns the Tele-MANAS 14416 hand-off; every outgoing message (chat + notifications) passes the Safety & Persona Monitor. Do not weaken this. Regex guardrails only ever scan Dhira's outgoing text, never the user's input.
- **Dev server (only host for day-to-day work):** `npm run dev` → **http://localhost:4028**. This is the product UI (landing, chat, timeline). `/api/status` is JSON health only — not the look-and-feel. Rocket.new / `*.builtwithrocket.new` hosts are retired; do not use them.
- **Build passes even with type/lint errors** (`next.config.mjs` sets `ignoreBuildErrors`/`ignoreDuringBuilds`). Run `npm run type-check` and `npm run lint` separately to catch issues.
- **Lint is noisy:** many pre-existing `prettier/prettier` errors in committed code — not a regression unless in files you touched. `type-check` is clean.
- **Verifying the app:** sign-up (`/sign-up`) → onboarding → chat (`/chat-with-dhira`, real reply + saved) → `/timeline` (journal + weekly + inbox) → crisis via the "Test safety path" button → `/admin/safety` / `/admin/mood-insights` show logged events and weekly analytics. Dev OTP returns `devCode` in the JSON response when Supabase SMS is not configured. To reset demo data, delete `.data/dhira-store.json`.
- **Brand charts:** use `useChartBrand()` / `MOOD_PALETTE` from `src/lib/brand.ts` so Recharts stay on-brand in day and night themes.
- **Supabase setup (only for live cloud saving + real Auth):** run `supabase/schema.sql` in the Supabase SQL editor, then add the URL + anon + service-role keys to `.env.local`. See `supabase/DATA_MODEL.md`.
- **Deploy (optional later):** local Cursor is the default Demo Day host. A public Vercel/Netlify URL is optional and needs the user's hosting account — not required for Cursor-local demos.
