import { NextResponse } from 'next/server';
import { isLiveBrainEnabled } from '@/config/models';
import { isSupabaseAuthConfigured, isSupabaseConfigured } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/status → tells the UI whether the live Claude brain and Supabase
 * Auth / cloud database are switched on.
 */
export async function GET() {
  const supabaseAuth = isSupabaseAuthConfigured();
  const supabaseStore = isSupabaseConfigured();
  return NextResponse.json({
    host: 'cursor-local',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4028',
    liveBrain: isLiveBrainEnabled(),
    // Back-compat: "supabase" means cloud Auth is ready (URL + publishable key).
    supabase: supabaseAuth,
    supabaseAuth,
    supabaseStore,
  });
}
