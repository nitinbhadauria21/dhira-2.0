import { buildTimelineNotebookWeek } from '@/lib/timelineNotebook';
import type { NotebookEntry } from '@/lib/types';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const now = new Date();
const day1 = new Date(now);
day1.setDate(day1.getDate() - 1);
const day1Key = day1.toISOString().slice(0, 10);

const entries: NotebookEntry[] = [
  {
    id: '1',
    profileId: 'p1',
    createdAt: `${day1Key}T10:00:00.000Z`,
    mode: 'write',
    body: 'Morning felt heavy before the presentation.',
    mood: 'anxious',
    topics: ['work'],
    shareWithDhira: true,
  },
  {
    id: '2',
    profileId: 'p1',
    createdAt: `${day1Key}T20:00:00.000Z`,
    mode: 'write',
    body: 'Evening wind-down — a bit calmer now.',
    mood: 'calm',
    topics: ['work'],
    shareWithDhira: true,
  },
];

const week = buildTimelineNotebookWeek(entries);
const day = week.days.find((d) => d.date === day1Key);

assert(day != null, 'day exists');
assert(day!.entryCount === 2, 'two entries');
assert(day!.moodArc.join(',') === 'anxious,calm', 'mood arc');
assert(day!.movement.shiftLabel.includes('→'), 'shift label has arrow');
assert(week.stats.entries === 2, 'week entry count');
assert(week.arcByDate[day1Key] === 'Anxious → Calmer', 'arc by date');

console.log('timeline-notebook tests passed');
