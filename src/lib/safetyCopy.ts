/**
 * Canonical safety copy. Single source of truth so the crisis message and
 * boundary line read identically everywhere (chat, API, crisis screen).
 */

export const TELE_MANAS_NUMBER = '14416';

/** Crisis Hand-off message (Agent spec §9). Shown instead of a normal reply. */
export const CRISIS_MESSAGE =
  "I'm really sorry you're feeling this way, and I'm concerned about your safety. " +
  'Please reach out right now to someone who can be with you. In India you can call ' +
  `Tele-MANAS at ${TELE_MANAS_NUMBER} (free, 24x7), or contact your local emergency ` +
  "services. If there's someone you trust nearby, please reach out to them too. " +
  "You don't have to be alone with this.";

/** The fixed boundary line Dhira uses when asked for advice/diagnosis. */
export const BOUNDARY_LINE =
  "I can listen and help you put this into words, but I'm not a therapist or doctor " +
  "and I don't want to give you the wrong kind of guidance. I can stay with you while " +
  'you sort through it.';
