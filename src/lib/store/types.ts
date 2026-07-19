import type {
  Profile,
  ChatMessageRecord,
  MoodLogRecord,
  MemoryRecord,
  RiskEventRecord,
} from '@/lib/types';

/** Aggregate numbers for the Admin Console (anonymous, no PII). */
export interface AdminStats {
  totalUsers: number;
  totalMessages: number;
  totalMoodLogs: number;
  crisisEvents: number;
  mediumEvents: number;
  activeToday: number;
}

/**
 * The one interface both storage backends implement. The rest of the app only
 * ever talks to this — so swapping a local file for Supabase changes nothing
 * upstream.
 */
export interface DhiraStore {
  getOrCreateProfile(id: string): Promise<Profile>;
  updateProfile(id: string, patch: Partial<Profile>): Promise<Profile>;

  addMessage(record: ChatMessageRecord): Promise<void>;
  getRecentMessages(profileId: string, limit?: number): Promise<ChatMessageRecord[]>;

  addMood(record: MoodLogRecord): Promise<void>;
  getMoods(profileId: string, sinceDays?: number): Promise<MoodLogRecord[]>;
  getLatestMood(profileId: string): Promise<MoodLogRecord | null>;

  addMemory(record: MemoryRecord): Promise<void>;
  getLatestMemory(profileId: string): Promise<MemoryRecord | null>;
  getMemories(profileId: string, limit?: number): Promise<MemoryRecord[]>;

  addRiskEvent(record: RiskEventRecord): Promise<void>;
  getRiskEvents(limit?: number): Promise<RiskEventRecord[]>;

  adminStats(): Promise<AdminStats>;
}
