'use client';

import React from 'react';
import { onboardingAssets } from '@/app/onboarding/onboardingAssets';

interface Props {
  onNext: () => void;
}

export default function StepSplash({ onNext }: Props) {
  return (
    <section
      className="onboarding-splash-scene"
      aria-labelledby="onboarding-splash-heading"
      style={
        {
          ['--onboarding-splash-bg-url' as string]: `url('${onboardingAssets.splashBackground}')`,
        } as React.CSSProperties
      }
    >
      <div aria-hidden className="onboarding-splash-bg absolute inset-0" />
      <div aria-hidden className="onboarding-splash-scrim absolute inset-0" />

      <div className="onboarding-splash-inner relative z-10">
        <div className="onboarding-splash-copy" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h1
            id="onboarding-splash-heading"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 5vw, 44px)',
              fontWeight: 650,
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              margin: 0,
            }}
          >
            Aaj, kahan se shuru karein?
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '17px',
              lineHeight: 1.65,
              maxWidth: '38ch',
              margin: 0,
            }}
          >
            Say as much or as little as you want. DHIRA is here to listen — quietly, patiently, without
            judgment.
          </p>

          <button
            type="button"
            onClick={onNext}
            className="btn-accent"
            style={{ fontSize: '17px', padding: '16px 48px', marginTop: '8px', alignSelf: 'flex-start' }}
          >
            Begin
          </button>

          <p
            className="onboarding-splash-footnote"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '13px',
              lineHeight: 1.5,
              margin: 0,
              marginTop: '4px',
            }}
          >
            Anonymous · Private · Free to use
          </p>
        </div>
      </div>
    </section>
  );
}
