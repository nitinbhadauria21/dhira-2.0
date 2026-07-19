import { anthropicJSON, isLiveBrainEnabled } from '@/lib/anthropic';
import { localEscalation } from '@/lib/localBrain';
import { isCrisis } from '@/lib/guardrails';
import type { EscalationResult } from '@/lib/types';

/** Escalation Agent (Agent Prompts spec §6.3). The safety tripwire. */
const ESCALATION_SYSTEM = `You scan the user's message for high-risk signals. You NEVER talk to the user. Return only JSON. Err toward caution.

Detect: self-harm, suicidal intent, intent to harm others, abuse, or immediate danger.

Return exactly:
{
  "risk_level": "LOW | MEDIUM | HIGH | CRISIS",
  "escalate": true,
  "signal": "brief reason"
}
Do not include anything outside the JSON.`;

/** Classify risk in a user message. */
export async function checkRisk(userMessage: string): Promise<EscalationResult> {
  if (!isLiveBrainEnabled()) {
    return localEscalation(userMessage);
  }

  try {
    const result = await anthropicJSON<EscalationResult>({
      agent: 'escalationAgent',
      system: ESCALATION_SYSTEM,
      userContent: userMessage,
      maxTokens: 150,
    });
    // Safety net: never let a live miss slip a clear crisis phrase through.
    if (isCrisis(userMessage) && result.risk_level !== 'CRISIS') {
      return { risk_level: 'CRISIS', escalate: true, signal: 'crisis phrase detected (guardrail override)' };
    }
    return result;
  } catch {
    return localEscalation(userMessage);
  }
}
