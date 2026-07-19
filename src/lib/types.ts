/**
 * Shared data shapes for Dhira's backend (used by the store, agents, and API).
 * Anonymous-first: we never store real names or raw personal identifiers.
 */

export type Language = 'english' | 'hinglish';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRISIS';

export type MoodLabel =
  | 'happy'
  | 'calm'
  | 'neutral'
  | 'hopeful'
  | 'stressed'
  | 'lonely'
  | 'angry'
  | 'anxious'
  | 'overwhelmed'
  | 'sad';

export type TopicTag =
  | 'work'
  | 'family'
  | 'relationships'
  | 'health'
  | 'finances'
  | 'self'
  | 'other';

export type CheckinFrequency = 'daily' | 'every-other-day' | 'weekly';

/** The anonymous person + their preferences (the "check-in contract"). */
export interface Profile {
  id: string; // anonymous id (from a secure cookie), never a real name
  alias: string;
  avatar: string; // e.g. 'moon' | 'sun' — a UI asset only, non-human
  language: Language;
  consentCheckin: boolean;
  consentMemory: boolean;
  checkinFrequency: CheckinFrequency;
  checkinWindow: string; // e.g. '22:00-23:00' (their late-night hours)
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageRecord {
  id: string;
  profileId: string;
  role: 'user' | 'dhira';
  content: string;
  createdAt: string;
}

export interface MoodLogRecord {
  id: string;
  profileId: string;
  mood: MoodLabel;
  valence: number; // -1..1
  emotionalIntensity: number; // 0..1
  topicTag: TopicTag;
  source: 'chat' | 'manual'; // manual = the mood modal; chat = auto-tagged
  createdAt: string;
}

export interface MemoryRecord {
  id: string;
  profileId: string;
  summary: string;
  mood: MoodLabel;
  topicTag: TopicTag;
  carryForward: string;
  createdAt: string;
}

export interface RiskEventRecord {
  id: string;
  profileId: string;
  riskLevel: RiskLevel;
  signal: string;
  handled: boolean;
  createdAt: string;
}

/** Output of the Safety & Persona Monitor (agent §5). */
export interface MonitorResult {
  decision: 'APPROVED' | 'REWRITE' | 'BLOCK_AND_REPLACE';
  risk_level: RiskLevel;
  issues_found: string[];
  approved_or_rewritten_response: string;
}

/** Output of the Escalation Agent (agent §6.3). */
export interface EscalationResult {
  risk_level: RiskLevel;
  escalate: boolean;
  signal: string;
}

/** Output of the Mood Tagging Agent (agent §6.1). */
export interface MoodTagResult {
  mood: MoodLabel;
  valence: number;
  emotional_intensity: number;
  topic_tag: TopicTag;
}

/** Output of the Memory Agent (agent §6.2). */
export interface MemoryResult {
  summary: string;
  mood: MoodLabel;
  topic_tag: TopicTag;
  carry_forward: string;
}
