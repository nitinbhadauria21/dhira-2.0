/**
 * Set Supabase "Reset password" email template to token_hash link (no PKCE).
 * Run once — no dashboard paste required if you have an access token.
 *
 *   SUPABASE_ACCESS_TOKEN=sbp_... npm run configure:password-reset-template
 */

const PROJECT_REF =
  process.env.SUPABASE_PROJECT_REF?.trim() || 'dfebsdwtktfnmzpmwlqp';

/** Matches Supabase default copy; only the link uses token_hash → /auth/confirm */
const RECOVERY_TEMPLATE = `<h2>Reset your password</h2>
<p>We received a request to reset your password. Follow the link below to choose a new one.</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">Reset password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>`;

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  if (!token) {
    console.error('Missing SUPABASE_ACCESS_TOKEN (Supabase Dashboard → Account → Access Tokens).');
    process.exit(1);
  }

  const body = {
    mailer_templates_recovery_content: RECOVERY_TEMPLATE,
    mailer_subjects_recovery: 'Reset your password',
  };

  console.log(`Updating recovery email template on project ${PROJECT_REF}…`);
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
    console.error(`Supabase API error (${res.status}):`, text.slice(0, 800));
    process.exit(1);
  }

  console.log('Recovery email template updated (token_hash → /auth/confirm).');
  console.log('Request a NEW reset email from Dhira — old links still use the previous format.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
