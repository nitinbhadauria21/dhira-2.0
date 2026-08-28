'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Browser Supabase client (PKCE + cookie storage via @supabase/ssr).
 * Returns null in offline/dev mode so callers fall back to /api/auth/* .
 *
 * Prefers GET /api/auth/supabase-config (runtime server env) over build-time
 * NEXT_PUBLIC_* embeds so production sign-in survives env updates and stale JS cache.
 */
let cached: SupabaseClient | null = null;
let initPromise: Promise<SupabaseClient | null> | null = null;

function looksLikePlaceholder(value: string | undefined): boolean {
  if (!value?.trim()) return true;
  const v = value.trim().toLowerCase();
  return v.includes('dummy') || v.includes('your-') || v.includes('updateyour') || v === 'changeme';
}

async function resolveSupabaseCredentials(): Promise<{ url: string; anonKey: string } | null> {
  try {
    const res = await fetch('/api/auth/supabase-config', { cache: 'no-store', credentials: 'same-origin' });
    if (res.ok) {
      const data = (await res.json()) as { configured?: boolean; url?: string; anonKey?: string };
      if (data.configured && data.url && data.anonKey) {
        return { url: data.url, anonKey: data.anonKey };
      }
    }
  } catch {
    /* fall back to build-time embed */
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey || looksLikePlaceholder(url) || looksLikePlaceholder(anonKey)) {
    return null;
  }
  return { url, anonKey };
}

export async function getBrowserSupabaseAsync(): Promise<SupabaseClient | null> {
  if (cached) return cached;
  if (!initPromise) {
    initPromise = (async () => {
      const creds = await resolveSupabaseCredentials();
      if (!creds) return null;
      cached = createBrowserClient(creds.url, creds.anonKey);
      return cached;
    })();
  }
  return initPromise;
}

/** Sync accessor — only safe after async init warmed up elsewhere. */
export function getBrowserSupabase(): SupabaseClient | null {
  return cached;
}

/** @deprecated use getBrowserSupabaseAsync — kept for imports that expected supabaseBrowser path */
export { getBrowserSupabaseAsync as default };
