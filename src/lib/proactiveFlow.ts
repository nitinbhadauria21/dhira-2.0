import { getStore } from '@/lib/store';
import { draftCheckin } from '@/agents/proactive';
import { reviewReply } from '@/agents/monitor';

/**
 * The proactive-check-in flow (Agent Prompts spec §4g):
 *   Trigger + consent check -> Proactive Check-in Agent -> Safety & Persona Monitor -> sent
 *
 * Even an unprompted "thinking of you" message must pass the Monitor first.
 */

export interface ProactiveResult {
  sent: boolean;
  reason?: string;
  message?: string;
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

  return { sent: true, message: reviewed.approved_or_rewritten_response };
}
