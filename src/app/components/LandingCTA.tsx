import React from 'react';
import Link from 'next/link';

export default function LandingCTA() {
  return (
    <section
      id="safety"
      className="py-24 px-6 lg:px-10 relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface-alt)' }}
    >
      {/* Background decorative elements */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(239, 169, 74, 0.12) 0%, transparent 65%)',
          filter: 'blur(50px)',
        }}
        aria-hidden="true"
      />
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.15, zIndex: 0 }}
        aria-hidden="true"
      >
        <defs>
          <pattern id="cta-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" fill="var(--color-accent)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cta-dots)" />
      </svg>

      <div className="max-w-2xl mx-auto text-center relative z-10">
        {/* Amber glow orb */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-8"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 0 32px rgba(239, 169, 74, 0.3)',
          }}
        >
          🌙
        </div>

        <h2
          className="mb-4"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 500,
            color: 'var(--color-text)',
            lineHeight: 1.2,
          }}
        >
          It&apos;s 2 AM and something feels heavy.
        </h2>
        <p
          className="mb-10"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '18px',
            color: 'var(--color-text-muted)',
            lineHeight: 1.65,
          }}
        >
          Dhira is already there. Anonymous, private, and ready to listen — no sign-up friction, no real name required.
        </p>

        <Link href="/sign-up" className="btn-accent" style={{ fontSize: '17px', padding: '16px 40px' }}>
          Begin now — it&apos;s free
        </Link>

        {/* Safety note */}
        <div
          className="mt-12 p-5 rounded-card text-left"
          style={{
            backgroundColor: 'var(--color-crisis-surface)',
            border: '1px solid var(--color-crisis)',
          }}
        >
          <p
            style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-crisis)', lineHeight: 1.6 }}
          >
            <strong>If you or someone you know is in crisis:</strong> Please call Tele-MANAS at{' '}
            <strong>14416</strong> — free, 24×7, India-wide. Dhira is a listening companion, not a crisis service.
          </p>
        </div>
      </div>
    </section>
  );
}