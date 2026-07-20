import React from 'react';
import Link from 'next/link';

export default function LandingCTA() {
  return (
    <section
      id="safety"
      className="page-section relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 50% 40%, rgba(245, 188, 92, 0.14) 0%, transparent 65%)',
        }}
      />

      <div className="page-narrow text-center-safe relative z-10">
        <p
          className="mb-4"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '48px',
            lineHeight: 1,
          }}
          aria-hidden="true"
        >
          🌙
        </p>

        <h2 className="text-h1 mb-4" style={{ color: 'var(--color-text)' }}>
          It&apos;s 2 AM and something feels heavy.
        </h2>
        <p
          className="mb-10 text-body"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Anonymous alias. Private account. Ready when the night feels loud — Hinglish if that&apos;s how you think.
        </p>

        <Link
          href="/sign-up"
          className="btn-accent inline-flex"
          style={{ fontSize: '16px', padding: '16px 36px', fontWeight: 600 }}
        >
          Begin now — it&apos;s free
        </Link>

        <div
          className="mt-12 p-5 text-left"
          style={{
            backgroundColor: 'var(--color-crisis-surface)',
            border: '1px solid var(--color-crisis)',
            borderRadius: 'var(--radius-card)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '14px',
              color: 'var(--color-crisis)',
              lineHeight: 1.6,
            }}
          >
            <strong>If you or someone you know is in crisis:</strong> Call Tele-MANAS at{' '}
            <strong>14416</strong> — free, 24×7, India-wide. Dhira is a listening companion, not a
            crisis service.
          </p>
        </div>
      </div>
    </section>
  );
}
