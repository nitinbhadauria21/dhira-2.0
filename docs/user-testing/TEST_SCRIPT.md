# Dhira — teammate user-testing script

**Time:** about 20–30 minutes  
**App:** http://localhost:4028 (or the URL your facilitator shared)  
**After you finish:** fill the feedback Form your facilitator linked.

This is not a test of *you*. Be honest. Skip anything that is broken or marked N/A.

---

## Before you start

1. Use a laptop if you can (phone is fine too — note which in the Form).
2. Prefer **Chrome** or **Safari**.
3. Sign up with a **test email** you control (not a real user’s personal story dump if you are uncomfortable).
4. You do **not** need the Admin Console for this session.

Facilitator tip: if live Claude is on, `GET /api/status` should show `"liveBrain": true`. Offline mode is still valid for UX testing.

---

## Walkthrough

### 1. Landing (2 min)

1. Open the app URL.
2. Read the first screen without clicking.
3. Note: Do you understand what Dhira is for? Does it feel calm / trustworthy?

### 2. Sign up or sign in (3 min)

1. Go to **Sign up** (or Sign in if you already have an account).
2. Use **email + password** (skip phone OTP unless the facilitator says SMS is live).
3. Complete sign-in so you reach onboarding or home.

### 3. Onboarding (3–5 min)

1. Walk through splash → privacy → contract → setup.
2. Pick language (English or Hinglish) and any check-in preferences.
3. Finish and land on the home dashboard.

### 4. Home dashboard (2 min)

1. Look at mood / streaks / cards.
2. Try the main nav (Home, Chat, Timeline, Profile — labels may vary slightly).
3. Note anything confusing.

### 5. Chat with Dhira (5–8 min)

1. Open **Chat with Dhira**.
2. Send at least **two** messages in English, for example:
   - “Aaj thoda heavy feel ho raha hai, but I’m okay.”
   - “I don’t need advice — I just want someone to listen.”
3. Send **one Hinglish** line, for example:  
   “Yaar office mein bilkul mann nahi laga aaj.”
4. Notice: Does Dhira **listen** rather than advise? Does the tone feel warm?

Optional (mic): use the **Speak** button if available (browser speech-to-text). You still tap Send.

### 6. Crisis / safety path — only with facilitator (2 min)

**Do this only if a facilitator is with you.** Do not use real crisis language alone for “fun.”

1. Use the in-app **“Test safety path”** control if present, **or** the facilitator’s agreed test phrase.
2. Confirm you see a clear handoff to **Tele-MANAS 14416**.
3. Stop the crisis flow when the facilitator says so.

### 7. Talk to Dhira — voice (3–5 min, optional)

1. If you see **Talk to Dhira**, start a short voice call.
2. Allow microphone permission.
3. Speak one short check-in, then end the call.
4. If the button is missing or fails, mark **N/A** on the Form (ElevenLabs may not be configured).

### 8. Timeline — My Dhira (3 min)

1. Open **Timeline** / My Dhira.
2. Look for weekly summary, journal / history, or notification inbox.
3. Note whether your chat (and voice, if any) shows up in a useful way.

### 9. Profile (2 min)

1. Open **Profile**.
2. Glance at language / check-in prefs.
3. Try **Export** if shown (optional).
4. You may **Sign out** at the end.

### 10. Feedback Form (5 min)

Open the Google Form and answer while the session is fresh.

---

## What *not* to test

- `/admin/*` (internal; placeholder access)
- Real personal trauma dumps (use light, realistic demo feelings)
- Phone OTP unless facilitator confirms SMS works
- Production deploy / payment / Google login unless facilitator says those are enabled
