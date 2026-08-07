/** Browser keys cleared when someone starts a fresh sign-up (not sign-in). */
const NEW_ACCOUNT_KEYS = [
  'dhira-onboarding-done',
  'dhira-alias',
  'dhira-language',
  'dhira-last-route',
] as const;

/**
 * Drop stale client flags from a prior demo/session so a new account starts blank.
 * Keeps theme and shift preferences.
 */
export function resetDhiraClientStateForNewAccount(): void {
  if (typeof window === 'undefined') return;
  for (const key of NEW_ACCOUNT_KEYS) {
    localStorage.removeItem(key);
  }
}
