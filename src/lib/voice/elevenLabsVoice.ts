import { languageDisplayName, usesHindiMix, type Language } from '@/lib/languages';

/** ElevenLabs ConvAI agent language codes (subset used by Dhira Profile languages). */
export type ElevenLabsAgentLanguage =
  | 'en'
  | 'hi'
  | 'te'
  | 'ta'
  | 'mr'
  | 'ml'
  | 'bn'
  | 'gu'
  | 'as'
  | 'kn'
  | 'pa';

const DHIRA_TO_ELEVENLABS: Record<Language, ElevenLabsAgentLanguage> = {
  english: 'en',
  hinglish: 'hi',
  hindi: 'hi',
  telugu: 'te',
  tamil: 'ta',
  marathi: 'mr',
  malayalam: 'ml',
  odia: 'bn',
  bengali: 'bn',
  gujarati: 'gu',
  assamese: 'as',
  kannada: 'kn',
  punjabi: 'pa',
};

export function mapDhiraLanguageToElevenLabs(lang: Language): ElevenLabsAgentLanguage {
  return DHIRA_TO_ELEVENLABS[lang] ?? 'en';
}

/** Map ElevenLabs agent language code → Dhira Profile language when it matches candidates. */
export function dhiraLanguageFromElevenLabsCode(
  code: string,
  candidates: Language[],
): Language | null {
  const key = code.trim().toLowerCase().slice(0, 2);
  const preference: Partial<Record<string, Language[]>> = {
    en: ['english'],
    te: ['telugu'],
    ta: ['tamil'],
    mr: ['marathi'],
    ml: ['malayalam'],
    bn: ['bengali', 'odia'],
    gu: ['gujarati'],
    as: ['assamese'],
    kn: ['kannada'],
    pa: ['punjabi'],
    hi: ['hinglish', 'hindi', 'marathi'],
  };
  const options = preference[key];
  if (!options) return null;
  for (const lang of candidates) {
    if (options.includes(lang)) return lang;
  }
  return null;
}

/**
 * ElevenLabs session language override — always Language 1.
 * Both fields must be sent together (language + firstMessage); partial overrides disconnect the call.
 * Multilingual listening for Language 2 relies on ElevenLabs agent language detection (dashboard).
 */
export function resolveElevenLabsSessionLanguageOverride(primary: Language): ElevenLabsAgentLanguage {
  return mapDhiraLanguageToElevenLabs(primary);
}

/** Warm opener when a voice call connects — uses Profile alias + primary language. */
export function buildVoiceFirstMessage(alias: string | undefined, primary: Language): string {
  const name = alias?.trim() || 'Friend';
  if (primary === 'english') {
    return `Hey ${name} — I'm here. What's on your mind right now?`;
  }
  if (usesHindiMix(primary)) {
    return `Hey ${name} — main yahin hoon. Mann mein kya chal raha hai?`;
  }
  return `Hey ${name} — I'm here with you. What's sitting with you right now?`;
}

/** Voice-only multilingual instruction (Talk to Dhira). Not used for text chat. */
export function voiceMultilingualInstruction(
  primary: Language,
  secondary: Language | null | undefined,
): string {
  const main = languageDisplayName(primary);
  if (!secondary || secondary === primary) {
    return `Speak in ${main} unless the user clearly uses another language in this turn.`;
  }
  const second = languageDisplayName(secondary);
  return `The user chose ${main} and ${second} on their Profile (Talk to Dhira voice). These are their only two languages — not Hindi/Hinglish unless listed. Match each spoken turn: reply fully in ${second} (native script) when they speak ${second} (including romanized ${second} if STT did not use native script), and in ${main} when they speak ${main}. Never say you cannot understand their chosen languages.`;
}

export const VOICE_DELIVERY_INSTRUCTION = `VOICE STYLE (Talk to Dhira — mandatory):
- Do NOT repeat or paraphrase the user's last sentence back to them (no "So you're saying…", no echoing their words).
- Use a brief fresh acknowledgment, then ONE gentle question that moves the conversation forward.
- Do not quote more than three words from what they just said.
- On simple greetings (hi, hello, namaste): give a warm welcome and invite them to share — do not only echo the greeting.`;
