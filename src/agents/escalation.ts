import { anthropicJSON, isLiveBrainEnabled } from '@/lib/anthropic';
import { ESCALATION_LIVE_SYSTEM } from '@/agents/prompts/agentPromptsLive';
import { assessContextualRisk } from '@/lib/contextualRiskOffline';
import { isNotSafeAfterCheckIn, scanCombinedForCrisis, isCrisis, isHighDistress } from '@/lib/guardrails';
import {
  normalizeEscalationResult,
  sanityCheckEscalation,
} from '@/lib/riskSanity';
import type { EscalationResult } from '@/lib/types';

export interface EscalationInput {
  userMessage: string;
  context: string;
  userPatternProfile?: string | null;
  recentRiskSummary?: string | null;
  riskHistory72h?: string | null;
  contextUnavailable?: boolean;
}

function useLegacyUserCrisisRegex(): boolean {
  return process.env.DHIRA_LEGACY_USER_CRISIS_REGEX === '1';
}

function legacyEscalation(params: EscalationInput): EscalationResult {
  const combined = scanCombinedForCrisis(params.userMessage, params.context);
  if (combined.crisis) {
    return {
      risk_level: 'CRISIS',
      escalate: true,
      signal: combined.signal,
      classification: 'genuine_risk_self',
    };
  }
  if (isNotSafeAfterCheckIn(params.userMessage, params.context)) {
    return {
      risk_level: 'CRISIS',
      escalate: true,
      signal: 'user not safe after check-in',
      classification: 'genuine_risk_self',
    };
  }
  if (isHighDistress(params.userMessage, params.context)) {
    return {
      risk_level: 'HIGH',
      escalate: false,
      signal: 'indirect or trajectory distress',
      classification: 'distress',
    };
  }
  if (isCrisis(params.userMessage)) {
    return {
      risk_level: 'CRISIS',
      escalate: true,
      signal: 'explicit crisis language',
      classification: 'genuine_risk_self',
    };
  }
  return assessContextualRisk(params);
}

function finalizeEscalation(
  userMessage: string,
  context: string,
  result: EscalationResult,
): EscalationResult {
  let out = normalizeEscalationResult(result);
  if (
    useLegacyUserCrisisRegex() &&
    isCrisis(userMessage) &&
    out.risk_level !== 'CRISIS' &&
    out.classification !== 'figure_of_speech' &&
    out.classification !== 'media_or_hypothetical' &&
    out.classification !== 'humour'
  ) {
    out = {
      risk_level: 'CRISIS',
      escalate: true,
      signal: 'crisis phrase detected (legacy guardrail override)',
      classification: 'genuine_risk_self',
    };
  }
  return sanityCheckEscalation(userMessage, context, out);
}

/** Classify risk using latest message + conversation context (v3 contextual). */
export async function checkRisk(input: EscalationInput | string): Promise<EscalationResult> {
  const params: EscalationInput =
    typeof input === 'string' ? { userMessage: input, context: '' } : input;

  if (isNotSafeAfterCheckIn(params.userMessage, params.context)) {
    return finalizeEscalation(params.userMessage, params.context, {
      risk_level: 'CRISIS',
      escalate: true,
      signal: 'user not safe after check-in',
      classification: 'genuine_risk_self',
    });
  }

  if (useLegacyUserCrisisRegex()) {
    return finalizeEscalation(params.userMessage, params.context, legacyEscalation(params));
  }

  if (!isLiveBrainEnabled()) {
    return finalizeEscalation(params.userMessage, params.context, assessContextualRisk(params));
  }

  const parts = [
    `USER MESSAGE:\n${params.userMessage}`,
    `CONTEXT:\n${params.context || '(none)'}`,
  ];
  if (params.userPatternProfile?.trim()) {
    parts.push(`USER PATTERN PROFILE:\n${params.userPatternProfile.trim()}`);
  }
  if (params.recentRiskSummary?.trim()) {
    parts.push(`RECENT RISK SUMMARY:\n${params.recentRiskSummary.trim()}`);
  }
  if (params.riskHistory72h?.trim()) {
    parts.push(params.riskHistory72h.trim());
  }
  if (params.contextUnavailable) {
    parts.push('context_unavailable: true');
  }

  try {
    const result = await anthropicJSON<EscalationResult>({
      agent: 'escalationAgent',
      system: ESCALATION_LIVE_SYSTEM,
      userContent: parts.join('\n\n'),
      maxTokens: 220,
    });
    return finalizeEscalation(params.userMessage, params.context, result);
  } catch {
    return finalizeEscalation(params.userMessage, params.context, assessContextualRisk(params));
  }
}

export { normalizeEscalationResult };
