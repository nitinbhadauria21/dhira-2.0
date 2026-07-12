# CLAUDE.md — dhira

Guidance specific to this project. See the workspace root `../CLAUDE.md` for shared conventions.

## What this is

**Dhira** — a Next.js 15 / React 19 / TypeScript prototype for a private, anonymous, Hinglish-first AI "listening companion" (mental-wellness chat app aimed at India). Originally generated with [Rocket.new](https://rocket.new) and imported from `github.com/nitinbhadauria21/dhira` (branch `rocket-update`).

Currently **frontend-only**: all pages/flows are built and use mocked/in-memory data. `.env` has placeholder keys for Supabase, OpenAI, Gemini, Anthropic, Perplexity, Stripe, GA, and AdSense — none are live yet.

## Key routes (`src/app/`)

- `/` — landing page
- `/sign-in`, `/sign-up` — auth (Google button + email/password, UI only)
- `/onboarding` — multi-step flow (splash, privacy, contract, setup)
- `/home-dashboard` — mood card, streaks, journal, mini timeline
- `/chat-with-dhira` — the core chat UI, incl. crisis handoff component
- `/profile` — alias, language (English/Hinglish), check-in prefs, account settings
- `/terms` — Terms of Use / Privacy / Safety Guidelines (Tele-MANAS crisis banner)
- `/admin/*` — internal dashboard (cohorts, config, consent, engine-health, mood-insights, overview, resources, roles, safety); guarded by `src/lib/adminAuth.ts` (client-side session helper, 8h TTL — not real auth)

Shared: `src/components/` (AppLayout, AppNav, DhiraAvatar, MoodBadge, ThemeProvider/Toggle, `ui/` primitives). Landing sections live in `src/app/components/`.

## Safety framing (don't drop when editing)

The product's core promise is *listens, never advises* and always surfaces Tele-MANAS (India's 24×7 mental health helpline, **14416**) for crisis situations. Any change touching `/chat-with-dhira`, `CrisisHandoff.tsx`, or `/terms` should preserve this — it's the product's safety net, not incidental copy.

## Running locally

```bash
npm install
npm run dev     # http://localhost:4028 (note: non-default port)
```

Other scripts: `npm run build`, `npm run lint` / `lint:fix`, `npm run format`, `npm run type-check`.

Note: `next.config.mjs` sets `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true` — the production build will pass even with type/lint errors. Run `npm run type-check` and `npm run lint` separately to actually catch issues.

## Wiring a real backend (not yet done)

To move past mocked data:
1. Real Supabase project → replace `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env`, add actual auth + persistence (currently no Supabase client code exists in `src/` — sign-in/up forms don't call anything yet).
2. Pick one AI provider (OpenAI/Gemini/Anthropic/Perplexity keys are all stubbed) and wire `/chat-with-dhira` to a real API route — there is no `src/app/api/` yet.
3. `admin/*` auth is a placeholder (`localStorage`/session-based, see `adminAuth.ts`) — needs real role-based auth before this is safe to expose.
