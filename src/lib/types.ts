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

export type NotifyChannel = 'email' | 'whatsapp';

/** The identified person + their preferences (the "check-in contract" + contact). */
export interface Profile {
  id: string; // = auth user id (Supabase) or dev-session id
  alias: string;
  avatar: string; // e.g. 'moon' | 'sun' — a UI asset only, non-human
  language: Language;
  email: string | null;
  phoneE164: string | null; // used for WhatsApp
  preferredChannel: NotifyChannel;
  emailOptIn: boolean;
  whatsappOptIn: boolean;
  timezone: string; // IANA tz, e.g. 'Asia/Kolkata'
  consentCheckin: boolean;
  consentMemory: boolean;
  checkinFrequency: CheckinFrequency;
  checkinWindow: string; // e.g. '22:00-23:00' (their late-night hours)
  /** Last successful proactive notification enqueue (ISO). Used by Emergent due-list. */
  lastProactiveAt: string | null;
  /** Last successful weekly summary enqueue (ISO). */
  lastWeeklyAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Dev-mode credential record (only used when Supabase Auth is NOT configured).
 * In production, Supabase Auth (auth.users) owns credentials — this is never used.
 */
export interface AuthUser {
  id: string;
  email: string | null;
  phoneE164: string | null;
  passwordHash: string | null; // scrypt hash (dev only)
  createdAt: string;
}

export type NotificationType = 'proactive_checkin' | 'weekly_summary' | 'crisis_followup';
export type NotificationStatus = 'queued' | 'sent' | 'delivered' | 'failed';

export interface NotificationRecord {
  id: string;
  profileId: string;
  channel: NotifyChannel;
  type: NotificationType;
  content: string;
  status: NotificationStatus;
  providerMessageId: string | null;
  scheduledFor: string | null;
  sentAt: string | null;
  createdAt: string;
  /** Emergent / Meta template id, e.g. dhira_checkin_v1 */
  templateKey: string | null;
  /** Email subject line (null for WhatsApp). */
  subject: string | null;
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
