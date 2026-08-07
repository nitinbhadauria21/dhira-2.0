import React from 'react';
import Link from 'next/link';
import SignUpLink from '@/components/SignUpLink';
import { CTA_BODY } from '@/lib/artifactDesign';

export default function LandingCTA() {
  return (
    <section
      id="safety"
      className="py-24 px-6 lg:px-10 relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface-alt)' }}
    >
      <div className="max-w-2xl mx-auto text-center relative z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illustrations/scene_2am.png"
          alt="DHIRA sitting cross-legged under a starlit sky, holding a small glowing light"
          width={340}
          height={215}
          className="mx-auto mb-7 block"
          style={{
            width: 340,
            maxWidth: '100%',
            height: 215,
            objectFit: 'cover',
            borderRadius: 22,
            border: '1px solid var(--color-border)',
            boxShadow: '0 18px 40px rgba(38,32,66,0.22), 0 0 32px rgba(239,169,74,0.3)',
          }}
        />

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
          When the world goes quiet, but your mind won&apos;t.
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

        <SignUpLink href="/sign-up" className="btn-accent" style={{ fontSize: '17px', padding: '16px 40px' }}>
          Begin now — it&apos;s free
        </SignUpLink>
      </div>
    </section>
  );
}
