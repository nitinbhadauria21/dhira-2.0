import { anthropicJSON, isLiveBrainEnabled } from '@/lib/anthropic';
import { MONITOR_LIVE_SYSTEM } from '@/agents/prompts/agentPromptsLive';
import {
  assessContextualRisk,
  shouldBlockCrisisForClassification,
} from '@/lib/contextualRiskOffline';
import { containsAdviceOrDiagnosis, isNotSafeAfterCheckIn } from '@/lib/guardrails';
import { localMonitor } from '@/lib/localBrain';
import { CRISIS_MESSAGE, NEUTRAL_FAILSAFE } from '@/lib/safetyCopy';
import { isEscalateCrisisDraft } from '@/lib/conversationContext';
import { sanityCheckMonitor } from '@/lib/riskSanity';
import type { EscalationResult, MonitorResult } from '@/lib/types';

export interface MonitorInput {
  userMessage: string;
  context: string;
  draftReply: string;
  escalation?: EscalationResult;
  userPatternProfile?: string | null;
  recentSentReplies?: string | null;
  contextUnavailable?: boolean;
}

function failSafeMonitor(draftReply: string): MonitorResult {
  return {
    decision: 'REWRITE',
    risk_level: 'LOW',
    issues_found: ['monitor_fail_safe'],
    approved_or_rewritten_response: draftReply?.trim() || NEUTRAL_FAILSAFE,
  };
}

function offlineMonitor(input: MonitorInput): MonitorResult {
  const esc =
    input.escalation ??
    assessContextualRisk({
      userMessage: input.userMessage,
      context: input.context,
      userPatternProfile: input.userPatternProfile,
    });

  if (isEscalateCrisisDraft(input.draftReply)) {
    if (shouldBlockCrisisForClassification(esc.classification)) {
      return {
        decision: 'REWRITE',
        risk_level: 'LOW',
        issues_found: ['false_positive_primary_escalate', esc.classification ?? 'neutral'],
        approved_or_rewritten_response:
          "Hey — I'm here with you. What's been sitting with you today?",
      };
    }
    if (esc.risk_level === 'CRISIS' || isNotSafeAfterCheckIn(input.userMessage, input.context)) {
      return {
        decision: 'BLOCK_AND_REPLACE',
        risk_level: 'CRISIS',
        issues_found: ['primary escalated crisis'],
        approved_or_rewritten_response: CRISIS_MESSAGE,
      };
    }
  }

  if (input.draftReply.includes('14416') && shouldBlockCrisisForClassification(esc.classification)) {
    return {
      decision: 'REWRITE',
      risk_level: esc.risk_level === 'MEDIUM' ? 'MEDIUM' : 'LOW',
      issues_found: ['false_positive_crisis_script', esc.classification ?? 'neutral'],
      approved_or_rewritten_response:
        esc.classification === 'third_party_concern'
          ? "That sounds really frightening to hear about your friend. I'm here with you — and Tele-MANAS at 14416 is there for anyone who needs support, including someone you care about."
          : "That sounds like a lot to carry. I'm listening — what part of it is hitting hardest right now?",
    };
  }

  const base = localMonitor({
    userMessage: input.userMessage,
    context: input.context,
    draftReply: input.draftReply,
    escalation: esc,
  });
  return base;
}

/** Review a draft reply; returns the final approved/rewritten text + decision. */
export async function reviewReply(input: MonitorInput): Promise<MonitorResult> {
  const esc = input.escalation;

  if (isNotSafeAfterCheckIn(input.userMessage, input.context)) {
    return sanityCheckMonitor(input.userMessage, input.context, {
      decision: 'BLOCK_AND_REPLACE',
      risk_level: 'CRISIS',
      issues_found: ['user not safe after check-in'],
      approved_or_rewritten_response: CRISIS_MESSAGE,
    });
  }

  if (
    isEscalateCrisisDraft(input.draftReply) &&
    esc &&
    !shouldBlockCrisisForClassification(esc.classification) &&
    esc.risk_level === 'CRISIS'
  ) {
    return sanityCheckMonitor(input.userMessage, input.context, {
      decision: 'BLOCK_AND_REPLACE',
      risk_level: 'CRISIS',
      issues_found: ['primary escalated crisis'],
      approved_or_rewritten_response: CRISIS_MESSAGE,
    });
  }

  if (!isLiveBrainEnabled()) {
    return sanityCheckMonitor(input.userMessage, input.context, offlineMonitor(input));
  }

  const parts = [
    `USER MESSAGE:\n${input.userMessage}`,
    `CONTEXT:\n${input.context}`,
    esc
      ? `ESCALATION ASSESSMENT:\n${JSON.stringify(esc, null, 2)}`
      : 'ESCALATION ASSESSMENT: (not provided)',
  ];
  if (input.contextUnavailable) {
    parts.push('context_unavailable: true');
  }
  if (input.recentSentReplies?.trim()) {
    parts.push(input.recentSentReplies.trim());
  }
  if (input.userPatternProfile?.trim()) {
    parts.push(`USER PATTERN PROFILE:\n${input.userPatternProfile.trim()}`);
  }
  parts.push(`DHIRA DRAFT REPLY:\n${input.draftReply}`);

  try {
    const result = await anthropicJSON<MonitorResult>({
      agent: 'safetyMonitor',
      system: MONITOR_LIVE_SYSTEM,
      userContent: parts.join('\n\n'),
      maxTokens: 450,
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
    if (
      result.decision === 'BLOCK_AND_REPLACE' &&
      result.risk_level === 'CRISIS' &&
      esc &&
      shouldBlockCrisisForClassification(esc.classification)
    ) {
      result.decision = 'REWRITE';
      result.risk_level = esc.risk_level === 'MEDIUM' ? 'MEDIUM' : 'LOW';
      result.issues_found = [...(result.issues_found ?? []), 'monitor_disagrees_escalation_false_positive'];
      if (result.approved_or_rewritten_response.includes('14416')) {
        result.approved_or_rewritten_response =
          "I'm here with you — sounds like today's been a lot. What's weighing on you most?";
      }
    }
    if (result.decision === 'BLOCK_AND_REPLACE' && result.risk_level !== 'CRISIS') {
      result.decision = 'REWRITE';
    }
    return sanityCheckMonitor(input.userMessage, input.context, result);
  } catch {
    return failSafeMonitor(input.draftReply);
  }
}
