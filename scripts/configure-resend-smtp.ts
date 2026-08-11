/**
 * Configure Supabase Auth to send email via Resend SMTP (Management API).
 *
 *   RESEND_API_KEY=re_... \
 *   RESEND_FROM_EMAIL="Dhira <hello@yourdomain.com>" \
 *   SUPABASE_ACCESS_TOKEN=sbp_... \
 *   npm run configure:resend-smtp
 */

const PROJECT_REF =
  process.env.SUPABASE_PROJECT_REF?.trim() || 'dfebsdwtktfnmzpmwlqp';

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();

  if (!token) {
    console.error('Missing SUPABASE_ACCESS_TOKEN');
    process.exit(1);
  }
  if (!apiKey) {
    console.error('Missing RESEND_API_KEY (https://resend.com/api-keys)');
    process.exit(1);
  }
  if (!fromEmail) {
    console.error('Missing RESEND_FROM_EMAIL (e.g. "Dhira <hello@yourdomain.com>")');
    process.exit(1);
  }

  const match = fromEmail.match(/<([^>]+)>/);
  const adminEmail = match?.[1] ?? fromEmail;
  const senderName = fromEmail.includes('<')
    ? fromEmail.replace(/<[^>]+>/, '').trim()
    : 'Dhira';

  const body = {
    external_email_enabled: true,
    smtp_host: 'smtp.resend.com',
    smtp_port: 465,
    smtp_user: 'resend',
    smtp_pass: apiKey,
    smtp_admin_email: adminEmail,
    smtp_sender_name: senderName || 'Dhira',
  };

  console.log(`Configuring Resend SMTP on project ${PROJECT_REF}…`);
  console.log('  smtp_admin_email:', adminEmail);

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

  console.log('Resend SMTP configured on Supabase Auth.');
  console.log('Next: npm run configure:password-reset-template');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
