/**
 * Confirm Supabase recovery email uses the default ConfirmationURL template.
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
  const usesDefault =
    content.includes('{{ .ConfirmationURL }}') && !content.includes('token_hash');

  console.log('Recovery template length:', content.length);
  if (usesDefault) {
    console.log('OK: recovery template uses Supabase default ConfirmationURL');
    process.exit(0);
  }
  if (content.includes('token_hash') && content.includes('/auth/confirm')) {
    console.warn('WARN: custom token_hash template detected — run npm run configure:password-reset to restore default.');
    process.exit(1);
  }
  console.error('FAIL: recovery template does not use {{ .ConfirmationURL }}.');
  console.error('Run: npm run configure:password-reset');
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
