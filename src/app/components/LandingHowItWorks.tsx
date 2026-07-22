'use client';

import React from 'react';
import { STEPS } from '@/lib/artifactDesign';
import { illIconSvg } from '@/lib/artifactIllustrations';

export default function LandingHowItWorks() {
  return (
    <section
      className="py-24 px-6 lg:px-10 relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface-alt)' }}
    >
      <div className="max-w-screen-xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <p
            className="mb-3 uppercase tracking-widest"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '12px',
              color: 'var(--color-lavender)',
              fontWeight: 600,
              letterSpacing: '0.12em',
            }}
          >
            How it works
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 4vw, 36px)',
              fontWeight: 500,
              color: 'var(--color-text)',
            }}
          >
            Four quiet steps
          </h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {/* Dashed connector — desktop */}
          <div
            className="hidden xl:block absolute pointer-events-none"
            style={{
              top: 70,
              left: '12%',
              right: '12%',
              height: 0,
              borderTop: '2px dashed var(--color-border)',
              zIndex: 0,
            }}
            aria-hidden="true"
          />

          {STEPS.map((st, i) => (
            <div
              key={st.number}
              className="dhira-flip-card relative z-10 flex flex-col items-center gap-5"
            >
              <div style={{ width: '100%', maxWidth: 220, height: 180 }}>
                <div className="dhira-flip-inner" tabIndex={0} aria-label={`${st.number}: ${st.title}`}>
                  <div className="dhira-flip-face">
                    <div
                      style={{ width: 56, height: 56 }}
                      dangerouslySetInnerHTML={{
                        __html: illIconSvg(`step-${i}`, st.glyph, i),
                      }}
                    />
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 28,
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                        opacity: 0.4,
                      }}
                    >
                      {st.number}
                    </div>
                  </div>
                  <div className="dhira-flip-face-back">
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 16,
                        fontWeight: 500,
                        color: 'var(--color-text)',
                        marginBottom: 8,
                      }}
                    >
                      {st.title}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: 13,
                        color: 'var(--color-text-muted)',
                        lineHeight: 1.55,
                      }}
                    >
                      {st.body}
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: 'var(--color-bg)',
                  border: '3px solid var(--color-primary)',
                }}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
