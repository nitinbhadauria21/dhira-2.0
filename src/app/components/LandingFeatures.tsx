import React from 'react';
import Image from 'next/image';

const features = [
  {
    key: 'feat-listens',
    emoji: '👂',
    title: 'Listens, never advises',
    body: 'Dhira reflects what you feel and asks one gentle question at a time. No scripts, no unsolicited advice — just space to be heard.',
    detail: '"That sounds heavy. Tell me more."',
    accent: 'var(--color-lavender)',
    span: 'xl:col-span-2',
  },
  {
    key: 'feat-remembers',
    emoji: '🌙',
    title: 'Remembers gently',
    body: 'After each chat, Dhira keeps a quiet note. Next time she starts from where you left off — work, family, that 2 AM spiral.',
    detail: '"Last time work was sitting heavy — how\'s that today?"',
    accent: 'var(--color-primary)',
    span: 'xl:col-span-1',
  },
  {
    key: 'feat-reaches',
    emoji: '💬',
    title: 'Reaches out first',
    body: 'Within your chosen window, Dhira checks in on WhatsApp or email — because sometimes starting is the hard part.',
    detail: '"Kal thoda heavy lag raha tha. Just checking in."',
    accent: 'var(--color-sage)',
    span: 'xl:col-span-1',
  },
  {
    key: 'feat-safety',
    emoji: '🕊️',
    title: 'Safety built in',
    body: 'When things feel too heavy, Dhira steps back and surfaces real help — Tele-MANAS 14416, free and 24×7 across India.',
    detail: 'You don\'t have to be alone with this.',
    accent: 'var(--color-accent)',
    span: 'xl:col-span-2',
  },
];

export default function LandingFeatures() {
  return (
    <section
      id="features"
      className="py-24 px-6 lg:px-10 relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* ── Illustrated SVG background ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ zIndex: 0 }}>
        <Image
          src="/assets/features-bg-illustration.svg"
          alt=""
          fill
          style={{ objectFit: 'cover', opacity: 0.18 }}
        />
      </div>
      {/* ── Organic blob: top-right lavender ── */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(ellipse 55% 60% at 60% 40%, rgba(174, 161, 218, 0.14) 0%, transparent 65%)',
          filter: 'blur(50px)',
          borderRadius: '40% 60% 55% 45% / 50% 45% 55% 50%',
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      {/* ── Organic blob: bottom-left sage ── */}
      <div
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(ellipse 60% 55% at 40% 60%, rgba(99, 161, 131, 0.11) 0%, transparent 65%)',
          filter: 'blur(55px)',
          borderRadius: '55% 45% 40% 60% / 45% 55% 50% 50%',
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      {/* ── Organic blob: center amber accent ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '300px',
          background: 'radial-gradient(ellipse, rgba(239, 169, 74, 0.07) 0%, transparent 65%)',
          filter: 'blur(60px)',
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
          <pattern id="feat-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" fill="var(--color-border)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#feat-dots)" />

        {/* Illustrated organic curves */}
        <path
          d="M -50 150 Q 200 50 400 200 Q 600 350 800 180 Q 1000 20 1200 160 Q 1350 260 1500 140"
          fill="none"
          stroke="var(--color-lavender)"
          strokeWidth="1.5"
          opacity="0.25"
          strokeDasharray="8 16"
        />
        <path
          d="M 0 500 Q 300 400 550 520 Q 750 620 1000 480 Q 1200 360 1440 500"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="1"
          opacity="0.18"
          strokeDasharray="5 18"
        />

        {/* Illustrated small shapes */}
        <ellipse cx="80" cy="100" rx="20" ry="13" fill="var(--color-lavender)" opacity="0.12" transform="rotate(-15, 80, 100)" />
        <ellipse cx="1360" cy="200" rx="18" ry="11" fill="var(--color-accent)" opacity="0.14" transform="rotate(20, 1360, 200)" />
        <ellipse cx="700" cy="80" rx="15" ry="9" fill="var(--color-sage)" opacity="0.1" transform="rotate(-5, 700, 80)" />

        {/* Asterisk accents */}
        {[
          { x: 180, y: 300, size: 7, color: 'var(--color-lavender)', opacity: 0.3 },
          { x: 1280, y: 400, size: 6, color: 'var(--color-primary)', opacity: 0.28 },
          { x: 600, y: 550, size: 5, color: 'var(--color-accent)', opacity: 0.25 },
          { x: 950, y: 120, size: 6, color: 'var(--color-sage)', opacity: 0.28 },
        ]?.map((star, i) => (
          <g key={`feat-star-${i}`} transform={`translate(${star?.x}, ${star?.y})`} opacity={star?.opacity}>
            <line x1={-star?.size} y1="0" x2={star?.size} y2="0" stroke={star?.color} strokeWidth="1.5" />
            <line x1="0" y1={-star?.size} x2="0" y2={star?.size} stroke={star?.color} strokeWidth="1.5" />
            <line x1={-star?.size * 0.7} y1={-star?.size * 0.7} x2={star?.size * 0.7} y2={star?.size * 0.7} stroke={star?.color} strokeWidth="1" />
            <line x1={star?.size * 0.7} y1={-star?.size * 0.7} x2={-star?.size * 0.7} y2={star?.size * 0.7} stroke={star?.color} strokeWidth="1" />
          </g>
        ))}

        {/* Decorative rings */}
        <circle cx="1380" cy="100" r="18" fill="none" stroke="var(--color-lavender)" strokeWidth="1" opacity="0.2" />
        <circle cx="60" cy="500" r="14" fill="none" stroke="var(--color-sage)" strokeWidth="1" opacity="0.18" />
        <circle cx="720" cy="600" r="22" fill="none" stroke="var(--color-primary)" strokeWidth="1" opacity="0.15" />
      </svg>
      <div className="max-w-screen-xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <p
            className="mb-3 uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.12em' }}
          >
            What Dhira does
          </p>
          <h2
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 500, color: 'var(--color-text)' }}
          >
            Designed for the hardest hour
          </h2>
        </div>

        {/* Asymmetric bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {features?.map((f) => (
            <div
              key={f?.key}
              className={`dhira-card feature-card-hover p-6 flex flex-col gap-4 relative overflow-hidden ${f?.span}`}
              style={{ backdropFilter: 'blur(4px)', backgroundColor: 'var(--color-glass)' }}
            >
              {/* Card accent glow */}
              <div
                className="absolute top-0 right-0 pointer-events-none"
                style={{
                  width: '140px',
                  height: '140px',
                  background: `radial-gradient(ellipse, ${f?.accent}28 0%, transparent 70%)`,
                  filter: 'blur(20px)',
                }}
                aria-hidden="true"
              />
              {/* Card bottom-left glow */}
              <div
                className="absolute bottom-0 left-0 pointer-events-none"
                style={{
                  width: '100px',
                  height: '100px',
                  background: `radial-gradient(ellipse, ${f?.accent}14 0%, transparent 70%)`,
                  filter: 'blur(15px)',
                }}
                aria-hidden="true"
              />
              <div
                className="w-12 h-12 rounded-control flex items-center justify-center text-2xl flex-shrink-0 relative z-10"
                style={{ backgroundColor: `${f?.accent}18`, border: `1px solid ${f?.accent}30` }}
              >
                {f?.emoji}
              </div>
              <div className="relative z-10">
                <h3
                  className="mb-2"
                  style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, color: 'var(--color-text)' }}
                >
                  {f?.title}
                </h3>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', color: 'var(--color-text-muted)', lineHeight: 1.65 }}>
                  {f?.body}
                </p>
              </div>
              <div
                className="mt-auto pt-4 relative z-10"
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
                  {f?.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}