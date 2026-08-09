import { randomUUID } from 'crypto';
import twilio from 'twilio';
import { normalizeTwilioWhatsAppAddress } from '@/lib/twilio/phone';
import { getStore } from '@/lib/store';
import type { NotifyChannel, NotificationType, Profile, NotificationRecord } from '@/lib/types';

/**
 * Notification delivery via Emergent.
 *
 * Plain English: we write a row describing the message (so it shows in the
 * user's in-app inbox and admin analytics), then hand it to an Emergent
 * workflow webhook, which actually sends the email / WhatsApp using its own
 * provider vault. Emergent later calls /api/notifications/callback to tell us
 * whether it was delivered.
 *
 * With no Emergent webhook configured (dev/demo), we simply mark it "sent" so
 * the whole flow is demonstrable without external accounts.
 */

const WHATSAPP_ENABLED = process.env.WHATSAPP_ENABLED === 'true';

/** Pick the channel to use for this user, honoring consent + availability. */
export function resolveChannel(profile: Profile): NotifyChannel | null {
  const canEmail = profile.emailOptIn && !!profile.email;
  const canWhatsapp = WHATSAPP_ENABLED && profile.whatsappOptIn && !!profile.phoneE164;

  if (profile.preferredChannel === 'whatsapp' && canWhatsapp) return 'whatsapp';
  if (profile.preferredChannel === 'email' && canEmail) return 'email';
  if (canEmail) return 'email';
  if (canWhatsapp) return 'whatsapp';
  return null;
}

export function templateFor(type: NotificationType, channel: NotifyChannel): { templateKey: string; subject: string | null } {
  if (type === 'weekly_summary') {
    return {
      templateKey: channel === 'whatsapp' ? 'dhira_weekly_v1' : 'dhira_weekly_email_v1',
      subject: channel === 'email' ? 'Your week with Dhira' : null,
    };
  }
  if (type === 'crisis_followup') {
    return {
      templateKey: channel === 'whatsapp' ? 'dhira_crisis_v1' : 'dhira_crisis_email_v1',
      subject: channel === 'email' ? 'Dhira is here — please reach out for support' : null,
    };
  }
  return {
    templateKey: channel === 'whatsapp' ? 'dhira_checkin_v1' : 'dhira_checkin_email_v1',
    subject: channel === 'email' ? 'Just checking in — no pressure' : null,
  };
}

export interface EnqueueParams {
  profile: Profile;
  type: NotificationType;
  content: string;
  channel?: NotifyChannel;
  scheduledFor?: string | null;
}

/** Create a notification row and attempt delivery through Emergent. */
export async function enqueueAndSend(params: EnqueueParams): Promise<NotificationRecord | null> {
  const channel = params.channel ?? resolveChannel(params.profile);
  if (!channel) return null;

  const { templateKey, subject } = templateFor(params.type, channel);
  const store = getStore();
  const now = new Date().toISOString();
  const record: NotificationRecord = {
    id: randomUUID(),
    profileId: params.profile.id,
    channel,
    type: params.type,
    content: params.content,
    status: 'queued',
    providerMessageId: null,
    scheduledFor: params.scheduledFor ?? null,
    sentAt: null,
    createdAt: now,
    templateKey,
    subject,
  };
  await store.addNotification(record);

  if (channel === 'whatsapp') {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      await store.updateNotificationStatus(record.id, 'sent', 'dev-simulated');
      return { ...record, status: 'sent', providerMessageId: 'dev-simulated' };
    }

    try {
      const client = twilio(accountSid, authToken);
      const toPhone = params.profile.phoneE164;
      if (!toPhone) throw new Error('Missing phone number');

      const message = await client.messages.create({
        from: normalizeTwilioWhatsAppAddress(fromNumber),
        to: normalizeTwilioWhatsAppAddress(toPhone),
        body: params.content,
      });

      await store.updateNotificationStatus(record.id, 'sent', message.sid);
      return { ...record, status: 'sent', providerMessageId: message.sid };
    } catch (error) {
      console.error('Twilio Error:', error);
      await store.updateNotificationStatus(record.id, 'failed');
      return { ...record, status: 'failed' };
    }
  }

  // Fallback for Email channel -> Emergent
  const webhook = process.env.EMERGENT_NOTIFY_WEBHOOK_URL?.trim();
  if (!webhook) {
    await store.updateNotificationStatus(record.id, 'sent', 'dev-simulated');
    return { ...record, status: 'sent', providerMessageId: 'dev-simulated' };
  }

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-emergent-secret': process.env.EMERGENT_WEBHOOK_SECRET ?? '',
      },
      body: JSON.stringify({
        notificationId: record.id,
        channel,
        to: params.profile.email,
        type: params.type,
        templateKey,
        subject,
        alias: params.profile.alias,
        language: params.profile.language,
        content: params.content,
        callbackUrl: process.env.APP_URL ? `${process.env.APP_URL}/api/notifications/callback` : undefined,
      }),
    });

    let providerMessageId: string | null = null;
    try {
      const body = (await res.json()) as { providerMessageId?: string; id?: string };
      providerMessageId = body.providerMessageId ?? body.id ?? null;
    } catch {
      /* Emergent may return empty body */
    }

    await store.updateNotificationStatus(record.id, res.ok ? 'sent' : 'failed', providerMessageId);
    return { ...record, status: res.ok ? 'sent' : 'failed', providerMessageId };
  } catch {
    await store.updateNotificationStatus(record.id, 'failed');
    return { ...record, status: 'failed' };
  }
}
