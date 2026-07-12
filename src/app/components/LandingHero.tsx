'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DhiraAvatar from '@/components/DhiraAvatar';

const rotatingLines = [
  'Aaj thoda heavy lag raha hai kya?',
  "I\'m here. Tell me more.",
  'Yeh kaafi heavy lag raha hai. Main sun raha hoon.',
  'What\'s sitting with you right now?',
  'That sounds heavy. Take your time.',
];

export default function LandingHero() {
  const [lineIndex, setLineIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setLineIndex((i) => (i + 1) % rotatingLines?.length);
        setVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-6 lg:px-10 pt-24 pb-20 overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Ambient background glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(90, 103, 184, 0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 right-1/4 rounded-full pointer-events-none"
        style={{
          width: '300px',
          height: '300px',
          background: 'radial-gradient(ellipse, rgba(239, 169, 74, 0.08) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <DhiraAvatar size={72} variant="softer" pulse />
        </div>

        {/* Headline */}
        <h1
          className="text-display mb-6"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 500,
            color: 'var(--color-text)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          The calm that stays up<br />
          <span style={{ color: 'var(--color-primary)' }}>with you.</span>
        </h1>

        {/* Rotating Dhira line */}
        <div className="mb-8 min-h-[60px] flex items-center justify-center">
          <div
            className="dhira-card px-6 py-4 inline-flex items-center gap-3 max-w-lg"
            style={{
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.35s ease',
            }}
          >
            <DhiraAvatar size={32} variant="softer" />
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '16px', color: 'var(--color-text)', fontStyle: 'italic', textAlign: 'left' }}>
              &ldquo;{rotatingLines?.[lineIndex]}&rdquo;
            </p>
          </div>
        </div>

        {/* Sub-copy */}
        <p
          className="mb-10 mx-auto"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '18px',
            color: 'var(--color-text-muted)',
            lineHeight: 1.65,
            maxWidth: '480px',
          }}
        >
          A private, anonymous companion that listens at the hardest hour — never advising, always present.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Amber accent CTA — ONE per screen */}
          <Link
            href="/home-dashboard"
            className="btn-accent pulse-amber"
            style={{ fontSize: '17px', padding: '14px 32px', fontWeight: 600 }}
          >
            Begin — it&apos;s free
          </Link>
          <a
            href="#features"
            className="btn-ghost"
            style={{ fontSize: '16px', padding: '14px 28px' }}
          >
            How it works
          </a>
        </div>

        {/* Privacy nudge */}
        <p
          className="mt-6"
          style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-subtle)' }}
        >
          🕊️ No password required &nbsp;·&nbsp; 🔒 Never your real name &nbsp;·&nbsp; 🎚️ You control check-ins
        </p>
      </div>
      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: 'var(--color-text-subtle)', fontSize: '12px', fontFamily: 'var(--font-ui)' }}
      >
        <div
          className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
          style={{ border: '1.5px solid var(--color-border)' }}
          aria-hidden="true"
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