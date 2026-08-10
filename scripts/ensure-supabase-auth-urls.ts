/**
 * Ensure Supabase Auth redirect URLs include Dhira callback (password reset + Google OAuth).
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_... npm run ensure:supabase-auth-urls
 *
 * Optional: DHIRA_SITE_URL (default https://dhira-2-0-xi.vercel.app)
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
  if (!token) {
    console.error('Missing SUPABASE_ACCESS_TOKEN (Supabase Dashboard → Account → Access Tokens).');
    process.exit(1);
  }

  const body = {
    site_url: SITE_URL,
    uri_allow_list: REDIRECT_URLS.join(','),
  };

  console.log(`Updating Supabase project ${PROJECT_REF} auth URLs…`);
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

  console.log('Auth redirect URLs updated.');
  console.log('  site_url:', SITE_URL);
  console.log('  uri_allow_list:', REDIRECT_URLS.join(', '));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
