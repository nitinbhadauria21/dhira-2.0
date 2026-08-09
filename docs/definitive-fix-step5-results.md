# Definitive fix — Step 5 verification results

Agent run after fail-closed implementation. **Live OpenRouter rows remain BLOCKED on VM** until privacy settings allow models.

| Case | Expected | Observed | PASS/FAIL |
|------|----------|----------|-----------|
| D2 fail-closed | Holding + 14416, no Achha laga sunke | `npm run test:safety` D2 block | **PASS** (automated) |
| F keyword extinction | Not hopeful on "Nothing feels good anymore" | `localMoodTag` → sad, valence ≤ 0 | **PASS** (automated) |
| D1/D3 crisis | 14416 with offline demo | Existing safety suite §5, C1–C10 | **PASS** (61+ tests) |
| A1 movie (live) | BRAIN_USED live; not stock reflect line | OpenRouter 404 on VM | **BLOCKED** |
| A2 withdrawal (live) | mood not hopeful; not duplicate template | Requires live | **BLOCKED** |
| A3 repeat A2 | Non-duplicate reply | Requires live + UI | **BLOCKED** |
| B1/B2 first incident | sad/overwhelmed, proportionate | Requires live | **BLOCKED** |
| C WhatsApp continuity | merged stream | Manual Twilio | **NOT RUN** |
| E fallback drill | holding then live without restart | Partial via telemetry | **PARTIAL** |

## Automated command output (excerpt)

Run locally:

```bash
npm run test:safety
npm run test:definitive-transcript   # skips or fails live until OpenRouter OK
```

## Gate 4 (after deploy)

Confirm production:

```bash
curl -s https://dhira-2-0-xi.vercel.app/api/status
```

Expect: `offlinePolicy: "fail_closed"`, `promptVersion: "v2.2-live"`, `gitCommit` matching merged PR SHA.

## Human actions for all-PASS live table

1. OpenRouter privacy → allow Claude Sonnet 4.5  
2. Vercel redeploy with this PR; **do not** set `DHIRA_ALLOW_OFFLINE` on production  
3. Re-run A1–A3 in web chat; paste `BRAIN_USED` lines from logs (`DHIRA_LOG_BRAIN=1`)
