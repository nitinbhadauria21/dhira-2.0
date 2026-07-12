import React from 'react';
import Link from 'next/link';

export default function LandingCTA() {
  return (
    <section
      id="safety"
      className="py-24 px-6 lg:px-10 relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface-alt)' }}
    >
      {/* ── Organic background blobs ── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: '700px',
          height: '500px',
          background: 'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(239, 169, 74, 0.16) 0%, rgba(239, 169, 74, 0.06) 50%, transparent 70%)',
          filter: 'blur(45px)',
          borderRadius: '50% 50% 45% 55% / 55% 45% 50% 50%',
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          width: '400px',
          height: '350px',
          background: 'radial-gradient(ellipse, rgba(174, 161, 218, 0.1) 0%, transparent 65%)',
          filter: 'blur(55px)',
          borderRadius: '45% 55% 50% 50% / 50% 50% 55% 45%',
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 pointer-events-none"
        style={{
          width: '380px',
          height: '320px',
          background: 'radial-gradient(ellipse, rgba(90, 103, 184, 0.1) 0%, transparent 65%)',
          filter: 'blur(50px)',
          borderRadius: '55% 45% 40% 60% / 45% 55% 50% 50%',
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      {/* ── Illustrated SVG decorations ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.3, zIndex: 1 }}
        aria-hidden="true"
      >
        <defs>
          <pattern id="cta-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" fill="var(--color-accent)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cta-dots)" opacity="0.15" />

        {/* Illustrated organic curves */}
        <path
          d="M 0 80 Q 360 20 720 80 Q 1080 140 1440 80"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.2"
          opacity="0.18"
          strokeDasharray="8 16"
        />
        <path
          d="M 0 420 Q 360 360 720 420 Q 1080 480 1440 420"
          fill="none"
          stroke="var(--color-lavender)"
          strokeWidth="1"
          opacity="0.15"
          strokeDasharray="6 18"
        />

        {/* Organic shapes */}
        <ellipse cx="100" cy="150" rx="26" ry="16" fill="var(--color-accent)" opacity="0.1" transform="rotate(-20, 100, 150)" />
        <ellipse cx="1340" cy="350" rx="22" ry="14" fill="var(--color-lavender)" opacity="0.12" transform="rotate(15, 1340, 350)" />
        <ellipse cx="720" cy="50" rx="18" ry="11" fill="var(--color-primary)" opacity="0.08" />

        {/* Asterisk accents */}
        {[
          { x: 200, y: 380, size: 7, color: 'var(--color-accent)', opacity: 0.3 },
          { x: 1240, y: 120, size: 6, color: 'var(--color-lavender)', opacity: 0.28 },
          { x: 1380, y: 420, size: 5, color: 'var(--color-primary)', opacity: 0.22 },
          { x: 60, y: 300, size: 5, color: 'var(--color-accent)', opacity: 0.25 },
        ]?.map((star, i) => (
          <g key={`cta-star-${i}`} transform={`translate(${star?.x}, ${star?.y})`} opacity={star?.opacity}>
            <line x1={-star?.size} y1="0" x2={star?.size} y2="0" stroke={star?.color} strokeWidth="1.5" />
            <line x1="0" y1={-star?.size} x2="0" y2={star?.size} stroke={star?.color} strokeWidth="1.5" />
            <line x1={-star?.size * 0.7} y1={-star?.size * 0.7} x2={star?.size * 0.7} y2={star?.size * 0.7} stroke={star?.color} strokeWidth="1" />
            <line x1={star?.size * 0.7} y1={-star?.size * 0.7} x2={-star?.size * 0.7} y2={star?.size * 0.7} stroke={star?.color} strokeWidth="1" />
          </g>
        ))}

        {/* Decorative rings */}
        <circle cx="1400" cy="200" r="22" fill="none" stroke="var(--color-accent)" strokeWidth="1" opacity="0.2" />
        <circle cx="40" cy="400" r="16" fill="none" stroke="var(--color-lavender)" strokeWidth="1" opacity="0.18" />

        {/* Scattered dots */}
        {[
          [300, 50], [600, 430], [900, 60], [1100, 400], [1300, 200], [150, 250], [800, 480],
        ]?.map(([cx, cy], i) => (
          <circle key={`cta-dot-${i}`} cx={cx} cy={cy} r={1.5} fill="var(--color-accent)" opacity={0.2} />
        ))}
      </svg>
      <div className="max-w-2xl mx-auto text-center relative z-10">
        {/* Amber glow orb */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-8"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 0 40px rgba(239, 169, 74, 0.4), 0 0 80px rgba(239, 169, 74, 0.15)',
          }}
        >
          🌙
        </div>

        <h2
          className="mb-4"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 500,
            color: 'var(--color-text)',
            lineHeight: 1.2,
          }}
        >
          It&apos;s 2 AM and something feels heavy.
        </h2>
        <p
          className="mb-10"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '18px',
            color: 'var(--color-text-muted)',
            lineHeight: 1.65,
          }}
        >
          Dhira is already there. Anonymous, private, and ready to listen — no sign-up friction, no real name required.
        </p>

        <Link href="/sign-up" className="btn-accent" style={{ fontSize: '17px', padding: '16px 40px' }}>
          Begin now — it&apos;s free
        </Link>

        {/* Safety note */}
        <div
          className="mt-12 p-5 rounded-card text-left"
          style={{
            backgroundColor: 'var(--color-crisis-surface)',
            border: '1px solid var(--color-crisis)',
          }}
        >
          <p
            style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-crisis)', lineHeight: 1.6 }}
          >
            <strong>If you or someone you know is in crisis:</strong> Please call Tele-MANAS at{' '}
            <strong>14416</strong> — free, 24×7, India-wide. Dhira is a listening companion, not a crisis service.
          </p>
        </div>
      </div>
    </section>
  );
}