/**
 * Enable Google sign-in on your Supabase project (Management API).
 *
 * Plain English: run this once after you have a Supabase access token and
 * Google OAuth Client ID + secret. It sets Site URL, redirect URLs, and turns
 * Google on — the same clicks as Phase 3 + 4c in docs/SUPABASE_GOOGLE_AUTH.md.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_... \
 *   GOOGLE_OAUTH_CLIENT_ID=... \
 *   GOOGLE_OAUTH_CLIENT_SECRET=... \
 *   npm run configure:google-auth
 */

const PROJECT_REF =
  process.env.SUPABASE_PROJECT_REF?.trim() || 'dfebsdwtktfnmzpmwlqp';
const SITE_URL =
  process.env.DHIRA_SITE_URL?.trim() || 'https://dhira-2-0-xi.vercel.app';

const REDIRECT_URLS = [
  `${SITE_URL}/auth/callback`,
  'http://localhost:4028/auth/callback',
];

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();

  if (!token) {
    console.error('Missing SUPABASE_ACCESS_TOKEN (Supabase Dashboard → Account → Access Tokens).');
    process.exit(1);
  }
  if (!clientId || !clientSecret) {
    console.error('Missing GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET (Google Cloud → Credentials).');
    process.exit(1);
  }

  const body = {
    site_url: SITE_URL,
    uri_allow_list: REDIRECT_URLS.join(','),
    external_google_enabled: true,
    external_google_client_id: clientId,
    external_google_secret: clientSecret,
  };

  console.log(`Updating Supabase project ${PROJECT_REF}…`);
  console.log(`  site_url: ${SITE_URL}`);
  console.log(`  redirect URLs: ${REDIRECT_URLS.join(', ')}`);

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  );

  const text = await res.text();
  if (!res.ok) {
    console.error(`Supabase API error (${res.status}):`, text.slice(0, 500));
    process.exit(1);
  }

  console.log('Supabase auth config updated successfully.');

  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    `https://${PROJECT_REF}.supabase.co`;

  if (anon) {
    const settingsRes = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: anon },
    });
    if (settingsRes.ok) {
      const settings = (await settingsRes.json()) as { external?: { google?: boolean } };
      const enabled = settings.external?.google === true;
      console.log(`Google provider enabled (public settings): ${enabled}`);
      if (!enabled) {
        console.warn('Warning: settings still show Google off — wait a minute and retry sign-in.');
      }
    }
  }

  console.log('\nNext: ensure Google Cloud redirect URI is');
  console.log(`  https://${PROJECT_REF}.supabase.co/auth/v1/callback`);
  console.log('Then test: https://dhira-2-0-xi.vercel.app/sign-in → Continue with Google');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
