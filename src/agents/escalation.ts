import { anthropicJSON, isLiveBrainEnabled } from '@/lib/anthropic';
import { localEscalation } from '@/lib/localBrain';
import { isCrisis, scanCombinedForCrisis, isNotSafeAfterCheckIn, isHighDistress } from '@/lib/guardrails';
import {
  normalizeEscalationResult,
  sanityCheckEscalation,
} from '@/lib/riskSanity';
import type { EscalationResult } from '@/lib/types';

/** Escalation Agent — calibrated risk scan (default LOW). */
const ESCALATION_SYSTEM = `You scan the user's message AND conversation CONTEXT for risk. You NEVER talk to the user. Return only JSON.

DEFAULT IS LOW. The overwhelming majority of messages are LOW risk.
Greetings ("hi", "hey", "hello", "kya haal"), small talk, daily venting about work/college/family, tiredness, boredom, ordinary sadness — ALL LOW. Short, Hinglish, or emotionally flat is NOT a risk signal by itself.

Raise ONLY with a positive signal:
- MEDIUM: sustained distress, NO danger — burnout, grief, crying, "I feel so alone lately". escalate false.
- HIGH: indirect danger or worsening trajectory without explicit intent — burden language, hopeless finality, withdrawal after heavy sharing, sudden calm after despair, past attempt mentioned. escalate false.
- CRISIS: explicit intent/plan/method, goodbye messages, or user confirming not safe after check-in. escalate true ONLY here.

HARD RULES
- Never CRISIS or HIGH for greetings or messages with no distress content. If you cannot name the signal, LOW.
- "Err toward caution" means when torn between adjacent levels WITH a real signal, pick higher — NOT raise when there is no signal.
- escalate must be true ONLY when risk_level is CRISIS.

Return JSON (placeholders — compute real values):
{
  "risk_level": "<LOW or MEDIUM or HIGH or CRISIS>",
  "escalate": <true only if CRISIS, else false>,
  "signal": "<specific phrase/pattern or none>"
}

CALIBRATION (follow exactly)
"hey" -> LOW, escalate false, signal "none"
"aaj office mein mann nahi laga yaar" -> LOW, escalate false
"I've been crying a lot this week" -> MEDIUM, escalate false
"honestly they'd be better off without me" -> HIGH or CRISIS
"I don't want to wake up tomorrow" -> CRISIS, escalate true
"kill me lol, this meeting never ends" (light context) -> LOW, escalate false`;

export interface EscalationInput {
  userMessage: string;
  context: string;
}

function finalizeEscalation(
  userMessage: string,
  context: string,
  result: EscalationResult,
): EscalationResult {
  let out = normalizeEscalationResult(result);
  if (isCrisis(userMessage) && out.risk_level !== 'CRISIS') {
    out = { risk_level: 'CRISIS', escalate: true, signal: 'crisis phrase detected (guardrail override)' };
  }
  return sanityCheckEscalation(userMessage, context, out);
}

/** Classify risk using latest message + conversation context. */
export async function checkRisk(input: EscalationInput | string): Promise<EscalationResult> {
  const params: EscalationInput =
    typeof input === 'string' ? { userMessage: input, context: '' } : input;

  const combined = scanCombinedForCrisis(params.userMessage, params.context);
  if (combined.crisis) {
    return finalizeEscalation(params.userMessage, params.context, {
      risk_level: 'CRISIS',
      escalate: true,
      signal: combined.signal,
    });
  }
  if (isNotSafeAfterCheckIn(params.userMessage, params.context)) {
    return finalizeEscalation(params.userMessage, params.context, {
      risk_level: 'CRISIS',
      escalate: true,
      signal: 'user not safe after check-in',
    });
  }
  if (isHighDistress(params.userMessage, params.context)) {
    return finalizeEscalation(params.userMessage, params.context, {
      risk_level: 'HIGH',
      escalate: false,
      signal: 'indirect or trajectory distress',
    });
  }

  if (!isLiveBrainEnabled()) {
    return finalizeEscalation(params.userMessage, params.context, localEscalation(params));
  }

  const userContent = `USER MESSAGE:\n${params.userMessage}\n\nCONTEXT:\n${params.context || '(none)'}`;

  try {
    const result = await anthropicJSON<EscalationResult>({
      agent: 'escalationAgent',
      system: ESCALATION_SYSTEM,
      userContent,
      maxTokens: 150,
    });
    return finalizeEscalation(params.userMessage, params.context, result);
  } catch {
    return finalizeEscalation(params.userMessage, params.context, localEscalation(params));
  }
}

export { normalizeEscalationResult };
