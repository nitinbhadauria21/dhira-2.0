import Anthropic from '@anthropic-ai/sdk';
import { getModelFor, isLiveBrainEnabled, type AgentName } from '@/config/models';

export { isLiveBrainEnabled };

/**
 * Low-level helpers for talking to Claude. Everything funnels through here so
 * model choice, key handling, and JSON parsing live in one place.
 * These throw if no key is set — callers (the agents) fall back to the local
 * offline brain in that case.
 */

let anthropic: Anthropic | null = null;
function client(): Anthropic {
  if (!anthropic) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY as string });
  }
  return anthropic;
}

export interface ClaudeTurn {
  role: 'user' | 'assistant';
  content: string;
}

/** Ask Claude for a plain-text reply. */
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

/** Ask Claude for a JSON object and parse it defensively. */
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
