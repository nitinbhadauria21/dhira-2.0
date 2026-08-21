/**
 * Resend email delivery — server-only. Never import from client components.
 */

import { escapeXml } from '@/lib/twilio/inboundWhatsApp';

const EMAIL_ENABLED = process.env.EMAIL_ENABLED === 'true';

export function isEmailEnabled(): boolean {
  return (
    EMAIL_ENABLED &&
    !!process.env.RESEND_API_KEY?.trim() &&
    !!process.env.EMAIL_FROM?.trim()
  );
}

export type EmailProviderMode = 'resend' | 'emergent' | 'simulated';

export function resolveEmailProviderMode(): EmailProviderMode {
  if (isEmailEnabled()) return 'resend';
  if (process.env.EMERGENT_NOTIFY_WEBHOOK_URL?.trim()) return 'emergent';
  return 'simulated';
}

export type EmailVerifyResult =
  | { ok: true }
  | { ok: false; reason: string };

/** Confirm Resend API key is valid before sending from Profile test. */
export async function verifyEmailProvider(): Promise<EmailVerifyResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, reason: 'RESEND_API_KEY is not configured on the server.' };
  }
  if (!process.env.EMAIL_FROM?.trim()) {
    return { ok: false, reason: 'EMAIL_FROM is not configured on the server.' };
  }
  try {
    const res = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.status === 401) {
      return { ok: false, reason: 'The Resend API key is invalid. Update RESEND_API_KEY on Vercel.' };
    }
    if (!res.ok) {
      return { ok: false, reason: `Resend check failed (HTTP ${res.status}).` };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: 'Could not reach Resend to verify the API key.' };
  }
}

export type SendEmailParams = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  headers?: Record<string, string>;
};

export type SendEmailResult =
  | { ok: true; messageId: string }
  | { ok: false; description?: string };

/** Send via Resend REST API. No retries. */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !from) {
    return { ok: false, description: 'Email provider not configured' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: params.subject,
        text: params.text,
        html: params.html ?? plainTextToHtml(params.text),
        reply_to: params.replyTo,
        headers: params.headers,
      }),
    });

    const body = (await res.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
      name?: string;
    };

    if (res.ok && body.id) {
      return { ok: true, messageId: body.id };
    }

    const desc = body.message ?? body.name ?? `HTTP ${res.status}`;
    console.error('[email/resend] send failed', { to: '[redacted]', description: desc });
    return { ok: false, description: desc };
  } catch (err) {
    console.error('[email/resend] send error', err);
    return { ok: false, description: 'network error' };
  }
}

function plainTextToHtml(text: string): string {
  return `<pre style="font-family:system-ui,sans-serif;white-space:pre-wrap;margin:0">${escapeXml(text)}</pre>`;
}

/** HTML wrapper aligned with docs/emergent/TEMPLATES.md check-in email. */
export function buildCheckinEmailHtml(alias: string, content: string, footerExtra?: string): string {
  const safeAlias = escapeXml(alias);
  const safeContent = escapeXml(content);
  const footer =
    footerExtra ??
    "Whenever you're ready, open Dhira and talk — I'm listening, not advising.\n\nIf things feel overwhelming, India's Tele-MANAS helpline is available 24×7 at 14416.";
  const safeFooter = escapeXml(footer);
  return `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#1a1a1a">
<p>Hi ${safeAlias},</p>
<p style="white-space:pre-wrap">${safeContent}</p>
<p style="white-space:pre-wrap">${safeFooter}</p>
<p>— Dhira</p>
</body></html>`;
}

export function checkinEmailPlainText(alias: string, content: string, footerExtra?: string): string {
  const footer =
    footerExtra ??
    "Whenever you're ready, open Dhira and talk — I'm listening, not advising.\n\nIf things feel overwhelming, India's Tele-MANAS helpline is available 24×7 at 14416.";
  return `Hi ${alias},\n\n${content}\n\n${footer}\n\n— Dhira`;
}
