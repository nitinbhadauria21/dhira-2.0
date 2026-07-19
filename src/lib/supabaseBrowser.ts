'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Browser Supabase client, only when the project URL + publishable key are set.
 * Returns null in offline/dev mode so callers fall back to /api/auth/* .
 */
let cached: SupabaseClient | null = null;

function looksLikePlaceholder(value: string | undefined): boolean {
  if (!value?.trim()) return true;
  const v = value.trim().toLowerCase();
  return v.includes('dummy') || v.includes('your-') || v.includes('updateyour') || v === 'changeme';
}

export function getBrowserSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (looksLikePlaceholder(url) || looksLikePlaceholder(anon)) return null;
  if (!cached) cached = createClient(url as string, anon as string);
  return cached;
}
