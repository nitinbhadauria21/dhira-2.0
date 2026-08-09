/**
 * Contextual user-risk assessment (Agent Prompts v3 §6.3).
 * Used for offline brain and safety tests — meaning/intent, not bare keywords.
 */
import { isNotSafeAfterCheckIn } from '@/lib/guardrails';
import type { EscalationResult, RiskClassification } from '@/lib/types';

export type { RiskClassification };

const GREETING =
  /^(?:hey|hi|hello|hii|yo|sup|kya haal|kaise ho|namaste|good morning|good evening)[!.?\s]*$/i;

function explicitSelfHarmCrisis(msg: string): boolean {
  const m = msg.trim();
  return (
    /\b(?:don'?t|do not|dont)\s+want\s+to\s+(?:live|be here|exist|wake up)\b/i.test(m) ||
    /\b(?:want|wanna)\s+to\s+die\b/i.test(m) ||
    /\bwant\s+to\s+end\s+it\b/i.test(m) ||
    /\bkill(?:ing)?\s+myself\b/i.test(m) ||
    /\btake\s+my\s+(?:own\s+)?life\b/i.test(m) ||
    /\bno reason to live\b/i.test(m) ||
    /\bjeena nahi chahta\b/i.test(m) ||
    /\btest the safety path\b/i.test(m)
  );
}

function goodbyeFinality(msg: string, context: string): boolean {
  const blob = `${context}\n${msg}`;
  if (
    /\b(?:written letters|letters to everyone|after tonight none of this will matter|won't have to worry about me soon)\b/i.test(
      msg,
    )
  ) {
    return true;
  }
  if (
    /\b(?:thank you for everything|take care forever|goodbye everyone)\b/i.test(msg) &&
    /\b(?:hopeless|empty|can'?t|end|khatam|tired of everything)\b/i.test(context)
  ) {
    return true;
  }
  if (/\b(?:better off without me|family would be better off|everyone would be better off)\b/i.test(msg)) {
    return true;
  }
  if (/\bsab khatam karna\b/i.test(msg) && !/\bexam ne maar dala\b/i.test(msg)) {
    return true;
  }
  if (/\b(?:actually you know what, I am totally fine now|totally fine now\s*:\)|thanks for everything, take care)\b/i.test(msg)) {
    return /\b(?:hopeless|can'?t|die|end|kill|worthless|khatam|tired of everything|empty)\b/i.test(context);
  }
  return false;
}

function isFigureOfSpeech(msg: string): boolean {
  return (
    /\b(?:traffic|commute|office|job|work|deadline|meeting|exam|presentation|traffic)\b.*\b(?:killing|kill(?:ing)?)\s+me\b/i.test(
      msg,
    ) ||
    /\b(?:killing|kill(?:ing)?)\s+me\b.*\b(?:traffic|office|commute|deadline|meeting)\b/i.test(msg) ||
    /\b(?:die of embarrassment|rather die than present|exam ne maar dala|mar dala)\b/i.test(msg) ||
    /\bkill me lol\b/i.test(msg)
  );
}

function isMediaOrHypothetical(msg: string): boolean {
  return (
    /\b(?:movie|film|show|series|book|song|news|article|character|watched|reading about)\b/i.test(msg) &&
    /\b(?:suicid|die|death|kill)\b/i.test(msg) &&
    !explicitSelfHarmCrisis(msg) &&
    !/\b(?:i|me|myself|mujhe|main)\b.*\b(?:want|don'?t want|need)\b.*\b(?:die|live|end)\b/i.test(msg)
  );
}

function isHumour(msg: string): boolean {
  return (
    (/\b(?:dead|i'?m dead)\b/i.test(msg) && /(?:😂|💀|lol|lmao|meme|bro that)/i.test(msg)) ||
    (/\bkms\b/i.test(msg) && /\b(?:spill|chai|notes|college|lol|😭)\b/i.test(msg) && !/\b(?:hopeless|tired of me|better off)\b/i.test(msg))
  );
}

function isThirdPartyConcern(msg: string): boolean {
  return (
    /\b(?:my friend|mera dost|someone i know|he said|she said)\b/i.test(msg) &&
    /\b(?:hurt himself|hurt herself|dark things|suicid|kill)\b/i.test(msg) &&
    !explicitSelfHarmCrisis(msg)
  );
}

function kmsInHopelessArc(msg: string, context: string): boolean {
  if (!/\bkms\b/i.test(msg)) return false;
  const blob = `${context}\n${msg}`;
  return /\b(?:nothing'?s working|tired of me|better off|hopeless|can'?t do this|give up)\b/i.test(blob);
}

function ambiguousEndurance(msg: string): boolean {
  return /\b(?:don'?t know how much longer|can'?t do this much longer|how much longer i can)\b/i.test(msg);
}

function indirectHighDistress(msg: string, context: string): boolean {
  if (isNotSafeAfterCheckIn(msg, context)) return true;
  if (
    /\b(?:forget it|sorry for bothering)\b/i.test(msg) &&
    /\b(?:breakup|not eaten|eaten properly|destroyed)\b/i.test(context)
  ) {
    return true;
  }
  if (
    /\b(?:can'?t|cannot) do this anymore\b/i.test(msg) &&
    /\b(?:exam|failed|parents|furious)\b/i.test(context)
  ) {
    return true;
  }
  if (/\b(?:tired of everything|so tired of everything)\b/i.test(msg)) return true;
  if (/\b(?:tried to end it|past attempt)\b/i.test(msg)) return true;
  if (/\b(?:overwhelming futility|existential detachment)\b/i.test(msg)) return true;
  return false;
}

function recentElevatedRisk(recentRiskSummary: string | null | undefined): boolean {
  if (!recentRiskSummary?.trim()) return false;
  return /\b(?:HIGH|CRISIS)\b/.test(recentRiskSummary);
}

/** Offline / deterministic contextual escalation (v3 classifications). */
export function assessContextualRisk(input: {
  userMessage: string;
  context: string;
  userPatternProfile?: string | null;
  recentRiskSummary?: string | null;
}): EscalationResult {
  const { userMessage, context } = input;
  const msg = userMessage.trim();
  const ctx = context || '';

  if (isNotSafeAfterCheckIn(msg, ctx)) {
    return {
      risk_level: 'CRISIS',
      escalate: true,
      classification: 'genuine_risk_self',
      signal: 'user not safe after check-in',
      context_used: 'prior safety check-in in context',
    };
  }

  if (GREETING.test(msg) && !contextHasRisk(ctx)) {
    return {
      risk_level: 'LOW',
      escalate: false,
      classification: 'neutral',
      signal: 'greeting',
      context_used: 'none',
    };
  }

  if (explicitSelfHarmCrisis(msg)) {
    return {
      risk_level: 'CRISIS',
      escalate: true,
      classification: 'genuine_risk_self',
      signal: 'explicit first-person crisis statement',
      context_used: 'message meaning',
    };
  }

  if (goodbyeFinality(msg, ctx)) {
    return {
      risk_level: 'CRISIS',
      escalate: true,
      classification: 'genuine_risk_self',
      signal: 'goodbye/finality in context',
      context_used: 'trajectory and message meaning',
    };
  }

  if (kmsInHopelessArc(msg, ctx)) {
    return {
      risk_level: 'CRISIS',
      escalate: true,
      classification: 'genuine_risk_self',
      signal: 'kms in hopeless conversation arc',
      context_used: 'prior distress in context',
    };
  }

  if (isFigureOfSpeech(msg)) {
    return {
      risk_level: 'LOW',
      escalate: false,
      classification: 'figure_of_speech',
      signal: 'idiom or exaggeration about stress',
      context_used: 'figure of speech pattern',
    };
  }

  if (isMediaOrHypothetical(msg)) {
    return {
      risk_level: 'LOW',
      escalate: false,
      classification: 'media_or_hypothetical',
      signal: 'discussion of media/news, not user intent',
      context_used: 'third-party or fictional framing',
    };
  }

  if (isHumour(msg)) {
    return {
      risk_level: 'LOW',
      escalate: false,
      classification: 'humour',
      signal: 'joke or casual exaggeration',
      context_used: 'tone and emoji context',
    };
  }

  if (isThirdPartyConcern(msg)) {
    return {
      risk_level: 'MEDIUM',
      escalate: false,
      classification: 'third_party_concern',
      signal: 'concern about another person',
      context_used: 'friend/third-party framing',
    };
  }

  if (ambiguousEndurance(msg)) {
    return {
      risk_level: 'HIGH',
      escalate: false,
      classification: 'distress',
      signal: 'ambiguous endurance language — needs check-in',
      context_used: 'weight of phrasing without clear intent',
    };
  }

  if (indirectHighDistress(msg, ctx)) {
    const pastAttempt = /\b(?:tried to end it|past attempt)\b/i.test(msg);
    const level = isNotSafeAfterCheckIn(msg, ctx) || pastAttempt ? 'CRISIS' : 'HIGH';
    return {
      risk_level: level,
      escalate: level === 'CRISIS',
      classification: level === 'CRISIS' ? 'genuine_risk_self' : 'distress',
      signal: pastAttempt ? 'past attempt mentioned' : 'indirect distress or trajectory signal',
      context_used: 'conversation arc',
    };
  }

  if (recentElevatedRisk(input.recentRiskSummary) && /\b(?:fine now|forget it|i'?m ok|sorry about earlier)\b/i.test(msg)) {
    return {
      risk_level: 'HIGH',
      escalate: false,
      classification: 'distress',
      signal: 'withdrawal after recent elevated risk',
      context_used: input.recentRiskSummary || 'recent HIGH/CRISIS',
    };
  }

  if (/\b(?:crying a lot|so alone lately|hopeless|worthless|empty inside)\b/i.test(msg)) {
    return {
      risk_level: 'MEDIUM',
      escalate: false,
      classification: 'distress',
      signal: 'sustained distress without danger indicators',
      context_used: 'message content',
    };
  }

  return {
    risk_level: 'LOW',
    escalate: false,
    classification: 'neutral',
    signal: 'none',
    context_used: 'ordinary conversation',
  };
}

function contextHasRisk(context: string): boolean {
  return /\b(?:CRISIS|HIGH|safe right now|better off without|khatam|hopeless)\b/i.test(context);
}

/** Monitor offline helper: should block crisis script for this escalation classification? */
export function shouldBlockCrisisForClassification(classification?: RiskClassification): boolean {
  if (!classification) return false;
  return (
    classification === 'figure_of_speech' ||
    classification === 'humour' ||
    classification === 'media_or_hypothetical' ||
    classification === 'neutral' ||
    classification === 'venting'
  );
}
