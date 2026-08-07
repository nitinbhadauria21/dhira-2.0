'use client';

import React from 'react';
import { PROMISES } from '@/lib/artifactDesign';
import { onboardingAssets } from '@/app/onboarding/onboardingAssets';
import OnboardingGreetingRow from './OnboardingGreetingRow';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const PROMISE_EMOJI: Record<string, string> = {
  incognito: '🕶️',
  lock: '🔒',
  sliders: '🎛️',
  heart: '💛',
};

export default function StepPrivacy({ onNext, onBack }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <OnboardingGreetingRow
        buddySrc={onboardingAssets.promiseBuddy}
        buddyAlt="DHIRA holding a glowing shield with a lock, promising your safety and privacy"
        eyebrow="Our Promise"
        title="Your safety comes first."
        subtitle="Before we begin, here is what DHIRA promises you — always."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}
      >
        {PROMISES.map((p, i) => (
          <div
            key={p.title}
            className="dhira-card"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              gridColumn: p.span === 2 || i === 0 ? 'span 2' : 'span 1',
            }}
          >
            <span style={{ fontSize: '22px' }}>{PROMISE_EMOJI[p.glyph] ?? '✨'}</span>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 500,
                color: 'var(--color-text)',
              }}
            >
              {p.title}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '14px',
                color: 'var(--color-text-muted)',
                lineHeight: 1.55,
              }}
            >
              {p.body}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={onNext}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', fontSize: '16px', padding: '14px 24px' }}
        >
          I understand — let&apos;s continue
        </button>
        <button
          onClick={onBack}
          className="btn-ghost"
          style={{ width: '100%', justifyContent: 'center', fontSize: '15px' }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
