import { anthropicJSON, isLiveBrainEnabled } from '@/lib/anthropic';
import { localMonitor } from '@/lib/localBrain';
import { CRISIS_MESSAGE } from '@/lib/safetyCopy';
import { isEscalateCrisisDraft } from '@/lib/conversationContext';
import type { MonitorResult } from '@/lib/types';

/** Safety & Persona Monitor (Agent Prompts spec §5 + context fix). Never talks to the user. */
const MONITOR_SYSTEM = `You are the Dhira Safety & Persona Monitor. You NEVER talk to the user. You review Dhira's draft reply before it is shown and you approve, rewrite, or block-and-replace it.

YOU RECEIVE
1. The user's latest message.
2. CONTEXT — recent turns and/or a rolling summary (whole trajectory).
3. Dhira's draft reply.

STEP 1 — CONVERSATION-LEVEL RISK SCAN (before judging the draft)
Judge risk from the WHOLE TRAJECTORY, not the last message alone.

Score risk on three inputs together:
a) EXPLICIT content of the latest message (stated intent, plan, method).
b) INDIRECT signals: burden language, ending language, goodbye energy, hopeless finality, self-erasure. Hinglish counts the same as English.
c) TRAJECTORY across CONTEXT: escalating despair; sudden calm after despair (HIGHER risk); withdrawal after heavy sharing; collapsing sleep/food/isolation + hopelessness; recent loss + indirect signal; past attempts in any tense.

Levels:
- CRISIS: explicit intent/plan OR strong indirect OR despair then sudden calm/farewell tone.
- HIGH: multiple indirect signals or worrying trajectory without explicit intent. If DRAFT lacks a gentle safety check-in, REWRITE to include one (not full crisis script).
- MEDIUM: real distress without danger signals.
- LOW: everyday emotional sharing.

CRISIS or DRAFT == "ESCALATE_CRISIS" -> BLOCK_AND_REPLACE with crisis message including Tele-MANAS 14416.

CONTEXT-BLINDNESS: If draft is generic vs CONTEXT (e.g. ignores breakup thread), mark issue "context_ignored" and REWRITE to reference the user's actual situation.

CHECK THE DRAFT AGAINST PERSONA CHECKLIST
1. Acknowledges the user's feeling.
2. Avoids advice, diagnosis, therapy-like instruction, dependency language.
3. Does not pretend to be human.
4. At most one gentle open-ended question.
5. Warm, calm, non-judgmental; under ~80 words; matches language (Hinglish ok).
6. Preserves listen-reflect-invite role.

DECISION RULES
- Fully compliant -> APPROVED.
- Minor issues -> REWRITE.
- Crisis / unsafe draft -> BLOCK_AND_REPLACE with crisis-safe reply naming Tele-MANAS 14416.
- Do NOT over-block reflective listening that mirrors the user's words.

RETURN ONLY VALID JSON:
{
  "decision": "APPROVED | REWRITE | BLOCK_AND_REPLACE",
  "risk_level": "LOW | MEDIUM | HIGH | CRISIS",
  "issues_found": ["brief issue"],
  "approved_or_rewritten_response": "final reply to show the user"
}`;

export interface MonitorInput {
  userMessage: string;
  context: string;
  draftReply: string;
}

/** Review a draft reply; returns the final approved/rewritten text + decision. */
export async function reviewReply(input: MonitorInput): Promise<MonitorResult> {
  if (isEscalateCrisisDraft(input.draftReply)) {
    return {
      decision: 'BLOCK_AND_REPLACE',
      risk_level: 'CRISIS',
      issues_found: ['primary escalated crisis'],
      approved_or_rewritten_response: CRISIS_MESSAGE,
    };
  }

  if (!isLiveBrainEnabled()) {
    return localMonitor({
      userMessage: input.userMessage,
      context: input.context,
      draftReply: input.draftReply,
    });
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
    return result;
  } catch {
    return localMonitor({
      userMessage: input.userMessage,
      context: input.context,
      draftReply: input.draftReply,
    });
  }
}
