import { languageDisplayName } from '@/lib/languages';
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

/** Romanized speech cues when voice STT does not emit native script (voice-only). */
const ROMANIZED_LANGUAGE_CUES: Partial<Record<Language, RegExp>> = {
  telugu:
    /\b(nenu|neeku|meeru|ela|em|emi|undi|ledu|baaga|cheppu|avunu|kada|ikkada|akkada|sare|anna|amma|chey|cheyyi|unna|unnaru|bagundhi|sarele)\b/i,
  tamil:
    /\b(naan|neenga|epdi|enna|sollu|nalla|illai|irukku|pa|da|amma|appa|seri|sari|vanakkam)\b/i,
  malayalam: /\b(njan|ningal|enth|entha|alle|illa|nann|sheri|sari|chetta|chechi)\b/i,
  kannada: /\b(nanu|nimma|hege|enu|illa|ide|sari|gothu|amma|anna)\b/i,
  marathi: /\b(mala|tumhi|kasa|kay|nahi|ahe|pan|mhanje|baba|aho)\b/i,
  gujarati: /\b(hu|tame|kem|shu|nathi|che|bhai|ben|khabar)\b/i,
  punjabi: /\b(main|tuhanu|ki|nahi|hai|paaji|veer|bhenji)\b/i,
  bengali: /\b(ami|tumi|kemon|ki|na|ache|dada|didi|bhalo)\b/i,
  odia: /\b(mu|tume|kemiti|ki|nahin|achhi|bhai|bhauja)\b/i,
  assamese: /\b(moi|tumi|kenekoi|ki|nai|ase|dada|didi)\b/i,
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

function isAmbiguousLatinTranscript(text: string): boolean {
  return /^[a-z0-9\s.,!?'"\-–—():;/]+$/i.test(text) && text.replace(/\s/g, '').length >= 3;
}

/**
 * Pick the best-matching language from the user's Profile languages based on message text.
 * Checks native scripts first, then roman Hinglish cues, then plain Latin → English.
 */
export function detectLanguageFromMessage(
  text: string,
  candidates: Language[],
  defaultLanguage: Language,
  options?: { channel?: ChatChannel; detectedLanguageHint?: Language | null },
): Language {
  const t = text.trim();
  if (!t) return defaultLanguage;

  const langs = uniqueCandidates(candidates.length ? candidates : [defaultLanguage]);

  for (const lang of langs) {
    const pattern = SCRIPT_PATTERNS[lang];
    if (pattern?.test(t)) return lang;
  }

  if (options?.channel === 'voice') {
    for (const lang of langs) {
      const roman = ROMANIZED_LANGUAGE_CUES[lang];
      if (roman?.test(t)) return lang;
    }
  }

  if (HINGlish_RE.test(t)) {
    if (langs.includes('hinglish')) return 'hinglish';
    if (langs.includes('hindi')) return 'hindi';
    if (langs.includes('marathi')) return 'marathi';
  }

  if (isAmbiguousLatinTranscript(t)) {
    const hint = options?.detectedLanguageHint;
    if (hint && langs.includes(hint)) return hint;
    if (langs.includes('english')) return 'english';
  }

  return defaultLanguage;
}

/** @deprecated Prefer detectLanguageFromMessage with explicit candidates. */
export function inferLanguageFromMessage(text: string, fallback: Language = 'hinglish'): Language {
  return detectLanguageFromMessage(text, [fallback, 'english'], fallback);
}
function detectExplicitLanguageSwitchRequest(
  text: string,
  candidates: Language[],
): Language | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  for (const lang of candidates) {
    const name = languageDisplayName(lang).toLowerCase();
    if (
      t.includes(`in ${name}`) ||
      t.includes(`speak ${name}`) ||
      t.includes(`${name} lo`) ||
      t.includes(`${name} mein`) ||
      t.includes(`talk in ${name}`)
    ) {
      return lang;
    }
  }
  return null;
}

/**
 * Language for this chat turn — detects from the message among Profile language 1 + 2.
 * Text chat / WhatsApp / Telegram / email use script detection only.
 * Talk to Dhira (voice) adds explicit language-switch phrase detection.
 */
export function languageForTurn(params: {
  channel: ChatChannel;
  userMessage: string;
  profileLanguage: Language;
  profileLanguage2?: Language | null;
  detectedLanguageHint?: Language | null;
}): Language {
  const candidates: Language[] = [params.profileLanguage];
  if (params.profileLanguage2 && params.profileLanguage2 !== params.profileLanguage) {
    candidates.push(params.profileLanguage2);
  }

  if (params.channel === 'voice') {
    const explicit = detectExplicitLanguageSwitchRequest(params.userMessage, candidates);
    if (explicit) return explicit;
  }

  return detectLanguageFromMessage(params.userMessage, candidates, params.profileLanguage, {
    channel: params.channel,
    detectedLanguageHint: params.detectedLanguageHint,
  });
}
