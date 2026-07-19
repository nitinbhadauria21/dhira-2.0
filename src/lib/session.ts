import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

/**
 * Anonymous-first identity.
 *
 * Plain English: instead of asking for a name/email/password, we give each
 * browser a random, private id and remember it in a secure cookie. That id is
 * a real, persistent "account" — the person's data (moods, memories, chat)
 * follows it — but it can never be traced back to a real identity.
 */

const UID_COOKIE = 'dhira_uid';
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Returns the current anonymous user id, creating (and persisting) one if this
 * is a brand-new visitor. Safe to call from Route Handlers and Server Actions.
 */
export async function getOrCreateUid(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(UID_COOKIE)?.value;
  if (existing) return existing;

  const uid = randomUUID();
  jar.set(UID_COOKIE, uid, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ONE_YEAR,
  });
  return uid;
}
