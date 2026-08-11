/**
 * Verify Dhira is ready for Supabase password reset (redirect URLs + email auth).
 *
 *   npm run verify:password-reset
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
  console.log('Production /api/status supabaseAuth:', status.supabaseAuth);
  if (!status.supabaseAuth) {
    console.error('FAIL: supabaseAuth is not true on production.');
    ok = false;
  }

  const cbRes = await fetch(`${siteUrl}/auth/callback`, { redirect: 'manual' });
  const loc = cbRes.headers.get('location') || '';
  if (cbRes.status !== 307 || !loc.includes('sign-in')) {
    console.error('FAIL: /auth/callback unexpected:', cbRes.status, loc);
    ok = false;
  } else {
    console.log('OK: /auth/callback route is deployed.');
  }

  console.log('Reset email: Supabase Auth resetPasswordForEmail (default template)');
  console.log('Configure once: SUPABASE_ACCESS_TOKEN + npm run configure:password-reset');
  console.log('Supabase redirect URLs should include:', `${siteUrl}/auth/callback`);

  if (anon) {
    const settingsRes = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: anon },
    });
    if (!settingsRes.ok) {
      console.error('FAIL: could not read Supabase auth settings.');
      ok = false;
    } else {
      const settings = (await settingsRes.json()) as {
        external?: { email?: boolean; google?: boolean };
      };
      const emailOn = settings.external?.email !== false;
      console.log(`Supabase email provider (expected ON): ${emailOn ? 'enabled' : 'check dashboard'}`);
      if (settings.external?.email === false) {
        console.error('FAIL: Email provider appears disabled in Supabase.');
        ok = false;
      }
    }
  } else {
    console.warn('Skip Supabase settings check (no NEXT_PUBLIC_SUPABASE_ANON_KEY).');
  }

  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export {};
