import React from 'react';
import SignUpLink from '@/components/SignUpLink';
import { CTA_BODY } from '@/lib/artifactDesign';

/** Full-bleed background for this section only — see scene_landing_cta_quiet.png */
export const LANDING_CTA_BG = '/illustrations/scene_landing_cta_quiet.png';

export default function LandingCTA() {
  return (
    <section
      id="safety"
      className="landing-cta-section relative overflow-hidden w-full"
      aria-labelledby="landing-cta-heading"
    >
      <div aria-hidden className="landing-cta-bg absolute inset-0" />
      <div aria-hidden className="landing-cta-scrim absolute inset-0" />

      <div className="landing-cta-inner relative z-10">
        <div className="landing-cta-content max-w-xl text-right ml-auto">
          <h2
            id="landing-cta-heading"
            className="mb-4"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 3.6vw, 40px)',
              fontWeight: 500,
              lineHeight: 1.2,
            }}
          >
            When the world goes quiet, but your mind won&apos;t.
          </h2>
          <p
            className="mb-8"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'clamp(16px, 2vw, 18px)',
              lineHeight: 1.65,
            }}
          >
            {CTA_BODY}
          </p>

          <SignUpLink
            href="/sign-up"
            className="btn-accent inline-flex"
            style={{ fontSize: '17px', padding: '16px 40px' }}
          >
            Begin now — it&apos;s free
          </SignUpLink>
        </div>
      </div>
    </section>
  );
}
