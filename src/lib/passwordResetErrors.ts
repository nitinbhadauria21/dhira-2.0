/**
 * Plain-English errors for Supabase password reset email failures.
 */
export function formatPasswordResetError(raw: string): string {
  const msg = raw.trim();
  const lower = msg.toLowerCase();

  if (
    lower.includes('over_email_send_rate_limit') ||
    lower.includes('rate limit') ||
    /only request this after \d+ seconds/i.test(msg)
  ) {
    return (
      'Supabase is temporarily limiting reset emails for security (free plan allows a few per hour). ' +
      'Wait about a minute, then try again. Also check your spam folder if you requested a link recently.'
    );
  }

  if (lower.includes('email not confirmed') || lower.includes('user not found')) {
    return msg;
  }

  return msg;
}
