/**
 * Design tokens + copy ported from the Claude Dhira User App artifact
 * (https://claude.ai/code/artifact/95d325eb-3e38-4658-9594-843bdb030151).
 * Keep in sync with CSS variables in src/styles/tailwind.css and
 * references/Dhira-User-App-claude-artifact.html.
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

/** 10-mood picker grid from the Claude artifact. */
export const MOODS_GRID: { id: MoodId; label: string; emoji: string; color: string }[] = [
  { id: 'happy', label: 'Happy', emoji: '😊', color: '#F0C46B' },
  { id: 'calm', label: 'Calm', emoji: '😌', color: '#8FBCA4' },
  { id: 'hopeful', label: 'Hopeful', emoji: '🌱', color: '#79C2C4' },
  { id: 'neutral', label: 'Neutral', emoji: '😶', color: '#B9B2A4' },
  { id: 'stressed', label: 'Stressed', emoji: '😤', color: '#E0A94F' },
  { id: 'anxious', label: 'Anxious', emoji: '😰', color: '#8794DA' },
  { id: 'lonely', label: 'Lonely', emoji: '🌧️', color: '#A99BC9' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '🌊', color: '#9C6B8E' },
  { id: 'sad', label: 'Sad', emoji: '😔', color: '#7089B0' },
  { id: 'angry', label: 'Angry', emoji: '🌋', color: '#C56B5C' },
];

export const HERO_LINES = [
  'Aaj thoda heavy lag raha hai kya?',
  "I'm here. Tell me more.",
  'Yeh kaafi heavy lag raha hai. Main sun raha hoon.',
  "What's sitting with you right now?",
  'That sounds heavy. Take your time.',
] as const;

export const FEATURES = [
  {
    glyph: 'ear',
    title: 'Listens, never advises',
    body: 'Dhira reflects your feelings and asks one gentle question at a time. No prescriptions, no unsolicited advice — just a space to be heard.',
    detail: '"That sounds heavy. Tell me more."',
  },
  {
    glyph: 'moon',
    title: 'Remembers gently',
    body: 'After each chat, Dhira keeps a quiet note of what you shared. Next time, she starts from where you left off.',
    detail: '"Last time work was sitting heavy on you — how\'s that today?"',
  },
  {
    glyph: 'chat',
    title: 'Reaches out first',
    body: 'Within your chosen window, Dhira checks in unprompted — because sometimes the hardest thing is starting the conversation.',
    detail: '"Kal thoda heavy lag raha tha. Just checking in."',
  },
  {
    glyph: 'shield',
    title: 'Safety built in',
    body: 'When things feel too heavy, Dhira steps back and connects you to real help — Tele-MANAS 14416, free and 24×7.',
    detail: "You don't have to be alone with this.",
  },
] as const;

export const STEPS = [
  {
    number: '01',
    glyph: 'person',
    title: 'Create your profile',
    body: "Sign up and select the language you'd like to talk to Dhira in.",
  },
  {
    number: '02',
    glyph: 'clock',
    title: 'Set your check-in window',
    body: 'Tell Dhira when she may reach out — 10 PM to 1 AM, a few times a week, in Hinglish. Your rules.',
  },
  {
    number: '03',
    glyph: 'chatDots',
    title: 'Talk. Be heard.',
    body: 'Open a chat anytime, or let Dhira come to you. She listens, reflects, and asks one gentle question.',
  },
  {
    number: '04',
    glyph: 'pulse',
    title: 'Watch your mood move',
    body: "A quiet 14-day mood timeline shows you how you've been — no judgement, just colour and continuity.",
  },
] as const;

export const TESTIMONIALS = [
  {
    quote:
      'Pehli baar kisi ne mujhe sirf suna — bina kuch solve karne ki koshish kiye. That felt different.',
    name: 'Aarav S.',
    meta: 'Mumbai · 3 weeks with Dhira',
    moodColor: '#8FBCA4',
    mood: 'Calmer',
  },
  {
    quote:
      'The 2 AM check-in message felt like someone actually cared enough to show up. Unexpected.',
    name: 'Priya K.',
    meta: 'Bengaluru · 5-day streak',
    moodColor: '#79C2C4',
    mood: 'Hopeful',
  },
  {
    quote:
      "Mujhe pata tha ye AI hai, phir bhi laga koi sun raha hai. That's the whole point, isn't it.",
    name: 'Rohan M.',
    meta: 'Delhi · 2 weeks with Dhira',
    moodColor: '#F0C46B',
    mood: 'Lighter',
  },
] as const;

/** Onboarding + landing privacy promise cards. */
export const PROMISES = [
  {
    glyph: 'incognito',
    title: 'Completely anonymous',
    body: 'No real name, no phone number, no email required. You choose what to share.',
    span: 2 as const,
  },
  {
    glyph: 'lock',
    title: 'Private by design',
    body: 'Your conversations stay yours. We store only mood metadata — never your words.',
    span: 1 as const,
  },
  {
    glyph: 'sliders',
    title: 'You are in control',
    body: 'Change your preferences, pause check-ins, or leave anytime. No lock-in.',
    span: 1 as const,
  },
  {
    glyph: 'heart',
    title: 'A listener, not a therapist',
    body: 'Dhira listens and remembers. She does not diagnose, advise, or judge.',
    span: 1 as const,
  },
] as const;

export const FREQUENCY_OPTIONS = [
  { value: 'daily' as const, label: 'Daily', sub: 'A gentle nudge every day' },
  { value: 'every-other-day' as const, label: 'Every other day', sub: 'A little breathing room' },
  { value: 'weekly' as const, label: 'Weekly', sub: 'Just once a week' },
];

export const LANGUAGE_OPTIONS = [
  {
    value: 'hinglish' as const,
    label: 'Hinglish',
    sub: 'Hindi + English — the way we actually talk',
  },
  {
    value: 'english' as const,
    label: 'English',
    sub: 'Full English responses from Dhira',
  },
];

/** Profile language cards use warmer example lines (still from the artifact UI). */
export const PROFILE_LANGUAGE_OPTIONS = [
  {
    value: 'hinglish' as const,
    label: 'Hinglish',
    sub: 'A warm mix of Hindi and English — "Aaj kaisa feel ho raha hai?"',
    emoji: '🇮🇳',
  },
  {
    value: 'english' as const,
    label: 'English',
    sub: 'Clear, gentle English — "How are you feeling today?"',
    emoji: '🌐',
  },
];

/** Demo 7-day moods from the Claude artifact (for empty accounts). */
export const DEMO_WEEK_MOODS: { day: string; date: string; mood: MoodId; isToday?: boolean }[] = [
  { day: 'Sat', date: '5', mood: 'calm' },
  { day: 'Sun', date: '6', mood: 'hopeful' },
  { day: 'Mon', date: '7', mood: 'stressed' },
  { day: 'Tue', date: '8', mood: 'overwhelmed' },
  { day: 'Wed', date: '9', mood: 'anxious' },
  { day: 'Thu', date: '10', mood: 'anxious' },
  { day: 'Fri', date: '11', mood: 'anxious', isToday: true },
];

/** Demo journal previews from the Claude artifact. */
export const DEMO_RECENT_ENTRIES = [
  {
    date: '11 Jul',
    preview: 'Office mein bilkul mann nahi laga aaj. Sab kuch overwhelming lag raha tha...',
    mood: 'anxious' as MoodId,
  },
  {
    date: '10 Jul',
    preview: 'Thoda better feel kiya aaj. Ek purani dost se baat hui, achha laga...',
    mood: 'hopeful' as MoodId,
  },
  {
    date: '9 Jul',
    preview: 'Neend nahi aayi raat ko. Kuch thoughts loop ho rahe the...',
    mood: 'anxious' as MoodId,
  },
];

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

export const HERO_TAGLINE =
  'A private, anonymous companion that listens at the hardest hour — never advising, always present.';

export const CTA_BODY =
  'Dhira is already there. Anonymous, private, and ready to listen — no sign-up friction, no real name required.';
