/**
 * Onboarding illustration map — single source of truth.
 * Files live in public/illustrations/ (designer PNGs; do not regenerate with AI).
 *
 * Sequence:
 * 1 splashHero — horizontal 3D path scene
 * 2 promiseBuddy — Our Promise (shield)
 * 3 setupBuddy — Step 1 of 2 (wave)
 * 4 contractBuddy — Step 2 of 2 (check-in)
 */

export const ONBOARDING_BUDDY_WIDTH = 78;

/** Step 2 of 2 — contract check-in buddy (+60% vs default greeting buddy). */
export const ONBOARDING_CONTRACT_BUDDY_WIDTH = Math.round(ONBOARDING_BUDDY_WIDTH * 1.6);

/** Our Promise hero — shield/lotus PNG (1024×1536). */
export const ONBOARDING_PROMISE_ART = {
  width: 1024,
  height: 1536,
  displayWidth: 172,
} as const;

export const ONBOARDING_SPLASH_ART = {
  width: 1024,
  height: 1536,
} as const;

export const onboardingAssets = {
  /** Step 0 splash — portrait master (full DHIRA head-to-toe). Never use landscape PNG here (it is pre-cropped). */
  splashBackground: '/illustrations/spot_onboarding_dhira_path.png',
  /** Step 0 inline hero (legacy banner; unused when splash uses full background). */
  splashHero: '/illustrations/spot_onboarding_dhira_path_landscape.png',
  /** Portrait source kept for archive / re-export only. */
  splashHeroSource: '/illustrations/spot_onboarding_dhira_path.png',
  promiseBuddy: '/illustrations/dhira_promise_shield.png',
  setupBuddy: '/illustrations/dhira_setup_wave.png',
  contractBuddy: '/illustrations/dhira_contract_checkin.png',
} as const;

export type OnboardingAssetKey = keyof typeof onboardingAssets;
