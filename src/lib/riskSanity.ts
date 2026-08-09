import { isNotSafeAfterCheckIn } from '@/lib/guardrails';
import { CRISIS_MESSAGE } from '@/lib/safetyCopy';
import type { EscalationResult, MonitorResult, RiskLevel } from '@/lib/types';

const RISK_VOCAB =
  /(?:die|kill|suicide|harm|khatam|marna|end it|bojh|disappear|wake up|14416|Tele-MANAS|better off without|mar ja)/i;

const GREETING =
  /^(?:hey|hi|hello|hii|yo|sup|kya haal|kaise ho|namaste|good morning|good evening)[!.?\s]*$/i;

export { GREETING };
export function isTrivialLowRiskMessage(userMessage: string): boolean {
  const t = userMessage.trim();
  if (t.length > 20) return false;
  if (RISK_VOCAB.test(t)) return false;
  return true;
}

export function contextHasElevatedRisk(context: string): boolean {
  if (!context?.trim() || context === '(no prior conversation)') return false;
  if (RISK_VOCAB.test(context) || /\b(?:CRISIS|HIGH)\b/.test(context)) return true;
  // Ongoing safety check-in arc (e.g. user answers "no. not really." after we asked if they feel safe).
  if (/\b(?:safe right now|feeling safe)\b/i.test(context)) return true;
  return false;
}

/** Downgrade model CRISIS/HIGH on trivial greetings when no prior risk in context. */
export function sanityCheckEscalation(
  userMessage: string,
  context: string,
  verdict: EscalationResult,
): EscalationResult {
  if (isNotSafeAfterCheckIn(userMessage, context)) {
    return normalizeEscalationResult({
      risk_level: 'CRISIS',
      escalate: true,
      signal: verdict.signal || 'user not safe after check-in',
    });
  }
  if (
    (verdict.risk_level === 'CRISIS' || verdict.risk_level === 'HIGH') &&
    isTrivialLowRiskMessage(userMessage) &&
    !contextHasElevatedRisk(context)
  ) {
    console.warn('[riskSanity] downgraded over-trigger', {
      userMessage: userMessage.slice(0, 40),
      from: verdict.risk_level,
    });
    return {
      risk_level: 'LOW',
      escalate: false,
      signal: 'sanity_check_downgrade',
    };
  }
  return verdict;
}

/** Force escalate flag to match risk_level (fixes JSON template copy bug). */
export function normalizeEscalationResult(result: EscalationResult): EscalationResult {
  const level = result.risk_level ?? 'LOW';
  const valid: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRISIS'];
  const risk_level = valid.includes(level as RiskLevel) ? (level as RiskLevel) : 'LOW';
  return {
    risk_level,
    escalate: risk_level === 'CRISIS',
    signal: result.signal?.trim() || 'none',
  };
}

export function shouldUseEarlyCrisisHandoff(risk: EscalationResult): boolean {
  const normalized = normalizeEscalationResult(risk);
  return normalized.risk_level === 'CRISIS' && normalized.escalate;
}

export function sanityCheckMonitor(
  userMessage: string,
  context: string,
  verdict: MonitorResult,
): MonitorResult {
  if (isNotSafeAfterCheckIn(userMessage, context)) {
    return {
      decision: 'BLOCK_AND_REPLACE',
      risk_level: 'CRISIS',
      issues_found: ['user not safe after check-in'],
      approved_or_rewritten_response: CRISIS_MESSAGE,
    };
  }
  if (
    verdict.risk_level === 'CRISIS' &&
    verdict.decision === 'BLOCK_AND_REPLACE' &&
    isTrivialLowRiskMessage(userMessage) &&
    !contextHasElevatedRisk(context)
  ) {
    console.warn('[riskSanity] monitor crisis downgraded on trivial message');
    return {
      decision: 'APPROVED',
      risk_level: 'LOW',
      issues_found: ['sanity_check_downgrade'],
      approved_or_rewritten_response: verdict.approved_or_rewritten_response.includes('14416')
        ? "Hey — I'm here. What's on your mind today?"
        : verdict.approved_or_rewritten_response,
    };
  }
  return verdict;
}

export function debugRiskLog(payload: Record<string, unknown>): void {
  if (process.env.DHIRA_DEBUG_RISK === '1') {
    console.info('DHIRA_DEBUG', payload);
  }
}
