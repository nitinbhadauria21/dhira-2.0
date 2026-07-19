import type { DhiraStore } from './types';
import { LocalStore } from './localStore';
import { SupabaseStore } from './supabaseStore';

/**
 * Picks the storage backend once, based on configuration:
 * - If the Supabase service-role key is set → save to Supabase (cloud demo).
 * - Otherwise → save to a local JSON file (single laptop / partial setup).
 *
 * Auth can turn on with just the project URL + publishable (anon) key.
 * Cloud saving needs the secret service-role key too.
 */

let store: DhiraStore | null = null;

function looksLikePlaceholder(value: string | undefined): boolean {
  if (!value?.trim()) return true;
  const v = value.trim().toLowerCase();
  return (
    v.includes('dummy') ||
    v.includes('your-') ||
    v.includes('updateyour') ||
    v === 'changeme'
  );
}

/** Project URL + publishable/anon key present → browser Auth against Supabase. */
export function isSupabaseAuthConfigured(): boolean {
  return Boolean(
    !looksLikePlaceholder(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      !looksLikePlaceholder(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
}

/** URL + service-role/secret key → server store writes to Supabase Postgres. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    !looksLikePlaceholder(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      !looksLikePlaceholder(process.env.SUPABASE_SERVICE_ROLE_KEY),
  );
}

export function getStore(): DhiraStore {
  if (store) return store;
  store = isSupabaseConfigured() ? new SupabaseStore() : new LocalStore();
  return store;
}

/** Test helper: clear the cached store after env changes in the same process. */
export function resetStoreForTests(): void {
  store = null;
}
