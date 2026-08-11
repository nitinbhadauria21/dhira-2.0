/**
 * Raise Supabase Auth email send rate limits when allowed (Management API).
 * Free-tier built-in email may stay at ~2/hour — custom SMTP unlocks higher limits.
 *
 *   SUPABASE_ACCESS_TOKEN=sbp_... npm run ensure:supabase-email-rate-limits
 */

const PROJECT_REF =
  process.env.SUPABASE_PROJECT_REF?.trim() || 'dfebsdwtktfnmzpmwlqp';

const TARGET_EMAIL_RATE = Number(process.env.SUPABASE_EMAIL_RATE_LIMIT ?? 30);

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  if (!token) {
    console.warn('SKIP: no SUPABASE_ACCESS_TOKEN');
    process.exit(0);
  }

  const getRes = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const before = (await getRes.json()) as { rate_limit_email_sent?: number };
  console.log('Current rate_limit_email_sent:', before.rate_limit_email_sent ?? '(unknown)');

  const patchRes = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rate_limit_email_sent: TARGET_EMAIL_RATE }),
    },
  );

  if (!patchRes.ok) {
    const text = await patchRes.text();
    console.warn(`Could not raise email rate limit (${patchRes.status}):`, text.slice(0, 200));
    console.warn('Built-in Supabase email on free tier may stay at ~2 emails/hour per project.');
    process.exit(0);
  }

  const afterRes = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const after = (await afterRes.json()) as { rate_limit_email_sent?: number };
  console.log('Updated rate_limit_email_sent:', after.rate_limit_email_sent ?? '(unchanged)');

  if ((after.rate_limit_email_sent ?? 0) <= 2) {
    console.warn(
      'Note: Supabase built-in email on free tier limits how many reset emails can be sent per hour.',
    );
    console.warn('If users see no email, wait 1 minute between tries and check spam.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export {};
