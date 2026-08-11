/**
 * Smoke-test password reset routes (Supabase default ConfirmationURL flow).
 *   set -a && source .env.local && set +a && npm run test:password-reset-flow
 */
import { createClient } from '@supabase/supabase-js';

const SITE =
  process.env.DHIRA_SITE_URL?.trim() ||
  process.env.APP_URL?.trim() ||
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  'https://dhira-2-0-xi.vercel.app';

const REDIRECT_TO = `${SITE}/auth/callback?next=/reset-password`;

async function main() {
  console.log('Site URL:', SITE);
  console.log('Redirect after reset:', REDIRECT_TO);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const testEmail = process.env.PASSWORD_RESET_TEST_EMAIL?.trim() || 'nitin.bhadauria23@gmail.com';
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email: testEmail,
    options: { redirectTo: REDIRECT_TO },
  });

  if (error || !data.properties?.action_link) {
    console.error('FAIL: generateLink', error?.message || 'no action_link');
    process.exit(1);
  }

  const actionLink = data.properties.action_link;
  console.log('OK: Supabase generateLink (recovery)');
  console.log('  action_link prefix:', actionLink.slice(0, 72) + '…');

  if (!actionLink.includes('/auth/v1/verify')) {
    console.error('FAIL: action_link is not a Supabase verify URL');
    process.exit(1);
  }
  console.log('OK: default-style Supabase verify link');

  const cbRes = await fetch(`${SITE}/auth/callback`, { redirect: 'manual' });
  const cbLoc = cbRes.headers.get('location') || '';
  console.log('GET /auth/callback (no code) →', cbRes.status, cbLoc.slice(0, 80));
  if (cbRes.status === 307 && cbLoc.includes('sign-in')) {
    console.log('OK: /auth/callback route deployed');
  } else {
    console.error('FAIL: unexpected /auth/callback response');
    process.exit(1);
  }

  const resetRes = await fetch(`${SITE}/reset-password`, { redirect: 'manual' });
  console.log('GET /reset-password →', resetRes.status);
  if (resetRes.status !== 200 && resetRes.status !== 307) {
    console.error('FAIL: /reset-password not reachable');
    process.exit(1);
  }
  console.log('OK: /reset-password route deployed');
  console.log('Done — request a real reset from /forgot-password to test email delivery.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
