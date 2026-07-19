import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { randomBytes, scryptSync, timingSafeEqual, randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/store';

/**
 * Identity & auth.
 *
 * Plain English: people now sign in for real (email+password or phone+OTP).
 * We keep ONE session mechanism in both modes: a secure `dhira_session` cookie
 * holding the user id.
 *  - Live mode: sign-in happens against Supabase Auth in the browser; the app
 *    verifies the Supabase token on the server and then sets `dhira_session`.
 *  - Dev mode (no Supabase keys): credentials live in the local store and we
 *    set the same cookie — so the whole flow is testable with no external keys.
 */

const SESSION_COOKIE = 'dhira_session';
const ONE_YEAR = 60 * 60 * 24 * 365;

// ── session cookie ────────────────────────────────────────────────────────
export async function getUserId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

export async function setSession(uid: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, uid, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ONE_YEAR,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

// ── password hashing (dev mode only) ───────────────────────────────────────
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string | null): boolean {
  if (!stored) return false;
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const check = scryptSync(password, salt, 64);
  const orig = Buffer.from(hash, 'hex');
  return check.length === orig.length && timingSafeEqual(check, orig);
}

// ── dev-mode phone OTP store (a tiny JSON file) ─────────────────────────────
const OTP_FILE = path.join(process.cwd(), '.data', 'dhira-otp.json');

interface OtpEntry {
  code: string;
  expires: number;
}

function readOtps(): Record<string, OtpEntry> {
  try {
    return JSON.parse(fs.readFileSync(OTP_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function writeOtps(map: Record<string, OtpEntry>): void {
  fs.mkdirSync(path.dirname(OTP_FILE), { recursive: true });
  fs.writeFileSync(OTP_FILE, JSON.stringify(map), 'utf-8');
}

/** Create a dev OTP for a phone number and return the code (dev returns it to the UI). */
export function createDevOtp(phone: string): string {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const map = readOtps();
  map[phone] = { code, expires: Date.now() + 5 * 60 * 1000 };
  writeOtps(map);
  return code;
}

export function verifyDevOtp(phone: string, code: string): boolean {
  const map = readOtps();
  const entry = map[phone];
  if (!entry) return false;
  const ok = entry.code === code && Date.now() < entry.expires;
  if (ok) {
    delete map[phone];
    writeOtps(map);
  }
  return ok;
}

// ── live-mode Supabase token verification ───────────────────────────────────
/** Verify a Supabase access token and return its user id (live mode only). */
export async function verifySupabaseToken(accessToken: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      { auth: { persistSession: false } },
    );
    const { data, error } = await sb.auth.getUser(accessToken);
    if (error || !data.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

export function newUserId(): string {
  return randomUUID();
}
