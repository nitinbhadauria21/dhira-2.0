/**
 * Ensure Supabase uses the default "Reset password" email template (ConfirmationURL).
 * Configured entirely in Supabase — no Resend or other email services.
 *
 *   SUPABASE_ACCESS_TOKEN=sbp_... npm run restore:default-recovery-template
 */

const PROJECT_REF =
  process.env.SUPABASE_PROJECT_REF?.trim() || 'dfebsdwtktfnmzpmwlqp';

/** Supabase default recovery template (uses {{ .ConfirmationURL }}) */
const DEFAULT_RECOVERY_TEMPLATE = `<h2>Reset your password</h2>
<p>We received a request to reset your password. Follow the link below to choose a new one.</p>
<p><a href="{{ .ConfirmationURL }}">Reset password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>`;

const DEFAULT_RECOVERY_SUBJECT = 'Reset your password';

function isDefaultTemplate(content: string): boolean {
  return content.includes('{{ .ConfirmationURL }}') && !content.includes('token_hash');
}

async function fetchAuthConfig(token: string) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Management API (${res.status}): ${text.slice(0, 400)}`);
  }
  return JSON.parse(text) as { mailer_templates_recovery_content?: string };
}

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  if (!token) {
    console.error('Missing SUPABASE_ACCESS_TOKEN (Supabase Dashboard → Account → Access Tokens).');
    process.exit(1);
  }

  const current = await fetchAuthConfig(token);
  const existing = current.mailer_templates_recovery_content ?? '';

  if (isDefaultTemplate(existing)) {
    console.log('OK: recovery template already uses Supabase default ConfirmationURL.');
    process.exit(0);
  }

  const body = {
    mailer_templates_recovery_content: DEFAULT_RECOVERY_TEMPLATE,
    mailer_subjects_recovery: DEFAULT_RECOVERY_SUBJECT,
  };

  console.log(`Restoring default recovery email template on project ${PROJECT_REF}…`);
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
    if (/free tier|custom SMTP/i.test(text) && isDefaultTemplate(existing)) {
      console.log('OK: free-tier project — default template already active in Supabase.');
      process.exit(0);
    }
    console.error(`Supabase API error (${res.status}):`, text.slice(0, 800));
    process.exit(1);
  }

  console.log('Default recovery template restored (ConfirmationURL).');
  console.log('Request a NEW reset email — old links may use a previous format.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
