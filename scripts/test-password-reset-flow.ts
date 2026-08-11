/**
 * Smoke-test password reset link flow (no email send).
 *   set -a && source .env.local && set +a && npm run test:password-reset-flow
 */
import { createClient } from '@supabase/supabase-js';

const TEST_EMAIL = process.env.PASSWORD_RESET_TEST_EMAIL?.trim() || 'nitin.bhadauria23@gmail.com';
const SITE =
  process.env.DHIRA_SITE_URL?.trim() ||
  process.env.APP_URL?.trim() ||
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  'https://dhira-2-0-xi.vercel.app';

function buildRecoveryConfirmUrl(siteUrl: string, hashedToken: string): string {
  const url = new URL('/auth/confirm', siteUrl);
  url.searchParams.set('token_hash', hashedToken);
  url.searchParams.set('type', 'recovery');
  url.searchParams.set('next', '/reset-password');
  return url.toString();
}

async function generateRecoveryConfirmLink(email: string, siteUrl: string): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return null;
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
  });

  if (error || !data.properties?.hashed_token) {
    console.error('generateLink failed:', error?.message || 'no hashed_token');
    return null;
  }

  return buildRecoveryConfirmUrl(siteUrl, data.properties.hashed_token);
}

async function main() {
  console.log('Site URL:', SITE);
  console.log('Test email:', TEST_EMAIL);

  const resetLink = await generateRecoveryConfirmLink(TEST_EMAIL, SITE);
  if (!resetLink) {
    console.error('FAIL: generateLink returned no link (user missing?)');
    process.exit(1);
  }
  console.log('OK: generateLink');
  console.log('  link prefix:', resetLink.slice(0, 80) + '…');

  if (!resetLink.includes('/auth/confirm') || !resetLink.includes('token_hash=')) {
    console.error('FAIL: link missing auth/confirm or token_hash');
    process.exit(1);
  }
  console.log('OK: link format (token_hash → /auth/confirm)');

  const localConfirm = resetLink.replace(SITE, 'http://127.0.0.1:4028');
  const res = await fetch(localConfirm, { redirect: 'manual' });
  const loc = res.headers.get('location') || '';
  console.log('GET /auth/confirm →', res.status, loc.slice(0, 120));

  if (res.status === 307 && loc.includes('/reset-password')) {
    console.log('OK: auth/confirm verified token and redirects to reset-password');
    process.exit(0);
  }
  if (res.status === 307 && loc.includes('/forgot-password')) {
    console.error('FAIL: auth/confirm rejected token:', loc);
    process.exit(1);
  }
  console.warn('WARN: unexpected confirm response — is dev server running on 4028?');
  process.exit(res.status === 307 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
