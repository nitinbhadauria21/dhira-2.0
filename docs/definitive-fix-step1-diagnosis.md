# Definitive fix — Step 1 diagnosis (Gate 1)

## 1. GET /api/status

### Production (`https://dhira-2-0-xi.vercel.app/api/status`)

```json
{
  "host": "cursor-local",
  "siteUrl": "https://dhira-2-0-xi.vercel.app",
  "liveBrain": true,
  "supabase": true,
  "supabaseAuth": true,
  "supabaseStore": true,
  "lastBrainError": "anthropicText failed | 404 {\"error\":{\"message\":\"No endpoints available matching your guardrail restrictions and data policy. Configure: https://openrouter.ai/settings/privacy\",\"code\":404}} | 404",
  "lastFallbackAt": "2026-08-09T12:01:03.560Z",
  "fallbackCount": 28,
  "lastBrainUsed": "offline",
  "showOfflineBanner": false
}
```

### Local dev (`http://localhost:4028/api/status`)

```json
{
  "host": "cursor-local",
  "siteUrl": "http://localhost:4028",
  "liveBrain": true,
  "supabase": true,
  "supabaseAuth": true,
  "supabaseStore": true,
  "lastBrainError": null,
  "lastFallbackAt": null,
  "fallbackCount": 0,
  "lastBrainUsed": null,
  "showOfflineBanner": false
}
```

## 2. Live vs offline decision

- [`src/config/models.ts`](src/config/models.ts): `getBrainApiKey()` reads `process.env` per call; `isLiveBrainEnabled()` true when key present.
- [`src/app/api/status/route.ts`](src/app/api/status/route.ts): imports `isLiveBrainEnabled` from **`@/config/models`**.
- Agents import `isLiveBrainEnabled` from **`@/lib/anthropic`** (re-export from models).

**Silent / harmful fallbacks (pre-fix):**

| Agent | File | Behavior |
|-------|------|----------|
| Primary | `primary.ts` L21–22, L40–41 | `localPrimaryReply` when no key or API error |
| Escalation | `escalation.ts` L132–134 | `assessContextualRisk` on API error (OK for safety) |
| Monitor | `monitor.ts` L110–111, L172–173 | offline monitor / `failSafeMonitor` |
| Mood | `moodTagging.ts` L18–19, L44 | `localMoodTag` |

## 3. OPENROUTER_API_KEY (.env.local)

Present when dev server runs with `liveBrain: true`; prefix `sk-or-v1-` (value not recorded).

## 4. OpenRouter direct test

Production telemetry shows **HTTP 404** with body: `No endpoints available matching your guardrail restrictions and data policy` — not 401/402. **Gate 1: proceed with code** (fail-closed + human OpenRouter privacy fix).

## 5. WhatsApp

[`src/lib/twilio/inboundWhatsApp.ts`](src/lib/twilio/inboundWhatsApp.ts) L204: `runChatTurn({ uid, userMessage: body, channel: 'whatsapp' })`.

## 6. Prompt wiring

Live: [`agentPromptsLive.ts`](src/agents/prompts/agentPromptsLive.ts) wraps [`v3Prompts.ts`](src/agents/prompts/v3Prompts.ts). Spec file: `Dhira_Agent_Prompts_v2_2.md` (no `Dhira_Agent_Prompts_v2.md` in repo).

## 7. Mood UI

[`chatFlow.ts`](src/lib/chatFlow.ts) persists mood after turn; offline keyword path when live off or mood agent catch.

## 8. Context §2.1

Implemented in #41: `formatRecentSentReplies`, 72h risk, `contextUnavailable`; Monitor includes `recentSentReplies` in user payload (`monitor.ts` L124–126).

## 9. Deployment

- `main` includes PR #41 merge (`13847fe`) and subsequent merges (`5fda20f` at agent run).
- Production has `liveBrain: true` and high `fallbackCount` → **deployed code runs live path but OpenRouter fails → offline templates** (not “undeployed fix” alone).

## 10. Findings

**Primary root cause:** Live brain **configured** (`liveBrain: true`) but OpenRouter calls **fail (404 privacy)** → Primary/Mood fall back to **`localBrain` templates** → wrong mood (keyword “good”) and harmful replies.

**Secondary gaps:** No fail-closed holding path; emotional templates on default fallback; no `prompt_version` in logs; prod shows `lastBrainUsed: offline` while key present.

**Gate 1:** Proceed to Step 2–3 code (404 ≠ 401/402 stop rule).
