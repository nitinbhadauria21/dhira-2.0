# Google sign-in (Supabase) — Dhira checklist

Use this once per Supabase project. Dhira’s code expects these dashboard settings.

## 1. Environment (Vercel + `.env.local`)

| Variable | Where |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable / anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key (server only) |

Production site: **https://dhira-2-0-xi.vercel.app**

Supabase project ref (from URL): **dfebsdwtktfnmzpmwlqp**

## 2. Supabase → Authentication → URL configuration

| Field | Value |
|-------|--------|
| **Site URL** | `https://dhira-2-0-xi.vercel.app` |
| **Redirect URLs** | `https://dhira-2-0-xi.vercel.app/auth/callback` |
| | `http://localhost:4028/auth/callback` |

## 3. Google Cloud Console → OAuth client (Web)

**Authorized JavaScript origins**

- `https://dhira-2-0-xi.vercel.app`
- `http://localhost:4028`

**Authorized redirect URIs** (Supabase callback — not Dhira)

- `https://dfebsdwtktfnmzpmwlqp.supabase.co/auth/v1/callback`

Paste **Client ID** and **Client secret** into Supabase → **Authentication → Providers → Google** (enabled).

## 4. App flow (code)

1. User clicks **Continue with Google** → `signInWithOAuth` (PKCE cookies via `@supabase/ssr`).
2. Google → Supabase → **`GET /auth/callback?code=...`** on your site.
3. Server exchanges code, creates profile, sets **`dhira_session`**, redirects to `/onboarding` or `next`.

## 5. Verify

- `GET https://dhira-2-0-xi.vercel.app/api/status` → `"supabaseAuth": true`
- Sign in with Google; land on onboarding or home with no error on `/sign-in?error=...`

If you see **redirect_uri_mismatch**, fix item 3 (Google redirect URI must be the Supabase `/auth/v1/callback` URL).

If you see **Could not complete Google sign-in** / PKCE errors, confirm item 2 redirect URLs include `/auth/callback` for the exact host you’re using.
