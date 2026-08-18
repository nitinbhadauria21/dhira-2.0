# OpenRouter — fix 404 “guardrail restrictions and data policy”

Dhira uses **one** OpenRouter API key (`OPENROUTER_API_KEY`). If chat shows the **holding message with 14416** (fail-closed) but never real AI replies, run this checklist.

## 1. Privacy (you may have done this already)

https://openrouter.ai/settings/privacy — allow routing to providers that match your policy (not “block everything”).

## 2. Guardrails (often the real blocker)

https://openrouter.ai/settings/guardrails or **Workspaces → Guardrails**

For the **default workspace guardrail** (and any guardrail tied to your Dhira API key):

- **Model allowlist:** leave **empty** (allow all), **or** include `anthropic/claude-sonnet-4.5` and `anthropic/claude-haiku-4.5`.
- **Provider allowlist:** leave **empty**, **or** include **Anthropic**.
- **Zero Data Retention (ZDR):** if **Anthropic ZDR is enforced** but no ZDR Anthropic endpoint is available, **turn off Anthropic ZDR** for this workspace/key, **or** use OpenRouter’s ZDR endpoint list to pick a model that has a ZDR route.

Save changes. Wait 1–2 minutes.

**If Anthropic models still return 404** but `openrouter/auto` works (smoke test passes with model override), set on Vercel (and optionally `.env.local`):

```bash
DHIRA_MODEL_SONNET=openrouter/auto
DHIRA_MODEL_HAIKU=anthropic/claude-haiku-4.5
```

**Code fix (deployed in app):** Dhira now sends `provider: { zdr: true, allow_fallbacks: true }` on every OpenRouter `/v1/messages` call unless `DHIRA_OPENROUTER_ZDR=0`. This unblocks accounts that enforce Zero Data Retention at the guardrail/privacy level.

Then redeploy. Dhira already reads model overrides in `src/config/models.ts`.

## 3. Credits

https://openrouter.ai/settings/credits — balance must be &gt; $0.

## 4. Verify (no secrets printed)

From a machine with the same key as Vercel:

```bash
npm run test:live-brain-smoke
```

**PASS:** `OpenRouter ping: HTTP 200` (or 200-level) and no `LIVE_BRAIN_FALLBACK`.

## 5. Same key everywhere

The key in **Vercel → Environment Variables** must belong to the **same OpenRouter account** where you changed Privacy/Guardrails. If you fixed settings on a different login, create a **new key** on the correct account and paste it into Vercel, then redeploy.
