'use client';

import React from 'react';

interface Props {
  onNext: () => void;
}

export default function StepSplash({ onNext }: Props) {
  return (
    <div className="flex flex-col items-center text-center" style={{ gap: '32px' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/illustrations/spot_onboarding_dhira_path.png"
        alt="DHIRA on a soft garden path at sunrise, welcoming you forward"
        style={{
          width: 'min(320px, 90vw)',
          height: 'auto',
          objectFit: 'contain',
          borderRadius: 20,
          border: '1px solid var(--color-border)',
          boxShadow: '0 0 40px rgba(239,169,74,0.35)',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 6vw, 48px)',
            fontWeight: 650,
            color: 'var(--color-text)',
            lineHeight: 1.12,
            letterSpacing: '-0.03em',
          }}
        >
          Aaj, kahan se shuru karein?
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '17px',
            color: 'var(--color-text-muted)',
            lineHeight: 1.65,
            maxWidth: '42ch',
            marginInline: 'auto',
          }}
        >
          Say as much or as little as you want. DHIRA is here to listen — quietly, patiently, without
          judgment.
        </p>
      </div>

      <button
        onClick={onNext}
        className="btn-accent"
        style={{ fontSize: '17px', padding: '16px 48px', marginTop: '8px' }}
      >
        Begin
      </button>

      <p
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '13px',
          color: 'var(--color-text-subtle)',
          lineHeight: 1.5,
        }}
      >
        Anonymous · Private · Free to use
      </p>
    </div>
  );
}
