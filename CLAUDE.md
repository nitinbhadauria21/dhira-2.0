# CLAUDE.md — dhira

Guidance specific to this project. See the workspace root `../CLAUDE.md` for shared conventions.  
For teammates: setup is in `README.md`; completed vs pending is in `DEMO_DAY_STATUS.md`.

## What this is

**Dhira** — a Next.js 15 / React 19 / TypeScript app for a private, Hinglish-first AI "listening companion" (mental-wellness chat aimed at India).

**Host for development:** Cursor local only — `npm run dev` → **http://localhost:4028**. Do not use Rocket.new hosting URLs; they are retired for this product. Cursor owns frontend, backend, database wiring, tests, and look-and-feel in this workspace.

It has a **real backend layer** that runs in two modes:
- **Offline/demo (default):** no real keys → deterministic offline brain (`src/lib/localBrain.ts`) + local JSON store (`.data/dhira-store.json`). Full product is testable with no keys.
- **Live:** real `ANTHROPIC_API_KEY` (starts with `sk-`) enables the six Claude agents; real Supabase keys switch persistence/auth to Postgres. Check mode via `GET /api/status`.

`.env` holds placeholders only — put real keys in `.env.local` (git-ignored).

## Key routes (`src/app/`)

- `/` — landing page
- `/sign-in`, `/sign-up` — real auth (email+password and phone+OTP via Supabase Auth, or dev auth when Supabase is unconfigured)
- `/onboarding` — multi-step flow (splash, privacy, contract, setup; collects email/phone/channel prefs)
- `/home-dashboard` — mood card, streaks, journal, mini timeline (protected)
- `/chat-with-dhira` — core chat UI + crisis handoff (protected; server-driven safety)
- `/timeline` — "My Dhira": weekly summary (recharts), searchable journal, chat history, notification inbox (protected)
- `/profile` — alias, language, check-in prefs, notification channel, export JSON, sign out (protected)
- `/terms` — Terms / Privacy / Safety (Tele-MANAS crisis banner)
- `/admin/*` — internal dashboard (cohorts, config, consent, engine-health, mood-insights, overview, resources, roles, safety); guarded by `src/lib/adminAuth.ts` (client-side session helper, 8h TTL — not production RBAC yet)

Shared: `src/components/` (AppLayout, AppNav, DhiraAvatar, MoodBadge, ThemeProvider/Toggle, `ui/` primitives). Landing sections live in `src/app/components/`.

API routes live under `src/app/api/*` (auth, chat, journal, weekly, notifications, export, admin, …). Middleware (`src/middleware.ts`) protects user app routes and redirects unauthenticated visitors to `/sign-in`.

## Safety framing (don't drop when editing)

The product's core promise is *listens, never advises* and always surfaces Tele-MANAS (India's 24×7 mental health helpline, **14416**) for crisis situations. Any change touching `/chat-with-dhira`, `CrisisHandoff.tsx`, notifications, or `/terms` should preserve this — it's the product's safety net, not incidental copy. Every user-facing message (chat + notifications) passes the Safety & Persona Monitor.

## Running locally

```bash
npm install
npm run dev     # http://localhost:4028 (note: non-default port)
```

Other scripts: `npm run build`, `npm run lint` / `lint:fix`, `npm run format`, `npm run type-check`.

Note: `next.config.mjs` sets `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true` — the production build will pass even with type/lint errors. Run `npm run type-check` and `npm run lint` separately to actually catch issues.

## Backend wiring status

1. **Auth:** Supabase Auth (email+password + phone OTP) with a dev-cookie fallback when Supabase is unconfigured. Session cookie is `dhira_session`; see `src/lib/auth.ts` and `/api/auth/*`.
2. **AI:** Anthropic Claude six-agent stack under `src/agents/*` (prompts from `Dhira_Agent_Prompts_Cursor.md`). Offline brain when no real `sk-` key.
3. **Store:** pluggable local file or Supabase (`src/lib/store/*`). Schema + mindmap in `supabase/schema.sql` and `supabase/DATA_MODEL.md`.
4. **Notifications:** Emergent webhook seam (`src/lib/notify.ts`, `EMERGENT_NOTIFY_WEBHOOK_URL`); WhatsApp gated by `WHATSAPP_ENABLED`. Demo marks `sent` without a webhook.
5. **Admin:** still uses placeholder client-side admin session — needs real role-based auth before public exposure.
