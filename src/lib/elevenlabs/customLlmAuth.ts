import type { NextRequest } from 'next/server';

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
