import type { DhiraStore } from './types';
import { LocalStore } from './localStore';
import { SupabaseStore } from './supabaseStore';

/**
 * Picks the storage backend once, based on configuration:
 * - If the Supabase keys are set → save to Supabase (good for a deployed demo).
 * - Otherwise → save to a local JSON file (good for a single laptop).
 */

let store: DhiraStore | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

export function getStore(): DhiraStore {
  if (store) return store;
  store = isSupabaseConfigured() ? new SupabaseStore() : new LocalStore();
  return store;
}
