/**
 * Turn Supabase/Twilio OTP send failures into plain-English fixes for the dashboard.
 */
export function formatPhoneOtpSendError(raw: string): string {
  const msg = raw.trim();
  const lower = msg.toLowerCase();

  // Twilio 21212 — VA… Verify SID used as SMS "From" (wrong Supabase provider)
  if (
    lower.includes('invalid from') ||
    lower.includes('21212') ||
    /invalid from number.*\bva[a-z0-9]{32}\b/i.test(msg)
  ) {
    return (
      'SMS could not be sent: your Supabase Phone settings are using a Twilio Verify ID (starts with VA) as the SMS sender. ' +
      'In Supabase → Authentication → Providers → Phone, either choose **Twilio Verify** and paste that VA Service SID in the Verify field, ' +
      'or choose **Twilio** and set a real Twilio phone number in E.164 (e.g. +1…) — not the VA ID. See docs/SUPABASE_PHONE_OTP.md § “Invalid From / VA…”.'
    );
  }

  // Twilio 21608 — trial account, destination not on Verified Caller IDs
  if (
    lower.includes('21608') ||
    (lower.includes('unverified') && lower.includes('trial'))
  ) {
    return (
      'This phone number cannot receive SMS yet because your Twilio account is on a free trial. ' +
      'In Twilio Console → Phone Numbers → Verified caller IDs, add this exact number (+91… in E.164), confirm the code Twilio texts you, then tap Send verification code again. ' +
      'For real users in production, upgrade the Twilio account (or use a paid messaging setup). See docs/SUPABASE_PHONE_OTP.md § Twilio trial (21608).'
    );
  }

  if (lower.includes('error sending confirmation otp') && lower.includes('provider')) {
    return `${msg} — Check Supabase → Authentication → Phone (Twilio vs Twilio Verify). See docs/SUPABASE_PHONE_OTP.md.`;
  }

  return msg;
}
