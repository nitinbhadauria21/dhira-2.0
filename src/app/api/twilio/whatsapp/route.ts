import { NextRequest } from 'next/server';
import { processTwilioWhatsAppWebhook } from '@/lib/twilio/inboundWhatsApp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Twilio WhatsApp inbound — canonical webhook (TwiML reply). */
export async function POST(req: NextRequest) {
  return processTwilioWhatsAppWebhook(req);
}
