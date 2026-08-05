import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isSupabaseAuthConfigured } from '@/lib/store';

function supabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL as string;
}

function supabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
}

/** Server Supabase client (PKCE cookies). Returns null when Auth is not configured. */
export async function createServerSupabase() {
  if (!isSupabaseAuthConfigured()) return null;

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          /* setAll from a Server Component — route handlers can still set cookies */
        }
      },
    },
  });
}
