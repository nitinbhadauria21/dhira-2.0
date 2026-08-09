import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';
import { getStore, isSupabaseConfigured } from '@/lib/store';
import { runChatTurn } from '@/lib/chatFlow';
import { newUserId } from '@/lib/auth';
import { normalizePhoneE164, phoneE164LookupVariants } from '@/lib/twilio/phone';
import { CRISIS_MESSAGE } from '@/lib/safetyCopy';

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

/** Twilio WhatsApp body limit (chars). */
const WHATSAPP_REPLY_MAX = 4000;

export function twimlMessage(message: string): NextResponse {
  const body =
    message.length > WHATSAPP_REPLY_MAX
      ? `${message.slice(0, WHATSAPP_REPLY_MAX - 1)}…`
      : message;
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(body)}</Message></Response>`;
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

/** Mask phone for logs (e.g. +91******3210). */
export function maskPhoneForLog(e164OrRaw: string): string {
  const bare = normalizePhoneE164(e164OrRaw);
  if (bare.length < 6) return '***';
  return `${bare.slice(0, 3)}******${bare.slice(-4)}`;
}

/**
 * Public URL Twilio signed when POSTing this webhook.
 * Prefer the incoming request host (what Twilio actually called), then APP_URL, then override env.
 */
export function twilioWebhookUrl(req: NextRequest): string {
  const override = process.env.TWILIO_WEBHOOK_PUBLIC_URL?.trim();
  if (override) return override.replace(/\/$/, '');

  const path = req.nextUrl.pathname;
  const hostHeader = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  if (hostHeader) {
    const host = hostHeader.split(',')[0]?.trim();
    const proto = (req.headers.get('x-forwarded-proto') ?? 'https').split(',')[0]?.trim() || 'https';
    if (host) return `${proto}://${host}${path}`;
  }

  const base = (process.env.APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
  if (base) return `${base}${path}`;
  return req.url.split('?')[0] ?? path;
}

/** Candidate URLs to try for signature validation (Twilio signs the configured webhook URL). */
export function twilioWebhookUrlCandidates(req: NextRequest): string[] {
  const primary = twilioWebhookUrl(req);
  const path = req.nextUrl.pathname;
  const base = (process.env.APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
  const fromAppUrl = base ? `${base}${path}` : null;

  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of [primary, fromAppUrl]) {
    if (u && !seen.has(u)) {
      seen.add(u);
      out.push(u);
    }
  }
  return out;
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
  const candidates = twilioWebhookUrlCandidates(req);
  let valid = false;
  let matchedUrl = url;
  for (const candidate of candidates) {
    if (twilio.validateRequest(authToken, signature, candidate, params)) {
      valid = true;
      matchedUrl = candidate;
      break;
    }
  }
  if (!valid) {
    console.warn('[twilio/inbound] invalid Twilio signature', { tried: candidates });
    return new NextResponse('Forbidden', { status: 403 });
  }

  console.info('[twilio/inbound] signature ok', { url: matchedUrl });
  return null;
}

async function findOrCreateProfileByPhone(phoneE164: string): Promise<string> {
  const phone = normalizePhoneE164(phoneE164);
  const store = getStore();

  const existing = await store.getProfileByPhoneE164(phone);
  if (existing) {
    const patch: Parameters<typeof store.updateProfile>[1] = {
      phoneE164: phone,
      whatsappOptIn: true,
    };
    if (!existing.preferredChannel) patch.preferredChannel = 'whatsapp';
    await store.updateProfile(existing.id, patch);
    return existing.id;
  }

  if (isSupabaseConfigured()) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    const sb = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const variants = phoneE164LookupVariants(phone);
    for (const v of variants) {
      const { data: list } = await sb.auth.admin.listUsers({ perPage: 1000 });
      const match = list?.users?.find((u) => u.phone === v || u.phone === phone);
      if (match?.id) {
        await store.getOrCreateProfile(match.id);
        await store.updateProfile(match.id, {
          phoneE164: phone,
          whatsappOptIn: true,
          preferredChannel: 'whatsapp',
        });
        return match.id;
      }
    }

    const { data: created, error } = await sb.auth.admin.createUser({
      phone,
      phone_confirm: true,
      user_metadata: { source: 'whatsapp', alias: 'Friend' },
    });

    let uid: string | null = created?.user?.id ?? null;

    if (error && !uid) {
      const { data: list } = await sb.auth.admin.listUsers({ perPage: 1000 });
      const match = list?.users?.find(
        (u) =>
          u.phone === phone ||
          variants.some((v) => u.phone === v),
      );
      uid = match?.id ?? null;
    }

    if (!uid) {
      throw error ?? new Error('Could not create or resolve WhatsApp user in Supabase Auth');
    }

    await store.getOrCreateProfile(uid);
    await store.updateProfile(uid, {
      phoneE164: phone,
      alias: 'Friend',
      preferredChannel: 'whatsapp',
      whatsappOptIn: true,
    });
    return uid;
  }

  let user = await store.getAuthUserByPhone(phone);
  if (!user) {
    const id = newUserId();
    user = {
      id,
      email: null,
      phoneE164: phone,
      passwordHash: null,
      createdAt: new Date().toISOString(),
    };
    await store.createAuthUser(user);
  }

  await store.getOrCreateProfile(user.id);
  await store.updateProfile(user.id, {
    phoneE164: phone,
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
    const turn = await runChatTurn({ uid, userMessage: body, channel: 'whatsapp' });
    const outbound =
      turn.crisis && !turn.reply.includes('14416') ? CRISIS_MESSAGE : turn.reply;
    console.info('[twilio/inbound] turn complete', {
      uid: uid.slice(0, 8),
      brainUsed: turn.brainUsed,
      riskLevel: turn.riskLevel,
      crisis: turn.crisis,
      replyLen: outbound.length,
    });
    return twimlMessage(outbound);
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
  console.info('[twilio/inbound] webhook POST', {
    path: req.nextUrl.pathname,
    from: maskPhoneForLog(params.From ?? ''),
    bodyLen: (params.Body ?? '').length,
  });
  const forbidden = validateTwilioRequest(req, params);
  if (forbidden) return forbidden;
  return handleInboundWhatsApp(params);
}
