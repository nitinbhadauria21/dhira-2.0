/**
 * Enable Supabase Send Email Hook → Dhira /api/auth/hooks/send-email
 *
 *   SUPABASE_ACCESS_TOKEN=sbp_... npm run configure:password-reset-hook
 */

import { randomBytes } from 'node:crypto';

const PROJECT_REF =
  process.env.SUPABASE_PROJECT_REF?.trim() || 'dfebsdwtktfnmzpmwlqp';
const SITE_URL =
  process.env.DHIRA_SITE_URL?.trim() || 'https://dhira-2-0-xi.vercel.app';

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  if (!token) {
    console.error('Missing SUPABASE_ACCESS_TOKEN (Supabase Dashboard → Account → Access Tokens).');
    process.exit(1);
  }

  const hookSecret =
    process.env.SUPABASE_SEND_EMAIL_HOOK_SECRET?.trim() ||
    `v1,whsec_${randomBytes(24).toString('base64url')}`;

  const body = {
    hook_send_email_enabled: true,
    hook_send_email_uri: `${SITE_URL}/api/auth/hooks/send-email`,
    hook_send_email_secrets: hookSecret,
  };

  console.log(`Enabling send-email hook on project ${PROJECT_REF}…`);
  console.log('  uri:', body.hook_send_email_uri);

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

  console.log('Send Email Hook enabled.');
  console.log('Add to Vercel (encrypted):');
  console.log(`  SUPABASE_SEND_EMAIL_HOOK_SECRET=${hookSecret}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
