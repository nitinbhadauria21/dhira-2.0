'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Browser Supabase client — used only for password-reset OTP flows.
 * Sign-in and Google OAuth go through server routes (/api/auth/signin, /api/auth/google).
 */
let cached: SupabaseClient | null = null;
let initPromise: Promise<SupabaseClient | null> | null = null;

const INIT_TIMEOUT_MS = 8000;

function looksLikePlaceholder(value: string | undefined): boolean {
  if (!value?.trim()) return true;
  const v = value.trim().toLowerCase();
  return v.includes('dummy') || v.includes('your-') || v.includes('updateyour') || v === 'changeme';
}

async function resolveSupabaseCredentials(): Promise<{ url: string; anonKey: string } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), INIT_TIMEOUT_MS);
  try {
    const res = await fetch('/api/auth/supabase-config', {
      cache: 'no-store',
      credentials: 'same-origin',
      signal: controller.signal,
    });
    if (res.ok) {
      const data = (await res.json()) as { configured?: boolean; url?: string; anonKey?: string };
      if (data.configured && data.url && data.anonKey) {
        return { url: data.url, anonKey: data.anonKey };
      }
    }
  } catch {
    /* fall back to build-time embed */
  } finally {
    clearTimeout(timer);
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
      try {
        const creds = await resolveSupabaseCredentials();
        if (!creds) return null;
        cached = createBrowserClient(creds.url, creds.anonKey);
        return cached;
      } catch {
        return null;
      } finally {
        initPromise = null;
      }
    })();
  }
  return initPromise;
}

export function getBrowserSupabase(): SupabaseClient | null {
  return cached;
}

export { getBrowserSupabaseAsync as default };
