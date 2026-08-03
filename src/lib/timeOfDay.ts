/**
 * Adaptive time-of-day + user-chosen shift (CalmLink pack).
 * Shift enum follows the .dc.html files (HTML wins over the older spec wording).
 */

export type ShiftPreference = 'day' | 'afternoon' | 'night' | 'rotating';

export type TimeBucket =
  | 'dawn'
  | 'morning'
  | 'midday'
  | 'afternoon'
  | 'evening'
  | 'dusk'
  | 'night'
  | 'lateNight';

/** Coarser scene keys used by Sign in / Sign up left panels. */
export type SceneKey = 'morning' | 'afternoon' | 'evening' | 'night';

export const SHIFT_OPTIONS: { key: ShiftPreference; label: string; hint: string }[] = [
  { key: 'day', label: 'Day shift', hint: '9-ish to 6-ish' },
  { key: 'afternoon', label: 'Afternoon shift', hint: '2 PM to 11 PM' },
  { key: 'night', label: 'Night shift', hint: '9 PM to 6 AM' },
  { key: 'rotating', label: 'Rotating shifts', hint: 'It changes weekly' },
];

export function isShiftPreference(v: unknown): v is ShiftPreference {
  return v === 'day' || v === 'afternoon' || v === 'night' || v === 'rotating';
}

export function readStoredShift(): ShiftPreference {
  if (typeof window === 'undefined') return 'day';
  try {
    const raw = localStorage.getItem('DHIRA-shift') || localStorage.getItem('dhira-shift');
    if (isShiftPreference(raw)) return raw;
  } catch {
    /* ignore */
  }
  return 'day';
}

export function writeStoredShift(shift: ShiftPreference) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('DHIRA-shift', shift);
  } catch {
    /* ignore */
  }
}

export function bucketForHour(hour: number): TimeBucket {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'midday';
  if (hour >= 14 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 19) return 'evening';
  if (hour >= 19 && hour < 21) return 'dusk';
  if (hour >= 21 || hour < 2) return 'night';
  return 'lateNight';
}

export function sceneKeyForHour(hour: number): SceneKey {
  if (hour >= 21 || hour < 5) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

type Phase = 'waking' | 'working' | 'winding' | 'offhours' | 'rotating';

function within(hour: number, wake: number, sleep: number): boolean {
  if (wake === sleep) return true;
  if (wake < sleep) return hour >= wake && hour < sleep;
  return hour >= wake || hour < sleep;
}

/** Map clock hour + shift into a personal phase (Sign-in panel copy). */
export function personalPhase(hour: number, shift: ShiftPreference): Phase {
  if (shift === 'rotating') return 'rotating';
  const windows: Record<Exclude<ShiftPreference, 'rotating'>, { wake: number; sleep: number }> = {
    day: { wake: 8, sleep: 22 },
    afternoon: { wake: 14, sleep: 23 },
    night: { wake: 21, sleep: 6 },
  };
  const w = windows[shift];
  if (!within(hour, w.wake, w.sleep)) return 'offhours';
  const span = (w.sleep - w.wake + 24) % 24 || 24;
  const into = (hour - w.wake + 24) % 24;
  if (into < span * 0.25) return 'waking';
  if (into < span * 0.75) return 'working';
  return 'winding';
}

export type AuthScene = {
  sky: string;
  badge: string;
  badgeDot: string;
  badgeColor: string;
  accent: string;
  eyebrow: string;
  h1: string;
  h2: string;
  memLabel: string;
  mem: string;
};

const SCENES: Record<SceneKey, AuthScene> = {
  morning: {
    sky: 'linear-gradient(165deg,#3C6E9E 0%,#79A7C6 38%,#C8CBDC 72%,#F6D9BC 100%)',
    badge: 'Awake with you',
    badgeDot: '#8FBCA4',
    badgeColor: '#DDF1E4',
    accent: '#F6C06B',
    eyebrow: 'A quiet morning',
    h1: 'Welcome back.',
    h2: 'Fresh page, same you.',
    memLabel: 'DHIRA remembers',
    mem: 'Yesterday felt heavy around work — how does this morning sit?',
  },
  afternoon: {
    sky: 'linear-gradient(165deg,#2F6BA8 0%,#5E97C8 40%,#A9C4DB 74%,#EFD9C4 100%)',
    badge: 'Here all day',
    badgeDot: '#8FBCA4',
    badgeColor: '#DDF1E4',
    accent: '#EFA94A',
    eyebrow: 'Middle of the day',
    h1: 'Welcome back.',
    h2: 'Take a breath here.',
    memLabel: 'DHIRA remembers',
    mem: 'Last time, work was sitting heavy on you — how’s that today?',
  },
  evening: {
    sky: 'linear-gradient(165deg,#3B3468 0%,#6B4B7E 38%,#B96F7C 72%,#F0A96E 100%)',
    badge: 'Winding down',
    badgeDot: '#F6C06B',
    badgeColor: '#FFE9CB',
    accent: '#EFA94A',
    eyebrow: 'Golden hour',
    h1: 'Welcome back.',
    h2: 'The day can rest now.',
    memLabel: 'DHIRA remembers',
    mem: 'You said evenings get loud in your head — how was today?',
  },
  night: {
    sky: 'linear-gradient(160deg,#171935 0%,#2A2550 42%,#463A6E 78%,#5E4A72 100%)',
    badge: 'Awake at 2 AM too',
    badgeDot: '#8FBCA4',
    badgeColor: '#D8F0E0',
    accent: '#F6C06B',
    eyebrow: 'Still awake · DHIRA is too',
    h1: 'Welcome back.',
    h2: "We've been here.",
    memLabel: 'DHIRA remembers · last night',
    mem: 'Sleep was hard last night — some thoughts were looping. Still there?',
  },
};

export function authSceneForNow(shift: ShiftPreference = 'day', now = new Date()): AuthScene {
  const hour = now.getHours();
  const key = sceneKeyForHour(hour);
  const base = SCENES[key];
  if (shift === 'day') return base;

  const phase = personalPhase(hour, shift);
  const isDarkOutside = key === 'night';
  const phaseCopy: Record<Phase, { badge: string; eyebrow: string; h1: string; h2: string; mem: string }> = {
    waking: {
      badge: 'Your day starts now',
      eyebrow: isDarkOutside ? 'Your morning, whenever it is' : 'Just getting started',
      h1: 'Good morning.',
      h2: 'Whatever the clock says.',
      mem: 'You mentioned the first hour is the hardest to face — how is it starting?',
    },
    working: {
      badge: 'Mid-shift, still here',
      eyebrow: 'Somewhere in the middle',
      h1: 'Taking a breather?',
      h2: 'This one is yours.',
      mem: 'Work was sitting heavy on you last time — how is the shift going?',
    },
    winding: {
      badge: 'Shift almost done',
      eyebrow: 'Nearly through it',
      h1: 'Almost done.',
      h2: 'Set the shift down.',
      mem: 'You said the end of a shift is when it all catches up — does it today?',
    },
    offhours: {
      badge: 'You should be resting',
      eyebrow: 'Outside your hours',
      h1: "Can't switch off?",
      h2: 'Sit with me a minute.',
      mem: 'Sleep has been hard to reach lately — is it doing that again?',
    },
    rotating: {
      badge: 'Whenever you land',
      eyebrow: "Your rhythm, not the clock's",
      h1: 'Welcome back.',
      h2: 'However this week runs.',
      mem: 'Your weeks keep shifting — how has this one been treating you?',
    },
  };
  const pc = phaseCopy[phase];
  return {
    ...base,
    badge: pc.badge,
    eyebrow: pc.eyebrow,
    h1: pc.h1,
    h2: pc.h2,
    mem: pc.mem,
  };
}

/** Home / Notebook greetings — DHIRA is there whenever the user comes. */
export function homeGreeting(alias: string, shift: ShiftPreference = 'day', now = new Date()): {
  title: string;
  sub: string;
} {
  const hour = now.getHours();
  const name = alias?.trim() || 'Friend';
  if (shift !== 'day') {
    const phase = personalPhase(hour, shift);
    if (phase === 'waking') return { title: `Good morning, ${name}.`, sub: 'Your day starts when you do.' };
    if (phase === 'working') return { title: `Hey ${name}.`, sub: 'A quiet minute mid-shift.' };
    if (phase === 'winding') return { title: `Almost there, ${name}.`, sub: 'You can set the shift down here.' };
    if (phase === 'rotating') return { title: `Welcome back, ${name}.`, sub: 'However this week runs — DHIRA is here.' };
    return { title: `Still up, ${name}?`, sub: "Sit with me a minute. You don't have to switch off alone." };
  }
  const bucket = bucketForHour(hour);
  switch (bucket) {
    case 'dawn':
      return { title: `Early light, ${name}.`, sub: 'A soft start — DHIRA is already here.' };
    case 'morning':
      return { title: `Good morning, ${name}.`, sub: 'Whenever you land, this page is yours.' };
    case 'midday':
      return { title: `Hey ${name}.`, sub: 'A quiet pocket in the middle of things.' };
    case 'afternoon':
      return { title: `Afternoon, ${name}.`, sub: 'Take a breath — no rush.' };
    case 'evening':
      return { title: `Evening, ${name}.`, sub: 'The day can soften here.' };
    case 'dusk':
      return { title: `Winding down, ${name}?`, sub: 'DHIRA is here for the in-between.' };
    case 'night':
      return { title: `Night check-in, ${name}.`, sub: "We've been here at this hour before." };
    case 'lateNight':
    default:
      return { title: `Still awake, ${name}.`, sub: 'No judgment — just company.' };
  }
}

export function notebookHeadline(now = new Date()): { title: string; sub: string } {
  const hour = now.getHours();
  if (hour >= 2 && hour < 5) return { title: 'The 2 a.m. page.', sub: 'Write what won’t settle.' };
  if (hour < 8) return { title: 'First page of the day.', sub: 'Before the noise starts.' };
  if (hour < 12) return { title: 'Morning notes.', sub: 'Whatever’s on your mind.' };
  if (hour < 17) return { title: 'The afternoon dip.', sub: 'Write it out instead of pushing through.' };
  if (hour < 21) return { title: 'Evening unload.', sub: 'Set the day down in ink.' };
  return { title: 'First thoughts, unfiltered.', sub: 'Late pages count too.' };
}

/** Mood weight for Horizon tiles (CalmLink pack). */
export const MOOD_WEIGHTS: Record<string, number> = {
  happy: 0.2,
  hopeful: 0.22,
  calm: 0.28,
  neutral: 0.4,
  lonely: 0.58,
  sad: 0.6,
  stressed: 0.62,
  anxious: 0.72,
  angry: 0.74,
  overwhelmed: 0.9,
};

export function moodTileHeight(mood: string | null | undefined): number {
  if (!mood) return 34;
  const w = MOOD_WEIGHTS[mood] ?? 0.4;
  return Math.round(34 + w * 44);
}
