import type { Profile } from '@/lib/types';

/** Same rule as sign-up — keep in sync with /api/auth/signup. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Trim, lowercase for lookup and storage consistency. */
export function normalizeEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) return null;
  return email;
}

/** Destination for proactive/test/inbound email — profiles.email + opt-in only. */
export function resolveNotificationEmail(profile: Profile): string | null {
  if (!profile.emailOptIn) return null;
  if (!profile.email?.trim()) return null;
  return normalizeEmail(profile.email);
}
