/**
 * Confirm Supabase recovery email template uses token_hash (Management API read).
 *
 *   SUPABASE_ACCESS_TOKEN=sbp_... npm run verify:recovery-template
 */

const PROJECT_REF =
  process.env.SUPABASE_PROJECT_REF?.trim() || 'dfebsdwtktfnmzpmwlqp';

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  if (!token) {
    console.error('SKIP: no SUPABASE_ACCESS_TOKEN — cannot read auth config.');
    process.exit(2);
  }

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const text = await res.text();
  if (!res.ok) {
    console.error(`FAIL: Management API (${res.status}):`, text.slice(0, 400));
    process.exit(1);
  }

  const data = JSON.parse(text) as { mailer_templates_recovery_content?: string };
  const content = data.mailer_templates_recovery_content ?? '';
  const ok =
    content.includes('token_hash') &&
    content.includes('{{ .TokenHash }}') &&
    content.includes('/auth/confirm');

  console.log('Recovery template length:', content.length);
  if (ok) {
    console.log('OK: recovery template uses token_hash → /auth/confirm');
    process.exit(0);
  }
  console.error('FAIL: recovery template missing token_hash /auth/confirm link.');
  console.error('Run: npm run configure:password-reset');
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
