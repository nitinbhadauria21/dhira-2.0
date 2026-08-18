/**
 * Which model each Dhira "agent" uses.
 *
 * Plain-English summary for non-developers:
 * - Dhira is made of six small helpers ("agents"). Each one has a job.
 * - The important, sensitive jobs (talking, safety, crisis) use the smarter,
 *   more careful model ("Voice & Safety" = Claude Sonnet).
 * - The simple background jobs (tagging a mood, writing a short memory note)
 *   use the cheaper, faster model ("Background" = Claude Haiku).
 *
 * Preferred brain host: OpenRouter (one key for all agents).
 * Fallback: direct Anthropic API key.
 */

export type AgentName =
  | 'primaryAgent'
  | 'safetyMonitor'
  | 'escalationAgent'
  | 'proactiveCheckin'
  | 'moodTagging'
  | 'memoryAgent';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api';
/** OpenRouter: SDK appends `/v1/messages` — do NOT set base to .../api/v1 (double /v1). */

/** Default models when OpenRouter account enforces ZDR (see docs/openrouter-guardrails-checklist.md). */
const OPENROUTER_VOICE_MODEL = 'openrouter/auto';
const OPENROUTER_BACKGROUND_MODEL = 'anthropic/claude-haiku-4.5';

function looksLikePlaceholder(value: string): boolean {
  const v = value.toLowerCase();
  return !v || v.includes('your-') || v.includes('changeme') || v.includes('dummy');
}

/** True when OPENROUTER_API_KEY looks like a real OpenRouter key. */
export function isOpenRouterConfigured(): boolean {
  const key = process.env.OPENROUTER_API_KEY?.trim() ?? '';
  if (looksLikePlaceholder(key)) return false;
  return key.startsWith('sk-or-');
}

/** Resolve the API key for the shared brain client (OpenRouter preferred). */
export function getBrainApiKey(): string | null {
  const openRouter = process.env.OPENROUTER_API_KEY?.trim() ?? '';
  if (!looksLikePlaceholder(openRouter) && openRouter.startsWith('sk-or-')) {
    return openRouter;
  }
  const anthropic = process.env.ANTHROPIC_API_KEY?.trim() ?? '';
  if (!looksLikePlaceholder(anthropic) && anthropic.startsWith('sk-')) {
    return anthropic;
  }
  return null;
}

/** Base URL for the Anthropic-compatible client (OpenRouter or default Anthropic). */
export function getBrainBaseURL(): string | undefined {
  if (isOpenRouterConfigured()) {
    return process.env.ANTHROPIC_BASE_URL?.trim() || OPENROUTER_BASE_URL;
  }
  const custom = process.env.ANTHROPIC_BASE_URL?.trim();
  return custom || undefined;
}

function voiceAndSafetyModel(): string {
  return (
    process.env.DHIRA_MODEL_SONNET?.trim() ||
    (isOpenRouterConfigured() ? OPENROUTER_VOICE_MODEL : 'claude-sonnet-4-5')
  );
}

function backgroundModel(): string {
  return (
    process.env.DHIRA_MODEL_HAIKU?.trim() ||
    (isOpenRouterConfigured() ? OPENROUTER_BACKGROUND_MODEL : 'claude-haiku-4-5')
  );
}

/** Default sampling temperature per agent (context-fix spec). */
export function getTemperatureFor(agent: AgentName): number {
  switch (agent) {
    case 'primaryAgent':
      return 0.7;
    case 'safetyMonitor':
    case 'escalationAgent':
      return 0.2;
    default:
      return 0.5;
  }
}

/** Returns the model id that a given agent should use. */
export function getModelFor(agent: AgentName): string {
  switch (agent) {
    case 'moodTagging':
    case 'memoryAgent':
      return backgroundModel();
    default:
      return voiceAndSafetyModel();
  }
}

/**
 * True when a REAL brain key is configured (OpenRouter or Anthropic).
 * Placeholder values in committed .env must not turn the live brain on.
 */
export function isLiveBrainEnabled(): boolean {
  return getBrainApiKey() !== null;
}

/** OpenRouter routing prefs — required when account/guardrail enforces Zero Data Retention. */
export function getOpenRouterProviderPrefs():
  | { zdr: boolean; allow_fallbacks: boolean; data_collection: 'allow' }
  | undefined {
  if (!isOpenRouterConfigured()) return undefined;
  if (process.env.DHIRA_OPENROUTER_ZDR === '0') return undefined;
  return { zdr: true, allow_fallbacks: true, data_collection: 'allow' };
}
