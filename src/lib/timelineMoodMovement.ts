import { MOOD_COLORS, MOOD_EMOJI, type MoodId } from '@/lib/artifactDesign';
import type { MoodLabel, TopicTag } from '@/lib/types';

/** Simplified labels for week stats (matches reference mock). */
export const MOOD_SHORT: Partial<Record<MoodLabel, string>> = {
  overwhelmed: 'Heavy',
  sad: 'Heavy',
  stressed: 'Heavy',
  angry: 'Heavy',
  lonely: 'Heavy',
  anxious: 'Anxious',
  calm: 'Calmer',
  hopeful: 'Hopeful',
  happy: 'Hopeful',
  neutral: 'Neutral',
};

export const MOOD_CAME_IN: Partial<Record<MoodLabel, string>> = {
  overwhelmed: 'Heavy emotions at the start',
  sad: 'Sadness sitting with you early on',
  stressed: 'Stress at the start of the day',
  anxious: 'Anxiety when you first opened up',
  calm: 'Already fairly settled when you started',
  hopeful: 'Hopeful when you began',
  neutral: 'Neutral when you checked in',
  lonely: 'Loneliness at the start',
  angry: 'Frustration when you came in',
  happy: 'Light mood when you started',
};

export const MOOD_LEFT: Partial<Record<MoodLabel, string>> = {
  calm: 'More balanced and steady',
  hopeful: 'A little lighter by the end',
  neutral: 'Steady, neither heavy nor light',
  anxious: 'Still some worry at the close',
  overwhelmed: 'Still heavy when you paused',
  sad: 'Still sad when you stepped away',
  stressed: 'Stress still present at the end',
  happy: 'Brighter when you left',
  lonely: 'Still feeling apart',
  angry: 'Frustration still present',
};

export const NOTEBOOK_MOOD_CAME_IN: Partial<Record<MoodLabel, string>> = {
  ...MOOD_CAME_IN,
  anxious: 'Anxiety when you first wrote',
  calm: 'Already fairly settled when you began writing',
  happy: 'Light mood when you opened your notebook',
};

export const NOTEBOOK_MOOD_LEFT: Partial<Record<MoodLabel, string>> = {
  ...MOOD_LEFT,
  calm: 'More balanced when you closed the page',
  hopeful: 'A little lighter after putting words down',
};

const HEAVY_MOODS: MoodLabel[] = ['overwhelmed', 'sad', 'stressed', 'angry', 'lonely'];
const LIGHT_MOODS: MoodLabel[] = ['calm', 'hopeful', 'happy', 'neutral'];

export const WEEKDAY_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export interface TimelineMovementBlock {
  cameIn: { mood: MoodLabel; label: string; emoji: string; subtext: string };
  left: { mood: MoodLabel; label: string; emoji: string; subtext: string };
  shiftLabel: string;
  narrative: [string, string, string];
}

export function dayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export function shortLabel(mood: MoodLabel): string {
  return MOOD_SHORT[mood] ?? MOOD_COLORS[mood as MoodId]?.label ?? mood;
}

function moodValenceRank(mood: MoodLabel): number {
  if (HEAVY_MOODS.includes(mood)) return 0;
  if (mood === 'anxious') return 1;
  if (mood === 'neutral') return 2;
  if (LIGHT_MOODS.includes(mood)) return 3;
  return 2;
}

export function isLighter(end: MoodLabel, start: MoodLabel): boolean {
  return moodValenceRank(end) > moodValenceRank(start);
}

export function dedupeConsecutive<T>(arr: T[]): T[] {
  return arr.filter((item, i) => i === 0 || item !== arr[i - 1]);
}

const TOPIC_PHRASE: Record<TopicTag, string> = {
  work: 'work pressure',
  family: 'family',
  relationships: 'relationships',
  health: 'health',
  finances: 'money worries',
  self: 'your inner world',
  other: 'what was on your mind',
};

function truncateSnippet(text: string, max = 48): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function buildNarrative(
  start: MoodLabel,
  end: MoodLabel,
  topic: TopicTag | null,
  userSnippet: string | null,
  options?: { notebook?: boolean },
): [string, string, string] {
  const topicPhrase = topic ? TOPIC_PHRASE[topic] : TOPIC_PHRASE.other;
  const startL = shortLabel(start).toLowerCase();
  const endL = shortLabel(end).toLowerCase();
  const notebook = options?.notebook ?? false;

  const line1 = userSnippet
    ? notebook
      ? `You started ${startL} — “${truncateSnippet(userSnippet)}” was part of what you wrote.`
      : `You came in ${startL} — “${truncateSnippet(userSnippet)}” was part of what you shared.`
    : notebook
      ? `You started feeling ${startL}, with ${topicPhrase} sitting close.`
      : `You came in feeling ${startL}, with ${topicPhrase} sitting close.`;

  if (isLighter(end, start)) {
    return [
      line1,
      notebook
        ? `Putting it into words helped the ${startL} edge soften a little — not solved, just clearer.`
        : `Naming what felt urgent helped the ${startL} edge soften a little — not solved, just clearer.`,
      notebook
        ? `You closed your notebook feeling a bit more ${endL}.`
        : `Dhira listened without advising, reflected your words back, and you left feeling a bit more ${endL}.`,
    ];
  }

  if (start === end) {
    return [
      line1,
      notebook
        ? `The ${startL} feeling stayed — your notebook held space without asking you to feel different.`
        : `The ${startL} feeling stayed — Dhira did not push you to feel different.`,
      notebook
        ? `You still had a quiet place to put what was on your mind.`
        : `You still had a quiet space to be heard, one gentle question at a time.`,
    ];
  }

  return [
    line1,
    notebook
      ? `Today moved from ${startL} toward ${endL} across your entries — that is still movement.`
      : `Today moved from ${startL} toward ${endL} in fits and starts — that is still movement.`,
    notebook
      ? `Each note captured a turn in how you were feeling, without trying to fix it.`
      : `Dhira stayed with each turn, mirroring what you said without trying to fix it.`,
  ];
}

export function pickKeyMoods(arc: MoodLabel[]): { start: MoodLabel; end: MoodLabel } {
  if (!arc.length) return { start: 'neutral', end: 'neutral' };
  return { start: arc[0], end: arc[arc.length - 1] };
}

export function buildMovementFromArc(
  arc: MoodLabel[],
  userSnippet: string | null,
  topic: TopicTag | null,
  options?: { notebook?: boolean },
): TimelineMovementBlock {
  const { start, end } = pickKeyMoods(arc);
  const cameInMap = options?.notebook ? NOTEBOOK_MOOD_CAME_IN : MOOD_CAME_IN;
  const leftMap = options?.notebook ? NOTEBOOK_MOOD_LEFT : MOOD_LEFT;
  const shiftLabel = arc.length > 1 ? `${shortLabel(start)} → ${shortLabel(end)}` : shortLabel(start);

  return {
    cameIn: {
      mood: start,
      label: shortLabel(start),
      emoji: MOOD_EMOJI[start as MoodId] ?? '😶',
      subtext: cameInMap[start] ?? 'How you started',
    },
    left: {
      mood: end,
      label: shortLabel(end),
      emoji: MOOD_EMOJI[end as MoodId] ?? '😶',
      subtext: leftMap[end] ?? 'How you ended',
    },
    shiftLabel,
    narrative: buildNarrative(start, end, topic, userSnippet, options),
  };
}

export function computeCommonShiftFromArcs(arcs: MoodLabel[][]): string {
  const shifts = new Map<string, number>();
  for (const arc of arcs) {
    if (arc.length < 2) continue;
    const from = shortLabel(arc[0]);
    const to = shortLabel(arc[arc.length - 1]);
    const key = `${from} → ${to}`;
    shifts.set(key, (shifts.get(key) ?? 0) + 1);
  }
  if (!shifts.size) return '—';
  return [...shifts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

export function defaultMoodLegend(): { mood: MoodLabel; label: string; color: string }[] {
  const legendEntries: { mood: MoodLabel; label: string }[] = [
    { mood: 'overwhelmed', label: 'Heavy' },
    { mood: 'anxious', label: 'Anxious' },
    { mood: 'overwhelmed', label: 'Overwhelmed' },
    { mood: 'sad', label: 'Sad' },
    { mood: 'calm', label: 'Calmer' },
    { mood: 'hopeful', label: 'Hopeful' },
  ];
  return legendEntries.map(({ mood, label }) => ({
    mood,
    label,
    color: MOOD_COLORS[mood]?.bg ?? '#B9B2A4',
  }));
}
