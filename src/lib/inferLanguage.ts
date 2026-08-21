import type { ChatChannel, Language } from '@/lib/types';

/** Devanagari and common Hinglish roman cues. */
const HINGlish_RE =
  /[\u0900-\u097F]|(\b(yaar|nahi|nahin|kya|hai|hoon|raha|rahi|lagta|mann|bhai|acha|theek|sun|bol|samajh|udas|dukh)\b)/i;

export function inferLanguageFromMessage(text: string, fallback: Language = 'hinglish'): Language {
  const t = text.trim();
  if (!t) return fallback;
  if (HINGlish_RE.test(t)) return 'hinglish';
  if (/^[a-z0-9\s.,!?'"-]+$/i.test(t) && t.length > 12) return 'english';
  return fallback;
}

/** Language for this turn — WhatsApp/Telegram follow the message; app uses profile default. */
export function languageForTurn(params: {
  channel: ChatChannel;
  userMessage: string;
  profileLanguage: Language;
  profileLanguage2?: Language | null;
}): Language {
  if (params.channel === 'whatsapp' || params.channel === 'telegram' || params.channel === 'email') {
    const primary = inferLanguageFromMessage(params.userMessage, params.profileLanguage);
    if (params.profileLanguage2 && params.profileLanguage2 !== params.profileLanguage) {
      const secondary = inferLanguageFromMessage(params.userMessage, params.profileLanguage2);
      if (secondary === params.profileLanguage2) return secondary;
    }
    return primary;
  }
  return params.profileLanguage;
}
