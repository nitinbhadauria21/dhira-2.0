/**
 * Design tokens ported from the Claude Dhira User App artifact
 * (https://claude.ai/code/artifact/95d325eb-3e38-4658-9594-843bdb030151).
 * Keep in sync with CSS variables in src/styles/tailwind.css.
 */

export const MOOD_COLORS = {
  happy: { bg: '#F0C46B', text: '#241F16', label: 'Happy' },
  calm: { bg: '#8FBCA4', text: '#241F16', label: 'Calm' },
  hopeful: { bg: '#79C2C4', text: '#241F16', label: 'Hopeful' },
  neutral: { bg: '#B9B2A4', text: '#241F16', label: 'Neutral' },
  stressed: { bg: '#E0A94F', text: '#241F16', label: 'Stressed' },
  anxious: { bg: '#8794DA', text: '#ffffff', label: 'Anxious' },
  lonely: { bg: '#A99BC9', text: '#ffffff', label: 'Lonely' },
  overwhelmed: { bg: '#9C6B8E', text: '#ffffff', label: 'Overwhelmed' },
  sad: { bg: '#7089B0', text: '#ffffff', label: 'Sad' },
  angry: { bg: '#C56B5C', text: '#ffffff', label: 'Angry' },
} as const;

export type MoodId = keyof typeof MOOD_COLORS;

export const MOOD_EMOJI: Record<MoodId, string> = {
  happy: '😊',
  calm: '😌',
  hopeful: '🌱',
  neutral: '😶',
  stressed: '😤',
  anxious: '😰',
  lonely: '🌧️',
  overwhelmed: '🌊',
  sad: '😔',
  angry: '🌋',
};

export const MOOD_LEGEND: MoodId[] = ['calm', 'hopeful', 'stressed', 'anxious', 'overwhelmed'];

export const HERO_LINES = [
  'Aaj thoda heavy lag raha hai kya?',
  "I'm here. Tell me more.",
  'Yeh kaafi heavy lag raha hai. Main sun raha hoon.',
  "What's sitting with you right now?",
  'That sounds heavy. Take your time.',
] as const;

/** Demo chat seed from the Claude artifact (Hinglish sample conversation). */
export const ARTIFACT_CHAT_SEED = [
  {
    id: 'm1',
    role: 'dhira' as const,
    content: 'Aaj thoda heavy lag raha hai kya?',
    timestamp: '10:38 PM',
  },
  {
    id: 'm2',
    role: 'user' as const,
    content:
      'Haan yaar, office mein bilkul mann nahi laga. Sab kuch overwhelming lag raha tha.',
    timestamp: '10:39 PM',
  },
  {
    id: 'm3',
    role: 'dhira' as const,
    content:
      'Yeh kaafi heavy lag raha hai. Office mein kya hua specifically — ya bas ek general heaviness thi puri din?',
    timestamp: '10:39 PM',
  },
  {
    id: 'm4',
    role: 'user' as const,
    content:
      'Meeting mein meri baat ko kisi ne seriously nahi liya. Aisa lagta hai jaise main invisible hoon wahan.',
    timestamp: '10:41 PM',
  },
  {
    id: 'm5',
    role: 'dhira' as const,
    content:
      'That sounds really isolating — to speak and feel like no one received it. Invisible is a heavy word to carry. Yeh feeling pehle bhi aayi hai wahan, ya aaj kuch alag tha?',
    timestamp: '10:41 PM',
  },
];

export const ARTIFACT_MEMORY_LINE =
  "Last time, work was sitting heavy on you — how's that today?";

export const ARTIFACT_CHECKIN_LINE =
  'Kal thoda heavy lag raha tha. Just checking in — how are you sitting with it today?';
