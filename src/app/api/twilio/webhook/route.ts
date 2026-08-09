import { NextRequest } from 'next/server';
import { processTwilioWhatsAppWebhook } from '@/lib/twilio/inboundWhatsApp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Legacy alias — same handler as /api/twilio/whatsapp. */
export async function POST(req: NextRequest) {
  return processTwilioWhatsAppWebhook(req);
}
