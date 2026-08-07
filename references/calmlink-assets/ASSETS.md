# DHIRA · CALMLINK — image assets

12 images. Copy the whole `assets-used/` folder into `public/illustrations/`,
then reference them as `/illustrations/<file>`.

All bot cut-outs are transparent PNGs, background removed with an **edge flood fill**
(not a near-white threshold) so the bot's own glossy highlights survive.
If you re-export any of these, use the same method or the helmet and shoulders
will get holes punched in them.

---

## Where each image goes

| File | Size | Page | Placement |
|---|---|---|---|
| `dhira_sitting_calm.png` | 665×1129 | Landing | Hero. Floating buddy, **78px** wide, with halo. |
| `scene_2am.png` | 1200×760 | Landing | Background scene in the "2 a.m." story block. |
| `dhira_orb.png` | 539×705 | Sign in, Sign up | Left story panel, **78px**, floating with halo. Replaces the old circular avatar. |
| `dhira_sitting_hi.png` | 678×1202 | Home | Greeting block, **left** of the text. Floating, welcoming pose. |
| `dhira_chat_scene.png` | 1130×1024 | Chat | Empty / intro state of the conversation. |
| `dhira_listening_avatar.png` | 1018×1018 | Chat, Notebook | "DHIRA is listening" panel, and the Notebook speak mode. |
| `dhira_wave.png` | 704×1025 | Notebook | Floating buddy greeting the user on the page. |
| `dhira_settings.png` | 738×1202 | Profile | Settings illustration. |
| `bot_avatar.png` | 256×256 | Chat, Landing, Profile, Sign up | Small round avatar — chat bubbles, nav, testimonials. |
| `spot_welcome.png` | 466×206 | Onboarding (legacy) | Former welcome step spot; superseded by `spot_onboarding_dhira_path.png` on splash. |
| `spot_onboarding_dhira_path.png` | — | Onboarding | Step 0 splash hero — DHIRA on the garden path. |
| `dhira_promise_shield.png` | — | Onboarding | Step 1 (Our Promise) — `FloatingBuddy` @ ~108px, shield pose. |
| `spot_privacy.png` | 468×206 | Onboarding (legacy) | Former thin privacy banner; superseded by split hero + `dhira_promise_shield.png`. |
| `spot_timeline.png` | 502×194 | Timeline | Section spot illustration. |

---

## Rendering the floating buddy

Applies to `dhira_sitting_calm`, `dhira_orb`, `dhira_sitting_hi`, `dhira_wave`, `dhira_promise_shield`.
Bot renders at **78px** wide inside a relative container, with three layers behind it:

```css
/* 1 — halo base */
position: absolute; width: 132px; height: 132px; border-radius: 50%;
background: radial-gradient(circle at 50% 46%,
  rgba(255,240,186,.95) 0%,
  rgba(250,214,110,.6) 28%,
  rgba(240,186,72,.3) 50%,
  transparent 74%);
filter: blur(7px);
animation: halo 6s ease-in-out infinite;

/* 2 — halo core: this is what makes it glow in dark mode too */
position: absolute; width: 132px; height: 132px; border-radius: 50%;
background: radial-gradient(circle at 50% 46%,
  rgba(255,250,225,.9) 0%,
  rgba(255,232,150,.5) 34%,
  transparent 70%);
mix-blend-mode: screen;
filter: blur(9px);
animation: halo 6s ease-in-out infinite;

/* 3 — contact shadow */
position: absolute; bottom: 1px; width: 60px; height: 13px; border-radius: 50%;
background: radial-gradient(ellipse, rgba(255,214,120,.3), transparent 72%);
animation: glowPad 5.5s ease-in-out infinite;

/* the bot itself */
position: relative; width: 78px; object-fit: contain;
filter: drop-shadow(0 8px 16px rgba(40,30,10,.3))
        drop-shadow(0 0 18px rgba(255,225,150,.4));
animation: bob 5.5s ease-in-out infinite;
transform-origin: 50% 92%;
```

```css
@keyframes bob {
  0%,100% { transform: translateY(0)     rotate(-1.5deg); }
  50%     { transform: translateY(-10px) rotate( 1.5deg); }
}
@keyframes halo {
  0%,100% { opacity: .6;  transform: scale(.95); }
  50%     { opacity: .95; transform: scale(1.05); }
}
@keyframes glowPad {
  0%,100% { opacity: .4;  transform: scale(.92); }
  50%     { opacity: .75; transform: scale(1.08); }
}
```

Bob is 5.5s and halo is 6s **on purpose** — the slight phase drift keeps it
feeling alive rather than mechanical. Don't sync them.

---

## Alt text

Screen-reader text used in the prototype — reuse it:

- `dhira_sitting_calm` — "DHIRA, a small calm robot buddy, sitting with a hand on its heart"
- `dhira_orb` — "DHIRA, a small robot buddy holding a glowing light"
- `dhira_sitting_hi` — "DHIRA, waving hello"
- `dhira_wave` — "DHIRA, waving hello"
- `dhira_listening_avatar` — "DHIRA, listening"
- `bot_avatar` — "DHIRA"

Never gender the alt text. DHIRA is an AI buddy — no "she" or "he", anywhere.
