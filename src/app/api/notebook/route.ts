import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getUserId } from '@/lib/auth';
import { getStore } from '@/lib/store';
import type { MoodLabel, NotebookEntry } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MOODS: MoodLabel[] = [
  'happy',
  'calm',
  'neutral',
  'hopeful',
  'stressed',
  'lonely',
  'angry',
  'anxious',
  'overwhelmed',
  'sad',
];

function isMood(value: unknown): value is MoodLabel {
  return typeof value === 'string' && MOODS.includes(value as MoodLabel);
}

function cleanTopics(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value
    .filter((topic): topic is string => typeof topic === 'string')
    .map((topic) => topic.trim().toLowerCase().slice(0, 32))
    .filter(Boolean)
    .slice(0, 8);
}

/** GET /api/notebook?limit=20 -> current user's notebook entries. */
export async function GET(req: NextRequest) {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const rawLimit = Number(req.nextUrl.searchParams.get('limit') ?? 20);
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(100, Math.floor(rawLimit))) : 20;
    const entries = await getStore().getNotebookEntries(uid, limit);
    return NextResponse.json({ entries });
  } catch (err) {
    console.error('[api/notebook] GET error', err);
    return NextResponse.json({ error: 'could not load notebook entries' }, { status: 500 });
  }
}

/** POST /api/notebook -> create a Write/Speak notebook entry. */
export async function POST(req: NextRequest) {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const mode = body.mode === 'write' || body.mode === 'speak' ? body.mode : null;
    const entryBody = typeof body.body === 'string' ? body.body.trim().slice(0, 5000) : '';
    const topics = cleanTopics(body.topics);

    if (!mode) return NextResponse.json({ error: 'mode must be write or speak' }, { status: 400 });
    if (entryBody.length < 2) return NextResponse.json({ error: 'body is required' }, { status: 400 });
    if (!isMood(body.mood)) return NextResponse.json({ error: 'valid mood is required' }, { status: 400 });
    if (!topics) return NextResponse.json({ error: 'topics must be an array' }, { status: 400 });
    if (typeof body.shareWithDhira !== 'boolean') {
      return NextResponse.json({ error: 'shareWithDhira must be a boolean' }, { status: 400 });
    }

    const entry: NotebookEntry = {
      id: randomUUID(),
      profileId: uid,
      createdAt: new Date().toISOString(),
      mode,
      body: entryBody,
      mood: body.mood,
      topics,
      shareWithDhira: body.shareWithDhira,
    };

    await getStore().getOrCreateProfile(uid);
    await getStore().addNotebookEntry(entry);
    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    console.error('[api/notebook] POST error', err);
    return NextResponse.json({ error: 'could not save notebook entry' }, { status: 500 });
  }
}
