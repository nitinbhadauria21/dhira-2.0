# Email password reset (Supabase only — default template)

Passwords for **email + password** accounts live in **Supabase Auth**. Dhira does not store your password — everything is saved in Supabase.

**Supabase sends the reset email** using its **built-in default template**. No Resend, Emergent, or other email services.

## For you

1. **Sign in** → **Forgot Password** → enter your email → **Send reset link**.
2. Open the email and tap **Reset password** → choose a new password.
3. You return to **Sign in** → sign in with your **new** password.

**Tip:** Open the reset link in the **same browser** where you clicked Forgot Password (Supabase’s default email works this way).

Production: **https://dhira-2-0-xi.vercel.app**

---

## One-time setup (Cloud Agent / developer)

Only needs your **Supabase Access Token** (Dashboard → Account → Access Tokens):

```bash
export SUPABASE_ACCESS_TOKEN=sbp_...
export DHIRA_SITE_URL=https://dhira-2-0-xi.vercel.app
npm run configure:password-reset
npm run verify:recovery-template
```

This configures **in Supabase only**:

1. **Site URL** + **redirect URLs** (`/auth/callback`, `/reset-password`, etc.)
2. **Default recovery email template** (`{{ .ConfirmationURL }}` — Supabase’s standard reset link)

### App routes

| Step | Route |
|------|--------|
| Forgot Password | `/forgot-password` |
| Email link (Supabase verify → Dhira) | `/auth/callback?next=/reset-password` |
| New password | `/reset-password` |
| Sign in again | `/sign-in?passwordUpdated=1` |

### Troubleshooting

| Symptom | Fix |
|---------|-----|
| “Same browser” / PKCE error | Request a new link and open it in the browser where you clicked Forgot Password |
| No email received | Supabase built-in email has rate limits — wait a few minutes and try again; check spam |
| Phone-only account | Use Phone OTP on sign-in |
