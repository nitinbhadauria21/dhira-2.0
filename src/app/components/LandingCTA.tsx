import React from 'react';
import SignUpLink from '@/components/SignUpLink';
import { CTA_BODY } from '@/lib/artifactDesign';

/** Full-bleed background for this section only — see scene_landing_cta_quiet.png */
export const LANDING_CTA_BG = '/illustrations/scene_landing_cta_quiet.png';

export default function LandingCTA() {
  return (
    <section
      id="safety"
      className="landing-cta-section py-24 px-6 lg:px-10 relative overflow-hidden"
      aria-labelledby="landing-cta-heading"
    >
      <div aria-hidden className="landing-cta-bg absolute inset-0" />
      <div aria-hidden className="landing-cta-scrim absolute inset-0" />

      <div className="landing-cta-content max-w-2xl mx-auto text-center relative z-10">
        <h2
          id="landing-cta-heading"
          className="mb-4"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 500,
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
