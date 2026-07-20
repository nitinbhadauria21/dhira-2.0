import type { CheckinFrequency, Profile } from '@/lib/types';
import { resolveChannel } from '@/lib/notify';

/** Local clock parts in a user's timezone. */
function localHM(date: Date, timeZone: string): { hour: number; minute: number; dayKey: string } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timeZone || 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '0';
  return {
    hour: Number(get('hour') === '24' ? '0' : get('hour')),
    minute: Number(get('minute')),
    dayKey: `${get('year')}-${get('month')}-${get('day')}`,
  };
}

/** Parse "22:00-23:00" (or "22:00") into minutes-from-midnight. */
function parseWindow(window: string): { start: number; end: number } | null {
  const m = window.trim().match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const start = Number(m[1]) * 60 + Number(m[2]);
  const end = Number(m[3]) * 60 + Number(m[4]);
  return { start, end };
}

export function isWithinCheckinWindow(now: Date, profile: Profile): boolean {
  const win = parseWindow(profile.checkinWindow || '22:00-23:00');
  if (!win) return true; // if misconfigured, don't block Demo Day
  const { hour, minute } = localHM(now, profile.timezone);
  const mins = hour * 60 + minute;
  if (win.start <= win.end) return mins >= win.start && mins < win.end;
  // overnight window e.g. 23:00-01:00
  return mins >= win.start || mins < win.end;
}

function hoursSince(iso: string | null | undefined, now: Date): number {
  if (!iso) return Infinity;
  return (now.getTime() - new Date(iso).getTime()) / (1000 * 60 * 60);
}

function minHoursForFrequency(freq: CheckinFrequency): number {
  if (freq === 'every-other-day') return 40;
  if (freq === 'weekly') return 6 * 24;
  return 20; // daily
}

export function isProactiveDue(profile: Profile, now = new Date(), opts?: { ignoreWindow?: boolean }): boolean {
  if (!profile.consentCheckin) return false;
  if (!resolveChannel(profile)) return false;
  if (!opts?.ignoreWindow && !isWithinCheckinWindow(now, profile)) return false;
  return hoursSince(profile.lastProactiveAt, now) >= minHoursForFrequency(profile.checkinFrequency);
}

export function isWeeklyDue(profile: Profile, now = new Date()): boolean {
  if (!profile.consentCheckin) return false;
  if (!resolveChannel(profile)) return false;
  // Once per ~6.5 days
  return hoursSince(profile.lastWeeklyAt, now) >= 6.5 * 24;
}

export interface DueUser {
  userId: string;
  alias: string;
  channel: NonNullable<ReturnType<typeof resolveChannel>>;
  to: string;
  language: Profile['language'];
}

export function toDueUser(profile: Profile): DueUser | null {
  const channel = resolveChannel(profile);
  if (!channel) return null;
  const to = channel === 'email' ? profile.email : profile.phoneE164;
  if (!to) return null;
  return {
    userId: profile.id,
    alias: profile.alias,
    channel,
    to,
    language: profile.language,
  };
}
