'use client';

import React from 'react';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const promises = [
  {
    icon: '🔒',
    title: 'Private by default',
    body: 'Use an alias — never your real name. Share email or phone only if you want check-ins. You choose what to share.',
  },
  {
    icon: '🤫',
    title: 'Private by design',
    body: 'Your conversations stay yours. We keep them so Dhira can remember — and you can export or leave anytime.',
  },
  {
    icon: '🎛️',
    title: 'You are in control',
    body: 'Change your preferences, pause check-ins, or leave anytime. No lock-in.',
  },
  {
    icon: '💛',
    title: 'A listener, not a therapist',
    body: 'Dhira listens and remembers. She does not diagnose, advise, or judge.',
  },
];

export default function StepPrivacy({ onNext, onBack }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Heading */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
          Our Promise
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(26px, 5vw, 36px)',
            fontWeight: 500,
            color: 'var(--color-text)',
            lineHeight: 1.2,
          }}
        >
          Your safety comes first.
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '16px',
            color: 'var(--color-text-muted)',
            lineHeight: 1.6,
          }}
        >
          Before we begin, here is what Dhira promises you — always.
        </p>
      </div>

      {/* Promise cards — asymmetric 2-col bento */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}
      >
        {promises.map((p, i) => (
          <div
            key={`promise-${i}`}
            className="dhira-card"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              gridColumn: i === 0 ? 'span 2' : 'span 1',
            }}
          >
            <span style={{ fontSize: '22px' }}>{p.icon}</span>
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

      {/* Actions */}
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
