# Email password reset (Supabase)

Passwords for **email + password** accounts live in **Supabase Auth**. Dhira does not store your password separately.

## For you (after setup is done)

1. **Sign in** → **Forgot Password** → enter your email → **Send reset link**.
2. Open the **new** email (request a fresh link if an older one failed) → **Reset password** → choose a new password.
3. You should land on the **home dashboard**. Sign out and sign in again with the **new** password to confirm.

Use an account created with **email + password**, not phone-only OTP.

Production app: **https://dhira-2-0-xi.vercel.app**

**Related:** [Google sign-in](./SUPABASE_GOOGLE_AUTH.md) · [Phone OTP](./SUPABASE_PHONE_OTP.md)

---

## Setup (Cloud Agent / developers)

The agent runs **`npm run configure:password-reset`** once per Supabase project (needs `SUPABASE_ACCESS_TOKEN` in the environment). That sets redirect URLs and the recovery email template (`token_hash` → `/auth/confirm`, works on phone and desktop).

Verify production:

```bash
npm run verify:password-reset
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
