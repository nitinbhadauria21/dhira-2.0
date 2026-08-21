import type { ChatChannel, Language } from '@/lib/types';

/** Devanagari and common Hinglish roman cues. */
const HINGlish_RE =
  /[\u0900-\u097F]|(\b(yaar|nahi|nahin|kya|hai|hoon|raha|rahi|lagta|mann|bhai|acha|theek|sun|bol|samajh|udas|dukh)\b)/i;

/** Unicode script ranges for Profile regional languages. */
const SCRIPT_PATTERNS: Partial<Record<Language, RegExp>> = {
  hindi: /[\u0900-\u097F]/,
  hinglish: /[\u0900-\u097F]/,
  marathi: /[\u0900-\u097F]/,
  bengali: /[\u0980-\u09FF]/,
  assamese: /[\u0980-\u09FF]/,
  gujarati: /[\u0A80-\u0AFF]/,
  punjabi: /[\u0A00-\u0A7F]/,
  odia: /[\u0B00-\u0B7F]/,
  tamil: /[\u0B80-\u0BFF]/,
  telugu: /[\u0C00-\u0C7F]/,
  kannada: /[\u0C80-\u0CFF]/,
  malayalam: /[\u0D00-\u0D7F]/,
};

function uniqueCandidates(candidates: Language[]): Language[] {
  const seen = new Set<Language>();
  const out: Language[] = [];
  for (const lang of candidates) {
    if (!seen.has(lang)) {
      seen.add(lang);
      out.push(lang);
    }
  }
  return out;
}

/**
 * Pick the best-matching language from the user's Profile languages based on message text.
 * Checks native scripts first, then roman Hinglish cues, then plain Latin → English.
 */
export function detectLanguageFromMessage(
  text: string,
  candidates: Language[],
  defaultLanguage: Language,
): Language {
  const t = text.trim();
  if (!t) return defaultLanguage;

  const langs = uniqueCandidates(candidates.length ? candidates : [defaultLanguage]);

  for (const lang of langs) {
    const pattern = SCRIPT_PATTERNS[lang];
    if (pattern?.test(t)) return lang;
  }

  if (HINGlish_RE.test(t)) {
    if (langs.includes('hinglish')) return 'hinglish';
    if (langs.includes('hindi')) return 'hindi';
    if (langs.includes('marathi')) return 'marathi';
  }

  if (/^[a-z0-9\s.,!?'"\-–—():;/]+$/i.test(t) && t.replace(/\s/g, '').length >= 3) {
    if (langs.includes('english')) return 'english';
  }

  return defaultLanguage;
}

/** @deprecated Prefer detectLanguageFromMessage with explicit candidates. */
export function inferLanguageFromMessage(text: string, fallback: Language = 'hinglish'): Language {
  return detectLanguageFromMessage(text, [fallback, 'english'], fallback);
}

/**
 * Language for this chat turn — detects from the message among Profile language 1 + 2.
 * Applies to app chat, voice (ElevenLabs Custom LLM), WhatsApp, Telegram, and email.
 */
export function languageForTurn(params: {
  channel: ChatChannel;
  userMessage: string;
  profileLanguage: Language;
  profileLanguage2?: Language | null;
}): Language {
  void params.channel;
  const candidates: Language[] = [params.profileLanguage];
  if (params.profileLanguage2 && params.profileLanguage2 !== params.profileLanguage) {
    candidates.push(params.profileLanguage2);
  }
  return detectLanguageFromMessage(params.userMessage, candidates, params.profileLanguage);
}
