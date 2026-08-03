import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getStore } from '@/lib/store';
import { getUserId } from '@/lib/auth';
import { normalizeMood, normalizeTopic, valenceForMood } from '@/lib/moodNormalize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/elevenlabs/sync
 *
 * Webhook tool for the ElevenLabs agent (external) AND authenticated app calls.
 * Prefer session cookie (web widget). Phone/email matching remains for WhatsApp tools.
 *
 * Expected JSON:
 * {
 *   "phoneNumber": "+91...",   // optional when session cookie is present
 *   "summary": "...",
 *   "carryForward": "...",
 *   "mood": "anxious",
 *   "topicTag": "work"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const searchParams = req.nextUrl.searchParams;
    const phoneNumber =
      (typeof body.phoneNumber === 'string' && body.phoneNumber) ||
      searchParams.get('phoneNumber');
    const summary =
      (typeof body.summary === 'string' && body.summary) || searchParams.get('summary') || '';
    const carryForward =
      (typeof body.carryForward === 'string' && body.carryForward) ||
      searchParams.get('carryForward') ||
      '';
    const moodRaw =
      (typeof body.mood === 'string' && body.mood) || searchParams.get('mood') || 'neutral';
    const topicRaw =
      (typeof body.topicTag === 'string' && body.topicTag) || searchParams.get('topicTag') || 'self';

    const store = getStore();
    const sessionUid = await getUserId();
    let uid = sessionUid;

    if (!uid) {
      const phoneE164 = phoneNumber ? phoneNumber.replace('whatsapp:', '').trim() : null;
      const profiles = await store.allProfiles();
      let userProfile = phoneE164
        ? profiles.find((p) => p.phoneE164 === phoneE164)
        : undefined;
      if (!userProfile && phoneE164?.includes('@')) {
        userProfile = profiles.find((p) => p.email === phoneE164);
      }
      // Dev-only fallback — never use newest-profile matching when a session exists.
      if (!userProfile && process.env.NODE_ENV !== 'production' && profiles.length > 0) {
        userProfile = profiles.sort(
          (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
        )[0];
      }
      if (!userProfile) {
        return NextResponse.json({ error: 'No user profile found' }, { status: 404 });
      }
      uid = userProfile.id;
    }

    const now = new Date().toISOString();
    const mood = normalizeMood(moodRaw);
    const topicTag = normalizeTopic(topicRaw);

    await store.addMood({
      id: randomUUID(),
      profileId: uid,
      mood,
      valence: valenceForMood(mood),
      emotionalIntensity: 0.5,
      topicTag,
      source: 'elevenlabs',
      createdAt: now,
    });

    if (summary) {
      await store.addMemory({
        id: randomUUID(),
        profileId: uid,
        summary,
        mood,
        topicTag,
        carryForward: carryForward || '',
        createdAt: now,
      });
    }

    return NextResponse.json({ success: true, message: 'Synced successfully to Dhira.', mood, topicTag });
  } catch (err) {
    console.error('[api/elevenlabs/sync] error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
