import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';
import { getStore, isSupabaseConfigured } from '@/lib/store';
import { runChatTurn } from '@/lib/chatFlow';
import { newUserId } from '@/lib/auth';
import { normalizePhoneE164 } from '@/lib/twilio/phone';

export function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

export function twimlMessage(message: string): NextResponse {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`;
  return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
}

/** Parse Twilio application/x-www-form-urlencoded body (already read as text). */
export function parseTwilioFormBody(text: string): Record<string, string> {
  const params: Record<string, string> = {};
  new URLSearchParams(text).forEach((v, k) => {
    params[k] = v;
  });
  return params;
}

function shouldValidateTwilioSignature(): boolean {
  if (process.env.TWILIO_VALIDATE_WEBHOOK === 'false') return false;
  return !!process.env.TWILIO_AUTH_TOKEN?.trim();
}

/** Public URL Twilio posted to (APP_URL + path). */
export function twilioWebhookUrl(req: NextRequest): string {
  const base = (process.env.APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
  const path = req.nextUrl.pathname;
  if (base) return `${base}${path}`;
  return req.url.split('?')[0] ?? path;
}

export function validateTwilioRequest(
  req: NextRequest,
  params: Record<string, string>,
): NextResponse | null {
  if (!shouldValidateTwilioSignature()) return null;

  const authToken = process.env.TWILIO_AUTH_TOKEN!.trim();
  const signature = req.headers.get('x-twilio-signature') ?? '';
  if (!signature) {
    console.warn('[twilio/inbound] missing X-Twilio-Signature');
    return new NextResponse('Forbidden', { status: 403 });
  }

  const url = twilioWebhookUrl(req);
  const valid = twilio.validateRequest(authToken, signature, url, params);
  if (!valid) {
    console.warn('[twilio/inbound] invalid Twilio signature', { url });
    return new NextResponse('Forbidden', { status: 403 });
  }

  return null;
}

async function findOrCreateProfileByPhone(phoneE164: string): Promise<string> {
  const store = getStore();
  const profiles = await store.allProfiles();
  const byPhone = profiles.find((p) => p.phoneE164 === phoneE164);
  if (byPhone) return byPhone.id;

  if (isSupabaseConfigured()) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    const sb = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: created, error } = await sb.auth.admin.createUser({
      phone: phoneE164,
      phone_confirm: true,
      user_metadata: { source: 'whatsapp', alias: 'Friend' },
    });

    let uid: string | null = created?.user?.id ?? null;

    if (error && !uid) {
      const { data: list } = await sb.auth.admin.listUsers({ perPage: 1000 });
      const match = list?.users?.find((u) => u.phone === phoneE164 || u.phone === phoneE164.replace('+', ''));
      uid = match?.id ?? null;
    }

    if (!uid) {
      throw error ?? new Error('Could not create or resolve WhatsApp user in Supabase Auth');
    }

    await store.getOrCreateProfile(uid);
    await store.updateProfile(uid, {
      phoneE164,
      alias: 'Friend',
      preferredChannel: 'whatsapp',
      whatsappOptIn: true,
    });
    return uid;
  }

  let user = await store.getAuthUserByPhone(phoneE164);
  if (!user) {
    const id = newUserId();
    user = {
      id,
      email: null,
      phoneE164,
      passwordHash: null,
      createdAt: new Date().toISOString(),
    };
    await store.createAuthUser(user);
  }

  await store.getOrCreateProfile(user.id);
  await store.updateProfile(user.id, {
    phoneE164,
    alias: 'Friend',
    preferredChannel: 'whatsapp',
    whatsappOptIn: true,
  });
  return user.id;
}

/**
 * Handle an inbound WhatsApp message from Twilio (same safety pipeline as /api/chat).
 */
export async function handleInboundWhatsApp(params: Record<string, string>): Promise<NextResponse> {
  const fromRaw = params.From ?? '';
  const body = (params.Body ?? '').trim();
  const phoneE164 = normalizePhoneE164(fromRaw);

  if (!phoneE164 || !body) {
    return twimlMessage("Hi! I didn't catch that. How are you feeling today?");
  }

  try {
    const uid = await findOrCreateProfileByPhone(phoneE164);
    const turn = await runChatTurn({ uid, userMessage: body });
    return twimlMessage(turn.reply);
  } catch (err) {
    console.error('[twilio/inbound] handle error', err);
    return twimlMessage(
      'Dhira is here — something went a little sideways. Please try again in a moment. 🙏',
    );
  }
}

export async function processTwilioWhatsAppWebhook(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text();
  const params = parseTwilioFormBody(rawBody);
  const forbidden = validateTwilioRequest(req, params);
  if (forbidden) return forbidden;
  return handleInboundWhatsApp(params);
}
