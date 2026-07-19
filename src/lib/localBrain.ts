import type {
  EscalationResult,
  MonitorResult,
  MoodTagResult,
  MemoryResult,
  Language,
} from '@/lib/types';
import {
  isCrisis,
  isMedium,
  containsAdviceOrDiagnosis,
} from '@/lib/guardrails';
import { BOUNDARY_LINE, CRISIS_MESSAGE } from '@/lib/safetyCopy';

/**
 * Offline fallback "brain".
 *
 * Plain English: when no Anthropic key is set, Dhira still needs to behave —
 * especially the SAFETY parts. These functions are deliberately simple but
 * follow the same rules as the real agents: listen, never advise, one gentle
 * question, and always catch a crisis. Once you add a key, the real Claude
 * agents take over automatically and these are no longer used.
 */

const ADVICE_REQUEST = /\b(should i|what should i|kya karu|kya karoon|advise me|tell me what to do)\b/i;
const DIAGNOSIS_REQUEST = /\b(am i depressed|do i have|diagnos|is it depression|anxiety disorder)\b/i;

function reflect(userMessage: string, language: Language): string {
  const lower = userMessage.toLowerCase();
  const hinglish = language === 'hinglish';

  if (ADVICE_REQUEST.test(lower)) {
    return `${BOUNDARY_LINE} What feels most stuck for you right now?`;
  }
  if (DIAGNOSIS_REQUEST.test(lower)) {
    return "I can't diagnose anything, and I don't want to give you the wrong kind of guidance. But I can stay with you while you sort through it. What's felt different for you lately?";
  }
  if (/\b(invisible|ignored|unseen)\b/.test(lower)) {
    return hinglish
      ? 'Yeh kaafi isolating lag raha hai — bolna aur phir lagna ki kisi ne suna hi nahi. Us waqt sabse zyada kya feel ho raha tha?'
      : "That sounds really isolating — to speak and feel like no one received it. What was the main feeling sitting with you in that moment?";
  }
  if (/\b(work|office|job|boss|kaam)\b/.test(lower)) {
    return hinglish
      ? 'Yeh work pressure kaafi heavy ho sakta hai. Aaj ka din unusually bhaari tha, ya kuch time se aisa chal raha hai?'
      : 'Work pressure like that can sit really heavy. Was today unusually hard, or has this been building for a while?';
  }
  if (/\b(lonely|alone|akela|akeli)\b/.test(lower)) {
    return hinglish
      ? 'Loneliness sabse quiet tarah ki heaviness hoti hai. Yeh feeling mostly kahan aati hai — logon ke beech, ya akele mein?'
      : 'Loneliness is one of the quietest kinds of heavy. Where does it show up most for you?';
  }
  if (/\b(better|okay|theek|thik|acha|good)\b/.test(lower)) {
    return hinglish
      ? 'Achha laga sunke ki thoda halka feel ho raha hai. Kya cheez ne madad ki, chahe thodi si?'
      : "I'm glad something shifted a little. What helped, even slightly?";
  }
  return hinglish
    ? 'Yeh kaafi heavy lag raha hai. Main sun raha hoon — apna time lo. Abhi sabse zyada kya mann mein hai?'
    : "That sounds heavy. I'm here — take your time. What's sitting with you most right now?";
}

export function localEscalation(userMessage: string): EscalationResult {
  if (isCrisis(userMessage)) {
    return { risk_level: 'CRISIS', escalate: true, signal: 'self-harm / crisis language detected' };
  }
  if (isMedium(userMessage)) {
    return { risk_level: 'MEDIUM', escalate: false, signal: 'distress language (not immediate danger)' };
  }
  return { risk_level: 'LOW', escalate: false, signal: 'no risk signals' };
}

export function localPrimaryReply(params: {
  userMessage: string;
  language: Language;
}): string {
  return reflect(params.userMessage, params.language);
}

export function localMonitor(params: {
  userMessage: string;
  draftReply: string;
}): MonitorResult {
  const { userMessage, draftReply } = params;

  // Crisis in the user's message must always escalate.
  if (isCrisis(userMessage)) {
    return {
      decision: 'BLOCK_AND_REPLACE',
      risk_level: 'CRISIS',
      issues_found: ['user in crisis — replaced with crisis hand-off'],
      approved_or_rewritten_response: CRISIS_MESSAGE,
    };
  }

  // Scan Dhira's OUTGOING draft only for advice/diagnosis/dependency.
  const issues = containsAdviceOrDiagnosis(draftReply);
  if (issues.length > 0) {
    return {
      decision: 'REWRITE',
      risk_level: isMedium(userMessage) ? 'MEDIUM' : 'LOW',
      issues_found: issues,
      approved_or_rewritten_response:
        "That sounds like a lot to be carrying. I'm here to listen, not to steer you. What feels heaviest about it right now?",
    };
  }

  return {
    decision: 'APPROVED',
    risk_level: isMedium(userMessage) ? 'MEDIUM' : 'LOW',
    issues_found: [],
    approved_or_rewritten_response: draftReply,
  };
}

export function localMoodTag(text: string): MoodTagResult {
  const lower = text.toLowerCase();
  const has = (re: RegExp) => re.test(lower);
  if (has(/\b(anxious|nervous|worried|ghabra|tension)\b/))
    return { mood: 'anxious', valence: -0.5, emotional_intensity: 0.6, topic_tag: topic(lower) };
  if (has(/\b(sad|down|low|udaas|dukhi)\b/))
    return { mood: 'sad', valence: -0.6, emotional_intensity: 0.6, topic_tag: topic(lower) };
  if (has(/\b(lonely|alone|akela|invisible|ignored)\b/))
    return { mood: 'lonely', valence: -0.5, emotional_intensity: 0.55, topic_tag: topic(lower) };
  if (has(/\b(angry|frustrated|gussa|irritated)\b/))
    return { mood: 'angry', valence: -0.5, emotional_intensity: 0.6, topic_tag: topic(lower) };
  if (has(/\b(overwhelmed|too much|can'?t cope|thak)\b/))
    return { mood: 'overwhelmed', valence: -0.6, emotional_intensity: 0.7, topic_tag: topic(lower) };
  if (has(/\b(stressed|pressure|deadline)\b/))
    return { mood: 'stressed', valence: -0.4, emotional_intensity: 0.55, topic_tag: topic(lower) };
  if (has(/\b(better|okay|theek|hopeful|calm|good|acha)\b/))
    return { mood: 'hopeful', valence: 0.4, emotional_intensity: 0.4, topic_tag: topic(lower) };
  return { mood: 'neutral', valence: 0, emotional_intensity: 0.3, topic_tag: topic(lower) };
}

function topic(lower: string): MoodTagResult['topic_tag'] {
  if (/\b(work|office|job|boss|kaam|meeting|deadline)\b/.test(lower)) return 'work';
  if (/\b(family|mom|dad|parents|ghar|bhai|behen)\b/.test(lower)) return 'family';
  if (/\b(girlfriend|boyfriend|partner|relationship|breakup|pyaar)\b/.test(lower)) return 'relationships';
  if (/\b(health|sick|ill|body|sleep|neend)\b/.test(lower)) return 'health';
  if (/\b(money|salary|paisa|finances|rent|loan)\b/.test(lower)) return 'finances';
  return 'self';
}

export function localMemory(params: {
  conversation: string;
  language: Language;
}): MemoryResult {
  const mood = localMoodTag(params.conversation);
  return {
    summary:
      'Shared something that felt heavy today and took a moment to put it into words.',
    mood: mood.mood,
    topic_tag: mood.topic_tag,
    carry_forward: 'Gently check whether that heaviness has eased since last time.',
  };
}

export function localProactive(params: {
  carryForward?: string;
  language: Language;
}): string {
  const hinglish = params.language === 'hinglish';
  if (params.carryForward) {
    return hinglish
      ? `Hey, kal kuch heavy lag raha tha. Bas check kar raha tha — aaj kaisa mehsoos ho raha hai?`
      : `Hey — yesterday felt a little heavy for you. Just checking in: how are you sitting with it today?`;
  }
  return hinglish
    ? 'Hey, bas yaad karke check kar raha tha — aaj din kaisa jaa raha hai?'
    : "Hey — just thinking of you and checking in. How's today going so far?";
}
