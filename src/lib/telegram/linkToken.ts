import { randomBytes } from 'crypto';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseAuthConfigured } from '@/lib/store';

const TOKEN_TTL_MS = 15 * 60 * 1000;
const LOCAL_FILE = path.join(process.cwd(), '.data', 'telegram-link-tokens.json');

interface LinkTokenRow {
  token: string;
  profileId: string;
  expiresAt: string;
  usedAt: string | null;
}

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    { auth: { persistSession: false } },
  );
}

function readLocalTokens(): LinkTokenRow[] {
  try {
    return JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf-8')) as LinkTokenRow[];
  } catch {
    return [];
  }
}

function writeLocalTokens(rows: LinkTokenRow[]): void {
  fs.mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(rows, null, 2), 'utf-8');
}

function generateToken(): string {
  return randomBytes(24).toString('base64url');
}

/** Create a one-time link token for Telegram /start binding. */
export async function createTelegramLinkToken(profileId: string): Promise<{
  token: string;
  expiresAt: string;
}> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

  if (isSupabaseAuthConfigured()) {
    const sb = supabaseAdmin();
    await sb.from('telegram_link_tokens').delete().eq('profile_id', profileId).is('used_at', null);
    const { error } = await sb.from('telegram_link_tokens').insert({
      token,
      profile_id: profileId,
      expires_at: expiresAt,
      used_at: null,
    });
    if (error) throw error;
    return { token, expiresAt };
  }

  const rows = readLocalTokens().filter((r) => r.profileId !== profileId || r.usedAt);
  rows.push({ token, profileId, expiresAt, usedAt: null });
  writeLocalTokens(rows);
  return { token, expiresAt };
}

/** Consume token; returns profile id if valid. */
export async function consumeTelegramLinkToken(token: string): Promise<string | null> {
  const now = Date.now();

  if (isSupabaseAuthConfigured()) {
    const sb = supabaseAdmin();
    const { data } = await sb
      .from('telegram_link_tokens')
      .select('*')
      .eq('token', token)
      .maybeSingle();
    if (!data || data.used_at) return null;
    if (new Date(data.expires_at).getTime() < now) return null;

    await sb
      .from('telegram_link_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);
    return data.profile_id as string;
  }

  const rows = readLocalTokens();
  const row = rows.find((r) => r.token === token && !r.usedAt);
  if (!row || new Date(row.expiresAt).getTime() < now) return null;
  row.usedAt = new Date().toISOString();
  writeLocalTokens(rows);
  return row.profileId;
}
