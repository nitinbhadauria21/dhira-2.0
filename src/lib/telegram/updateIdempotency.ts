import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/store';

const LOCAL_FILE = path.join(process.cwd(), '.data', 'telegram-processed-updates.json');
const LOCAL_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

function isServerlessRuntime(): boolean {
  return process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
}

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

function isDuplicateKeyError(message: string | undefined): boolean {
  return /duplicate|unique|23505/i.test(message ?? '');
}

function isMissingTableError(message: string | undefined): boolean {
  return /telegram_processed_updates|PGRST205|schema cache|does not exist/i.test(message ?? '');
}

/**
 * Claim a Telegram update_id before processing. Returns false if already handled
 * (webhook retry / duplicate delivery).
 */
export async function claimTelegramUpdate(updateId: number): Promise<boolean> {
  if (!Number.isFinite(updateId)) return true;

  if (isSupabaseConfigured()) {
    const sb = supabaseAdmin();
    const { error } = await sb.from('telegram_processed_updates').insert({
      update_id: updateId,
      processed_at: new Date().toISOString(),
    });
    if (!error) return true;
    if (isDuplicateKeyError(error.message)) return false;
    if (isMissingTableError(error.message)) {
      console.warn(
        '[telegram/idempotency] telegram_processed_updates missing — apply migration 20260822_telegram_inbound_idempotency.sql; processing without dedupe',
      );
      return true;
    }
    console.warn('[telegram/idempotency] supabase insert failed', error.message);
  }

  if (isServerlessRuntime()) {
    // Ephemeral / read-only filesystem on Vercel — do not block the message.
    return true;
  }

  try {
    const cutoff = Date.now() - LOCAL_RETENTION_MS;
    const rows = readLocalUpdates().filter((r) => new Date(r.processedAt).getTime() >= cutoff);
    if (rows.some((r) => r.updateId === updateId)) return false;
    rows.push({ updateId, processedAt: new Date().toISOString() });
    writeLocalUpdates(rows);
    return true;
  } catch (err) {
    console.warn('[telegram/idempotency] local file fallback failed', err);
    return true;
  }
}

/** Allow Telegram to retry after a failed processing attempt. */
export async function releaseTelegramUpdate(updateId: number): Promise<void> {
  if (!Number.isFinite(updateId)) return;

  if (isSupabaseConfigured()) {
    const sb = supabaseAdmin();
    const { error } = await sb.from('telegram_processed_updates').delete().eq('update_id', updateId);
    if (!error || isMissingTableError(error.message)) return;
    console.warn('[telegram/idempotency] release failed', error.message);
  }

  if (isServerlessRuntime()) return;

  try {
    const rows = readLocalUpdates().filter((r) => r.updateId !== updateId);
    writeLocalUpdates(rows);
  } catch {
    // Best effort only.
  }
}
