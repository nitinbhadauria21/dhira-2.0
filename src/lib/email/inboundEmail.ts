import { after } from 'next/server';
import { getStore } from '@/lib/store';
import { resolveNotificationEmail } from '@/lib/email/address';
import { runChatTurn } from '@/lib/chatFlow';
import { runChatTurnPostReplyEnrichment } from '@/lib/chatTurnPostReply';
import { CRISIS_MESSAGE } from '@/lib/safetyCopy';
import { sendEmail } from '@/lib/email/resend';
import { extractReplyText, parseEmailAddress } from '@/lib/email/parseInbound';

const FAILURE_MESSAGE =
  "I'm having a little trouble responding right now. Give me a moment and try again.";

const UNLINKED_MESSAGE =
  'Please add your email under Check-ins on your Dhira Profile (and turn on Email notifications) so I know it is you.';

function truncateSubject(reply: string): string {
  const base = reply.replace(/\s+/g, ' ').trim().slice(0, 60);
  return base ? `Re: ${base}${base.length >= 60 ? '…' : ''}` : 'Dhira';
}

/**
 * Handle an inbound email reply (same Dhira pipeline as web chat and Telegram).
 */
export async function handleInboundEmailMessage(params: {
  from: string;
  text: string;
  subject?: string;
  inReplyTo?: string;
  references?: string;
}): Promise<void> {
  const fromEmail = parseEmailAddress(params.from);
  const body = extractReplyText(params.text);
  if (!fromEmail || !body) return;

  const store = getStore();
  const profile = await store.getProfileByEmail(fromEmail);

  if (!profile || !resolveNotificationEmail(profile)) {
    console.info('[email/inbound] unlinked sender', { from: '[redacted]' });
    if (fromEmail) {
      await sendEmail({
        to: fromEmail,
        subject: 'Connect your Dhira Profile',
        text: UNLINKED_MESSAGE,
      });
    }
    return;
  }

  try {
    const { result: turn, postReply } = await runChatTurn({
      uid: profile.id,
      userMessage: body,
      channel: 'email',
    });
    if (postReply) {
      after(() => runChatTurnPostReplyEnrichment(postReply));
    }

    const outbound =
      turn.crisis && !turn.reply.includes('14416') ? CRISIS_MESSAGE : turn.reply;

    const to = resolveNotificationEmail(profile)!;
    const headers: Record<string, string> = {};
    if (params.inReplyTo) headers['In-Reply-To'] = params.inReplyTo;
    if (params.references) headers['References'] = params.references;

    await sendEmail({
      to,
      subject: params.subject?.startsWith('Re:') ? params.subject : truncateSubject(body),
      text: outbound,
      replyTo: process.env.EMAIL_REPLY_TO?.trim() || undefined,
      headers: Object.keys(headers).length ? headers : undefined,
    });

    console.info('[email/inbound] turn complete', {
      uid: profile.id.slice(0, 8),
      brainUsed: turn.brainUsed,
      riskLevel: turn.riskLevel,
      crisis: turn.crisis,
      replyLen: outbound.length,
    });
  } catch (err) {
    console.error('[email/inbound] handle error', err);
    const to = resolveNotificationEmail(profile);
    if (to) {
      await sendEmail({ to, subject: 'Dhira', text: FAILURE_MESSAGE });
    }
  }
}
