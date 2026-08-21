import { MOOD_COLORS, type MoodId } from '@/lib/artifactDesign';
import type { MoodLabel, NotebookEntry } from '@/lib/types';
import {
  buildMovementFromArc,
  computeCommonShiftFromArcs,
  dayKey,
  dedupeConsecutive,
  defaultMoodLegend,
  pickKeyMoods,
  shortLabel,
  WEEKDAY_SHORT,
  type TimelineMovementBlock,
} from '@/lib/timelineMoodMovement';

export interface TimelineNotebookDay {
  date: string;
  weekdayShort: string;
  dayNum: number;
  isToday: boolean;
  entryCount: number;
  bubbles: { mood: MoodLabel; color: string; time: string }[];
  moodArc: MoodLabel[];
  moodArcDisplay: string;
  movement: TimelineMovementBlock;
  highlights: { quote: string; time: string }[];
}

export interface TimelineNotebookWeek {
  weekStart: string;
  weekEnd: string;
  stats: {
    entries: number;
    commonShift: string;
    avgEntriesPerActiveDay: number;
    exitMood: string;
  };
  legend: { mood: MoodLabel; label: string; color: string }[];
  days: TimelineNotebookDay[];
  /** Lookup: date → mood arc display for list row chips */
  arcByDate: Record<string, string>;
}

function pickHighlights(entries: NotebookEntry[], limit = 2): { quote: string; time: string }[] {
  const sorted = [...entries].sort((a, b) => b.body.length - a.body.length);
  const picks = sorted.slice(0, limit);
  if (picks.length < limit) {
    const rest = entries.filter((e) => !picks.includes(e)).slice(-(limit - picks.length));
    picks.push(...rest);
  }
  return picks.map((e) => ({
    quote: e.body.length > 120 ? `${e.body.slice(0, 117)}…` : e.body,
    time: new Date(e.createdAt).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  }));
}

/** Build the last-7-days notebook timeline from saved entries. */
export function buildTimelineNotebookWeek(entries: NotebookEntry[]): TimelineNotebookWeek {
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);

  const days: TimelineNotebookDay[] = [];
  const arcByDate: Record<string, string> = {};

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const dayEntries = entries
      .filter((e) => dayKey(e.createdAt) === date)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const moodArc = dedupeConsecutive(dayEntries.map((e) => e.mood));
    const moodArcDisplay =
      moodArc.length > 0 ? moodArc.map((m) => shortLabel(m)).join(' → ') : dayEntries.length ? '—' : '';

    if (moodArcDisplay) arcByDate[date] = moodArcDisplay;

    const bubbles = dayEntries.map((e) => ({
      mood: e.mood,
      color: MOOD_COLORS[e.mood as MoodId]?.bg ?? '#B9B2A4',
      time: e.createdAt,
    }));

    const highlights = pickHighlights(dayEntries);
    const snippet = highlights[0]?.quote ?? null;

    days.push({
      date,
      weekdayShort: WEEKDAY_SHORT[d.getDay()],
      dayNum: d.getDate(),
      isToday: date === todayKey,
      entryCount: dayEntries.length,
      bubbles,
      moodArc,
      moodArcDisplay,
      movement: buildMovementFromArc(moodArc, snippet, null, { notebook: true }),
      highlights,
    });
  }

  const weekEntries = days.flatMap((day) => entries.filter((e) => dayKey(e.createdAt) === day.date));
  const activeDays = days.filter((d) => d.entryCount > 0);
  const avgEntries =
    activeDays.length > 0 ? Math.round((weekEntries.length / activeDays.length) * 10) / 10 : 0;

  const lastDayWithEntries = [...days].reverse().find((d) => d.entryCount > 0);
  const exitMood = lastDayWithEntries?.movement.left.label ?? '—';

  const dayArcs = days.filter((d) => d.moodArc.length >= 2).map((d) => d.moodArc);

  return {
    weekStart: days[0]?.date ?? todayKey,
    weekEnd: days[days.length - 1]?.date ?? todayKey,
    stats: {
      entries: weekEntries.length,
      commonShift: computeCommonShiftFromArcs(dayArcs),
      avgEntriesPerActiveDay: avgEntries,
      exitMood,
    },
    legend: defaultMoodLegend(),
    days,
    arcByDate,
  };
}

export function formatNotebookDaySummary(day: TimelineNotebookDay): string {
  if (!day.entryCount) return 'No notebook entries this day.';
  const dateLabel = new Date(`${day.date}T12:00:00`).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const arc = day.moodArcDisplay || '—';
  const countLabel = day.entryCount === 1 ? '1 entry' : `${day.entryCount} entries`;
  return `${dateLabel} · ${countLabel}. Your moods moved ${arc} across the day.`;
}

/** For list rows: compact arc chip text, e.g. "Anxious → Calmer" */
export function notebookDayArcChip(arcByDate: Record<string, string>, createdAt: string): string | null {
  const key = dayKey(createdAt);
  const arc = arcByDate[key];
  if (!arc || arc === '—') return null;
  return arc;
}

export { pickKeyMoods };
