import type { AgentName } from '@/config/models';
import type { ChatChannel } from '@/lib/types';
import { LIVE_PROMPT_VERSION } from '@/agents/prompts/agentPromptsLive';

export type BrainUsed = 'live' | 'offline' | 'holding';

interface BrainCallContext {
  channel?: ChatChannel;
}

let callContext: BrainCallContext = {};

const state = {
  fallbackCount: 0,
  /** Increments only when the Primary Agent fails — used for fail-closed holding replies. */
  criticalFailureCount: 0,
  lastBrainError: null as string | null,
  lastFallbackAt: null as string | null,
  lastBrainUsed: null as BrainUsed | null,
  lastTurnMeta: null as {
    channel: ChatChannel;
    riskLevel: string;
    moodLabel?: string;
    moodTagSource?: string;
    brainUsed: BrainUsed;
    promptVersion: string;
  } | null,
};

export function setBrainCallContext(ctx: BrainCallContext): void {
  callContext = ctx;
}

export function getBrainCallContext(): BrainCallContext {
  return callContext;
}

export function recordLiveBrainFallback(params: {
  reason: string;
  status?: number | string;
  model?: string;
  agent: AgentName;
  channel?: ChatChannel;
  detail?: string;
  /** When true, a recovered reply is still blocked (Primary Agent only). Default false. */
  critical?: boolean;
}): void {
  state.fallbackCount += 1;
  if (params.critical) {
    state.criticalFailureCount += 1;
  }
  state.lastFallbackAt = new Date().toISOString();
  state.lastBrainError = [params.reason, params.detail, params.status].filter(Boolean).join(' | ');
  console.error('LIVE_BRAIN_FALLBACK', {
    ...params,
    channel: params.channel ?? callContext.channel ?? 'app',
  });
}

export function recordBrainUsed(params: {
  brainUsed: BrainUsed;
  channel: ChatChannel;
  riskLevel: string;
  moodLabel?: string;
  moodTagSource?: string;
  promptVersion?: string;
}): void {
  const promptVersion = params.promptVersion ?? LIVE_PROMPT_VERSION;
  state.lastBrainUsed = params.brainUsed;
  state.lastTurnMeta = { ...params, promptVersion };
  const line = `BRAIN_USED: ${params.brainUsed} | ${params.channel} | ${params.riskLevel} | ${params.moodLabel ?? 'untagged'} | ${params.moodTagSource ?? 'n/a'} | ${promptVersion}`;
  if (process.env.NODE_ENV === 'development' || process.env.DHIRA_LOG_BRAIN === '1') {
    console.info(line);
  }
}

export function getLiveBrainTelemetry() {
  return {
    fallbackCount: state.fallbackCount,
    criticalFailureCount: state.criticalFailureCount,
    lastBrainError: state.lastBrainError,
    lastFallbackAt: state.lastFallbackAt,
    lastBrainUsed: state.lastBrainUsed,
    lastTurnMeta: state.lastTurnMeta,
  };
}

export function resetLiveBrainTelemetryForTests(): void {
  state.fallbackCount = 0;
  state.criticalFailureCount = 0;
  state.lastBrainError = null;
  state.lastFallbackAt = null;
  state.lastBrainUsed = null;
  state.lastTurnMeta = null;
}
