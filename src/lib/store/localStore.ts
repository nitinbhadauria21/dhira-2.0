import fs from 'fs';
import path from 'path';
import type {
  Profile,
  ChatMessageRecord,
  MoodLogRecord,
  MemoryRecord,
  RiskEventRecord,
  AuthUser,
  NotificationRecord,
  NotificationStatus,
} from '@/lib/types';
import type { DhiraStore, AdminStats } from './types';

/**
 * File-backed store used when Supabase is not configured.
 *
 * Plain English: this saves everything to a single JSON file on disk
 * (.data/dhira-store.json). It's perfect for a single-laptop demo — data
 * survives page refreshes and server restarts. For a deployed, multi-user
 * demo, set the Supabase keys instead and this file is ignored.
 */

interface Db {
  profiles: Profile[];
  messages: ChatMessageRecord[];
  moods: MoodLogRecord[];
  memories: MemoryRecord[];
  riskEvents: RiskEventRecord[];
  authUsers: AuthUser[];
  notifications: NotificationRecord[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'dhira-store.json');

function emptyDb(): Db {
  return { profiles: [], messages: [], moods: [], memories: [], riskEvents: [], authUsers: [], notifications: [] };
}

function readDb(): Db {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return { ...emptyDb(), ...parsed };
  } catch {
    return emptyDb();
  }
}

function writeDb(db: Db): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function daysAgo(n: number): number {
  return Date.now() - n * 24 * 60 * 60 * 1000;
}

export class LocalStore implements DhiraStore {
  async getOrCreateProfile(id: string): Promise<Profile> {
    const db = readDb();
    let profile = db.profiles.find((p) => p.id === id);
    if (!profile) {
      const now = new Date().toISOString();
      profile = {
        id,
        alias: 'Friend',
        avatar: 'moon',
        language: 'hinglish',
        email: null,
        phoneE164: null,
        preferredChannel: 'email',
        emailOptIn: true,
        whatsappOptIn: false,
        timezone: 'Asia/Kolkata',
        consentCheckin: true,
        consentMemory: true,
        checkinFrequency: 'daily',
        checkinWindow: '22:00-23:00',
        lastProactiveAt: null,
        lastWeeklyAt: null,
        createdAt: now,
        updatedAt: now,
      };
      db.profiles.push(profile);
      writeDb(db);
    }
    // Backfill fields added after early local demos
    if (profile.lastProactiveAt === undefined) (profile as Profile).lastProactiveAt = null;
    if (profile.lastWeeklyAt === undefined) (profile as Profile).lastWeeklyAt = null;
    return profile;
  }

  async updateProfile(id: string, patch: Partial<Profile>): Promise<Profile> {
    const db = readDb();
    const idx = db.profiles.findIndex((p) => p.id === id);
    const now = new Date().toISOString();
    if (idx === -1) {
      const base = await this.getOrCreateProfile(id);
      return this.updateProfile(id, patch === base ? {} : patch);
    }
    db.profiles[idx] = { ...db.profiles[idx], ...patch, id, updatedAt: now };
    writeDb(db);
    return db.profiles[idx];
  }

  async addMessage(record: ChatMessageRecord): Promise<void> {
    const db = readDb();
    db.messages.push(record);
    writeDb(db);
  }

  async getRecentMessages(profileId: string, limit = 20): Promise<ChatMessageRecord[]> {
    const db = readDb();
    return db.messages
      .filter((m) => m.profileId === profileId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .slice(-limit);
  }

  async addMood(record: MoodLogRecord): Promise<void> {
    const db = readDb();
    db.moods.push(record);
    writeDb(db);
  }

  async getMoods(profileId: string, sinceDays?: number): Promise<MoodLogRecord[]> {
    const db = readDb();
    let moods = db.moods.filter((m) => m.profileId === profileId);
    if (sinceDays != null) {
      const cutoff = daysAgo(sinceDays);
      moods = moods.filter((m) => new Date(m.createdAt).getTime() >= cutoff);
    }
    return moods.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async getLatestMood(profileId: string): Promise<MoodLogRecord | null> {
    const moods = await this.getMoods(profileId);
    return moods.length ? moods[moods.length - 1] : null;
  }

  async addMemory(record: MemoryRecord): Promise<void> {
    const db = readDb();
    db.memories.push(record);
    writeDb(db);
  }

  async getLatestMemory(profileId: string): Promise<MemoryRecord | null> {
    const db = readDb();
    const memories = db.memories
      .filter((m) => m.profileId === profileId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return memories.length ? memories[memories.length - 1] : null;
  }

  async getMemories(profileId: string, limit = 10): Promise<MemoryRecord[]> {
    const db = readDb();
    return db.memories
      .filter((m) => m.profileId === profileId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  async addRiskEvent(record: RiskEventRecord): Promise<void> {
    const db = readDb();
    db.riskEvents.push(record);
    writeDb(db);
  }

  async getRiskEvents(limit = 50): Promise<RiskEventRecord[]> {
    const db = readDb();
    return db.riskEvents
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  async addNotification(record: NotificationRecord): Promise<void> {
    const db = readDb();
    db.notifications.push(record);
    writeDb(db);
  }

  async updateNotificationStatus(id: string, status: NotificationStatus, providerMessageId?: string | null): Promise<void> {
    const db = readDb();
    const idx = db.notifications.findIndex((n) => n.id === id);
    if (idx === -1) return;
    db.notifications[idx].status = status;
    if (providerMessageId !== undefined) db.notifications[idx].providerMessageId = providerMessageId;
    if (status === 'sent' || status === 'delivered') {
      db.notifications[idx].sentAt = db.notifications[idx].sentAt ?? new Date().toISOString();
    }
    writeDb(db);
  }

  async getNotifications(profileId: string, limit = 20): Promise<NotificationRecord[]> {
    const db = readDb();
    return db.notifications
      .filter((n) => n.profileId === profileId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  async createAuthUser(user: AuthUser): Promise<void> {
    const db = readDb();
    db.authUsers.push(user);
    writeDb(db);
  }

  async getAuthUserByEmail(email: string): Promise<AuthUser | null> {
    const db = readDb();
    return db.authUsers.find((u) => u.email?.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async getAuthUserByPhone(phoneE164: string): Promise<AuthUser | null> {
    const db = readDb();
    return db.authUsers.find((u) => u.phoneE164 === phoneE164) ?? null;
  }

  async allProfiles(): Promise<Profile[]> {
    return readDb().profiles;
  }

  async allMoods(): Promise<MoodLogRecord[]> {
    return readDb().moods;
  }

  async allRiskEvents(): Promise<RiskEventRecord[]> {
    return readDb().riskEvents;
  }

  async allNotifications(): Promise<NotificationRecord[]> {
    return readDb().notifications;
  }

  async adminStats(): Promise<AdminStats> {
    const db = readDb();
    const cutoff = daysAgo(1);
    const activeToday = new Set(
      db.messages
        .filter((m) => new Date(m.createdAt).getTime() >= cutoff)
        .map((m) => m.profileId),
    ).size;
    return {
      totalUsers: db.profiles.length,
      totalMessages: db.messages.length,
      totalMoodLogs: db.moods.length,
      crisisEvents: db.riskEvents.filter((r) => r.riskLevel === 'CRISIS').length,
      mediumEvents: db.riskEvents.filter((r) => r.riskLevel === 'MEDIUM').length,
      activeToday,
    };
  }
}
