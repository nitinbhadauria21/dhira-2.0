import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { handleInboundEmailMessage } from '@/lib/email/inboundEmail';
import { claimEmailMessage, releaseEmailMessage } from '@/lib/email/updateIdempotency';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type ResendInboundPayload = {
  type?: string;
  data?: {
    email_id?: string;
    from?: string;
    to?: string | string[];
    subject?: string;
    text?: string;
    html?: string;
    message_id?: string;
    in_reply_to?: string;
    references?: string;
  };
};

function verifyResendWebhook(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!secret) return true;

  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');
  if (!svixId || !svixTimestamp || !svixSignature) {
    return false;
  }

  try {
    const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
    const secretBytes = secret.startsWith('whsec_')
      ? Buffer.from(secret.slice(6), 'base64')
      : Buffer.from(secret, 'utf-8');

    const signatures = svixSignature.split(' ');
    for (const part of signatures) {
      const [version, sig] = part.split(',');
      if (version !== 'v1' || !sig) continue;
      const expected = createHmac('sha256', secretBytes).update(signedContent).digest('base64');
      const sigBuf = Buffer.from(sig);
      const expBuf = Buffer.from(expected);
      if (sigBuf.length === expBuf.length && timingSafeEqual(sigBuf, expBuf)) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/** POST /api/email/inbound/webhook — Resend inbound email.received events. */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  if (!verifyResendWebhook(req, rawBody)) {
    console.warn('[email/webhook] rejected — signature mismatch');
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let payload: ResendInboundPayload;
  try {
    payload = JSON.parse(rawBody) as ResendInboundPayload;
  } catch {
    return NextResponse.json({ ok: true });
  }

  if (payload.type !== 'email.received' || !payload.data) {
    return NextResponse.json({ ok: true });
  }

  const data = payload.data;
  const messageId = data.email_id ?? data.message_id ?? '';
  const from = data.from ?? '';
  const text = data.text ?? data.html?.replace(/<[^>]+>/g, ' ') ?? '';
  if (!from || !text.trim()) {
    return NextResponse.json({ ok: true });
  }

  console.info('[email/webhook] inbound', {
    messageId: messageId || null,
    subjectLen: (data.subject ?? '').length,
    textLen: text.length,
  });

  after(async () => {
    if (messageId) {
      const claimed = await claimEmailMessage(messageId);
      if (!claimed) {
        console.info('[email/webhook] duplicate message skipped', { messageId });
        return;
      }
    }
    try {
      await handleInboundEmailMessage({
        from,
        text,
        subject: data.subject,
        inReplyTo: data.in_reply_to,
        references: data.references,
      });
    } catch (err) {
      console.error('[email/webhook] inbound failed', err);
      if (messageId) await releaseEmailMessage(messageId);
    }
  });

  return NextResponse.json({ ok: true });
}
