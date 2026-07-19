import { getStore } from '@/lib/store';
import { draftCheckin } from '@/agents/proactive';
import { reviewReply } from '@/agents/monitor';
import { enqueueAndSend, resolveChannel } from '@/lib/notify';
import type { NotifyChannel } from '@/lib/types';

/**
 * The proactive-check-in flow (Agent Prompts spec §4g):
 *   Trigger + consent check -> Proactive Check-in Agent -> Safety & Persona Monitor -> deliver
 *
 * Even an unprompted "thinking of you" message must pass the Monitor first, and
 * is then delivered as a notification (email / WhatsApp via Emergent).
 */

export interface ProactiveResult {
  sent: boolean;
  reason?: string;
  message?: string;
  channel?: NotifyChannel | null;
  deliveryStatus?: string;
}

export async function runProactiveCheckin(uid: string): Promise<ProactiveResult> {
  const store = getStore();
  const profile = await store.getOrCreateProfile(uid);

  // Proactivity is always permission-based.
  if (!profile.consentCheckin) {
    return { sent: false, reason: 'user has not consented to check-ins' };
  }

  const memory = profile.consentMemory ? await store.getLatestMemory(uid) : null;

  const draft = await draftCheckin({
    carryForward: memory?.carryForward ?? null,
    memorySummary: memory?.summary ?? null,
    language: profile.language,
  });

  // Golden rule: route the proactive draft through the Monitor before sending.
  const reviewed = await reviewReply({
    userMessage: '(proactive check-in trigger — no user message)',
    context: memory?.summary ?? '(no prior memory)',
    draftReply: draft,
  });

  const message = reviewed.approved_or_rewritten_response;

  // Deliver as a notification (best-effort; the message still returns for in-app display).
  const channel = resolveChannel(profile);
  const notification = await enqueueAndSend({ profile, type: 'proactive_checkin', content: message });

  return {
    sent: true,
    message,
    channel,
    deliveryStatus: notification?.status,
  };
}

/** Build + deliver a short weekly summary notification for one user. */
export async function runWeeklySummary(uid: string): Promise<ProactiveResult> {
  const store = getStore();
  const profile = await store.getOrCreateProfile(uid);
  if (!profile.consentCheckin) return { sent: false, reason: 'user has not consented to check-ins' };

  const moods = await store.getMoods(uid, 7);
  const checkins = moods.length;
  const avgValence = checkins ? moods.reduce((s, m) => s + m.valence, 0) / checkins : 0;
  const tone = avgValence > 0.15 ? 'a little lighter' : avgValence < -0.15 ? 'on the heavier side' : 'a real mix';
  const hinglish = profile.language === 'hinglish';

  const message = hinglish
    ? `Is hafte tumne ${checkins} baar check-in kiya — overall mood ${tone} raha. Main yahin hoon jab bhi baat karni ho.`
    : `This week you checked in ${checkins} time${checkins === 1 ? '' : 's'} — your mood felt ${tone}. I'm here whenever you want to talk.`;

  const notification = await enqueueAndSend({ profile, type: 'weekly_summary', content: message });
  return { sent: true, message, channel: resolveChannel(profile), deliveryStatus: notification?.status };
}
