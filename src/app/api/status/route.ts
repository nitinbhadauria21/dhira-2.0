import { NextResponse } from 'next/server';
import { isLiveBrainEnabled } from '@/config/models';
import { isSupabaseConfigured } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/status → tells the UI whether the live Claude brain and cloud
 * database are switched on. Used for a small, honest "mode" badge.
 */
export async function GET() {
  return NextResponse.json({
    liveBrain: isLiveBrainEnabled(),
    supabase: isSupabaseConfigured(),
  });
}
