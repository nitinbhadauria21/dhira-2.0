import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { runChatTurn } from '@/lib/chatFlow';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    const params = new URLSearchParams(text);
    
    const from = params.get('From') || '';
    const body = params.get('Body') || '';
    
    // Twilio sends From as "whatsapp:+1234567890"
    const phoneE164 = from.replace('whatsapp:', '').trim();
    
    if (!phoneE164 || !body) {
      return new NextResponse('Bad Request', { status: 400 });
    }

    const store = getStore();
    const profiles = await store.allProfiles();
    const userProfile = profiles.find(p => p.phoneE164 === phoneE164);

    let replyText = "I couldn't find your account. Please link this phone number in your Dhira Profile.";
    
    if (userProfile) {
      const turn = await runChatTurn({ uid: userProfile.id, userMessage: body });
      replyText = turn.reply;
    }

    const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(replyText)}</Message>
</Response>`;

    return new NextResponse(xmlResponse, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' }
    });
    
  } catch (err) {
    console.error('[api/twilio/webhook] error', err);
    
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Dhira is experiencing some technical difficulties. Please try again later.</Message>
</Response>`;

    return new NextResponse(fallbackXml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' }
    });
  }
}
