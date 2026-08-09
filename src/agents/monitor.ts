import { anthropicJSON, isLiveBrainEnabled } from '@/lib/anthropic';
import { localMonitor } from '@/lib/localBrain';
import { isCrisis, isNotSafeAfterCheckIn, scanCombinedForCrisis } from '@/lib/guardrails';
import { CRISIS_MESSAGE, NEUTRAL_FAILSAFE } from '@/lib/safetyCopy';
import { isEscalateCrisisDraft } from '@/lib/conversationContext';
import { sanityCheckMonitor } from '@/lib/riskSanity';
import type { MonitorResult } from '@/lib/types';

/** Safety & Persona Monitor — calibrated default LOW. Never talks to the user. */
const MONITOR_SYSTEM = `You are the Dhira Safety & Persona Monitor. You NEVER talk to the user. You review Dhira's draft reply before it is shown and you approve, rewrite, or block-and-replace it.

YOU RECEIVE: USER MESSAGE, CONTEXT (trajectory), DHIRA DRAFT REPLY.

STEP 1 — RISK SCAN (calibrated)
DEFAULT IS LOW. Greetings ("hi", "hey", "hello", "kya haal"), small talk, ordinary venting, tiredness, boredom, everyday sadness — LOW. Short or Hinglish alone is NOT risk.

Raise ONLY with positive signals:
- MEDIUM: real sustained distress, no danger — burnout, grief, crying. Normal reply ok; referral card ok. Never BLOCK_AND_REPLACE with crisis script.
- HIGH: indirect danger or worsening trajectory without explicit intent — burden language, hopeless finality, withdrawal after heavy sharing, sudden calm after despair, past attempt. If DRAFT lacks gentle safety check-in, REWRITE to add one (not full crisis script).
- CRISIS: explicit intent/plan/method, goodbye energy, or user confirmed not safe after check-in. ONLY here: BLOCK_AND_REPLACE with crisis message naming Tele-MANAS 14416.

HARD RULES
- Never CRISIS/HIGH for greetings or no distress content. Cannot name signal -> LOW.
- Err toward caution only when a REAL signal exists between adjacent levels.
- DRAFT == "ESCALATE_CRISIS" -> BLOCK_AND_REPLACE with crisis message only if CRISIS criteria met; if message was trivial greeting, REWRITE to warm LOW reply instead.

CALIBRATION
"hey" -> LOW, APPROVED warm draft
"aaj office mein mann nahi laga" -> LOW
"I've been crying a lot this week" -> MEDIUM
"better off without me" -> HIGH or CRISIS per signal
"kill me lol" in light chat -> LOW

CONTEXT-BLINDNESS: generic draft vs CONTEXT -> issue "context_ignored" and REWRITE with thread reference.

PERSONA CHECKLIST: listen not advise, one question, warm, under ~80 words, Hinglish ok.

RETURN ONLY VALID JSON:
{
  "decision": "APPROVED | REWRITE | BLOCK_AND_REPLACE",
  "risk_level": "LOW | MEDIUM | HIGH | CRISIS",
  "issues_found": ["brief issue"],
  "approved_or_rewritten_response": "final reply to show the user"
}

Use BLOCK_AND_REPLACE with 14416 crisis text ONLY when risk_level is CRISIS.`;

export interface MonitorInput {
  userMessage: string;
  context: string;
  draftReply: string;
}

function failSafeMonitor(draftReply: string): MonitorResult {
  return {
    decision: 'REWRITE',
    risk_level: 'LOW',
    issues_found: ['monitor_fail_safe'],
    approved_or_rewritten_response: draftReply?.trim() || NEUTRAL_FAILSAFE,
  };
}

/** Review a draft reply; returns the final approved/rewritten text + decision. */
export async function reviewReply(input: MonitorInput): Promise<MonitorResult> {
  if (isEscalateCrisisDraft(input.draftReply)) {
    return sanityCheckMonitor(input.userMessage, input.context, {
      decision: 'BLOCK_AND_REPLACE',
      risk_level: 'CRISIS',
      issues_found: ['primary escalated crisis'],
      approved_or_rewritten_response: CRISIS_MESSAGE,
    });
  }

  const guardrailCrisis =
    scanCombinedForCrisis(input.userMessage, input.context).crisis ||
    isCrisis(input.userMessage) ||
    isNotSafeAfterCheckIn(input.userMessage, input.context);
  if (guardrailCrisis) {
    return sanityCheckMonitor(input.userMessage, input.context, {
      decision: 'BLOCK_AND_REPLACE',
      risk_level: 'CRISIS',
      issues_found: ['guardrail crisis — crisis hand-off'],
      approved_or_rewritten_response: CRISIS_MESSAGE,
    });
  }

  if (!isLiveBrainEnabled()) {
    return sanityCheckMonitor(
      input.userMessage,
      input.context,
      localMonitor({
        userMessage: input.userMessage,
        context: input.context,
        draftReply: input.draftReply,
      }),
    );
  }

  const userContent = `USER MESSAGE:\n${input.userMessage}\n\nCONTEXT:\n${input.context}\n\nDHIRA DRAFT REPLY:\n${input.draftReply}`;

  try {
    const result = await anthropicJSON<MonitorResult>({
      agent: 'safetyMonitor',
      system: MONITOR_SYSTEM,
      userContent,
      maxTokens: 400,
    });
    if (!result.approved_or_rewritten_response) {
      result.approved_or_rewritten_response = input.draftReply;
    }
    if (isEscalateCrisisDraft(result.approved_or_rewritten_response)) {
      result.decision = 'BLOCK_AND_REPLACE';
      result.risk_level = 'CRISIS';
      result.approved_or_rewritten_response = CRISIS_MESSAGE;
    }
    if (
      result.decision === 'BLOCK_AND_REPLACE' &&
      result.risk_level === 'CRISIS' &&
      !result.approved_or_rewritten_response.includes('14416')
    ) {
      result.approved_or_rewritten_response = CRISIS_MESSAGE;
    }
    if (result.decision === 'BLOCK_AND_REPLACE' && result.risk_level !== 'CRISIS') {
      result.decision = 'REWRITE';
    }
    return sanityCheckMonitor(input.userMessage, input.context, result);
  } catch {
    return failSafeMonitor(input.draftReply);
  }
}
