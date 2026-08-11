# Email password reset (Supabase only)

Passwords for **email + password** accounts live in **Supabase Auth**. Dhira does not store your password separately.

**Supabase sends the reset email** — the browser calls `resetPasswordForEmail`; Dhira only provides the pages.

## For you (after setup)

1. **Sign in** → **Forgot Password** → enter your email → **Send reset link**.
2. Open the email on **any browser or phone** → tap **Reset password** → choose a new password.
3. You return to **Sign in** → sign in with your **new** password.

Production: **https://dhira-2-0-xi.vercel.app**

---

## One-time setup (developer / Cloud Agent)

Needs **Supabase Access Token** + **Resend** (for Supabase SMTP — https://resend.com):

```bash
export SUPABASE_ACCESS_TOKEN=sbp_...
export RESEND_API_KEY=re_...
export RESEND_FROM_EMAIL="Dhira <hello@yourdomain.com>"
npm run configure:password-reset
npm run verify:recovery-template
```

This configures:

1. Site URL + redirect URLs (`/auth/confirm`, `/reset-password`)
2. **Resend SMTP** on Supabase Auth (Supabase sends mail)
3. **Recovery email template** with `token_hash` link (works on any device)

### App routes

| Step | Route |
|------|--------|
| Forgot Password | `/forgot-password` |
| Email link | `/auth/confirm?token_hash=…&type=recovery` |
| New password | `/reset-password` |
| Sign in again | `/sign-in?passwordUpdated=1` |

### Troubleshooting

| Symptom | Fix |
|---------|-----|
| Same-browser / PKCE error | Run `configure:password-reset` again; request a **new** email |
| Template locked in dashboard | Use `configure:password-reset` (API) after Resend SMTP is set |
| No email received | Check Resend domain verification + `RESEND_FROM_EMAIL` |
| Phone-only account | Use Phone OTP on sign-in |
