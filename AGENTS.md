# AGENTS.md — dhira

Project-specific guidance lives in `CLAUDE.md` (routes, safety framing, backend-wiring notes). Read it first.

## Cursor Cloud specific instructions

- **What this is:** a Next.js 15 / React 19 / TypeScript app with a real backend layer. It runs in two modes automatically:
  - **Offline/demo mode (default here):** with no real keys, Dhira uses a deterministic offline "brain" (`src/lib/localBrain.ts`) and saves to a local JSON file (`.data/dhira-store.json`, git-ignored). The full product works and is testable with **no keys** — this is how the cloud VM runs by default.
  - **Live mode:** set a real `ANTHROPIC_API_KEY` (starts with `sk-`) to use the six Claude agents; set the Supabase keys to save to Postgres instead of the local file. Put real keys in `.env.local` (git-ignored) — the committed `.env` holds placeholders only. Check current mode via `GET /api/status`.
- **Architecture:** `src/agents/*` = the six agents (primary, monitor, escalation, moodTagging, memory, proactive) using the prompts in `Dhira_Agent_Prompts_Cursor.md`. `src/lib/chatFlow.ts` wires Escalation → Primary → Safety Monitor → mood/memory. `src/lib/store/*` is a pluggable store (`getStore()` picks Supabase or local file). Anonymous identity is a secure `dhira_uid` cookie (`src/lib/session.ts`) — no login required. API routes live in `src/app/api/*`.
- **Safety is server-driven:** crisis detection runs in the Escalation Agent + `src/lib/guardrails.ts` and always returns the Tele-MANAS 14416 hand-off; every outgoing message passes the Safety & Persona Monitor. Do not weaken this. Regex guardrails only ever scan Dhira's outgoing text, never the user's input.
- **Dev server:** `npm run dev` serves on port **4028** (not 3000). `npm run start` is aliased to dev; `npm run serve` runs `next start` (needs a prior `npm run build`).
- **Build passes even with type/lint errors** (`next.config.mjs` sets `ignoreBuildErrors`/`ignoreDuringBuilds`). Run `npm run type-check` and `npm run lint` separately to catch issues.
- **Lint is noisy:** many pre-existing `prettier/prettier` errors in committed code — not a regression unless in files you touched. `type-check` is clean.
- **Verifying the app:** onboarding (`/onboarding`) → chat (`/chat-with-dhira`, real reply + saved) → crisis via the "Test safety path" button → `/admin/safety` shows the logged event → `/home-dashboard` mood check-in saves and the timeline/streak update. To reset demo data, delete `.data/dhira-store.json`.
- **Supabase setup (only for live cloud saving):** run `supabase/schema.sql` in the Supabase SQL editor, then add the URL + anon + service-role keys to `.env.local`.
- **Deploy (Demo Day):** deploying a live web URL needs the user's own hosting account (Vercel or Netlify — `@netlify/plugin-nextjs` is already a dependency). Set the same env vars there. This is a user step; the agent cannot deploy without their account.
