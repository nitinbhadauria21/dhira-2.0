'use client';

import React from 'react';
import { FEATURES } from '@/lib/artifactDesign';
import { illIconSvg } from '@/lib/artifactIllustrations';

export default function LandingFeatures() {
  return (
    <section
      id="features"
      className="py-24 px-6 lg:px-10 relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="max-w-screen-xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <p
            className="mb-3 uppercase tracking-widest"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '12px',
              color: 'var(--color-accent)',
              fontWeight: 600,
              letterSpacing: '0.12em',
            }}
          >
            What Dhira does
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 4vw, 36px)',
              fontWeight: 500,
              color: 'var(--color-text)',
            }}
          >
            Designed for the hardest hour
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="dhira-card feature-card-hover p-6 flex flex-col gap-4"
            >
              <div
                className="w-14 h-14 flex-shrink-0"
                dangerouslySetInnerHTML={{
                  __html: illIconSvg(`feat-${i}`, f.glyph, i),
                }}
              />
              <div>
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
                    fontWeight: 500,
                    color: 'var(--color-text)',
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '15px',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.65,
                  }}
                >
                  {f.body}
                </p>
              </div>
              <div
                className="mt-auto pt-4"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '14px',
                    color: 'var(--color-text-subtle)',
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                  }}
                >
                  {f.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
