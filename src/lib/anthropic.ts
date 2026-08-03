import Anthropic from '@anthropic-ai/sdk';
import {
  getBrainApiKey,
  getBrainBaseURL,
  getModelFor,
  isLiveBrainEnabled,
  isOpenRouterConfigured,
  type AgentName,
} from '@/config/models';

export { isLiveBrainEnabled, isOpenRouterConfigured };

/**
 * Low-level helpers for talking to Dhira's live brain.
 * Prefer OpenRouter (`OPENROUTER_API_KEY`) as the central host; fall back to a
 * direct Anthropic key. Everything funnels through here so model choice, key
 * handling, and JSON parsing live in one place.
 * These throw if no key is set — callers (the agents) fall back to the local
 * offline brain in that case.
 */

let anthropic: Anthropic | null = null;
function client(): Anthropic {
  if (!anthropic) {
    const apiKey = getBrainApiKey();
    if (!apiKey) {
      throw new Error('No live brain API key configured (OPENROUTER_API_KEY or ANTHROPIC_API_KEY)');
    }
    const baseURL = getBrainBaseURL();
    anthropic = new Anthropic({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
      // OpenRouter recommends identifying the app; harmless for Anthropic direct.
      defaultHeaders: isOpenRouterConfigured()
        ? {
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4028',
            'X-Title': 'Dhira',
          }
        : undefined,
    });
  }
  return anthropic;
}

export interface ClaudeTurn {
  role: 'user' | 'assistant';
  content: string;
}

/** Ask the live brain for a plain-text reply. */
export async function anthropicText(params: {
  agent: AgentName;
  system: string;
  messages: ClaudeTurn[];
  maxTokens?: number;
}): Promise<string> {
  const res = await client().messages.create({
    model: getModelFor(params.agent),
    max_tokens: params.maxTokens ?? 400,
    system: params.system,
    messages: params.messages,
  });
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
}

/** Ask the live brain for a JSON object and parse it defensively. */
export async function anthropicJSON<T>(params: {
  agent: AgentName;
  system: string;
  userContent: string;
  maxTokens?: number;
}): Promise<T> {
  const raw = await anthropicText({
    agent: params.agent,
    system: params.system,
    messages: [{ role: 'user', content: params.userContent }],
    maxTokens: params.maxTokens ?? 400,
  });
  return parseJsonLoose<T>(raw);
}

/** Pulls the first {...} JSON object out of a model response, tolerating fences. */
export function parseJsonLoose<T>(raw: string): T {
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  const slice = start !== -1 && end !== -1 ? cleaned.slice(start, end + 1) : cleaned;
  return JSON.parse(slice) as T;
}
