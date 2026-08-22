import type { NextRequest } from 'next/server';
import { isLanguage, type Language } from '@/lib/languages';
import { dhiraLanguageFromElevenLabsCode } from '@/lib/voice/elevenLabsVoice';

export function isVoiceCustomLlmEnabled(): boolean {
  return process.env.DHIRA_VOICE_CUSTOM_LLM === 'true';
}

export function voiceCustomLlmSecret(): string | null {
  const secret = process.env.ELEVENLABS_CUSTOM_LLM_SECRET?.trim() ?? '';
  if (!secret || secret.includes('your-')) return null;
  return secret;
}

export function authorizeElevenLabsCustomLlm(req: NextRequest): boolean {
  const expected = voiceCustomLlmSecret();
  if (!expected) return false;

  const header = req.headers.get('authorization')?.trim() ?? '';
  if (!header.toLowerCase().startsWith('bearer ')) return false;
  const token = header.slice(7).trim();
  return token.length > 0 && token === expected;
}

export function extractDhiraUidFromExtraBody(extra: unknown): string | null {
  if (!extra || typeof extra !== 'object') return null;
  const row = extra as Record<string, unknown>;
  const uid = row.dhira_uid ?? row.user_id ?? row.userId;
  return typeof uid === 'string' && uid.trim() ? uid.trim() : null;
}

type ChatMessageInput = { role?: string; content?: string };

export function latestUserMessage(messages: unknown): string | null {
  if (!Array.isArray(messages)) return null;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const row = messages[i] as ChatMessageInput;
    if (row?.role !== 'user') continue;
    const content = typeof row.content === 'string' ? row.content.trim() : '';
    if (content) return content;
  }
  return null;
}

function readLanguageCode(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value && typeof value === 'object') {
    const row = value as Record<string, unknown>;
    for (const key of ['language', 'code', 'locale']) {
      const nested = row[key];
      if (typeof nested === 'string' && nested.trim()) return nested.trim();
    }
  }
  return null;
}

/** ElevenLabs may pass detected/output language in extra body on Custom LLM requests. */
export function extractVoiceLanguageHint(
  extra: unknown,
  profileLanguages: Language[],
): Language | null {
  if (!extra || typeof extra !== 'object') return null;
  const row = extra as Record<string, unknown>;
  const candidates: Language[] = [];
  for (const lang of profileLanguages) {
    if (isLanguage(lang) && !candidates.includes(lang)) candidates.push(lang);
  }
  if (!candidates.length) return null;

  for (const key of [
    'detected_language',
    'conversation_language',
    'output_language',
    'agent_language',
    'language',
  ]) {
    const code = readLanguageCode(row[key]);
    if (!code) continue;
    if (isLanguage(code) && candidates.includes(code)) return code;
    const mapped = dhiraLanguageFromElevenLabsCode(code, candidates);
    if (mapped) return mapped;
  }
  return null;
}
