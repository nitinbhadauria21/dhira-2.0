'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DhiraAvatar from '@/components/DhiraAvatar';

const rotatingLines = [
  'Aaj thoda heavy lag raha hai kya?',
  "I\'m here. Tell me more.",
  'Yeh kaafi heavy lag raha hai. Main sun raha hoon.',
  "What\'s sitting with you right now?",
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
      {/* ── Rich background layer 1: large indigo radial glow ── */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: '800px',
          height: '600px',
          background: 'radial-gradient(ellipse, rgba(90, 103, 184, 0.16) 0%, rgba(174, 161, 218, 0.06) 45%, transparent 70%)',
          filter: 'blur(30px)',
        }}
        aria-hidden="true"
      />
      {/* ── Layer 2: amber glow bottom-right ── */}
      <div
        className="absolute bottom-1/4 right-1/4 pointer-events-none"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(239, 169, 74, 0.12) 0%, transparent 65%)',
          filter: 'blur(50px)',
        }}
        aria-hidden="true"
      />
      {/* ── Layer 3: sage green accent top-left ── */}
      <div
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          width: '350px',
          height: '350px',
          background: 'radial-gradient(ellipse, rgba(99, 161, 131, 0.08) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
        aria-hidden="true"
      />
      {/* ── Decorative SVG: floating constellation dots ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.35, zIndex: 0 }}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="hero-dot-fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Scattered dots — constellation feel */}
        {[
          [80, 120], [160, 60], [240, 180], [340, 90], [420, 200],
          [520, 70], [620, 150], [720, 50], [820, 180], [920, 100],
          [100, 320], [280, 380], [460, 290], [640, 360], [800, 300],
          [150, 500], [350, 560], [550, 480], [750, 540], [950, 460],
          [50, 650], [250, 700], [450, 620], [650, 680], [850, 600],
        ]?.map(([cx, cy], i) => (
          <circle
            key={`hero-dot-${i}`}
            cx={cx}
            cy={cy}
            r={i % 3 === 0 ? 2 : 1.2}
            fill="var(--color-primary)"
            opacity={i % 4 === 0 ? 0.5 : 0.25}
          />
        ))}
        {/* Thin connecting lines between some dots */}
        <line x1="80" y1="120" x2="160" y2="60" stroke="var(--color-primary)" strokeWidth="0.5" opacity="0.15" />
        <line x1="160" y1="60" x2="340" y2="90" stroke="var(--color-primary)" strokeWidth="0.5" opacity="0.12" />
        <line x1="520" y1="70" x2="620" y2="150" stroke="var(--color-lavender)" strokeWidth="0.5" opacity="0.15" />
        <line x1="100" y1="320" x2="280" y2="380" stroke="var(--color-lavender)" strokeWidth="0.5" opacity="0.12" />
        <line x1="460" y1="290" x2="640" y2="360" stroke="var(--color-primary)" strokeWidth="0.5" opacity="0.1" />
      </svg>
      {/* ── Decorative SVG: soft wave arcs ── */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full pointer-events-none"
        style={{ height: '200px', opacity: 0.18, zIndex: 0 }}
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,100 C240,160 480,40 720,100 C960,160 1200,40 1440,100 L1440,200 L0,200 Z"
          fill="var(--color-primary)"
        />
        <path
          d="M0,130 C360,80 720,170 1080,120 C1260,95 1380,140 1440,130 L1440,200 L0,200 Z"
          fill="var(--color-lavender)"
          opacity="0.5"
        />
      </svg>
      {/* ── Grain texture overlay ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.025, zIndex: 1, mixBlendMode: 'overlay' }}
        aria-hidden="true"
      >
        <filter id="hero-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-noise)" />
      </svg>
      {/* ── Content ── */}
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
          <Link
            href="/sign-up"
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
        style={{ color: 'var(--color-text-subtle)', fontSize: '12px', fontFamily: 'var(--font-ui)', zIndex: 10 }}
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