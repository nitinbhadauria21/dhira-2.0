# Mood / Transformation Timeline — Plan (preview before build)

**Mentor ask:** On `/timeline`, show the user *how they moved from heavy → calm* with a **short explanation** of what Dhira understood and what helped — **without** exposing the full chat.

**Visual mock (open in browser):** [`transformation_mock.html`](./transformation_mock.html)

**Status:** Plan + mock only — **not wired to production yet.**

---

## 1. What we’re building (plain English)

Today Timeline shows weekly stats, notebook logs, and chat history. The mentor wants a new card — **“How you shifted”** — that answers:

> “I came in heavy. Something happened in my talk with Dhira. I left calmer. *What actually shifted?*”

Not a generic line like *“Great progress — you shifted towards calmer feelings.”*  
Instead, 2–4 sentences that feel personal, derived from the conversation, but **never quote the whole chat**.

---

## 2. Where it lives on the page

```
My DHIRA (hero)
    ↓
Your week with DHIRA (existing stats + 7-day tiles)
    ↓
★ How you shifted  ← NEW (this plan)
    ↓
Notebook logs
    ↓
Chat history
    ↓
Notifications
```

One card per **meaningful session** where mood/valence improved enough to count as a “transformation.”

---

## 3. What each transformation entry shows

| Block | Purpose | Example (from mock) |
|-------|---------|---------------------|
| **Meta row** | When + channel + mood arc + topic | `Wed, 18 Aug · 10:42 PM chat` · overwhelmed → calm · work |
| **Headline** | Human title for the shift | *From “can’t switch off” to a quieter chest* |
| **Body (3–4 sentences)** | What Dhira understood — themes only, no transcript | Demo deadline, 3am loop, one small step tonight |
| **“What helped” insight** | The turning point in one line | Separating urgent tomorrow vs rest of week |
| **Valence arc** | Tiny curve: started heavy → ended lighter | SVG + labels: Started heavy → Named pressure → Pause → Calmer |
| **Privacy line** | Trust | *A private summary — not your full chat. Only you see this.* |

Second mock entry shows **Hinglish** when the user wrote in Hinglish — same structure, matched register.

---

## 4. What we will NOT show

- Full message text or scrollable transcript  
- Dhira’s exact replies quoted at length  
- Clinical labels (“you were dysregulated”)  
- Advice framed as Dhira telling them what to do  
- Sessions with no real mood shift (e.g. hi → bye, or flat neutral throughout)

---

## 5. When to create an entry (detection rules)

Use data we **already store** per chat session:

| Signal | Source today |
|--------|----------------|
| Mood at start vs end | `mood_logs` + per-turn mood tagging in `runChatTurn` |
| Valence / intensity trend | `valence`, `emotional_intensity` on mood logs |
| Session boundaries | `chat_messages` grouped by day or by gap > 30 min |
| Topic | `topic_tag` from mood agent |
| Channel | `app` vs `whatsapp` / `elevenlabs` |

**Include a session when (draft thresholds — tune in QA):**

1. At least **4 user messages** in the session (or ≥3 min voice), and  
2. **Valence improves** by ≥ 0.25 from first third → last third of session, **or**  
3. Start mood ∈ {anxious, overwhelmed, stressed, sad, lonely, angry} **and** end mood ∈ {calm, hopeful, neutral} with lower intensity.

**Exclude:** crisis sessions (show crisis card path only, no “transformation” cheer), single-message check-ins, admin/test accounts.

---

## 6. How we generate the text (AI, safely)

New **Transformation Agent** (server-only, never talks to user directly):

**Input (structured, not raw dump):**

- Anonymized **turn summaries** (user + Dhira, max 80 chars each × N turns), or  
- Existing **Memory Agent** output if session just ended  
- Start/end mood, valence, topic, channel, language  
- Optional: `carry_forward` from memory

**Output (JSON):**

```json
{
  "headline": "From … to …",
  "body": "2-4 sentences, themes only",
  "insight_label": "What helped in this chat",
  "insight": "1-2 sentences on the turning point",
  "arc_labels": ["Started heavy", "Named pressure", "Pause", "Calmer"]
}
```

**Then:** Safety Monitor pass (same persona rules — no advice, no diagnosis, no PII).

**Storage:** `transformation_summaries` table (or JSON column on session) — generated **once** when session closes or nightly job, not on every Timeline page load.

---

## 7. API & UI (when we implement)

| Piece | Path |
|-------|------|
| API | `GET /api/timeline/transformations?limit=10` |
| Component | `src/app/timeline/components/TimelineTransformationSection.tsx` |
| Page hook | Insert in `timeline/page.tsx` after `TimelineWeeklySection` |

Empty state: *“When a chat helps you settle from heavy to calmer, Dhira will reflect that here — privately.”*

---

## 8. Build order (one feature at a time)

1. **Approve mock** — you + mentor sign off on layout/copy tone (this step).  
2. **Detection** — session grouping + shift scoring from existing mood logs.  
3. **Transformation Agent** + store summaries.  
4. **API + UI** — wire mock design into React with real data.  
5. **QA** — Hinglish, voice sessions, no false “great progress” on flat chats.

---

## 9. Open questions for you / mentor

1. **How many entries** on Timeline — last 3 sessions, last 7 days, or all that qualify?  
2. **Voice (Talk to Dhira)** — same card style when valence shifts during a call?  
3. **WhatsApp** — show channel badge “WhatsApp” as in mock?  
4. **Headline tone** — more poetic (*“quieter chest”*) vs plainer (*“felt less overwhelmed”*)?

---

## 10. Preview files

- Interactive mock: `docs/timeline/transformation_mock.html` (toggle day/night in banner)  
- Screenshots for review: see PR / agent artifacts `timeline_transformation_preview_*.png`

**Next step after your OK:** implement Step 2 (detection) only, then pause for you to test before AI copy generation.
