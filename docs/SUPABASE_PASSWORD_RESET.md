# Email password reset (Supabase)

Passwords for **email + password** accounts live in **Supabase Auth**. Dhira does not store your password separately.

## For you (after setup is done)

1. **Sign in** → **Forgot Password** → enter your email → **Send reset link**.
2. Open the email on **any browser or phone** → tap **Reset password** → choose a new password.
3. You should land on the **home dashboard**. Sign out and sign in again with the **new** password to confirm.

Use an account created with **email + password**, not phone-only OTP.

Production app: **https://dhira-2-0-xi.vercel.app**

**Related:** [Google sign-in](./SUPABASE_GOOGLE_AUTH.md) · [Phone OTP](./SUPABASE_PHONE_OTP.md)

---

## How reset email is sent (no same-browser requirement)

Dhira’s server calls Supabase Admin **`generateLink`** and builds:

`/auth/confirm?token_hash=…&type=recovery` → **Choose a new password**

That link is emailed via **`EMERGENT_NOTIFY_WEBHOOK_URL`** (Emergent workflow). It works when you open Gmail on a different device than where you requested the reset.

**Production must have** `EMERGENT_NOTIFY_WEBHOOK_URL` and `EMERGENT_WEBHOOK_SECRET` in Vercel (same as check-in emails).

Optional one-time Supabase dashboard automation (recovery template + redirect URLs):

```bash
npm run configure:password-reset   # needs SUPABASE_ACCESS_TOKEN
```

Verify:

```bash
npm run verify:password-reset
npm run verify:recovery-template   # needs SUPABASE_ACCESS_TOKEN
```

### App routes

| Step | Route |
|------|--------|
| Forgot Password link | `/forgot-password` |
| Email link | `/auth/confirm?token_hash=…&type=recovery` |
| New password | `/reset-password` → `/home-dashboard` |

Implementation: [`src/lib/authClient.ts`](../src/lib/authClient.ts), [`src/app/auth/confirm/route.ts`](../src/app/auth/confirm/route.ts).

### Troubleshooting

| Symptom | Fix |
|---------|-----|
| PKCE code verifier not found | Run `configure:password-reset` again; request a **new** reset email |
| Link expired | Request a new reset email from Forgot Password |
| Phone-only account | Use **Phone OTP** on sign-in — no password to reset |

Technical checklist for agents: [AGENTS.md](../AGENTS.md).
