import { createClient, SupabaseClient } from '@supabase/supabase-js';
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
 * Supabase-backed store (used when the Supabase keys are set).
 *
 * Runs only on the server with the service-role key. Row-Level Security is
 * enabled on every table (see supabase/schema.sql); server routes scope every
 * query by profile_id so each anonymous user only ever touches their own rows.
 */

function client(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

function daysAgoIso(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

// ── row <-> record mappers ────────────────────────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
const toProfile = (r: any): Profile => ({
  id: r.id,
  alias: r.alias,
  avatar: r.avatar,
  language: r.language,
  email: r.email ?? null,
  phoneE164: r.phone_e164 ?? null,
  preferredChannel: r.preferred_channel ?? 'email',
  emailOptIn: r.email_opt_in ?? true,
  whatsappOptIn: r.whatsapp_opt_in ?? false,
  timezone: r.timezone ?? 'Asia/Kolkata',
  consentCheckin: r.consent_checkin,
  consentMemory: r.consent_memory,
  checkinFrequency: r.checkin_frequency,
  checkinWindow: r.checkin_window,
  lastProactiveAt: r.last_proactive_at ?? null,
  lastWeeklyAt: r.last_weekly_at ?? null,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const toNotification = (r: any): NotificationRecord => ({
  id: r.id,
  profileId: r.profile_id,
  channel: r.channel,
  type: r.type,
  content: r.content,
  status: r.status,
  providerMessageId: r.provider_message_id ?? null,
  scheduledFor: r.scheduled_for ?? null,
  sentAt: r.sent_at ?? null,
  createdAt: r.created_at,
  templateKey: r.template_key ?? null,
  subject: r.subject ?? null,
});

const toMessage = (r: any): ChatMessageRecord => ({
  id: r.id,
  profileId: r.profile_id,
  role: r.role,
  content: r.content,
  createdAt: r.created_at,
});

const toMood = (r: any): MoodLogRecord => ({
  id: r.id,
  profileId: r.profile_id,
  mood: r.mood,
  valence: r.valence,
  emotionalIntensity: r.emotional_intensity,
  topicTag: r.topic_tag,
  source: r.source,
  createdAt: r.created_at,
});

const toMemory = (r: any): MemoryRecord => ({
  id: r.id,
  profileId: r.profile_id,
  summary: r.summary,
  mood: r.mood,
  topicTag: r.topic_tag,
  carryForward: r.carry_forward,
  createdAt: r.created_at,
});

const toRisk = (r: any): RiskEventRecord => ({
  id: r.id,
  profileId: r.profile_id,
  riskLevel: r.risk_level,
  signal: r.signal,
  handled: r.handled,
  createdAt: r.created_at,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

export class SupabaseStore implements DhiraStore {
  async getOrCreateProfile(id: string): Promise<Profile> {
    const sb = client();
    const { data } = await sb.from('profiles').select('*').eq('id', id).maybeSingle();
    if (data) return toProfile(data);

    const now = new Date().toISOString();
    const row = {
      id,
      alias: 'Friend',
      avatar: 'moon',
      language: 'hinglish',
      email: null,
      phone_e164: null,
      preferred_channel: 'email',
      email_opt_in: true,
      whatsapp_opt_in: false,
      timezone: 'Asia/Kolkata',
      consent_checkin: true,
      consent_memory: true,
      checkin_frequency: 'daily',
      checkin_window: '22:00-23:00',
      last_proactive_at: null,
      last_weekly_at: null,
      created_at: now,
      updated_at: now,
    };
    const { data: inserted, error } = await sb.from('profiles').insert(row).select('*').single();
    if (error) throw error;
    return toProfile(inserted);
  }

  async updateProfile(id: string, patch: Partial<Profile>): Promise<Profile> {
    const sb = client();
    await this.getOrCreateProfile(id);
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.alias !== undefined) row.alias = patch.alias;
    if (patch.avatar !== undefined) row.avatar = patch.avatar;
    if (patch.language !== undefined) row.language = patch.language;
    if (patch.email !== undefined) row.email = patch.email;
    if (patch.phoneE164 !== undefined) row.phone_e164 = patch.phoneE164;
    if (patch.preferredChannel !== undefined) row.preferred_channel = patch.preferredChannel;
    if (patch.emailOptIn !== undefined) row.email_opt_in = patch.emailOptIn;
    if (patch.whatsappOptIn !== undefined) row.whatsapp_opt_in = patch.whatsappOptIn;
    if (patch.timezone !== undefined) row.timezone = patch.timezone;
    if (patch.consentCheckin !== undefined) row.consent_checkin = patch.consentCheckin;
    if (patch.consentMemory !== undefined) row.consent_memory = patch.consentMemory;
    if (patch.checkinFrequency !== undefined) row.checkin_frequency = patch.checkinFrequency;
    if (patch.checkinWindow !== undefined) row.checkin_window = patch.checkinWindow;
    if (patch.lastProactiveAt !== undefined) row.last_proactive_at = patch.lastProactiveAt;
    if (patch.lastWeeklyAt !== undefined) row.last_weekly_at = patch.lastWeeklyAt;
    let { data, error } = await sb.from('profiles').update(row).eq('id', id).select('*').single();
    // Older projects before migration — drop new timestamp columns and retry.
    if (error && /last_proactive_at|last_weekly_at/i.test(error.message ?? '')) {
      delete row.last_proactive_at;
      delete row.last_weekly_at;
      ({ data, error } = await sb.from('profiles').update(row).eq('id', id).select('*').single());
    }
    if (error) throw error;
    return toProfile(data);
  }

  async addMessage(record: ChatMessageRecord): Promise<void> {
    const sb = client();
    const { error } = await sb.from('chat_messages').insert({
      id: record.id,
      profile_id: record.profileId,
      role: record.role,
      content: record.content,
      created_at: record.createdAt,
    });
    if (error) throw error;
  }

  async getRecentMessages(profileId: string, limit = 20): Promise<ChatMessageRecord[]> {
    const sb = client();
    const { data, error } = await sb
      .from('chat_messages')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(toMessage).reverse();
  }

  async addMood(record: MoodLogRecord): Promise<void> {
    const sb = client();
    const { error } = await sb.from('mood_logs').insert({
      id: record.id,
      profile_id: record.profileId,
      mood: record.mood,
      valence: record.valence,
      emotional_intensity: record.emotionalIntensity,
      topic_tag: record.topicTag,
      source: record.source,
      created_at: record.createdAt,
    });
    if (error) throw error;
  }

  async getMoods(profileId: string, sinceDays?: number): Promise<MoodLogRecord[]> {
    const sb = client();
    let q = sb.from('mood_logs').select('*').eq('profile_id', profileId);
    if (sinceDays != null) q = q.gte('created_at', daysAgoIso(sinceDays));
    const { data, error } = await q.order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toMood);
  }

  async getLatestMood(profileId: string): Promise<MoodLogRecord | null> {
    const sb = client();
    const { data } = await sb
      .from('mood_logs')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data ? toMood(data) : null;
  }

  async addMemory(record: MemoryRecord): Promise<void> {
    const sb = client();
    const { error } = await sb.from('memories').insert({
      id: record.id,
      profile_id: record.profileId,
      summary: record.summary,
      mood: record.mood,
      topic_tag: record.topicTag,
      carry_forward: record.carryForward,
      created_at: record.createdAt,
    });
    if (error) throw error;
  }

  async getLatestMemory(profileId: string): Promise<MemoryRecord | null> {
    const sb = client();
    const { data } = await sb
      .from('memories')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data ? toMemory(data) : null;
  }

  async getMemories(profileId: string, limit = 10): Promise<MemoryRecord[]> {
    const sb = client();
    const { data, error } = await sb
      .from('memories')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(toMemory);
  }

  async addRiskEvent(record: RiskEventRecord): Promise<void> {
    const sb = client();
    const { error } = await sb.from('risk_events').insert({
      id: record.id,
      profile_id: record.profileId,
      risk_level: record.riskLevel,
      signal: record.signal,
      handled: record.handled,
      created_at: record.createdAt,
    });
    if (error) throw error;
  }

  async getRiskEvents(limit = 50): Promise<RiskEventRecord[]> {
    const sb = client();
    const { data, error } = await sb
      .from('risk_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(toRisk);
  }

  async addNotification(record: NotificationRecord): Promise<void> {
    const sb = client();
    const base = {
      id: record.id,
      profile_id: record.profileId,
      channel: record.channel,
      type: record.type,
      content: record.content,
      status: record.status,
      provider_message_id: record.providerMessageId,
      scheduled_for: record.scheduledFor,
      sent_at: record.sentAt,
      created_at: record.createdAt,
    };
    const withMeta = { ...base, template_key: record.templateKey, subject: record.subject };
    let { error } = await sb.from('notifications').insert(withMeta);
    // Older projects before migration 20260720 — retry without new columns.
    if (error && /template_key|subject/i.test(error.message ?? '')) {
      ({ error } = await sb.from('notifications').insert(base));
    }
    if (error) throw error;
  }

  async updateNotificationStatus(id: string, status: NotificationStatus, providerMessageId?: string | null): Promise<void> {
    const sb = client();
    const row: Record<string, unknown> = { status };
    if (providerMessageId !== undefined) row.provider_message_id = providerMessageId;
    if (status === 'sent' || status === 'delivered') row.sent_at = new Date().toISOString();
    await sb.from('notifications').update(row).eq('id', id);
  }

  async getNotifications(profileId: string, limit = 20): Promise<NotificationRecord[]> {
    const sb = client();
    const { data, error } = await sb
      .from('notifications')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(toNotification);
  }

  // Supabase Auth owns credentials — these dev-auth methods are unused in live mode.
  async createAuthUser(): Promise<void> {
    /* no-op: Supabase Auth manages users */
  }
  async getAuthUserByEmail(): Promise<AuthUser | null> {
    return null;
  }
  async getAuthUserByPhone(): Promise<AuthUser | null> {
    return null;
  }

  async allProfiles(): Promise<Profile[]> {
    const sb = client();
    const { data } = await sb.from('profiles').select('*');
    return (data ?? []).map(toProfile);
  }

  async allMoods(): Promise<MoodLogRecord[]> {
    const sb = client();
    const { data } = await sb.from('mood_logs').select('*').order('created_at', { ascending: true });
    return (data ?? []).map(toMood);
  }

  async allRiskEvents(): Promise<RiskEventRecord[]> {
    const sb = client();
    const { data } = await sb.from('risk_events').select('*').order('created_at', { ascending: true });
    return (data ?? []).map(toRisk);
  }

  async allNotifications(): Promise<NotificationRecord[]> {
    const sb = client();
    const { data } = await sb.from('notifications').select('*').order('created_at', { ascending: true });
    return (data ?? []).map(toNotification);
  }

  async adminStats(): Promise<AdminStats> {
    const sb = client();
    const countOf = async (table: string): Promise<number> => {
      const { count } = await sb.from(table).select('*', { count: 'exact', head: true });
      return count ?? 0;
    };
    const [totalUsers, totalMessages, totalMoodLogs] = await Promise.all([
      countOf('profiles'),
      countOf('chat_messages'),
      countOf('mood_logs'),
    ]);
    const { data: risks } = await sb.from('risk_events').select('risk_level');
    const crisisEvents = (risks ?? []).filter((r) => r.risk_level === 'CRISIS').length;
    const mediumEvents = (risks ?? []).filter((r) => r.risk_level === 'MEDIUM').length;
    const { data: recentMsgs } = await sb
      .from('chat_messages')
      .select('profile_id')
      .gte('created_at', daysAgoIso(1));
    const activeToday = new Set((recentMsgs ?? []).map((m) => m.profile_id)).size;
    return { totalUsers, totalMessages, totalMoodLogs, crisisEvents, mediumEvents, activeToday };
  }
}
