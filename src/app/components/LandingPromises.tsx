'use client';

import React from 'react';
import { PROMISES } from '@/lib/artifactDesign';

const PROMISE_EMOJI: Record<string, string> = {
  incognito: '🕶️',
  lock: '🔒',
  sliders: '🎛️',
  heart: '💛',
};

export default function LandingPromises() {
  return (
    <section
      id="privacy"
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
            Our promise
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 4vw, 36px)',
              fontWeight: 500,
              color: 'var(--color-text)',
            }}
          >
            Your safety comes first.
          </h2>
          <p
            className="mt-3 mx-auto"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '16px',
              color: 'var(--color-text-muted)',
              maxWidth: '42ch',
              lineHeight: 1.6,
            }}
          >
            Before you begin, here is what Dhira promises you — always.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {PROMISES.map((p, i) => (
            <div
              key={p.title}
              className={`dhira-card p-6 flex flex-col gap-3 ${i === 0 ? 'xl:col-span-2' : 'xl:col-span-1'}`}
            >
              <span style={{ fontSize: 28 }}>{PROMISE_EMOJI[p.glyph] ?? '✨'}</span>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 18,
                  fontWeight: 500,
                  color: 'var(--color-text)',
                }}
              >
                {p.title}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 15,
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.65,
                }}
              >
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
