# ElevenLabs live voice — Custom LLM (Chat-With-Dhira parity)

**Plain English:** Dashboard **Chat-With-Dhira** (`/chat-with-dhira`) sends each message to `POST /api/chat` → `runChatTurn()` (Escalation → Primary → Monitor). **Talk to Dhira** should use that **same brain** on every spoken turn — not a separate prompt pasted in the ElevenLabs dashboard.

When Custom LLM is enabled, each user utterance hits your server at `/api/elevenlabs/v1/chat/completions`, which calls `runChatTurn({ channel: 'app' })` — identical to text chat.

---

## Environment variables (Vercel + local)

| Variable | Where | Purpose |
|----------|--------|---------|
| `DHIRA_VOICE_CUSTOM_LLM` | Server | Set to `true` after dashboard is configured |
| `ELEVENLABS_CUSTOM_LLM_SECRET` | Server | Bearer token ElevenLabs sends on Custom LLM requests |
| `ELEVENLABS_API_KEY` | Server | Signed session URL / WebRTC token for the widget |
| `OPENROUTER_API_KEY` | Server | Live brain (same as Chat-With-Dhira) |

Example (local `.env`):

```bash
DHIRA_VOICE_CUSTOM_LLM=true
ELEVENLABS_CUSTOM_LLM_SECRET=choose-a-long-random-string
ELEVENLABS_API_KEY=sk_...
OPENROUTER_API_KEY=sk-or-...
```

---

## ElevenLabs dashboard setup (manual)

1. Open your ConvAI agent (`ELEVENLABS_AGENT_ID`).
2. **LLM** → select **Custom LLM**.
3. **Server URL (production):**  
   `https://dhira-2-0-xi.vercel.app/api/elevenlabs/v1/chat/completions`
4. **Authorization header:**  
   `Bearer <same value as ELEVENLABS_CUSTOM_LLM_SECRET>`
5. **Security → Overrides:** enable **Custom LLM extra body** (required so `dhira_uid` reaches the server).
6. **Agent system prompt (minimal):** Dhira’s replies come from your server. Example:

```
You speak exactly the text returned by the connected language model. Do not add advice, diagnoses, or extra commentary. Keep a warm, calm delivery suitable for voice.
```

   **Copy-paste file (Option 1 + full chat Primary prompt for standalone):**  
   [`ELEVENLABS_SYSTEM_PROMPT_COPYPASTE.txt`](./ELEVENLABS_SYSTEM_PROMPT_COPYPASTE.txt)

7. Disable or tighten **LLM cascade / backup models** so a fallback does not revert to a different persona.
8. **Publish** the agent.

---

## How identity is passed

The widget (`ElevenLabsWidget.tsx`) calls `GET /api/elevenlabs/session` and passes:

- `customLlmExtraBody: { dhira_uid: "<signed-in user id>" }`
- `dynamicVariables: { dhira_uid: "<same>" }`
- `userId: "<same>"`

ElevenLabs forwards extra body as `elevenlabs_extra_body` on each Custom LLM request.

---

## After the call

`POST /api/elevenlabs/finalize` dedupes any transcript lines already saved by `runChatTurn` during the call. It no longer runs a separate Primary/Monitor “reflection” — that path was different from Chat-With-Dhira.

---

## Verify parity (manual QA)

1. Sign in as one user.
2. On **Chat-With-Dhira**, send prompt X — note tone, safety, language.
3. Start **Talk to Dhira**, say the same prompt X — reply should match (may be slightly shorter for speech).
4. End call — open **Chat-With-Dhira** — voice turns appear without duplicates.
5. Crisis phrase — Tele-MANAS **14416** in spoken reply and chat history.

**Voice-only behavior (code):** Custom LLM calls use `channel: voice` — multilingual Profile languages and anti-echo rules apply **only** to Talk to Dhira, not text chat. The session API returns `voice.elevenLabsLanguage` + `voice.firstMessage` for invisible ElevenLabs overrides.

Automated smoke: `npm run test:voice-custom-llm`, `npm run test:voice-language`

---

## Legacy mode (Custom LLM off)

If `DHIRA_VOICE_CUSTOM_LLM` is not `true`, voice still uses the ElevenLabs dashboard agent prompt and finalize saves the full transcript with legacy mood tagging. Enable Custom LLM for Chat-With-Dhira parity.
