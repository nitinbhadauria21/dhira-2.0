import React from 'react';
import Link from 'next/link';
import { CTA_BODY } from '@/lib/artifactDesign';

export default function LandingCTA() {
  return (
    <section
      id="safety"
      className="py-24 px-6 lg:px-10 relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface-alt)' }}
    >
      <div className="max-w-2xl mx-auto text-center relative z-10">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-8"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 0 32px rgba(239,169,74,0.3)',
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
          {CTA_BODY}
        </p>

        <Link href="/sign-up" className="btn-accent" style={{ fontSize: '17px', padding: '16px 40px' }}>
          Begin now — it&apos;s free
        </Link>
      </div>
    </section>
  );
}
