# Live brain — Step 1 diagnosis (agent run)

1. **GET /api/status (local):** `liveBrain: true` when `.env.local` has `sk-or-v1-...` key.
2. **Brain selection:** `isLiveBrainEnabled()` in `src/config/models.ts` reads `process.env` per call via `getBrainApiKey()`. Anthropic client cached in `src/lib/anthropic.ts` module scope until key change reset (fixed in this PR).
3. **OPENROUTER_API_KEY:** present in `.env.local`, prefix `sk-or-v1-`, no quotes detected in length check.
4. **OpenRouter direct POST** `https://openrouter.ai/api/v1/messages`: HTTP **404** body `"No endpoints available matching your guardrail restrictions and data policy"` — key valid but OpenRouter account privacy/guardrail blocks model until configured at openrouter.ai/settings/privacy. **Not** a wrong path when base URL is `https://openrouter.ai/api` (SDK appends `/v1/messages`).
5. **WhatsApp:** `inboundWhatsApp.ts` calls `runChatTurn({ channel: 'whatsapp' })` — same pipeline as web.
6. **Live prompts:** compressed `v3Prompts.ts` + short mood inline — not full v2.2 humanization blocks (fixed: `agentPromptsLive.ts`).
7. **Mood:** single-message `tagMood(text)` + silent `localMoodTag` fallback (fixed: ≥5 turns + `moodTagSource`).
8. **Context gaps:** no RECENT SENT REPLIES block, 72h risk, or `context_unavailable` (fixed in `conversationContext.ts`).
9. **Root cause:** Production symptoms match **offline `localBrain.reflect()`** because live is off (`liveBrain: false` on Vercel) **or** live API errors are **swallowed** without logs. Secondary gaps 6–8 caused wrong mood/register even when live works.
