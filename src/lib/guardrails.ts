/**
 * Guardrail phrase patterns from the Agent Prompts spec §7.
 *
 * These are a *tripwire*, not the judge: when one fires on Dhira's OUTGOING
 * draft, we ask the Safety & Persona Monitor to rewrite it warmly rather than
 * hard-blocking. We only ever scan Dhira's reply, never the user's message.
 */

// Advice / diagnosis / dependency patterns (case-insensitive).
export const ADVICE_PATTERNS: RegExp[] = [
  /\byou should\b/i,
  /\byou must\b/i,
  /\byou need to\b/i,
  /\byou have to\b/i,
  /\byou ought to\b/i,
  /\byou'?d better\b/i,
  /\bwhy don'?t you\b/i,
  /\bhave you tried\b/i,
  /\byou could try\b/i,
  /\byou might want to\b/i,
  /\bmaybe you should\b/i,
  /\bif i were you\b/i,
  /\bwhat you should do\b/i,
  /\bthe best thing to do\b/i,
  /\ball you have to do\b/i,
  /\bmake sure you\b/i,
  /\bi suggest\b/i,
  /\bi recommend\b/i,
  /\bi'?d advise\b/i,
  /\bhere'?s what i'?d do\b/i,
  /\bmy advice is\b/i,
];

export const DIAGNOSIS_PATTERNS: RegExp[] = [
  /\bi diagnose\b/i,
  /\byou are depressed\b/i,
  /\byou have anxiety\b/i,
  /\btake medicine\b/i,
  /\bstop taking medicine\b/i,
  /\bas your therapist\b/i,
  /\bas your psychologist\b/i,
];

export const DEPENDENCY_PATTERNS: RegExp[] = [
  /\bi will always be here for you\b/i,
  /\byou only need me\b/i,
  /\bdon'?t tell anyone\b/i,
  /\beverything will be fine\b/i,
  /\bi promise\b/i,
];

/** Crisis signals (self-harm, suicide, harm to others, immediate danger). */
export const CRISIS_PATTERNS: RegExp[] = [
  // "don't / do not / dont want to live | be here | exist | wake up"
  /\b(?:don'?t|do not|dont)\s+want\s+to\s+(?:live|be here|exist|wake up)\b/i,
  /\b(?:want|wanna)\s+to\s+die\b/i,
  /\bwant\s+to\s+end\s+it\b/i,
  /\bend(?:ing)?\s+(?:my|it)\s+(?:life|all)\b/i,
  /\bend my life\b/i,
  /\bkill(?:ing)?\s+myself\b/i,
  /\btake\s+my\s+(?:own\s+)?life\b/i,
  /\bno reason to live\b/i,
  /\bbetter off dead\b/i,
  /\bsuicid/i,
  /\bself[-\s]?harm\b/i,
  /\b(?:hurt|harm|cut)\s+myself\b/i,
  /\bmar\s?(jaun|jaunga|jaana|jana chahta|jaunga main)\b/i, // Hinglish: "mar jaun/jaunga"
  /\bjeena nahi chahta\b/i, // Hinglish: "don't want to live"
  /\btest the safety path\b/i,
  /\b(?:want|going)\s+to\s+hurt\s+(?:someone|him|her|them|people)\b/i,
];

/** Medium-risk distress (not immediate danger, but surfaces gentle support). */
export const MEDIUM_PATTERNS: RegExp[] = [
  /\bhopeless\b/i,
  /\bcan'?t go on\b/i,
  /\bworthless\b/i,
  /\bempty inside\b/i,
  /\bno point\b/i,
  /\bgive up\b/i,
  /\bbreaking down\b/i,
];

export function matchesAny(text: string, patterns: RegExp[]): RegExp | null {
  for (const p of patterns) if (p.test(text)) return p;
  return null;
}

export function containsAdviceOrDiagnosis(draft: string): string[] {
  const issues: string[] = [];
  if (matchesAny(draft, ADVICE_PATTERNS)) issues.push('contains advice / decision-steering');
  if (matchesAny(draft, DIAGNOSIS_PATTERNS)) issues.push('contains diagnosis / clinical language');
  if (matchesAny(draft, DEPENDENCY_PATTERNS)) issues.push('contains dependency / false-promise language');
  return issues;
}

export function isCrisis(userMessage: string): boolean {
  return Boolean(matchesAny(userMessage, CRISIS_PATTERNS));
}

export function isMedium(userMessage: string): boolean {
  return Boolean(matchesAny(userMessage, MEDIUM_PATTERNS));
}
