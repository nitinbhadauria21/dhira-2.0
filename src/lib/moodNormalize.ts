import type { MoodLabel, TopicTag } from '@/lib/types';

const MOODS: MoodLabel[] = [
  'happy',
  'calm',
  'neutral',
  'hopeful',
  'stressed',
  'lonely',
  'angry',
  'anxious',
  'overwhelmed',
  'sad',
];

const TOPICS: TopicTag[] = [
  'work',
  'family',
  'relationships',
  'health',
  'finances',
  'self',
  'other',
];

/** Map free-form mood strings (voice agent, UI) onto Dhira's fixed mood labels. */
export function normalizeMood(raw: string | null | undefined): MoodLabel {
  const m = (raw || '').toLowerCase().trim();
  if ((MOODS as string[]).includes(m)) return m as MoodLabel;
  if (['better', 'good', 'ok', 'okay', 'fine'].includes(m)) return 'hopeful';
  if (['worried', 'nervous', 'panic', 'scared'].includes(m)) return 'anxious';
  if (['down', 'upset', 'cry', 'crying', 'depressed'].includes(m)) return 'sad';
  if (['exhausted', 'drained', 'sleepy', 'tired'].includes(m)) return 'stressed';
  if (['busy', 'pressure', 'tense'].includes(m)) return 'stressed';
  if (['alone', 'isolated'].includes(m)) return 'lonely';
  if (['mad', 'furious', 'irritated', 'annoyed'].includes(m)) return 'angry';
  if (['peace', 'peaceful', 'relaxed'].includes(m)) return 'calm';
  if (['joy', 'glad', 'happyish'].includes(m)) return 'happy';
  if (['too much', 'burnt', 'burned out', 'flooded'].includes(m)) return 'overwhelmed';
  return 'neutral';
}

export function normalizeTopic(raw: string | null | undefined): TopicTag {
  const t = (raw || '').toLowerCase().trim();
  if ((TOPICS as string[]).includes(t)) return t as TopicTag;
  if (['job', 'office', 'career', 'boss'].includes(t)) return 'work';
  if (['parents', 'home', 'ghar'].includes(t)) return 'family';
  if (['partner', 'friend', 'friends', 'dating'].includes(t)) return 'relationships';
  if (['body', 'sleep', 'illness'].includes(t)) return 'health';
  if (['money', 'bills', 'salary'].includes(t)) return 'finances';
  return 'self';
}

export function valenceForMood(mood: MoodLabel): number {
  if (['happy', 'calm', 'hopeful'].includes(mood)) return 0.5;
  if (['sad', 'anxious', 'overwhelmed', 'lonely', 'stressed', 'angry'].includes(mood)) return -0.5;
  return 0;
}
