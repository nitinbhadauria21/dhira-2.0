import type { Language, MoodLabel, TopicTag } from '@/lib/types';

export interface ProactiveContextHints {
  /** Latest mood label if available. */
  recentMood: MoodLabel | null;
  /** Topic tag from mood or notebook. */
  recentTopic: TopicTag | null;
  /** Short theme hint from notebook (never full body). */
  notebookTheme: string | null;
}

export function buildProactiveContextLines(
  hints: ProactiveContextHints,
  language: Language,
): string[] {
  const lines: string[] = [`(User's language: ${language}. Match it.)`];
  if (hints.recentMood) {
    lines.push(`(Recent mood tone: ${hints.recentMood} — reference gently, do not diagnose.)`);
  }
  if (hints.recentTopic && hints.recentTopic !== 'other') {
    lines.push(`(Recent life area: ${hints.recentTopic} — only if it fits naturally.)`);
  }
  if (hints.notebookTheme) {
    lines.push(`(Private theme from their notebook: ${hints.notebookTheme} — never quote verbatim.)`);
  }
  return lines;
}

/** Truncate notebook body to a safe theme hint for the agent only. */
export function notebookThemeHint(body: string, max = 80): string | null {
  const t = body.trim();
  if (t.length < 12) return null;
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}
