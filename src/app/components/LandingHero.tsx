'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DhiraAvatar from '@/components/DhiraAvatar';

const rotatingLines = [
  'Aaj thoda heavy lag raha hai kya?',
  "I'm here. Tell me more.",
  'Yeh kaafi heavy lag raha hai. Main sun raha hoon.',
  "What's sitting with you right now?",
  'That sounds heavy. Take your time.',
];

export default function LandingHero() {
  const [lineIndex, setLineIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setLineIndex((i) => (i + 1) % rotatingLines.length);
        setVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundColor: 'var(--color-bg)',
        paddingTop: '96px',
        paddingBottom: '80px',
        paddingInline: 'clamp(20px, 4vw, 40px)',
      }}
    >
      {/* Full-bleed night lamp atmosphere — one visual plane */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 80% 55% at 50% 0%, rgba(245, 188, 92, 0.14) 0%, transparent 55%),
            radial-gradient(ellipse 70% 60% at 80% 80%, rgba(79, 93, 181, 0.16) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 10% 70%, rgba(79, 154, 120, 0.1) 0%, transparent 55%)
          `,
        }}
      />

      <div className="relative z-10 w-full max-w-3xl mx-auto text-center-safe flex flex-col items-center">
        <p
          className="wordmark mb-6"
          style={{
            fontSize: 'clamp(28px, 5vw, 36px)',
            color: 'var(--color-text)',
          }}
        >
          Dhira
        </p>

        <div className="flex justify-center mb-7">
          <DhiraAvatar size={64} variant="softer" pulse />
        </div>

        <h1
          className="text-display mb-5"
          style={{ color: 'var(--color-text)', maxWidth: '16ch' }}
        >
          The calm that stays up{' '}
          <span style={{ color: 'var(--color-primary)' }}>with you.</span>
        </h1>

        {/* Product voice — rotating Hinglish line */}
        <div
          className="mb-8 w-full flex items-center justify-center"
          style={{ minHeight: '64px' }}
        >
          <div
            className="inline-flex items-center gap-3 px-5 py-3.5 max-w-lg w-full sm:w-auto"
            style={{
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.35s ease',
              backgroundColor: 'var(--color-glass)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <DhiraAvatar size={28} variant="softer" />
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(15px, 2.5vw, 17px)',
                fontWeight: 500,
                fontStyle: 'italic',
                color: 'var(--color-text)',
                textAlign: 'left',
                lineHeight: 1.4,
              }}
            >
              &ldquo;{rotatingLines[lineIndex]}&rdquo;
            </p>
          </div>
        </div>

        <p
          className="mb-10 text-body"
          style={{
            color: 'var(--color-text-muted)',
            maxWidth: '36ch',
          }}
        >
          A private Hinglish companion that listens at 2 AM — never advises, always present. Crisis help stays one tap away.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Link
            href="/sign-up"
            className="btn-accent pulse-amber w-full sm:w-auto justify-center"
            style={{ fontSize: '16px', padding: '14px 28px', fontWeight: 600 }}
          >
            Start free — alias only
          </Link>
          <a
            href="#features"
            className="btn-ghost w-full sm:w-auto justify-center"
            style={{ fontSize: '16px', padding: '14px 24px' }}
          >
            See how it works
          </a>
        </div>

        <p
          className="mt-6 text-small"
          style={{ color: 'var(--color-text-subtle)', maxWidth: '40ch' }}
        >
          Alias only · Email or phone to save your space · You control check-ins · Tele-MANAS 14416 in crisis
        </p>
      </div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        style={{ color: 'var(--color-text-subtle)', fontSize: '12px', fontFamily: 'var(--font-ui)' }}
        aria-hidden="true"
      >
        <div
          className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
          style={{ border: '1.5px solid var(--color-border)' }}
        >
          <div
            className="w-1 h-2 rounded-full"
            style={{
              backgroundColor: 'var(--color-text-subtle)',
              animation: 'scrollDot 1.8s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollDot {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(8px); opacity: 0.3; }
        }
      `}</style>
    </section>
  );
}
