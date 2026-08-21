/**
 * Preferred conversation + notification language (Profile.language).
 * Stored as snake_case codes in Postgres / local store.
 */

export const PREFERRED_LANGUAGE_OPTIONS = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'malayalam', label: 'Malayalam' },
  { value: 'odia', label: 'Odia' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'assamese', label: 'Assamese' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'punjabi', label: 'Punjabi' },
] as const;

export type PreferredLanguage = (typeof PREFERRED_LANGUAGE_OPTIONS)[number]['value'];

/** Legacy accounts created before regional language rollout. */
export type LegacyLanguage = 'hinglish';

export type Language = PreferredLanguage | LegacyLanguage;

const VALID_LANGUAGES = new Set<string>([
  ...PREFERRED_LANGUAGE_OPTIONS.map((o) => o.value),
  'hinglish',
]);

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && VALID_LANGUAGES.has(value);
}

export function normalizeLanguage(value: unknown, fallback: Language = 'english'): Language {
  return isLanguage(value) ? value : fallback;
}

export function languageDisplayName(lang: Language): string {
  if (lang === 'hinglish') return 'Hinglish';
  const match = PREFERRED_LANGUAGE_OPTIONS.find((o) => o.value === lang);
  return match?.label ?? 'English';
}

/** Agent / Monitor instruction so outbound text matches Profile language. */
export function languagePromptInstruction(lang: Language): string {
  if (lang === 'english') {
    return '(Write entirely in clear, gentle English.)';
  }
  if (lang === 'hinglish') {
    return '(Write in natural Hinglish — Hindi + English mix — the way people text in India.)';
  }
  if (lang === 'hindi') {
    return '(Write entirely in Hindi, Devanagari script, warm and conversational.)';
  }
  return `(Write entirely in ${languageDisplayName(lang)}, using its native script where natural. Do not default to English.)`;
}

export function usesHindiMix(lang: Language): boolean {
  return lang === 'hinglish' || lang === 'hindi';
}

/** Canned Telegram test line when the offline brain is active. */
export function telegramConnectionTestMessage(alias: string, lang: Language): string {
  if (lang === 'english') {
    return `Hey ${alias} — this is a quick test from Dhira. Telegram is connected. I'm here whenever you feel like talking.`;
  }
  if (usesHindiMix(lang)) {
    return `Hey ${alias} — yeh ek chhota test message hai. Telegram connect ho gaya. Main yahin hoon jab bhi baat karni ho.`;
  }
  return `Hey ${alias} — Dhira this side. Telegram is connected. I'm here whenever you feel like talking. (${languageDisplayName(lang)} preferred.)`;
}

/** Warm test line for email delivery check. */
export function emailConnectionTestMessage(alias: string, lang: Language): string {
  if (lang === 'english') {
    return `Hey ${alias} — this is a quick test from Dhira. Email check-ins are set up. I'm here whenever you feel like talking.`;
  }
  if (usesHindiMix(lang)) {
    return `Hey ${alias} — yeh ek chhota test email hai. Check-ins ke liye email ready hai. Main yahin hoon jab bhi baat karni ho.`;
  }
  return `Hey ${alias} — Dhira this side. Your email for check-ins is connected. I'm here whenever you feel like talking. (${languageDisplayName(lang)} preferred.)`;
}
