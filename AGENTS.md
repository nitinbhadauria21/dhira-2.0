# AGENTS.md — dhira

Project-specific guidance lives in `CLAUDE.md` (routes, safety framing, backend-wiring notes). Read it first.

## Cursor Cloud specific instructions

- **What this is:** a frontend-only Next.js 15 / React 19 / TypeScript app. All data is mocked/in-memory — there is no `src/app/api/`, no database, and no real auth. Chat replies, sign-in, and admin auth are all client-side mocks, so the app runs fully with the placeholder `.env` and needs no live API keys.
- **Dev server:** `npm run dev` serves on port **4028** (not 3000). `npm run start` is aliased to the same dev command; `npm run serve` runs the production server (`next start`) and requires a prior `npm run build`.
- **Standard commands** are in `package.json`: `dev`, `build`, `lint`, `lint:fix`, `format`, `type-check`.
- **Build passes even with type/lint errors:** `next.config.mjs` sets `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true`. To actually catch issues, run `npm run type-check` and `npm run lint` separately.
- **Lint is currently noisy:** `npm run lint` reports many pre-existing `prettier/prettier` formatting errors in committed code (e.g. `src/app/admin/*`). These are not caused by your changes — don't treat a nonzero lint exit as a regression unless the failures are in files you touched. `npm run type-check` currently passes clean.
- **Verifying the app:** the core flow is `/chat-with-dhira` — typing a message and sending it appends the message and produces a mocked Dhira reply. Other key routes: `/`, `/sign-in`, `/onboarding`, `/home-dashboard`, `/profile`, `/terms`, `/admin/*`.
