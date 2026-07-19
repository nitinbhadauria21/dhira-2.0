import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { runChatTurn } from '@/lib/chatFlow';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/chat  { message }  → { reply, crisis, showReferralCard, riskLevel } */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    const uid = await getUserId();
    if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    const result = await runChatTurn({ uid, userMessage: message });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[api/chat] error', err);
    return NextResponse.json({ error: 'Something went wrong talking to Dhira.' }, { status: 500 });
  }
}
