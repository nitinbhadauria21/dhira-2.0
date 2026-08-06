# Fix: “Unsupported provider: provider is not enabled”

That message is **not a bug in Dhira’s code**. It means **Google sign-in is switched OFF** in Supabase.

## Fix in 3 clicks (about 5 minutes)

You need **Google Client ID + secret** first (from [Google Cloud Credentials](https://console.cloud.google.com/apis/credentials) — Web app, redirect URI must be `https://dfebsdwtktfnmzpmwlqp.supabase.co/auth/v1/callback`).

Then:

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your Dhira project.
2. **Authentication** → **Providers** → **Google**.
3. Turn **Enable** **ON**, paste **Client ID** and **Client secret**, click **Save**.

Also check **Authentication** → **URL configuration**:

- **Site URL:** `https://dhira-2-0-xi.vercel.app`
- **Redirect URLs:** `https://dhira-2-0-xi.vercel.app/auth/callback`

## Test

Incognito window → [sign-in](https://dhira-2-0-xi.vercel.app/sign-in) → **Continue with Google**.

Full checklist: [SUPABASE_GOOGLE_AUTH.md](./SUPABASE_GOOGLE_AUTH.md)

## Verify from a developer machine

```bash
npm run verify:google-auth
```

Should show: `Supabase Google provider enabled: true`
