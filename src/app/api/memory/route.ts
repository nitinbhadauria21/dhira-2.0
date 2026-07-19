import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { getStore } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/memory → the latest "Dhira remembers" note for this user (or null). */
export async function GET() {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ memory: null }, { status: 401 });
    const store = getStore();
    const profile = await store.getOrCreateProfile(uid);
    if (!profile.consentMemory) return NextResponse.json({ memory: null });
    const memory = await store.getLatestMemory(uid);
    return NextResponse.json({ memory });
  } catch (err) {
    console.error('[api/memory] error', err);
    return NextResponse.json({ memory: null });
  }
}
