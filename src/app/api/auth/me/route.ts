import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { getStore } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/auth/me → { userId, profile } or { userId: null } when signed out. */
export async function GET() {
  const uid = await getUserId();
  if (!uid) return NextResponse.json({ userId: null });
  try {
    const profile = await getStore().getOrCreateProfile(uid);
    return NextResponse.json({ userId: uid, profile });
  } catch {
    return NextResponse.json({ userId: uid, profile: null });
  }
}
