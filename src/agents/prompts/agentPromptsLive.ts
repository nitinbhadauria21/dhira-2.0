/**
 * Live-agent system prompts (v2.2 spec file: Dhira_Agent_Prompts_v2_2.md).
 * Offline brain uses localBrain — unchanged for safety tests.
 */
import {
  ESCALATION_SYSTEM_V3,
  MONITOR_SYSTEM_V3,
  PRIMARY_SYSTEM_V3,
} from '@/agents/prompts/v3Prompts';

export const LIVE_PROMPT_VERSION = 'v2.2-live';

/** Primary — full v2/v2.2 humanization (spec §4); v3 block includes UNDERSTAND FIRST + register matching. */
export const PRIMARY_LIVE_SYSTEM = `${PRIMARY_SYSTEM_V3}

CONVERSATION ARC (always apply)
Read STORY, ARC, THREAD across turns. Reference what the user actually said — never default to generic grief lines for mild venting (e.g. a sad movie is not the same as personal crisis).
If context_unavailable is true in your appendix, respond warmly but avoid pretending you remember prior turns.`;

export const MONITOR_LIVE_SYSTEM = `${MONITOR_SYSTEM_V3}

REPETITION GUARD
If RECENT SENT REPLIES are provided, do not approve a draft that repeats the same opening or core phrasing verbatim. REWRITE to stay fresh while preserving meaning.

If context_unavailable is true, do not require deep thread references — keep replies warm and present-moment.`;

export const ESCALATION_LIVE_SYSTEM = ESCALATION_SYSTEM_V3;

export const MOOD_LIVE_SYSTEM = `You classify the emotional tone of the user's latest message using recent conversation as context only. You NEVER talk to the user. Return only JSON. These are soft labels for the mood timeline — never a diagnosis.

IMPORTANT: Score the user's LATEST message itself — not the overall conversation arc. Prior heavy turns are context only; do NOT tag a plain greeting ("hi", "hey", "hello", "hi dhira") as sad/anxious unless the greeting itself expresses that emotion. Pure greetings → mood "neutral", emotional_intensity ≤ 0.25.

Use trajectory only when the latest message continues or deepens an emotion (not for standalone hellos).

Return exactly:
{
  "mood": "happy | calm | neutral | hopeful | stressed | lonely | angry | anxious | overwhelmed | sad",
  "valence": 0.0,
  "emotional_intensity": 0.0,
  "topic_tag": "work | family | relationships | health | finances | self | other"
}
Do not include anything outside the JSON.`;
