import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  Profile,
  ChatMessageRecord,
  MoodLogRecord,
  MemoryRecord,
  RiskEventRecord,
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
  consentCheckin: r.consent_checkin,
  consentMemory: r.consent_memory,
  checkinFrequency: r.checkin_frequency,
  checkinWindow: r.checkin_window,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
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
      consent_checkin: true,
      consent_memory: true,
      checkin_frequency: 'daily',
      checkin_window: '22:00-23:00',
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
    if (patch.consentCheckin !== undefined) row.consent_checkin = patch.consentCheckin;
    if (patch.consentMemory !== undefined) row.consent_memory = patch.consentMemory;
    if (patch.checkinFrequency !== undefined) row.checkin_frequency = patch.checkinFrequency;
    if (patch.checkinWindow !== undefined) row.checkin_window = patch.checkinWindow;
    const { data, error } = await sb.from('profiles').update(row).eq('id', id).select('*').single();
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
