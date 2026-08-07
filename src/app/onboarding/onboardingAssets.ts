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

export const onboardingAssets = {
  /** Step 0 splash — horizontal banner (not portrait spot crop in UI). */
  splashHero: '/illustrations/spot_onboarding_dhira_path_landscape.png',
  /** Portrait source kept for archive / re-export only. */
  splashHeroSource: '/illustrations/spot_onboarding_dhira_path.png',
  promiseBuddy: '/illustrations/dhira_promise_shield.png',
  setupBuddy: '/illustrations/dhira_setup_wave.png',
  contractBuddy: '/illustrations/dhira_contract_checkin.png',
} as const;

export type OnboardingAssetKey = keyof typeof onboardingAssets;
