import { anthropicJSON, isLiveBrainEnabled } from '@/lib/anthropic';
import { localEscalation } from '@/lib/localBrain';
import { isCrisis, scanCombinedForCrisis, isNotSafeAfterCheckIn, isHighDistress } from '@/lib/guardrails';
import type { EscalationResult } from '@/lib/types';

/** Escalation Agent (Agent Prompts spec §6.3 + trajectory). The safety tripwire. */
const ESCALATION_SYSTEM = `You scan the user's message AND conversation CONTEXT for high-risk signals. You NEVER talk to the user. Return only JSON. Err toward caution.

Detect: self-harm, suicidal intent, harm to others, abuse, immediate danger — including INDIRECT English and Hinglish (better off without me, sab khatam, don't want to wake up, goodbye energy, past attempts) and TRAJECTORY patterns (escalating despair, sudden calm after despair, withdrawal after heavy sharing).

Return exactly:
{
  "risk_level": "LOW | MEDIUM | HIGH | CRISIS",
  "escalate": true,
  "signal": "brief reason"
}
Set escalate true only for CRISIS. HIGH/MEDIUM/LOW use appropriate risk_level with escalate false unless CRISIS.
Do not include anything outside the JSON.`;

export interface EscalationInput {
  userMessage: string;
  context: string;
}

/** Classify risk using latest message + conversation context. */
export async function checkRisk(input: EscalationInput | string): Promise<EscalationResult> {
  const params: EscalationInput =
    typeof input === 'string' ? { userMessage: input, context: '' } : input;

  const combined = scanCombinedForCrisis(params.userMessage, params.context);
  if (combined.crisis) {
    return { risk_level: 'CRISIS', escalate: true, signal: combined.signal };
  }
  if (isNotSafeAfterCheckIn(params.userMessage, params.context)) {
    return { risk_level: 'CRISIS', escalate: true, signal: 'user not safe after check-in' };
  }
  if (isHighDistress(params.userMessage, params.context)) {
    return { risk_level: 'HIGH', escalate: false, signal: 'indirect or trajectory distress' };
  }

  if (!isLiveBrainEnabled()) {
    return localEscalation(params);
  }

  const userContent = `USER MESSAGE:\n${params.userMessage}\n\nCONTEXT:\n${params.context || '(none)'}`;

  try {
    const result = await anthropicJSON<EscalationResult>({
      agent: 'escalationAgent',
      system: ESCALATION_SYSTEM,
      userContent,
      maxTokens: 150,
    });
    if (isCrisis(params.userMessage) && result.risk_level !== 'CRISIS') {
      return { risk_level: 'CRISIS', escalate: true, signal: 'crisis phrase detected (guardrail override)' };
    }
    return result;
  } catch {
    return localEscalation(params);
  }
}
