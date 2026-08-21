import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/store';

const LOCAL_FILE = path.join(process.cwd(), '.data', 'email-processed-messages.json');
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

function readLocal(): { messageId: string; processedAt: string }[] {
  try {
    return JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf-8')) as { messageId: string; processedAt: string }[];
  } catch {
    return [];
  }
}

function writeLocal(rows: { messageId: string; processedAt: string }[]): void {
  fs.mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(rows, null, 2), 'utf-8');
}

function isDuplicateKeyError(message: string | undefined): boolean {
  return /duplicate|unique|23505/i.test(message ?? '');
}

function isMissingTableError(message: string | undefined): boolean {
  return /email_processed_messages|PGRST205|schema cache|does not exist/i.test(message ?? '');
}

export async function claimEmailMessage(messageId: string): Promise<boolean> {
  const id = messageId.trim();
  if (!id) return true;

  if (isSupabaseConfigured()) {
    const sb = supabaseAdmin();
    const { error } = await sb.from('email_processed_messages').insert({
      message_id: id,
      processed_at: new Date().toISOString(),
    });
    if (!error) return true;
    if (isDuplicateKeyError(error.message)) return false;
    if (isMissingTableError(error.message)) {
      console.warn(
        '[email/idempotency] email_processed_messages missing — apply migration 20260822_email_inbound_idempotency.sql',
      );
      return true;
    }
    console.warn('[email/idempotency] supabase insert failed', error.message);
  }

  if (isServerlessRuntime()) return true;

  try {
    const cutoff = Date.now() - LOCAL_RETENTION_MS;
    const rows = readLocal().filter((r) => new Date(r.processedAt).getTime() >= cutoff);
    if (rows.some((r) => r.messageId === id)) return false;
    rows.push({ messageId: id, processedAt: new Date().toISOString() });
    writeLocal(rows);
    return true;
  } catch {
    return true;
  }
}

export async function releaseEmailMessage(messageId: string): Promise<void> {
  const id = messageId.trim();
  if (!id) return;

  if (isSupabaseConfigured()) {
    const sb = supabaseAdmin();
    await sb.from('email_processed_messages').delete().eq('message_id', id);
  }

  if (isServerlessRuntime()) return;

  try {
    writeLocal(readLocal().filter((r) => r.messageId !== id));
  } catch {
    /* best effort */
  }
}
