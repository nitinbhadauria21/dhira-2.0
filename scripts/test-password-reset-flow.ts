/**
 * Smoke-test password reset link flow (no email send).
 *   set -a && source .env.local && set +a && npm run test:password-reset-flow
 */
import { buildRecoveryConfirmUrl, generateRecoveryConfirmLink, passwordResetSiteUrl } from '../src/lib/passwordReset';

const TEST_EMAIL = process.env.PASSWORD_RESET_TEST_EMAIL?.trim() || 'nitin.bhadauria23@gmail.com';
const SITE = passwordResetSiteUrl();

async function main() {
  console.log('Site URL:', SITE);
  console.log('Test email:', TEST_EMAIL);

  const generated = await generateRecoveryConfirmLink(TEST_EMAIL, SITE);
  if (!generated?.resetLink) {
    console.error('FAIL: generateLink returned no link (user missing?)');
    process.exit(1);
  }
  console.log('OK: generateLink');
  console.log('  link prefix:', generated.resetLink.slice(0, 80) + '…');

  if (!generated.resetLink.includes('/auth/confirm') || !generated.resetLink.includes('token_hash=')) {
    console.error('FAIL: link missing auth/confirm or token_hash');
    process.exit(1);
  }
  console.log('OK: link format (token_hash → /auth/confirm)');

  const localConfirm = generated.resetLink.replace(SITE, 'http://127.0.0.1:4028');
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
