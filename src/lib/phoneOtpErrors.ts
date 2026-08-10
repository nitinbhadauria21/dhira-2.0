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

  if (lower.includes('error sending confirmation otp') && lower.includes('provider')) {
    return `${msg} — Check Supabase → Authentication → Phone (Twilio vs Twilio Verify). See docs/SUPABASE_PHONE_OTP.md.`;
  }

  return msg;
}
