import { getStore } from '@/lib/store';
import { draftCheckin } from '@/agents/proactive';
import { reviewReply } from '@/agents/monitor';
import { enqueueAndSend, resolveChannel } from '@/lib/notify';
import {
  buildProactiveContextLines,
  notebookThemeHint,
  type ProactiveContextHints,
} from '@/lib/proactiveContext';
import { languagePromptInstruction, languagePreferencesInstruction, usesHindiMix } from '@/lib/languages';
import type { NotifyChannel, TopicTag } from '@/lib/types';

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
  notificationId?: string;
}

export async function runProactiveCheckin(uid: string): Promise<ProactiveResult> {
  const store = getStore();
  const profile = await store.getOrCreateProfile(uid);

  if (!profile.consentCheckin) {
    return { sent: false, reason: 'user has not consented to check-ins' };
  }

  const channel = resolveChannel(profile);
  if (!channel) {
    return { sent: false, reason: 'no delivery channel available for this user' };
  }

  const memory = profile.consentMemory ? await store.getLatestMemory(uid) : null;

  const hints: ProactiveContextHints = {
    recentMood: null,
    recentTopic: null,
    notebookTheme: null,
  };

  const latestMood = await store.getLatestMood(uid);
  if (latestMood) {
    hints.recentMood = latestMood.mood;
    hints.recentTopic = latestMood.topicTag;
  }

  if (profile.consentMemory) {
    const entries = await store.getNotebookEntries(uid, 5);
    const shared = entries.find((e) => e.shareWithDhira);
    if (shared) {
      hints.notebookTheme = notebookThemeHint(shared.body);
      if (!hints.recentTopic && shared.topics[0]) {
        hints.recentTopic = shared.topics[0] as TopicTag;
      }
    }
  }

  const extraContextLines = buildProactiveContextLines(hints, profile.language, profile.language2);

  const draft = await draftCheckin({
    carryForward: memory?.carryForward ?? null,
    memorySummary: memory?.summary ?? null,
    language: profile.language,
    extraContextLines,
  });

  const reviewed = await reviewReply({
    userMessage: '(proactive check-in trigger — no user message)',
    context: memory?.summary ?? '(no prior memory)',
    draftReply: draft,
  });

  const message = reviewed.approved_or_rewritten_response;
  const notification = await enqueueAndSend({ profile, type: 'proactive_checkin', content: message, channel });

  if (!notification) {
    return { sent: false, reason: 'could not enqueue notification', message, channel };
  }

  await store.updateProfile(uid, { lastProactiveAt: new Date().toISOString() });

  return {
    sent: notification.status === 'sent' || notification.status === 'queued',
    message,
    channel,
    deliveryStatus: notification.status,
    notificationId: notification.id,
  };
}

/** Build + deliver a short weekly summary notification for one user (Monitor-gated). */
export async function runWeeklySummary(uid: string): Promise<ProactiveResult> {
  const store = getStore();
  const profile = await store.getOrCreateProfile(uid);
  if (!profile.consentCheckin) return { sent: false, reason: 'user has not consented to check-ins' };

  const channel = resolveChannel(profile);
  if (!channel) return { sent: false, reason: 'no delivery channel available for this user' };

  const moods = await store.getMoods(uid, 7);
  const checkins = moods.length;
  const avgValence = checkins ? moods.reduce((s, m) => s + m.valence, 0) / checkins : 0;
  const tone = avgValence > 0.15 ? 'a little lighter' : avgValence < -0.15 ? 'on the heavier side' : 'a real mix';
  const indic = usesHindiMix(profile.language);

  const draft = indic
    ? `Is hafte tumne ${checkins} baar check-in kiya — overall mood ${tone} raha. Main yahin hoon jab bhi baat karni ho.`
    : profile.language === 'english'
      ? `This week you checked in ${checkins} time${checkins === 1 ? '' : 's'} — your mood felt ${tone}. I'm here whenever you want to talk.`
      : await draftCheckin({
          carryForward: null,
          memorySummary: null,
          language: profile.language,
          extraContextLines: [
            languagePreferencesInstruction(profile.language, profile.language2),
            `(Weekly summary only: user checked in ${checkins} time(s) this week; mood felt ${tone}. One short warm recap, no advice.)`,
          ],
        });

  const reviewed = await reviewReply({
    userMessage: '(weekly summary trigger — no user message)',
    context: `checkins=${checkins}; avgValence=${avgValence.toFixed(2)}`,
    draftReply: draft,
  });
  const message = reviewed.approved_or_rewritten_response;

  const notification = await enqueueAndSend({ profile, type: 'weekly_summary', content: message, channel });
  if (!notification) {
    return { sent: false, reason: 'could not enqueue notification', message, channel };
  }

  await store.updateProfile(uid, { lastWeeklyAt: new Date().toISOString() });

  return {
    sent: notification.status === 'sent' || notification.status === 'queued',
    message,
    channel,
    deliveryStatus: notification.status,
    notificationId: notification.id,
  };
}
