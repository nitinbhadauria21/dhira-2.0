import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseAuthConfigured } from '@/lib/store';

const LOCAL_FILE = path.join(process.cwd(), '.data', 'telegram-processed-updates.json');
const LOCAL_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    { auth: { persistSession: false } },
  );
}

function readLocalUpdates(): { updateId: number; processedAt: string }[] {
  try {
    return JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf-8')) as { updateId: number; processedAt: string }[];
  } catch {
    return [];
  }
}

function writeLocalUpdates(rows: { updateId: number; processedAt: string }[]): void {
  fs.mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(rows, null, 2), 'utf-8');
}

/**
 * Claim a Telegram update_id before processing. Returns false if already handled
 * (webhook retry / duplicate delivery).
 */
export async function claimTelegramUpdate(updateId: number): Promise<boolean> {
  if (!Number.isFinite(updateId)) return true;

  if (isSupabaseAuthConfigured()) {
    const sb = supabaseAdmin();
    const { error } = await sb.from('telegram_processed_updates').insert({
      update_id: updateId,
      processed_at: new Date().toISOString(),
    });
    if (!error) return true;
    if (/duplicate|unique|23505/i.test(error.message ?? '')) return false;
    // Table may not exist yet — fall through to local file so dev still works.
    console.warn('[telegram/idempotency] supabase insert failed', error.message);
  }

  const cutoff = Date.now() - LOCAL_RETENTION_MS;
  const rows = readLocalUpdates().filter((r) => new Date(r.processedAt).getTime() >= cutoff);
  if (rows.some((r) => r.updateId === updateId)) return false;
  rows.push({ updateId, processedAt: new Date().toISOString() });
  writeLocalUpdates(rows);
  return true;
}
