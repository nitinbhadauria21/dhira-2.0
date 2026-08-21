import { randomUUID } from 'crypto';
import { getStore } from '@/lib/store';
import { templateFor } from '@/lib/notify';
import type { NotificationType } from '@/lib/types';

/**
 * Persist an outbound Telegram message in the notifications inbox (Timeline → Check-ins).
 * Proactive check-ins already use enqueueAndSend; this covers test messages and chat replies.
 */
export async function recordTelegramOutbound(params: {
  profileId: string;
  content: string;
  providerMessageId: string | number;
  type?: NotificationType;
}): Promise<void> {
  const type = params.type ?? 'proactive_checkin';
  const { templateKey, subject } = templateFor(type, 'telegram');
  const now = new Date().toISOString();
  const store = getStore();

  await store.addNotification({
    id: randomUUID(),
    profileId: params.profileId,
    channel: 'telegram',
    type,
    content: params.content,
    status: 'sent',
    providerMessageId: String(params.providerMessageId),
    scheduledFor: null,
    sentAt: now,
    createdAt: now,
    templateKey,
    subject,
  });
}
