# Phone OTP sign-in (Supabase + Twilio SMS) — Dhira checklist

Use this once per Supabase project. Dhira’s code uses the browser Supabase client for live SMS OTP, then **`POST /api/auth/session`** for the unified **`dhira_session`** cookie.

**Related:** [Google sign-in](./SUPABASE_GOOGLE_AUTH.md) · **WhatsApp chat** uses a **different** Twilio setup on Vercel (`POST /api/twilio/whatsapp`), not this SMS provider.

## 1. Environment (Vercel + `.env.local`)

| Variable | Where |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable / anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key (server only — token verify + store) |

Production site: **https://dhira-2-0-xi.vercel.app**

Verify:

```bash
curl -s https://dhira-2-0-xi.vercel.app/api/status | jq '.supabaseAuth'
# true when keys are live on that deployment
```

## 2. Supabase → Authentication → Providers → Phone

1. Enable **Phone** provider.
2. Connect **Twilio** (Account SID, Auth Token, and messaging setup per Supabase docs for SMS OTP).
3. Send a test OTP from the dashboard or from the app (Step 4).

This Twilio configuration is **only for login SMS**. It is **not** the WhatsApp webhook credentials in Vercel.

## 3. Supabase → Authentication → URL configuration

Same as Google auth ([SUPABASE_GOOGLE_AUTH.md](./SUPABASE_GOOGLE_AUTH.md)):

| Field | Value |
|-------|--------|
| **Site URL** | `https://dhira-2-0-xi.vercel.app` |
| **Redirect URLs** | `https://dhira-2-0-xi.vercel.app/auth/callback` |
| | `http://localhost:4028/auth/callback` |

Phone OTP does not use `/auth/callback`, but Site URL should still match the host you use.

## 4. App flow (code)

| Guide prompt | Dhira file |
|--------------|------------|
| Supabase client | `src/lib/supabaseBrowser.ts` |
| Send / verify OTP | `src/lib/authClient.ts` — `requestOtp`, `verifyOtp` |
| Phone UI | `/sign-in`, `/sign-up` → **Phone OTP** tab |

1. User enters phone (default prefix **+91**; 10-digit Indian numbers are normalized to E.164).
2. **Send Code** → `signInWithOtp({ phone })` via Supabase → Twilio SMS.
3. **Verify** → `verifyOtp({ phone, token, type: 'sms' })` → access token → **`/api/auth/session`** → profile patch (`phoneE164`, alias/state/city on sign-up) → **`dhira_session`** cookie.

### Dev mode (no real Supabase keys)

If `NEXT_PUBLIC_SUPABASE_*` look like placeholders, the app uses **`/api/auth/otp/request`** and **`/api/auth/otp/verify`** and shows a **Dev code** on screen (no SMS).

In **live** mode those routes return **400** — the browser must use `authClient` only.

## 5. Test in Cursor

```bash
npm run dev
```

Open **http://localhost:4028/sign-up** or **/sign-in** → **Phone OTP**.

1. Enter mobile in E.164 form, e.g. **`+919876543210`** (or 10 digits after `+91`).
2. **Send Code** → check SMS → enter 6 digits → **Verify**.
3. Sign-up → **/onboarding**; sign-in → **/home-dashboard** (or `?next=`).

## 6. WhatsApp parity (same user, one timeline)

After phone login, the **Profile** phone should match the number you use on WhatsApp (E.164, e.g. `+91…`). Inbound WhatsApp resolves profiles via `normalizePhoneE164` and lookup variants — OTP now stores the same normalized value on sign-up/sign-in session.

See [AGENTS.md](../AGENTS.md) (cross-channel / v3 §8.1).

## 7. Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| No SMS | Phone provider off in Supabase; wrong Twilio creds; trial/geo limits |
| **Trial / unverified number (21608)** | Twilio Trial — verify the signup number under Verified caller IDs, or upgrade Twilio |
| Invalid phone / OTP | Not E.164; typo; expired code — use **Send Code** again |
| `Use Supabase phone OTP in live mode` (network) | Client called `/api/auth/otp/*` while Supabase is configured — use sign-in UI / `authClient` |
| Verify OK but not logged in | **`/api/auth/session`** failed — check server logs, **`SUPABASE_SERVICE_ROLE_KEY`** |
| WhatsApp thread separate from app | Profile phone ≠ WhatsApp **From**; fix number on Profile or re-verify OTP with correct E.164 |
| Sign-in via phone only, alias “Friend” | Expected if user skipped **/sign-up** — use sign-up for alias + location |

### Invalid From / `VA…` (Twilio error 21212)

**Symptom (in the app):**  
`Error sending confirmation OTP to provider: Invalid From Number (caller ID): VAxxxxxxxx…`  
([Twilio 21212](https://www.twilio.com/docs/errors/21212))

**Cause:** A **Twilio Verify Service SID** (starts with **`VA`**) was saved in the **Programmable SMS “From”** field. Verify IDs are not phone numbers and cannot be used as SMS caller ID.

**Fix (pick one path in Supabase → Authentication → Providers → Phone):**

| You want | Supabase SMS provider | What to paste |
|----------|----------------------|---------------|
| **OTP via Twilio Verify** (common for login codes) | **Twilio Verify** | Account SID, Auth Token, **Verify Service SID** (`VA…`) in the Verify service field — not in “From phone number” |
| **OTP via plain SMS** | **Twilio** | Account SID, Auth Token, and a **Twilio phone number** in E.164 (e.g. `+14155551234`) or a **Messaging Service SID** (`MG…`) — **never** `VA…` |

After saving, wait a minute and tap **Send verification code** again.

**India (`+91`):** Your Twilio number or Verify service must be allowed to send SMS to India (regulatory / geo permissions in Twilio Console).

### Twilio trial — unverified number (21608)

**Symptom in Dhira:**  
`The phone number is unverified. Trial accounts cannot send messages to unverified numbers`  
([Twilio 21608](https://www.twilio.com/docs/errors/21608))

**Cause:** Supabase sends login OTP through **Twilio**. On a **Trial** Twilio account, SMS can only go to numbers you add under **Verified caller IDs** — not every Indian mobile until the account is upgraded.

**Fix for testing (same number you use in sign-up, e.g. `+919665029933`):**

1. Open [Twilio Console → Verified caller IDs](https://console.twilio.com/us1/develop/phone-numbers/manage/verified).
2. Click **Add a new number**, enter the full E.164 number (with `+91`).
3. Complete Twilio’s verification step (they SMS/call you once).
4. In Dhira, tap **Send verification code** again.

**Fix for production (any user can sign up):** Upgrade Twilio from Trial to a paid account and complete SMS/geo requirements for **India (+91)** in Twilio (and keep Supabase Phone provider credentials in sync).

**Optional — Supabase test OTP (no SMS):** Supabase Dashboard → **Authentication → Phone** (or Auth settings) → configure **test phone numbers** with fixed OTP codes for demo only — see [Supabase phone auth docs](https://supabase.com/docs/guides/auth/phone-login).

## 8. Edge cases

- **Sign-in** with phone only (no sign-up) creates a Supabase user and profile with default alias **Friend** — fine for quick login; onboarding path is **/sign-up** → Phone OTP.
