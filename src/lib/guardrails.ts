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
  /\bi don'?t want to live\b/i,
  /\bi want to die\b/i,
  /\bend my life\b/i,
  /\bkill myself\b/i,
  /\bkilling myself\b/i,
  /\bdon'?t want to be here\b/i,
  /\bsuicid/i,
  /\bself[-\s]?harm\b/i,
  /\bhurt myself\b/i,
  /\bharm myself\b/i,
  /\bcut myself\b/i,
  /\bmar\s?(jaun|jaunga|jana chahta)\b/i, // Hinglish: "mar jaun"
  /\btest the safety path\b/i,
  /\bi want to hurt (someone|him|her|them)\b/i,
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
