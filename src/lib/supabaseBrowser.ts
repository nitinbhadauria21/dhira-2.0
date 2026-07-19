'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Browser Supabase client, only when configured (live mode). Returns null in
 * dev mode so callers fall back to the app's own /api/auth/* endpoints.
 */
let cached: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon || url.includes('dummy') || anon.includes('dummy')) return null;
  if (!cached) cached = createClient(url, anon);
  return cached;
}
