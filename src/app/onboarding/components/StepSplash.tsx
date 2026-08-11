'use client';

import React from 'react';
import { onboardingAssets, ONBOARDING_SPLASH_ART } from '@/app/onboarding/onboardingAssets';

interface Props {
  onNext: () => void;
}

/** Landscape card; square shield art uses object-fit contain (no crop). */
const SPLASH_FRAME_ASPECT = '16 / 9';

export default function StepSplash({ onNext }: Props) {
  return (
    <section
      className="onboarding-splash-scene"
      aria-labelledby="onboarding-splash-heading"
      style={{ aspectRatio: SPLASH_FRAME_ASPECT }}
    >
      <img
        src={onboardingAssets.splashBackground}
        alt=""
        aria-hidden
        className="onboarding-splash-art"
        width={ONBOARDING_SPLASH_ART.width}
        height={ONBOARDING_SPLASH_ART.height}
        decoding="async"
        fetchPriority="high"
      />
      <div aria-hidden className="onboarding-splash-scrim absolute inset-0" />
      <div className="onboarding-splash-inner absolute inset-0 z-10">
        <div className="onboarding-splash-copy" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h1
            id="onboarding-splash-heading"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 4.2vw, 40px)',
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
              fontSize: '16px',
              lineHeight: 1.65,
              maxWidth: '36ch',
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
            style={{ fontSize: '16px', padding: '14px 40px', marginTop: '4px', alignSelf: 'flex-start' }}
          >
            Begin
          </button>

          <p
            className="onboarding-splash-footnote"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '12px',
              lineHeight: 1.5,
              margin: 0,
              marginTop: '2px',
            }}
          >
            Anonymous · Private · Free to use
          </p>
        </div>
      </div>
    </section>
  );
}
