import Anthropic from '@anthropic-ai/sdk';
import {
  getBrainApiKey,
  getBrainBaseURL,
  getModelFor,
  getOpenRouterProviderPrefs,
  getTemperatureFor,
  isLiveBrainEnabled,
  isOpenRouterConfigured,
  type AgentName,
} from '@/config/models';
import { getBrainCallContext, recordLiveBrainFallback } from '@/lib/liveBrainTelemetry';

export { isLiveBrainEnabled, isOpenRouterConfigured };

let anthropic: Anthropic | null = null;
let cachedKey: string | null = null;

function client(): Anthropic {
  const apiKey = getBrainApiKey();
  if (!apiKey) {
    throw new Error('No live brain API key configured (OPENROUTER_API_KEY or ANTHROPIC_API_KEY)');
  }
  if (anthropic && cachedKey !== apiKey) {
    anthropic = null;
  }
  if (!anthropic) {
    cachedKey = apiKey;
    const baseURL = getBrainBaseURL();
    anthropic = new Anthropic({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
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

export function resetAnthropicClientForTests(): void {
  anthropic = null;
  cachedKey = null;
}

export interface ClaudeTurn {
  role: 'user' | 'assistant';
  content: string;
}

function apiErrorMeta(err: unknown): { status?: number; message: string } {
  if (err && typeof err === 'object' && 'status' in err) {
    const status = (err as { status?: number }).status;
    const message = err instanceof Error ? err.message : String(err);
    return { status, message };
  }
  return { status: undefined, message: err instanceof Error ? err.message : String(err) };
}

function isOpenRouterPolicyBlock(err: unknown): boolean {
  const meta = apiErrorMeta(err);
  if (meta.status === 404) return true;
  return /guardrail|data policy|not_found_error|no endpoints available/i.test(meta.message);
}

function openRouterExtras(): Record<string, unknown> {
  const provider = getOpenRouterProviderPrefs();
  return provider ? { provider } : {};
}

/** Ask the live brain for a plain-text reply. */
export async function anthropicText(params: {
  agent: AgentName;
  system: string;
  messages: ClaudeTurn[];
  maxTokens?: number;
}): Promise<string> {
  const model = getModelFor(params.agent);
  const ctx = getBrainCallContext();
  const baseBody = {
    model,
    max_tokens: params.maxTokens ?? 400,
    temperature: getTemperatureFor(params.agent),
    system: params.system,
    messages: params.messages,
    ...openRouterExtras(),
  };

  try {
    const res = await client().messages.create(
      baseBody as Anthropic.MessageCreateParamsNonStreaming,
    );
    return res.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();
  } catch (err) {
    const meta = apiErrorMeta(err);
    recordLiveBrainFallback({
      agent: params.agent,
      model,
      reason: 'anthropicText failed',
      status: meta.status,
      detail: meta.message,
      channel: ctx.channel,
    });

    // Retry with ZDR routing when OpenRouter blocks on privacy/guardrail policy.
    if (isOpenRouterConfigured() && isOpenRouterPolicyBlock(err) && !openRouterExtras().provider) {
      try {
        const res = await client().messages.create({
          ...baseBody,
          provider: { zdr: true, allow_fallbacks: true, data_collection: 'allow' },
        } as Anthropic.MessageCreateParamsNonStreaming);
        return res.content
          .filter((b): b is Anthropic.TextBlock => b.type === 'text')
          .map((b) => b.text)
          .join('')
          .trim();
      } catch (retryErr) {
        const retryMeta = apiErrorMeta(retryErr);
        recordLiveBrainFallback({
          agent: params.agent,
          model,
          reason: 'anthropicText ZDR retry failed',
          status: retryMeta.status,
          detail: retryMeta.message,
          channel: ctx.channel,
        });
        throw retryErr;
      }
    }

    throw err;
  }
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
  try {
    return parseJsonLoose<T>(raw);
  } catch (err) {
    recordLiveBrainFallback({
      agent: params.agent,
      model: getModelFor(params.agent),
      reason: 'JSON parse failed',
      detail: err instanceof Error ? err.message : String(err),
      channel: getBrainCallContext().channel,
    });
    throw err;
  }
}

/** Pulls the first {...} JSON object out of a model response, tolerating fences. */
export function parseJsonLoose<T>(raw: string): T {
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  const slice = start !== -1 && end !== -1 ? cleaned.slice(start, end + 1) : cleaned;
  return JSON.parse(slice) as T;
}
