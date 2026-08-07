import type React from 'react';

/** Theme-aware panel behind FloatingBuddy on onboarding hero steps (light + dark). */
export const onboardingBuddyPanelStyle: React.CSSProperties = {
  borderRadius: 22,
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--shadow-card)',
  background:
    'radial-gradient(ellipse 85% 75% at 50% 42%, color-mix(in srgb, var(--color-primary) 14%, transparent) 0%, transparent 68%), linear-gradient(165deg, var(--color-surface-alt) 0%, var(--color-surface) 100%)',
  minHeight: 240,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '28px 20px',
};
