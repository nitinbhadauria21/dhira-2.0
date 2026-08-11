# Email password reset (Supabase + Resend)

Passwords for **email + password** accounts live in **Supabase Auth**. Dhira does not store your password separately.

**No Emergent** — reset email is sent by **Supabase Auth** (Resend SMTP) or **Resend API** from Dhira.

## For you (after setup)

1. **Sign in** → **Forgot Password** → enter your email → **Send reset link**.
2. Open the email on **any browser or phone** → tap **Reset password** → choose a new password.
3. Sign in again with the **new** password to confirm.

Production: **https://dhira-2-0-xi.vercel.app**

---

## One-time setup (developer / Cloud Agent)

Needs **Supabase Access Token** + **Resend** (https://resend.com):

```bash
export SUPABASE_ACCESS_TOKEN=sbp_...
export RESEND_API_KEY=re_...
export RESEND_FROM_EMAIL="Dhira <hello@yourdomain.com>"
npm run configure:password-reset
npm run verify:recovery-template
```

This configures:

1. Site URL + redirect URLs (`/auth/confirm`, `/reset-password`)
2. **Resend SMTP** on Supabase Auth
3. **Recovery email template** with `token_hash` link (works on any device)

**Alternative:** set only `RESEND_API_KEY` + `RESEND_FROM_EMAIL` on **Vercel** — Dhira sends the reset email directly (no Supabase template edit).

Optional Send Email Hook: `npm run configure:password-reset-hook` (requires `RESEND_API_KEY` on Vercel).

### App routes

| Step | Route |
|------|--------|
| Forgot Password | `/forgot-password` |
| Email link | `/auth/confirm?token_hash=…&type=recovery` |
| New password | `/reset-password` |

### Troubleshooting

| Symptom | Fix |
|---------|-----|
| Same-browser / PKCE error | Run `configure:password-reset` again; request a **new** email |
| Template locked in dashboard | Use `configure:password-reset` (API) after Resend SMTP is set |
| No email received | Check Resend domain verification + `RESEND_FROM_EMAIL` |
| Phone-only account | Use Phone OTP on sign-in |
