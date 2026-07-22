'use client';

import React from 'react';

interface Props {
  onNext: () => void;
}

export default function StepSplash({ onNext }: Props) {
  return (
    <div className="flex flex-col items-center text-center" style={{ gap: '32px' }}>
      {/* Amber glow orb */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 0 40px rgba(239, 169, 74, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '36px',
        }}
      >
        🌙
      </div>

      {/* Headline */}
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
          Kuch feel ho raha hai?
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '17px',
            color: 'var(--color-text-muted)',
            lineHeight: 1.65,
            maxWidth: '34ch',
            marginInline: 'auto',
          }}
        >
          Dhira is here to listen — no advice, no judgment, no real name needed. Just a quiet space that remembers.
        </p>
      </div>

      {/* Begin CTA */}
      <button
        onClick={onNext}
        className="btn-accent"
        style={{ fontSize: '17px', padding: '16px 48px', marginTop: '8px' }}
      >
        Begin
      </button>

      {/* Trust micro-copy */}
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
