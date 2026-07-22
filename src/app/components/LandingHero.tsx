'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DhiraAvatar from '@/components/DhiraAvatar';
import { HERO_LINES, HERO_TAGLINE } from '@/lib/artifactDesign';

const rotatingLines = [...HERO_LINES];

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
      className="relative min-h-screen flex flex-col items-center justify-center px-6 lg:px-10 pt-24 pb-20 overflow-hidden"
      style={{ backgroundColor: 'transparent' }}
    >
      {/* Soft glows matching Standalone S.glowA / glowB */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-80px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          height: '700px',
          background:
            'radial-gradient(ellipse 60% 55% at 50% 40%, rgba(90, 103, 184, 0.14) 0%, rgba(174, 161, 218, 0.06) 50%, transparent 75%)',
          filter: 'blur(24px)',
          zIndex: 1,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '5%',
          right: '-5%',
          width: '520px',
          height: '520px',
          background:
            'radial-gradient(ellipse 55% 60% at 45% 50%, rgba(239, 169, 74, 0.14) 0%, transparent 75%)',
          filter: 'blur(40px)',
          zIndex: 1,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <div className="flex justify-center mb-8">
          <div className="pulse-amber rounded-full">
            <DhiraAvatar size={72} variant="softer" />
          </div>
        </div>

        <h1
          className="mb-6"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 500,
            color: 'var(--color-text)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          The calm that stays up
          <br />
          <span style={{ color: 'var(--color-primary)' }}>with you.</span>
        </h1>

        <div className="mb-8 min-h-[60px] flex items-center justify-center">
          <div
            className="dhira-card px-6 py-4 inline-flex items-center gap-3 max-w-lg"
            style={{
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.35s ease',
            }}
          >
            <DhiraAvatar size={32} variant="softer" />
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '16px',
                color: 'var(--color-text)',
                fontStyle: 'italic',
                textAlign: 'left',
              }}
            >
              &ldquo;{rotatingLines[lineIndex]}&rdquo;
            </p>
          </div>
        </div>

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
          {HERO_TAGLINE}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="btn-accent pulse-amber"
            style={{ fontSize: '17px', padding: '14px 32px', fontWeight: 600 }}
          >
            Begin — it&apos;s free
          </Link>
          <a href="#features" className="btn-ghost" style={{ fontSize: '16px', padding: '14px 28px' }}>
            How it works
          </a>
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: 'var(--color-text-subtle)', zIndex: 10 }}
        aria-hidden="true"
      >
        <div
          className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
          style={{ border: '1.5px solid var(--color-border)' }}
        >
          <div
            className="w-1 h-2 rounded-full dhira-anim-scroll-dot"
            style={{ backgroundColor: 'var(--color-text-subtle)' }}
          />
        </div>
      </div>
    </section>
  );
}
