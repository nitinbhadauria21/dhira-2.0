# Live brain — Step 4 verification

Run after deploy or locally with `.env.local` keys. Agent run on cloud VM unless noted.

| Test | Pass criteria | Result | Notes |
| --- | --- | --- | --- |
| 4.1 Movie transcript (web) | Two msgs; `BRAIN_USED: live`; replies differ; msg2 references withdrawal; mood sad/overwhelmed | **BLOCKED (VM)** | OpenRouter returns HTTP 404 guardrail/privacy until account settings fixed. Offline safety suite covers movie scenario (test 15). Manual re-check on prod after key + privacy fix. |
| 4.2 WhatsApp msg2 | `BRAIN_USED: live \| whatsapp`; continuity with web turns | **NOT RUN** | Requires Twilio sandbox + linked `phoneE164`. Code path confirmed: `inboundWhatsApp` → `runChatTurn({ channel: 'whatsapp' })`. |
| 4.3 Crisis regression | 14416 with live on; offline still crisis-safe | **PASS** | `npm run test:safety` — crisis + C1–C10 + v3 cases (61/61). |
| 4.4 Fallback drill | Bad key → `LIVE_BRAIN_FALLBACK`, status counters, dev banner, valid reply | **PARTIAL** | Telemetry + `/api/status` fields implemented; dev banner when `!liveBrain` in development. Full drill needs toggling key without restart (client cache reset on key change). |
| 4.5 Repetition guard | Third similar msg ≠ duplicate; Monitor sees prior sent replies | **PARTIAL (code)** | `formatRecentSentReplies` injected in Monitor user payload; live verification needs working OpenRouter. |

## Automated checks (this PR)

- `npm run type-check` — pass
- `npm run test:safety` — 61 passed
- `npm run test:live-brain-smoke` — expect **fail** on VM until OpenRouter privacy allows models (see step 1 diagnosis)

## Production checklist (human)

1. Vercel env: `OPENROUTER_API_KEY` (`sk-or-v1-…`), redeploy.
2. OpenRouter dashboard → Privacy → allow data policy for Claude Sonnet 4.5.
3. `GET https://dhira-2-0-xi.vercel.app/api/status` → `liveBrain: true`, `fallbackCount` stable after test message.
4. Chat: movie msg1 + withdrawal msg2 — distinct replies, not canned reflect line.
5. Optional: WhatsApp continuity with same profile phone link.
