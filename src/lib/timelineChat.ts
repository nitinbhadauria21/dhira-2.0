import { MOOD_COLORS, MOOD_EMOJI, type MoodId } from '@/lib/artifactDesign';
import type { ChatMessageRecord, MoodLabel, MoodLogRecord, TopicTag } from '@/lib/types';

const SESSION_GAP_MS = 30 * 60 * 1000;

/** Simplified labels for week stats (matches reference mock). */
const MOOD_SHORT: Partial<Record<MoodLabel, string>> = {
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

const MOOD_STEP_BLURB: Partial<Record<MoodLabel, string>> = {
  overwhelmed: 'Overwhelmed, stuck, unsure',
  sad: 'Heavy, low, withdrawn',
  stressed: 'Pressure, tight, on edge',
  angry: 'Frustrated, heated, tense',
  lonely: 'Apart, unseen, quiet',
  anxious: 'Worry, tension, overthinking',
  calm: 'More clarity, relief, in control',
  hopeful: 'Lighter, forward-looking, steadier',
  happy: 'Brighter, eased, more open',
  neutral: 'Even, steady, in-between',
};

const MOOD_CAME_IN: Partial<Record<MoodLabel, string>> = {
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

const MOOD_LEFT: Partial<Record<MoodLabel, string>> = {
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

const HEAVY_MOODS: MoodLabel[] = ['overwhelmed', 'sad', 'stressed', 'angry', 'lonely'];
const LIGHT_MOODS: MoodLabel[] = ['calm', 'hopeful', 'happy', 'neutral'];

export interface ChatSession {
  id: string;
  startAt: string;
  endAt: string;
  messages: ChatMessageRecord[];
  moods: MoodLabel[];
  topic: TopicTag | null;
}

export interface DayMovementStep {
  order: number;
  mood: MoodLabel;
  label: string;
  description: string;
  color: string;
}

export interface TimelineChatDay {
  date: string;
  weekdayShort: string;
  dayNum: number;
  isToday: boolean;
  sessions: ChatSession[];
  sessionCount: number;
  bubbles: { mood: MoodLabel; color: string; time: string }[];
  moodArc: MoodLabel[];
  moodArcDisplay: string;
  movement: {
    cameIn: { mood: MoodLabel; label: string; emoji: string; subtext: string };
    left: { mood: MoodLabel; label: string; emoji: string; subtext: string };
    steps: DayMovementStep[];
    insight: string;
  };
  highlights: { quote: string; time: string }[];
}

export interface TimelineChatWeek {
  weekStart: string;
  weekEnd: string;
  stats: {
    conversations: number;
    commonShift: string;
    avgSupportMinutes: number;
    exitMood: string;
  };
  legend: { mood: MoodLabel; label: string; color: string }[];
  days: TimelineChatDay[];
}

function dayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function shortLabel(mood: MoodLabel): string {
  return MOOD_SHORT[mood] ?? MOOD_COLORS[mood as MoodId]?.label ?? mood;
}

function moodValenceRank(mood: MoodLabel): number {
  if (HEAVY_MOODS.includes(mood)) return 0;
  if (mood === 'anxious') return 1;
  if (mood === 'neutral') return 2;
  if (LIGHT_MOODS.includes(mood)) return 3;
  return 2;
}

function isLighter(end: MoodLabel, start: MoodLabel): boolean {
  return moodValenceRank(end) > moodValenceRank(start);
}

function dedupeConsecutive<T>(arr: T[]): T[] {
  return arr.filter((item, i) => i === 0 || item !== arr[i - 1]);
}

/** Group messages into sessions when gap > 30 minutes. */
export function groupMessagesIntoSessions(messages: ChatMessageRecord[]): ChatSession[] {
  if (!messages.length) return [];

  const sorted = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const sessions: ChatSession[] = [];
  let batch: ChatMessageRecord[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].createdAt).getTime();
    const cur = new Date(sorted[i].createdAt).getTime();
    if (cur - prev > SESSION_GAP_MS) {
      sessions.push(buildSession(batch));
      batch = [sorted[i]];
    } else {
      batch.push(sorted[i]);
    }
  }
  if (batch.length) sessions.push(buildSession(batch));

  return sessions;
}

function buildSession(messages: ChatMessageRecord[]): ChatSession {
  const startAt = messages[0].createdAt;
  const endAt = messages[messages.length - 1].createdAt;
  return {
    id: `session-${startAt}`,
    startAt,
    endAt,
    messages,
    moods: [],
    topic: null,
  };
}

/** Nearest mood log within ±15 min of a timestamp. */
function moodNearTime(moods: MoodLogRecord[], iso: string): MoodLogRecord | null {
  const t = new Date(iso).getTime();
  let best: MoodLogRecord | null = null;
  let bestDelta = Infinity;
  for (const m of moods) {
    const delta = Math.abs(new Date(m.createdAt).getTime() - t);
    if (delta <= 15 * 60 * 1000 && delta < bestDelta) {
      best = m;
      bestDelta = delta;
    }
  }
  return best;
}

function attachMoodsToSessions(sessions: ChatSession[], moods: MoodLogRecord[]): ChatSession[] {
  return sessions.map((session) => {
    const windowStart = new Date(session.startAt).getTime() - 2 * 60 * 1000;
    const windowEnd = new Date(session.endAt).getTime() + 20 * 60 * 1000;
    const inWindow = moods
      .filter((m) => {
        const t = new Date(m.createdAt).getTime();
        return t >= windowStart && t <= windowEnd;
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    let sessionMoods = dedupeConsecutive(inWindow.map((m) => m.mood));
    let topic: TopicTag | null = inWindow.find((m) => m.topicTag !== 'other')?.topicTag ?? null;

    if (!sessionMoods.length) {
      const userMsgs = session.messages.filter((m) => m.role === 'user');
      for (const msg of userMsgs) {
        const log = moodNearTime(moods, msg.createdAt);
        if (log) {
          sessionMoods.push(log.mood);
          if (!topic && log.topicTag !== 'other') topic = log.topicTag;
        }
      }
      sessionMoods = dedupeConsecutive(sessionMoods);
    }

    return {
      ...session,
      moods: sessionMoods,
      topic,
    };
  });
}

function buildInsight(steps: MoodLabel[], topics: (TopicTag | null)[]): string {
  if (steps.length === 0) {
    return 'When you talk with Dhira, your mood shifts will show up here — privately, without the full chat.';
  }
  if (steps.length === 1) {
    return `You checked in feeling ${shortLabel(steps[0]).toLowerCase()}. Showing up to name it is already a step.`;
  }

  const start = steps[0];
  const end = steps[steps.length - 1];
  const topic = topics.find(Boolean);
  const topicPhrase = topic ? ` around ${topic}` : '';

  if (isLighter(end, start)) {
    return `Dhira heard you move from ${shortLabel(start).toLowerCase()} toward ${shortLabel(end).toLowerCase()}${topicPhrase}. You named what felt heavy, and something eased a little by the end — not fixed, just easier to carry.`;
  }
  if (start === end) {
    return `Your mood stayed ${shortLabel(start).toLowerCase()} across today's chats${topicPhrase}. Dhira stayed with you there — no pressure to feel different.`;
  }
  return `You came in ${shortLabel(start).toLowerCase()}${topicPhrase}. Some of that weight stayed — and you still showed up. That matters.`;
}

function pickHighlights(messages: ChatMessageRecord[], limit = 2): { quote: string; time: string }[] {
  const userMsgs = messages
    .filter((m) => m.role === 'user' && m.content.trim().length > 8)
    .sort((a, b) => b.content.length - a.content.length);

  const picks = userMsgs.slice(0, limit);
  if (picks.length < limit) {
    const rest = messages
      .filter((m) => m.role === 'user' && !picks.includes(m))
      .slice(-(limit - picks.length));
    picks.push(...rest);
  }

  return picks.map((m) => ({
    quote: m.content.length > 120 ? `${m.content.slice(0, 117)}…` : m.content,
    time: new Date(m.createdAt).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  }));
}

function buildDayMovement(sessions: ChatSession[]): TimelineChatDay['movement'] {
  const arc = dedupeConsecutive(sessions.flatMap((s) => s.moods));
  const fallbackStart: MoodLabel = arc[0] ?? 'neutral';
  const fallbackEnd: MoodLabel = arc[arc.length - 1] ?? fallbackStart;
  const steps: DayMovementStep[] = (arc.length ? arc : [fallbackStart, fallbackEnd]).map(
    (mood, i) => ({
      order: i + 1,
      mood,
      label: shortLabel(mood),
      description: MOOD_STEP_BLURB[mood] ?? MOOD_COLORS[mood as MoodId]?.label ?? mood,
      color: MOOD_COLORS[mood as MoodId]?.bg ?? '#B9B2A4',
    })
  );

  return {
    cameIn: {
      mood: fallbackStart,
      label: shortLabel(fallbackStart),
      emoji: MOOD_EMOJI[fallbackStart as MoodId] ?? '😶',
      subtext: MOOD_CAME_IN[fallbackStart] ?? 'How you started the day',
    },
    left: {
      mood: fallbackEnd,
      label: shortLabel(fallbackEnd),
      emoji: MOOD_EMOJI[fallbackEnd as MoodId] ?? '😶',
      subtext: MOOD_LEFT[fallbackEnd] ?? 'How you ended the day',
    },
    steps,
    insight: buildInsight(
      arc.length ? arc : [fallbackStart, fallbackEnd],
      sessions.map((s) => s.topic)
    ),
  };
}

function sessionDurationMinutes(session: ChatSession): number {
  const ms = new Date(session.endAt).getTime() - new Date(session.startAt).getTime();
  return Math.max(1, Math.round(ms / 60000));
}

function computeCommonShift(sessions: ChatSession[]): string {
  const shifts = new Map<string, number>();
  for (const s of sessions) {
    if (s.moods.length < 2) continue;
    const from = shortLabel(s.moods[0]);
    const to = shortLabel(s.moods[s.moods.length - 1]);
    const key = `${from} → ${to}`;
    shifts.set(key, (shifts.get(key) ?? 0) + 1);
  }
  if (!shifts.size) return '—';
  return [...shifts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

const WEEKDAY_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/** Build the last-7-days chat timeline from messages + mood logs. */
export function buildTimelineChatWeek(
  messages: ChatMessageRecord[],
  moods: MoodLogRecord[]
): TimelineChatWeek {
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);

  const allSessions = attachMoodsToSessions(groupMessagesIntoSessions(messages), moods);

  const days: TimelineChatDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const daySessions = allSessions.filter((s) => dayKey(s.startAt) === date);

    const bubbles = daySessions.flatMap((session) => {
      const mood = session.moods[0] ?? session.moods[session.moods.length - 1] ?? 'neutral';
      return session.messages.some((m) => m.role === 'user')
        ? [
            {
              mood,
              color: MOOD_COLORS[mood as MoodId]?.bg ?? '#B9B2A4',
              time: session.startAt,
            },
          ]
        : [];
    });

    const moodArc = dedupeConsecutive(daySessions.flatMap((s) => s.moods));
    const moodArcDisplay =
      moodArc.length > 0
        ? moodArc.map((m) => shortLabel(m)).join(' → ')
        : daySessions.length
          ? '—'
          : '';

    const dayMessages = daySessions.flatMap((s) => s.messages);

    days.push({
      date,
      weekdayShort: WEEKDAY_SHORT[d.getDay()],
      dayNum: d.getDate(),
      isToday: date === todayKey,
      sessions: daySessions,
      sessionCount: daySessions.length,
      bubbles,
      moodArc,
      moodArcDisplay,
      movement: buildDayMovement(daySessions),
      highlights: pickHighlights(dayMessages),
    });
  }

  const weekSessions = days.flatMap((d) => d.sessions);
  const totalMin = weekSessions.reduce((sum, s) => sum + sessionDurationMinutes(s), 0);
  const avgMin = weekSessions.length ? Math.round(totalMin / weekSessions.length) : 0;

  const lastDayWithChats = [...days].reverse().find((d) => d.sessionCount > 0);
  const exitMood = lastDayWithChats?.movement.left.label ?? '—';

  const legendEntries: { mood: MoodLabel; label: string }[] = [
    { mood: 'overwhelmed', label: 'Heavy' },
    { mood: 'anxious', label: 'Anxious' },
    { mood: 'overwhelmed', label: 'Overwhelmed' },
    { mood: 'sad', label: 'Sad' },
    { mood: 'calm', label: 'Calmer' },
    { mood: 'hopeful', label: 'Hopeful' },
  ];

  return {
    weekStart: days[0]?.date ?? todayKey,
    weekEnd: days[days.length - 1]?.date ?? todayKey,
    stats: {
      conversations: weekSessions.length,
      commonShift: computeCommonShift(weekSessions),
      avgSupportMinutes: avgMin,
      exitMood,
    },
    legend: legendEntries.map(({ mood, label }) => ({
      mood,
      label,
      color: MOOD_COLORS[mood]?.bg ?? '#B9B2A4',
    })),
    days,
  };
}

export function formatDaySummary(day: TimelineChatDay): string {
  if (!day.sessionCount) return 'No conversations this day.';
  const dateLabel = new Date(`${day.date}T12:00:00`).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const arc = day.moodArcDisplay || '—';
  const countLabel = day.sessionCount === 1 ? '1 conversation' : `${day.sessionCount} conversations`;
  return `${dateLabel} · ${countLabel}. You moved ${arc} across the day.`;
}
