'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
      {/* ── Illustrated SVG background layer ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ zIndex: 0 }}>
        <Image
          src="/assets/landing-hero-illustration.svg"
          alt=""
          fill
          style={{ objectFit: 'cover', opacity: 0.2 }}
          priority
        />
      </div>
      {/* ── Organic blob 1: large indigo top-center ── */}
      <div
        className="absolute pointer-events-none hero-blob-1"
        style={{
          top: '-80px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          height: '700px',
          background: 'radial-gradient(ellipse 60% 55% at 50% 40%, rgba(90, 103, 184, 0.18) 0%, rgba(174, 161, 218, 0.08) 50%, transparent 75%)',
          filter: 'blur(24px)',
          borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
        }}
        aria-hidden="true"
      />
      {/* ── Organic blob 2: amber glow bottom-right ── */}
      <div
        className="absolute pointer-events-none hero-blob-2"
        style={{
          bottom: '5%',
          right: '-5%',
          width: '520px',
          height: '520px',
          background: 'radial-gradient(ellipse 55% 60% at 45% 50%, rgba(239, 169, 74, 0.18) 0%, rgba(239, 169, 74, 0.06) 55%, transparent 75%)',
          filter: 'blur(40px)',
          borderRadius: '45% 55% 40% 60% / 55% 45% 60% 40%',
        }}
        aria-hidden="true"
      />
      {/* ── Organic blob 3: sage green top-left ── */}
      <div
        className="absolute pointer-events-none hero-blob-3"
        style={{
          top: '10%',
          left: '-8%',
          width: '420px',
          height: '420px',
          background: 'radial-gradient(ellipse, rgba(99, 161, 131, 0.12) 0%, transparent 65%)',
          filter: 'blur(50px)',
          borderRadius: '55% 45% 60% 40% / 40% 60% 45% 55%',
        }}
        aria-hidden="true"
      />
      {/* ── Organic blob 4: lavender mid-right ── */}
      <div
        className="absolute pointer-events-none hero-blob-4"
        style={{
          top: '40%',
          right: '5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(ellipse, rgba(174, 161, 218, 0.14) 0%, transparent 65%)',
          filter: 'blur(35px)',
          borderRadius: '50% 50% 40% 60% / 60% 40% 55% 45%',
        }}
        aria-hidden="true"
      />
      {/* ── Illustrated SVG: floating organic shapes + constellation ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.2, zIndex: 1 }}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="hero-dot-fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </radialGradient>
          {/* Organic path filter */}
          <filter id="hero-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Illustrated organic curved strokes */}
        <path
          d="M 50 200 Q 200 80 380 160 Q 520 230 650 120 Q 780 30 920 140"
          fill="none"
          stroke="var(--color-lavender)"
          strokeWidth="1.5"
          opacity="0.2"
          strokeDasharray="6 10"
        />
        <path
          d="M 0 380 Q 180 300 320 420 Q 480 540 680 400 Q 840 280 1100 360"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="1"
          opacity="0.15"
          strokeDasharray="4 12"
        />
        <path
          d="M 200 600 Q 400 520 560 640 Q 720 760 900 620 Q 1060 500 1300 580"
          fill="none"
          stroke="var(--color-sage)"
          strokeWidth="1"
          opacity="0.12"
          strokeDasharray="3 14"
        />

        {/* Illustrated small organic blobs */}
        <ellipse cx="120" cy="180" rx="28" ry="18" fill="var(--color-lavender)" opacity="0.1" transform="rotate(-20, 120, 180)" />
        <ellipse cx="900" cy="120" rx="22" ry="14" fill="var(--color-accent)" opacity="0.12" transform="rotate(15, 900, 120)" />
        <ellipse cx="1100" cy="400" rx="32" ry="20" fill="var(--color-primary)" opacity="0.08" transform="rotate(-10, 1100, 400)" />
        <ellipse cx="200" cy="550" rx="18" ry="12" fill="var(--color-sage)" opacity="0.1" transform="rotate(25, 200, 550)" />
        <ellipse cx="750" cy="600" rx="24" ry="16" fill="var(--color-lavender)" opacity="0.09" transform="rotate(-15, 750, 600)" />

        {/* Constellation dots */}
        {[
          [80, 120], [160, 60], [240, 180], [340, 90], [420, 200],
          [520, 70], [620, 150], [720, 50], [820, 180], [920, 100],
          [100, 320], [280, 380], [460, 290], [640, 360], [800, 300],
          [150, 500], [350, 560], [550, 480], [750, 540], [950, 460],
          [50, 650], [250, 700], [450, 620], [650, 680], [850, 600],
          [1050, 200], [1150, 350], [1250, 150], [1350, 280], [1100, 500],
        ]?.map(([cx, cy], i) => (
          <circle
            key={`hero-dot-${i}`}
            cx={cx}
            cy={cy}
            r={i % 3 === 0 ? 2.2 : 1.4}
            fill="var(--color-primary)"
            opacity={i % 4 === 0 ? 0.55 : 0.28}
          />
        ))}

        {/* Connecting lines */}
        <line x1="80" y1="120" x2="160" y2="60" stroke="var(--color-primary)" strokeWidth="0.6" opacity="0.18" />
        <line x1="160" y1="60" x2="340" y2="90" stroke="var(--color-primary)" strokeWidth="0.6" opacity="0.14" />
        <line x1="520" y1="70" x2="620" y2="150" stroke="var(--color-lavender)" strokeWidth="0.6" opacity="0.18" />
        <line x1="100" y1="320" x2="280" y2="380" stroke="var(--color-lavender)" strokeWidth="0.6" opacity="0.14" />
        <line x1="460" y1="290" x2="640" y2="360" stroke="var(--color-primary)" strokeWidth="0.6" opacity="0.12" />
        <line x1="1050" y1="200" x2="1150" y2="350" stroke="var(--color-lavender)" strokeWidth="0.6" opacity="0.15" />
        <line x1="1150" y1="350" x2="1100" y2="500" stroke="var(--color-primary)" strokeWidth="0.6" opacity="0.12" />

        {/* Illustrated asterisk/star accents */}
        {[
          { x: 320, y: 250, size: 8, color: 'var(--color-accent)', opacity: 0.3 },
          { x: 980, y: 320, size: 6, color: 'var(--color-lavender)', opacity: 0.35 },
          { x: 140, y: 440, size: 7, color: 'var(--color-sage)', opacity: 0.28 },
          { x: 1200, y: 180, size: 5, color: 'var(--color-primary)', opacity: 0.3 },
          { x: 680, y: 520, size: 6, color: 'var(--color-accent)', opacity: 0.25 },
        ]?.map((star, i) => (
          <g key={`star-${i}`} transform={`translate(${star?.x}, ${star?.y})`} opacity={star?.opacity}>
            <line x1={-star?.size} y1="0" x2={star?.size} y2="0" stroke={star?.color} strokeWidth="1.5" />
            <line x1="0" y1={-star?.size} x2="0" y2={star?.size} stroke={star?.color} strokeWidth="1.5" />
            <line x1={-star?.size * 0.7} y1={-star?.size * 0.7} x2={star?.size * 0.7} y2={star?.size * 0.7} stroke={star?.color} strokeWidth="1" />
            <line x1={star?.size * 0.7} y1={-star?.size * 0.7} x2={-star?.size * 0.7} y2={star?.size * 0.7} stroke={star?.color} strokeWidth="1" />
          </g>
        ))}

        {/* Small decorative rings */}
        <circle cx="480" cy="160" r="12" fill="none" stroke="var(--color-lavender)" strokeWidth="1" opacity="0.2" />
        <circle cx="1050" cy="450" r="16" fill="none" stroke="var(--color-primary)" strokeWidth="1" opacity="0.15" />
        <circle cx="200" cy="620" r="10" fill="none" stroke="var(--color-sage)" strokeWidth="1" opacity="0.18" />
      </svg>
      {/* ── Wave arc at bottom ── */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full pointer-events-none"
        style={{ height: '220px', opacity: 0.12, zIndex: 1 }}
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,110 C240,175 480,45 720,110 C960,175 1200,45 1440,110 L1440,220 L0,220 Z"
          fill="var(--color-primary)"
        />
        <path
          d="M0,145 C360,90 720,185 1080,135 C1260,108 1380,155 1440,145 L1440,220 L0,220 Z"
          fill="var(--color-lavender)"
          opacity="0.35"
        />
        <path
          d="M0,175 C300,155 600,195 900,170 C1100,152 1300,180 1440,175 L1440,220 L0,220 Z"
          fill="var(--color-sage)"
          opacity="0.2"
        />
      </svg>
      {/* ── Grain texture overlay ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.03, zIndex: 2, mixBlendMode: 'overlay' }}
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
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(255,255,255,0.7)',
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
        .hero-blob-1 {
          animation: blobFloat1 10s ease-in-out infinite alternate;
        }
        .hero-blob-2 {
          animation: blobFloat2 13s ease-in-out infinite alternate;
        }
        .hero-blob-3 {
          animation: blobFloat3 11s ease-in-out infinite alternate;
        }
        .hero-blob-4 {
          animation: blobFloat1 9s ease-in-out infinite alternate-reverse;
        }
        @keyframes blobFloat1 {
          0% { transform: translateX(-50%) translateY(0px) scale(1); }
          100% { transform: translateX(-50%) translateY(-20px) scale(1.04); }
        }
        @keyframes blobFloat2 {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(-16px) scale(1.06); }
        }
        @keyframes blobFloat3 {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-12px) rotate(5deg); }
        }
      `}</style>
    </section>
  );
}