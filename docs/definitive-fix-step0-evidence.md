# Definitive fix — Step 0 evidence (Gate 0)

## 1. Grep hits (production reply fingerprints)

### "Yeh kaafi heavy lag raha hai"

| File | Line | Note |
|------|------|------|
| `src/lib/localBrain.ts` | 63 | **Runtime template** (default `reflect()` branch) |
| `src/lib/artifactDesign.ts` | 55, 276 | Hero/marketing copy only |
| `Dhira_Agent_Prompts_v2_2.md`, `v3.md`, `Cursor.md` | ~423 | Spec example phrases |
| `references/*`, `AGENTS.md` | various | Docs/artifacts, not chat runtime |

### "Achha laga sunke"

| File | Line | Note |
|------|------|------|
| `src/lib/localBrain.ts` | 59 | **Runtime template** (`reflect()` when `\b(better\|okay\|…\|good\|acha)\b`) |

### "apna time lo"

| File | Line | Note |
|------|------|------|
| `src/lib/localBrain.ts` | 63 | Same default `reflect()` Hinglish string |

**Gate 0:** Production strings are in `src/lib/localBrain.ts`. Deployment is built from this codebase.

## 2. Offline pipeline map

```
runChatTurn (chatFlow.ts)
  → checkRisk (escalation.ts) → offline assessContextualRisk when !isLiveBrainEnabled()
  → draftReply (primary.ts)
       → !isLiveBrainEnabled() → localPrimaryReply → reflect()
       → live fail catch → localPrimaryReply → reflect()
  → reviewReply (monitor.ts) → offline localMonitor when !live
  → tagMood (moodTagging.ts)
       → !live → localMoodTag(text)
       → live fail → localMoodTag(text)
```

Mood shown in UI: `chatFlow` returns `mood` from `tagMood` after turn (`chat/route.ts` → `ChatContent.tsx`).

## 3. Keyword hypothesis (confirmed)

**`reflect()`** (`localBrain.ts` ~57–60):

```ts
if (/\b(better|okay|theek|thik|acha|good)\b/.test(lower)) {
  return hinglish ? 'Achha laga sunke ki thoda halka feel ho raha hai...' : ...
}
```

**`localMoodTag()`** (~188–189):

```ts
if (has(/\b(better|okay|theek|hopeful|calm|good|acha)\b/))
  return { mood: 'hopeful', valence: 0.4, ... };
```

Message *"I don't know whether it's **good** or it is..."* matches both → **Hopeful** tag + congratulatory reply.

## 4. Callers reaching canned pipeline

| Path | File | Line |
|------|------|------|
| Web chat API | `src/app/api/chat/route.ts` | `runChatTurn({ uid, userMessage })` |
| WhatsApp inbound | `src/lib/twilio/inboundWhatsApp.ts` | ~204 `runChatTurn({ channel: 'whatsapp' })` |
| ElevenLabs finalize | `src/app/api/elevenlabs/finalize/route.ts` | uses agents separately (out of scope) |
| Safety tests | `scripts/safety-tests.ts` | direct agent calls + `DHIRA_ALLOW_OFFLINE=true` after this PR |
