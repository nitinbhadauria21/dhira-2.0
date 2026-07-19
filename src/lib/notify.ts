import { randomUUID } from 'crypto';
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
  // fall back to whichever is available
  if (canEmail) return 'email';
  if (canWhatsapp) return 'whatsapp';
  return null;
}

export interface EnqueueParams {
  profile: Profile;
  type: NotificationType;
  content: string;
  channel?: NotifyChannel; // override; otherwise resolved from profile
}

/** Create a notification row and attempt delivery through Emergent. */
export async function enqueueAndSend(params: EnqueueParams): Promise<NotificationRecord | null> {
  const channel = params.channel ?? resolveChannel(params.profile);
  if (!channel) return null; // no consented/available channel

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
    scheduledFor: null,
    sentAt: null,
    createdAt: now,
  };
  await store.addNotification(record);

  const webhook = process.env.EMERGENT_NOTIFY_WEBHOOK_URL?.trim();
  if (!webhook) {
    // Dev/demo: no delivery provider — mark as sent so the flow is visible.
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
        to: channel === 'email' ? params.profile.email : params.profile.phoneE164,
        type: params.type,
        content: params.content,
        // callback so Emergent can report delivery status back to us
        callbackUrl: process.env.APP_URL ? `${process.env.APP_URL}/api/notifications/callback` : undefined,
      }),
    });
    await store.updateNotificationStatus(record.id, res.ok ? 'sent' : 'failed');
    return { ...record, status: res.ok ? 'sent' : 'failed' };
  } catch {
    await store.updateNotificationStatus(record.id, 'failed');
    return { ...record, status: 'failed' };
  }
}
