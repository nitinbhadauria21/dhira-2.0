# Dhira — Demo Day status report

Last updated: **20 Jul 2026**  
Repo: `nitinbhadauria21/dhira-2.0` · Feature work on `main` via PRs #1–#7; this doc tracks product readiness for the team.

---

## Executive summary

Dhira is **past the mock-frontend stage**. Teammates can run the full product locally. **Supabase Auth + cloud Postgres saving are wired and verified**. Live Claude (`ANTHROPIC_API_KEY`) and real Emergent email/WhatsApp delivery are the main remaining upgrades for a polished Demo Day.

| Layer | Status |
|---|---|
| UI / product flows | ✅ Complete |
| Offline demo (no keys) | ✅ Complete |
| Supabase Auth (email) | ✅ Wired & verified |
| Supabase cloud data store | ✅ Wired & verified |
| Phone OTP (SMS) | ⚠️ UI ready; needs Twilio/SMS in Supabase |
| Live Claude brain | ⏳ Pending real `ANTHROPIC_API_KEY` |
| Emergent email/WhatsApp send | ✅ Dhira APIs + docs ready; wire Emergent webhook URL + secrets |
| Public deploy URL | ⏳ Pending hosting account |
| Production admin RBAC | ⏳ Still placeholder client gate |

---

## Completed

### Product & UX
- [x] Landing, sign-up, sign-in, onboarding, home dashboard, chat, profile, terms
- [x] **My Dhira** page at `/timeline` (weekly charts, searchable journal, chat history, notification inbox)
- [x] Nav “Timeline” → `/timeline`
- [x] Crisis UI + Tele-MANAS **14416** hand-off
- [x] Brand tokens / day-night charts (`src/lib/brand.ts`)
- [x] Extras: JSON data export, Web Speech voice input, loading skeletons, empty states

### Backend dual-mode
- [x] Pluggable store: local `.data/dhira-store.json` **or** Supabase (`src/lib/store/*`)
- [x] Six-agent stack under `src/agents/*` (prompts in `Dhira_Agent_Prompts_Cursor.md`)
- [x] Chat flow: Escalation → Primary → Safety Monitor → mood/memory (`src/lib/chatFlow.ts`)
- [x] Offline brain when no real Anthropic key (`src/lib/localBrain.ts`)
- [x] `GET /api/status` → `liveBrain`, `supabaseAuth`, `supabaseStore`

### Accounts & auth
- [x] Email + password on sign-up / sign-in
- [x] Phone + OTP UI (dev OTP returns `devCode` when Supabase SMS not configured)
- [x] Unified `dhira_session` cookie + middleware on protected routes
- [x] Live Supabase Auth with URL + publishable key; session handoff via `/api/auth/session`
- [x] Schema + RLS model in `supabase/schema.sql` + `supabase/DATA_MODEL.md`

### Notifications & analytics
- [x] `src/lib/notify.ts` enqueue + Emergent webhook seam (dev marks `sent` / `dev-simulated`)
- [x] Proactive check-in + weekly notification types (Monitor-gated)
- [x] `/api/notifications` inbox + `/api/notifications/callback`
- [x] `/api/notifications/due` + `/api/notifications/weekly` for Emergent scheduling
- [x] Plain-English Emergent attach guide (founder copy): `docs/emergent/EMERGENT_DEMO_DAY_WORKFLOW.md`
- [x] Email + WhatsApp templates: `docs/emergent/TEMPLATES.md`
- [x] SQL for due-list columns: `supabase/migrations/20260720_notification_orchestration.sql`
- [x] `/api/admin/weekly` + admin mood-insights / overview wired to real aggregates

### Verification done in cloud VM
- [x] `npm run type-check` / `npm run build`
- [x] Offline API + browser e2e (signup → chat → timeline → admin)
- [x] Live Supabase: tables present; sign-in → chat → timeline; rows in `profiles`, `chat_messages`, `mood_logs`, `memories`, `notifications`

### Docs for teammates
- [x] `README.md` (this setup guide)
- [x] `DEMO_DAY_STATUS.md` (this report)
- [x] `AGENTS.md`, `CLAUDE.md`, `.env.example`, `n8n/README.md`

---

## Pending / next actions

### Must-do before a smooth public Demo Day signup flow
1. **Supabase → Authentication → Providers → Email**  
   - Email provider **ON**  
   - **Confirm email OFF** (otherwise new signups hit email rate limits / require inbox links)
2. Share **non-secret** setup with the team: project URL is fine to share internally; **never** paste `sb_secret_...` into Slack/GitHub. Each teammate copies keys into their own `.env.local`.
3. Optional: rotate the secret key if it was ever pasted in chat, then update only `.env.local` / host env vars.

### Nice-to-have for a stronger demo
| Item | Why | Owner hint |
|---|---|---|
| Real `ANTHROPIC_API_KEY` (`sk-...`) in `.env.local` / host | Live Claude replies instead of offline brain | Founder / eng |
| Emergent webhook URL + secret + `APP_URL` | Real email delivery of check-ins | Founder + Emergent — follow `docs/emergent/EMERGENT_DEMO_DAY_WORKFLOW.md` |
| Run `supabase/migrations/20260720_notification_orchestration.sql` | Adds due-list timestamp columns | Founder in SQL Editor |
| `WHATSAPP_ENABLED=true` + Business template | WhatsApp check-ins | After Meta/Twilio approval — see `docs/emergent/TEMPLATES.md` |
| Phone OTP SMS provider in Supabase | Real phone sign-in | Twilio (via Emergent or Supabase) |
| Deploy to Vercel/Netlify | Shareable Demo Day URL | Someone with hosting login |
| Replace `adminAuth.ts` client gate | Real admin roles before public admin URLs | Eng post-demo |

### Explicitly out of scope / not done
- Google OAuth button is still UI-only
- Regional languages beyond English/Hinglish (Tamil/Telugu) not built
- Starred journal moments / TTS playback / breathing cards (proposed extras, not built)

---

## How teammates should run it today

```bash
git clone https://github.com/nitinbhadauria21/dhira-2.0.git
cd dhira-2.0
git checkout main
npm install
cp .env.example .env.local
# Ask the founder for Supabase URL + publishable + secret (via a password manager, not chat)
# Optional: Anthropic key for live brain
npm run dev   # http://localhost:4028
```

Smoke test:
1. Sign up / sign in → onboarding → home  
2. Chat: send a Hinglish line → expect a reply  
3. Open **Timeline** → weekly + journal  
4. Profile → Export my data  
5. `GET /api/status` → confirm flags  

Reset local-only data: delete `.data/dhira-store.json` (ignored by git).

---

## How to re-create Emergent workflows (anyone on the team)

1. Open **[docs/emergent/EMERGENT_DEMO_DAY_WORKFLOW.md](./docs/emergent/EMERGENT_DEMO_DAY_WORKFLOW.md)** — this is the founder attachable copy.
2. In Emergent, create two workflows named exactly as in that doc:
   - `Dhira — Proactive Check-in`
   - `Dhira — Weekly Summary`
3. Paste the schedule + HTTP steps (due → prepare → send → callback) from the doc.
4. Copy email/WhatsApp bodies from **[docs/emergent/TEMPLATES.md](./docs/emergent/TEMPLATES.md)** (same text is also in the workflow doc).
5. Set Dhira env secrets to match Emergent (`EMERGENT_NOTIFY_WEBHOOK_URL`, `EMERGENT_WEBHOOK_SECRET`, `CHECKIN_SECRET`, `APP_URL`).
6. Keep `WHATSAPP_ENABLED=false` until Meta templates are approved.

---

## Safety reminder

Every user-facing message (chat **and** notifications) must pass the Safety & Persona Monitor. Crisis always surfaces **Tele-MANAS 14416**. Do not weaken this for demos.
