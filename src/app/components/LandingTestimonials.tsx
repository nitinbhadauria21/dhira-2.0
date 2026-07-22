'use client';

import React from 'react';
import { TESTIMONIALS } from '@/lib/artifactDesign';

export default function LandingTestimonials() {
  return (
    <section
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
              color: 'var(--color-sage)',
              fontWeight: 600,
              letterSpacing: '0.12em',
            }}
          >
            What people say
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 4vw, 36px)',
              fontWeight: 500,
              color: 'var(--color-text)',
            }}
          >
            Felt, not just read
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="dhira-card feature-card-hover p-6 flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block rounded-full flex-shrink-0"
                  style={{ width: 10, height: 10, backgroundColor: t.moodColor }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 13,
                    color: 'var(--color-text-subtle)',
                    fontWeight: 500,
                  }}
                >
                  Feeling: {t.mood}
                </span>
              </div>

              <blockquote
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 16,
                  color: 'var(--color-text)',
                  lineHeight: 1.65,
                  fontStyle: 'italic',
                  margin: 0,
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div
                className="pt-4 flex items-center gap-3"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                  style={{
                    backgroundColor: 'var(--color-primary-soft)',
                    color: 'var(--color-primary)',
                    fontFamily: 'var(--font-ui)',
                  }}
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--color-text)',
                    }}
                  >
                    {t.name}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 12,
                      color: 'var(--color-text-subtle)',
                    }}
                  >
                    {t.meta}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
