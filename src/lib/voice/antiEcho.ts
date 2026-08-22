import type { Language } from '@/lib/types';

function normalizeForEchoCompare(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Detect when Dhira's draft mostly mirrors the user's spoken line (common in voice "reflect" mode).
 * Voice-only guard — not applied to text chat.
 */
export function draftEchoesUserMessage(userMessage: string, draft: string): boolean {
  const u = normalizeForEchoCompare(userMessage);
  const d = normalizeForEchoCompare(draft);
  if (!u || !d || u.length < 10) return false;

  if (d.includes(u)) return true;

  const uWords = u.split(' ').filter((w) => w.length > 2);
  if (uWords.length < 4) return false;

  for (let i = 0; i <= uWords.length - 4; i += 1) {
    const phrase = uWords.slice(i, i + 4).join(' ');
    if (d.includes(phrase)) return true;
  }

  return false;
}

export function voiceAntiEchoFallback(language: Language): string {
  if (language === 'english') {
    return "I'm here with you. What part of this feels heaviest right now?";
  }
  if (language === 'hinglish' || language === 'hindi') {
    return 'Main sun rahi hoon. Abhi sabse zyada kya chipka hua lag raha hai?';
  }
  return "I'm here with you. What's weighing on you most right now?";
}
