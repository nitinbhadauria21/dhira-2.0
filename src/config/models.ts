/**
 * Which Claude model each Dhira "agent" uses.
 *
 * Plain-English summary for non-developers:
 * - Dhira is made of six small helpers ("agents"). Each one has a job.
 * - The important, sensitive jobs (talking, safety, crisis) use the smarter,
 *   more careful model ("Voice & Safety" = Claude Sonnet).
 * - The simple background jobs (tagging a mood, writing a short memory note)
 *   use the cheaper, faster model ("Background" = Claude Haiku).
 *
 * If Anthropic ever renames a model, just update the IDs below. You can ask
 * Cursor: "What is the current model ID for the latest Claude Sonnet and Haiku?"
 */

export type AgentName =
  | 'primaryAgent'
  | 'safetyMonitor'
  | 'escalationAgent'
  | 'proactiveCheckin'
  | 'moodTagging'
  | 'memoryAgent';

// "Voice & Safety" — the careful model used for anything the user reads.
// Overridable via env in case Anthropic renames the model.
const VOICE_AND_SAFETY = process.env.DHIRA_MODEL_SONNET?.trim() || 'claude-sonnet-4-5';
// "Background" — the fast/cheap model for silent metadata jobs.
const BACKGROUND = process.env.DHIRA_MODEL_HAIKU?.trim() || 'claude-haiku-4-5';

const MODEL_MAP: Record<AgentName, string> = {
  primaryAgent: VOICE_AND_SAFETY,
  safetyMonitor: VOICE_AND_SAFETY,
  escalationAgent: VOICE_AND_SAFETY,
  proactiveCheckin: VOICE_AND_SAFETY,
  moodTagging: BACKGROUND,
  memoryAgent: BACKGROUND,
};

/** Returns the Claude model id that a given agent should use. */
export function getModelFor(agent: AgentName): string {
  return MODEL_MAP[agent];
}

/** True when a real Anthropic key is configured (i.e. the live brain is on). */
export function isLiveBrainEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim());
}
