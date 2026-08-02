# DHIRA · CALMLINK — implementation spec for Cursor

Feed this file to Cursor as context. It describes every change made to the prototype
in `/omelette` so the Next.js app at `localhost:4028` can be brought to match.

The visual source of truth is the `.dc.html` files shipped alongside this spec.
They are plain HTML with inline styles — read them directly for exact values.
Cut-out illustration PNGs are in `assets/`; copy them to `public/illustrations/`.

---

## 0. Scope summary

| Area | Status |
|---|---|
| New **Notebook** section (journal: text + voice) | **New page + nav item + route** |
| Brand lockup → `DHIRA` over `C A L M L I N K` | Global |
| Adaptive time-of-day panels (Sign in / Sign up / Home) | New behaviour |
| User-chosen shift (not inferred) | New preference |
| Illustrations + floating buddy with halo | 5 pages |
| Mandatory signup fields incl. State + City | Validation change |
| Password reveal toggle | Sign in + Sign up |
| Home dashboard "Horizon" layout | Rebuild |
| Mood check-in → live dashboard updates | Wiring |
| Voice affordance in chat composer | Rework |
| Logout | New |

---

## 1. Assets

Copy from `assets/` into `public/illustrations/`:

| File | Used on |
|---|---|
| `dhira_sitting_calm.png` | Landing hero (floating, 78px) |
| `dhira_orb.png` | Sign in + Sign up left panel (78px, replaces circular avatar) |
| `dhira_listening.png` | Chat "DHIRA is listening" panel |
| `dhira_notebook.png` | Notebook page floating buddy |
| `bot_avatar.png` | Small avatars, chat bubbles, nav |

All PNGs were background-removed with an **edge flood fill** (not a
near-white threshold) so the bot's own glossy highlights survive. If you
re-export art, use the same method or highlights will be punched out.

**Halo treatment** (used wherever the buddy floats): two stacked radial
gradients — a warm `rgba(255,240,186,.95) → rgba(240,186,72,.3) → transparent`
base blurred 7px, plus a `mix-blend-mode: screen` inner core blurred 9px.
This reads as a glow in both light and dark mode. Plus a soft elliptical
contact shadow under the bot. Three keyframes: `Bob` (6s translateY ±10px
with ±1.5° rotate), `Halo` (6s opacity .6→.95, scale .95→1.05), `GlowPad`
(5.5s, on the contact shadow). Keep the bob and halo slightly out of phase.

**Do not touch the existing Landing page scroll/motion animations** — they were
reproduced as-is and are out of scope.

---

## 2. Brand lockup (global)

Everywhere the wordmark appears, replace the single `Dhira` text node with a
two-line vertical lockup:

```html
<a href="/" class="inline-flex flex-col items-start leading-none">
  <span class="font-fraunces font-bold text-[24px] tracking-[-0.03em] block leading-none">DHIRA</span>
  <span class="block font-sans font-semibold text-[9px] tracking-[0.3em] leading-none mt-[4px] opacity-[.62]">CALMLINK</span>
</a>
```

Rules:
- `CALMLINK` font-size = **36%** of the DHIRA size; `margin-top` = **17%**; `letter-spacing: .3em`; `opacity: .62`; inherits the parent's colour.
- Scales per location — 24px nav mark, 22px onboarding mark, larger on Landing hero.
- Every **prose** mention of "Dhira" is also uppercased to **DHIRA** (nav, footers, chat header, disclaimers, profile labels, greetings).
- Wrap the logo group in `flex-shrink-0`, and give any adjacent nav badge/pill `white-space: nowrap; flex-shrink: 0` — the wider lockup otherwise wraps it.

### Voice / gender
DHIRA is an **AI buddy** — **never** referred to as "she", "he", or any gendered
pronoun. Use "DHIRA", "your buddy", or "it" sparingly. Audit all copy for this.

---

## 3. Navigation

App nav is now **five** items:

`Home · Chat · Notebook · Timeline · Profile`

Plus a **Logout** control in the top-right of the nav (after the theme toggle),
present on every signed-in page, returning to Landing.

---

## 4. New section — Notebook (`/notebook`)

The user's own space to write or speak their thoughts. Distinct from Chat
(which is conversation with DHIRA); Notebook is a diary DHIRA can optionally read.

### Layout
- **Time-aware headline** (9 variants, see §5) — e.g. "The 2 a.m. page.",
  "First page of the day.", "First thoughts, unfiltered."
- **Two modes**, toggled by a segmented control:
  - **Write** — ruled-paper textarea (repeating-linear-gradient rule lines),
    Fraunces body text, autosaving feel.
  - **Speak** — record button with a live waveform and a running transcript
    pane; the transcript is editable after stopping.
- **Opener chips** — Hinglish/English prompt starters that insert text
  ("Aaj kaisa raha…", "Something I keep replaying…", "One good thing today…").
- **Mood tag + topic tags** on each entry.
- **"Let DHIRA read this"** privacy toggle per entry — off means it stays
  private and is excluded from DHIRA's context.
- **Floating buddy** (`dhira_notebook.png`) with halo, per §1.

### Data + wiring
Every saved entry must appear **immediately** in Timeline → **Notebook logs**
(renamed from "Journal Logs"). Entry shape:

```ts
type NotebookEntry = {
  id: string;
  createdAt: string;      // ISO
  mode: 'write' | 'speak';
  body: string;           // transcript for speak mode
  mood: MoodKey;
  topics: string[];
  shareWithDhira: boolean;
};
```

---

## 5. Adaptive time-of-day system

Applies to the **Sign in** and **Sign up** left story panels, the **Home**
greeting, and the **Notebook** headline.

### Buckets
`dawn · morning · midday · afternoon · evening · dusk · night · lateNight`

Each bucket drives: background scene gradient, illustration/scene details,
headline, sub-line, and the halo's apparent light source. Read the exact
gradients and copy from `SignIn.dc.html` and `SignIn Time Samples.dc.html`
(the latter is a reference page showing every state side by side — do not ship it).

### Shift workers — **user-chosen, never inferred**
Add a preference: `shift: 'general' | 'afternoon' | 'evening' | 'night'`.
Set during onboarding and editable in Profile. When set, the panel and greeting
use the shift's own frame of reference — a night-shift user opening the app at
9 p.m. gets a "start of your day" tone, not "late night".

### Home greeting
Must not hard-code "Late night, Friend." The greeting is derived from
(bucket × shift), with the through-line that **DHIRA is there whenever the
user comes** — the copy adapts rather than assuming a time.

---

## 6. Sign in / Sign up

- Left panel: adaptive scene (§5) + orb buddy at 78px floating with halo (§1),
  replacing the old circular avatar.
- **All fields mandatory** on Sign up, with inline validation and a blocked
  submit until valid.
- **State** — dropdown (Indian states/UTs). **City** — free text.
  Both required; account creation fails without them. They sit as an aligned
  two-up row on the same baseline.
- **Password reveal** — eye toggle inside the field on both pages, so the user
  can confirm and correct what they typed. Toggle is keyboard-accessible with a
  labelled `aria-label` that reflects state.

---

## 7. Home dashboard ("Horizon" layout)

- Welcoming floating buddy on the **left** of the greeting block.
- **7-day mood view**: a 7-column grid, `gap: 18px`, tiles capped at
  **52px** wide with `border-radius: 14px`. Tile height encodes weight of the
  day (`34 + weight * 44` px) — calm/hopeful short, overwhelmed tallest.
  Selected tile lifts `-7px` with a stronger shadow and a white ring.
  Today, before check-in, renders as a **dashed ghost tile**.
  The same pattern is reused in Timeline's full view.
- **Start today's check-in** must open the **"How are you right now?"** modal —
  not navigate to Chat. (This was a live bug.)

### Realtime propagation on mood save
Saving a mood updates, in the same tick:
1. **Today's mood** card — emoji, label, intensity bar, delta vs yesterday, and a real timestamp.
2. **Friday's tile** — colour and height; legend picks up the new colour; ghost state clears.
3. **Caption** under the week — `"Fri 11 · Sad — today, a heavy, slower day."`
4. **Streak** 5 → 6, and the note flips from "Check in today to keep it going." to "You've shown up. That matters."
5. **Sessions** 0 → 1.
6. **Week reading** and the top **Recent entry** rewrite to today's mood.

Mood keys and weights:
```
happy .20 · hopeful .22 · calm .28 · neutral .40 · lonely .58 · sad .60
stressed .62 · anxious .72 · angry .74 · overwhelmed .90
```

---

## 8. Chat

- **Listening panel** uses `dhira_listening.png` so it's obvious DHIRA is attending.
- **Voice affordance** — the bare 🎙 glyph is replaced by a labelled pill:
  a 4-bar animated waveform + the word **Speak**. On activation it turns sage,
  the bars animate, a ring pulses out of the button, the label becomes
  **Listening**, and the composer placeholder changes from
  "Type, or tap Speak to talk" → "Go ahead — I'm listening…". Tap again to stop.
- The "Test safety path" pill gets `white-space: nowrap; flex-shrink: 0`.

---

## 9. Timeline

- "Journal Logs" → **Notebook logs**; hero subtitle → "Your week, notebook, chats, and check-ins — one calm place."
- **＋ New entry** button routes to `/notebook`.
- Notebook logs render as a **fanned mood-spine stack** above the entry list.
- Uses the same 7-day mood tile pattern as Home.

---

## 10. Gen Z direction (applied, keep subtle)

Audience is 20–40 young professionals. The tone is **warm, low-pressure,
lowercase-friendly** without slang cosplay:
- Short, human sentences. "okay is allowed." "the same worry kept circling back."
- Hinglish openers in Notebook, used sparingly and only as optional prompts.
- No emoji in system copy beyond the mood set and the streak flame.
- Elegance and subtlety of the original product are preserved — no neon,
  no aggressive gradients, no hype language.

---

## 11. Files in this bundle

| File | Page |
|---|---|
| `Landing.dc.html` | Landing |
| `SignIn.dc.html` | Sign in |
| `SignUp.dc.html` | Sign up |
| `Onboarding.dc.html` | Onboarding |
| `Home.dc.html` | Home dashboard |
| `Chat.dc.html` | Chat |
| `Notebook.dc.html` | **Notebook (new)** |
| `Timeline.dc.html` | Timeline |
| `Profile.dc.html` | Profile |
| `SignIn Time Samples.dc.html` | Reference only — all adaptive states |

Each is standalone HTML with inline styles; open in a browser or read as text.
Where this spec and the HTML disagree, **the HTML wins**.
