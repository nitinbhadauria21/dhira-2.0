import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getStore } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/elevenlabs/sync
 * 
 * This is a "Webhook Tool" for the ElevenLabs Native Agent.
 * When the conversation ends (or when the agent decides it's a good time),
 * it hits this endpoint to sync the conversation data back to Dhira's DB.
 * 
 * Expected JSON payload from ElevenLabs:
 * {
 *   "phoneNumber": "+1234567890",
 *   "summary": "Brief summary of the conversation...",
 *   "carryForward": "Something to remember for next time...",
 *   "mood": "anxious",      // e.g. anxious, sad, neutral, hopeful
 *   "topicTag": "work"      // e.g. work, family, relationships, health, finances, self
 * }
 */
export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      // Ignored, might be empty
    }
    
    const searchParams = req.nextUrl.searchParams;

    const phoneNumber = body.phoneNumber || searchParams.get('phoneNumber');
    const summary = body.summary || searchParams.get('summary');
    const carryForward = body.carryForward || searchParams.get('carryForward');
    const mood = body.mood || searchParams.get('mood') || 'neutral';
    const topicTag = body.topicTag || searchParams.get('topicTag') || 'self';

    // Standardize phone number format (just in case)
    const phoneE164 = phoneNumber ? phoneNumber.replace('whatsapp:', '').trim() : null;

    const store = getStore();
    const profiles = await store.allProfiles();

    // 1. Try exact phone match
    let userProfile = phoneE164
      ? profiles.find(p => p.phoneE164 === phoneE164)
      : undefined;

    // 2. Try email match (for web widget sessions where phone is an email)
    if (!userProfile && phoneE164 && phoneE164.includes('@')) {
      userProfile = profiles.find(p => p.email === phoneE164);
    }

    // 3. Fall back to most recently created profile (solo testing via web widget)
    if (!userProfile && profiles.length > 0) {
      userProfile = profiles.sort((a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      )[0];
    }

    if (!userProfile) {
      return NextResponse.json({ error: 'No user profile found' }, { status: 404 });
    }

    const uid = userProfile.id;
    const now = new Date().toISOString();

    // 1. Log the Mood (Best effort mapping)
    // Approximate valence/intensity based on the string.
    let valence = 0;
    let intensity = 0.5;
    const m = mood.toLowerCase();
    if (['sad', 'anxious', 'overwhelmed', 'lonely', 'angry'].includes(m)) valence = -0.5;
    if (['hopeful', 'calm', 'better', 'good'].includes(m)) valence = 0.5;

    await store.addMood({
      id: randomUUID(),
      profileId: uid,
      mood: m,
      valence,
      emotionalIntensity: intensity,
      topicTag: topicTag.toLowerCase(),
      source: 'elevenlabs',
      createdAt: now,
    });

    // 2. Save the Memory
    if (summary) {
      await store.addMemory({
        id: randomUUID(),
        profileId: uid,
        summary,
        mood: m,
        topicTag: topicTag.toLowerCase(),
        carryForward: carryForward || '',
        createdAt: now,
      });
    }

    return NextResponse.json({ success: true, message: 'Synced successfully to Dhira.' });

  } catch (err) {
    console.error('[api/elevenlabs/sync] error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
