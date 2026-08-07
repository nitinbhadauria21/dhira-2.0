'use client';

import React from 'react';
import FloatingBuddy from '@/components/FloatingBuddy';

/** Match home dashboard hero (`HomeGreeting`) — same buddy size, halo, and bob. */
export const ONBOARDING_BUDDY_WIDTH = 78;
export const ONBOARDING_BUDDY_BOB = 'dhira-bob 5.5s ease-in-out infinite';

type Props = {
  buddySrc: string;
  buddyAlt: string;
  eyebrow: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
};

export default function OnboardingGreetingRow({ buddySrc, buddyAlt, eyebrow, title, subtitle }: Props) {
  return (
    <div className="flex items-center gap-4">
      <FloatingBuddy
        src={buddySrc}
        alt={buddyAlt}
        width={ONBOARDING_BUDDY_WIDTH}
        bobAnimation={ONBOARDING_BUDDY_BOB}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', minWidth: 0 }}>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-text-subtle)',
          }}
        >
          {eyebrow}
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(22px, 3vw, 32px)',
            fontWeight: 500,
            letterSpacing: '-0.03em',
            color: 'var(--color-text)',
            lineHeight: 1.2,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 15,
            color: 'var(--color-text-muted)',
            lineHeight: 1.55,
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
