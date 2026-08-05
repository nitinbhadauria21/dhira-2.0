'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Browser Supabase client (PKCE + cookie storage via @supabase/ssr).
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
  if (!cached) {
    cached = createBrowserClient(url as string, anon as string);
  }
  return cached;
}

/** @deprecated use getBrowserSupabase — kept for imports that expected supabaseBrowser path */
export { getBrowserSupabase as default };
