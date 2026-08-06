/**
 * Quick check: is Supabase Google provider enabled and is Dhira callback deployed?
 *
 *   npm run verify:google-auth
 *
 * Uses NEXT_PUBLIC_* from .env.local when present.
 */

const PROJECT_REF =
  process.env.SUPABASE_PROJECT_REF?.trim() || 'dfebsdwtktfnmzpmwlqp';

function env(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

async function main() {
  const supabaseUrl =
    env('NEXT_PUBLIC_SUPABASE_URL') || `https://${PROJECT_REF}.supabase.co`;
  const anon = env('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  const siteUrl = env('DHIRA_SITE_URL') || 'https://dhira-2-0-xi.vercel.app';

  let ok = true;

  const statusRes = await fetch(`${siteUrl}/api/status`);
  const status = (await statusRes.json()) as Record<string, unknown>;
  console.log('Production /api/status:', JSON.stringify(status));
  if (!status.supabaseAuth) {
    console.error('FAIL: supabaseAuth is not true on production.');
    ok = false;
  }

  const cbRes = await fetch(`${siteUrl}/auth/callback`, { redirect: 'manual' });
  const loc = cbRes.headers.get('location') || '';
  if (cbRes.status !== 307 || !loc.includes('sign-in')) {
    console.error('FAIL: /auth/callback route unexpected:', cbRes.status, loc);
    ok = false;
  } else {
    console.log('OK: /auth/callback route responds (redirects when no code).');
  }

  if (anon) {
    const settingsRes = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: anon },
    });
    if (!settingsRes.ok) {
      console.error('FAIL: could not read Supabase auth settings.');
      ok = false;
    } else {
      const settings = (await settingsRes.json()) as { external?: { google?: boolean } };
      const google = settings.external?.google === true;
      console.log(`Supabase Google provider enabled: ${google}`);
      if (!google) {
        console.error(
          'FAIL: Google is OFF in Supabase. Run npm run configure:google-auth (see docs/SUPABASE_GOOGLE_AUTH.md).',
        );
        ok = false;
      }
    }
  } else {
    console.warn('Skip Supabase settings check (no NEXT_PUBLIC_SUPABASE_ANON_KEY in env).');
  }

  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export {};
