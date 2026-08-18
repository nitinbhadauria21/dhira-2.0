import { NextResponse } from 'next/server';
import { isLiveBrainEnabled } from '@/config/models';
import { isSupabaseAuthConfigured, isSupabaseConfigured } from '@/lib/store';
import { getLiveBrainTelemetry } from '@/lib/liveBrainTelemetry';
import { offlinePolicyLabel, allowOfflineDemo } from '@/lib/brainPolicy';
import { LIVE_PROMPT_VERSION } from '@/agents/prompts/agentPromptsLive';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/status → tells the UI whether the live Claude brain and Supabase
 * Auth / cloud database are switched on.
 */
export async function GET() {
  const supabaseAuth = isSupabaseAuthConfigured();
  const supabaseStore = isSupabaseConfigured();
  const telemetry = getLiveBrainTelemetry();
  const isDev = process.env.NODE_ENV === 'development';
  const gitCommit =
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
    process.env.DHIRA_GIT_SHA?.trim() ||
    'unknown';
  return NextResponse.json({
    host: 'cursor-local',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4028',
    liveBrain: isLiveBrainEnabled(),
    supabase: supabaseAuth,
    supabaseAuth,
    supabaseStore,
    lastBrainError: telemetry.lastBrainError,
    lastFallbackAt: telemetry.lastFallbackAt,
    fallbackCount: telemetry.fallbackCount,
    criticalFailureCount: telemetry.criticalFailureCount,
    lastBrainUsed: telemetry.lastBrainUsed,
    offlinePolicy: offlinePolicyLabel(),
    promptVersion: LIVE_PROMPT_VERSION,
    gitCommit,
    showOfflineBanner: isDev && allowOfflineDemo() && !isLiveBrainEnabled(),
  });
}
