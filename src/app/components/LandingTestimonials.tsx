import React from 'react';

import { TESTIMONIALS } from '@/lib/artifactDesign';

const testimonials = TESTIMONIALS.map((t, i) => ({
  key: `testi-${i}`,
  ...t,
}));

export default function LandingTestimonials() {
  return (
    <section
      className="py-24 px-6 lg:px-10 relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* ── Organic background blobs ── */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: '550px',
          height: '450px',
          background: 'radial-gradient(ellipse 55% 60% at 60% 40%, rgba(99, 161, 131, 0.1) 0%, transparent 65%)',
          filter: 'blur(55px)',
          borderRadius: '45% 55% 50% 50% / 50% 50% 55% 45%',
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{
          width: '480px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(90, 103, 184, 0.1) 0%, transparent 65%)',
          filter: 'blur(50px)',
          borderRadius: '55% 45% 40% 60% / 45% 55% 50% 50%',
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '350px',
          height: '280px',
          background: 'radial-gradient(ellipse, rgba(239, 169, 74, 0.07) 0%, transparent 65%)',
          filter: 'blur(60px)',
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      {/* ── Illustrated SVG decorations ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.28, zIndex: 1 }}
        aria-hidden="true"
      >
        {/* Flowing curves */}
        <path
          d="M 0 100 Q 300 40 600 120 Q 900 200 1200 100 Q 1350 60 1440 100"
          fill="none"
          stroke="var(--color-sage)"
          strokeWidth="1.2"
          opacity="0.2"
          strokeDasharray="7 15"
        />
        <path
          d="M 0 450 Q 400 380 720 460 Q 1000 530 1440 430"
          fill="none"
          stroke="var(--color-lavender)"
          strokeWidth="1"
          opacity="0.18"
          strokeDasharray="5 18"
        />

        {/* Organic shapes */}
        <ellipse cx="150" cy="200" rx="22" ry="14" fill="var(--color-sage)" opacity="0.12" transform="rotate(-18, 150, 200)" />
        <ellipse cx="1300" cy="150" rx="19" ry="12" fill="var(--color-lavender)" opacity="0.13" transform="rotate(12, 1300, 150)" />
        <ellipse cx="720" cy="500" rx="16" ry="10" fill="var(--color-accent)" opacity="0.1" />

        {/* Asterisk accents */}
        {[
          { x: 80, y: 400, size: 6, color: 'var(--color-sage)', opacity: 0.28 },
          { x: 1360, y: 300, size: 5, color: 'var(--color-lavender)', opacity: 0.25 },
          { x: 720, y: 80, size: 7, color: 'var(--color-primary)', opacity: 0.22 },
          { x: 400, y: 520, size: 5, color: 'var(--color-accent)', opacity: 0.2 },
        ]?.map((star, i) => (
          <g key={`testi-star-${i}`} transform={`translate(${star?.x}, ${star?.y})`} opacity={star?.opacity}>
            <line x1={-star?.size} y1="0" x2={star?.size} y2="0" stroke={star?.color} strokeWidth="1.5" />
            <line x1="0" y1={-star?.size} x2="0" y2={star?.size} stroke={star?.color} strokeWidth="1.5" />
            <line x1={-star?.size * 0.7} y1={-star?.size * 0.7} x2={star?.size * 0.7} y2={star?.size * 0.7} stroke={star?.color} strokeWidth="1" />
            <line x1={star?.size * 0.7} y1={-star?.size * 0.7} x2={-star?.size * 0.7} y2={star?.size * 0.7} stroke={star?.color} strokeWidth="1" />
          </g>
        ))}

        {/* Decorative rings */}
        <circle cx="1400" cy="450" r="20" fill="none" stroke="var(--color-sage)" strokeWidth="1" opacity="0.18" />
        <circle cx="40" cy="150" r="14" fill="none" stroke="var(--color-primary)" strokeWidth="1" opacity="0.15" />

        {/* Scattered dots */}
        {[
          [250, 60], [500, 480], [800, 40], [1100, 500], [1300, 80], [200, 380], [950, 300],
        ]?.map(([cx, cy], i) => (
          <circle key={`testi-dot-${i}`} cx={cx} cy={cy} r={1.5} fill="var(--color-primary)" opacity={0.2} />
        ))}
      </svg>
      <div className="max-w-screen-xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <p
            className="mb-3 uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-sage)', fontWeight: 600, letterSpacing: '0.12em' }}
          >
            What people say
          </p>
          <h2
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 500, color: 'var(--color-text)' }}
          >
            Felt, not just read
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials?.map((t) => (
            <div
              key={t?.key}
              className="dhira-card p-6 flex flex-col gap-5 feature-card-hover relative overflow-hidden"
              style={{ backdropFilter: 'blur(4px)', backgroundColor: 'var(--color-glass)' }}
            >
              {/* Card mood glow */}
              <div
                className="absolute top-0 right-0 pointer-events-none"
                style={{
                  width: '120px',
                  height: '120px',
                  background: `radial-gradient(ellipse, ${t?.moodColor}22 0%, transparent 70%)`,
                  filter: 'blur(16px)',
                }}
                aria-hidden="true"
              />
              {/* Mood tag */}
              <div className="flex items-center gap-2 relative z-10">
                <span
                  className="inline-block rounded-full"
                  style={{ width: 10, height: 10, backgroundColor: t?.moodColor, flexShrink: 0 }}
                />
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-subtle)', fontWeight: 500 }}>
                  Feeling: {t?.mood}
                </span>
              </div>

              <blockquote
                className="relative z-10"
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '16px',
                  color: 'var(--color-text)',
                  lineHeight: 1.65,
                  fontStyle: 'italic',
                  margin: 0,
                }}
              >
                &ldquo;{t?.quote}&rdquo;
              </blockquote>

              <div
                className="pt-4 flex items-center gap-3 relative z-10"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)', fontFamily: 'var(--font-ui)' }}
                >
                  {t?.name?.[0]}
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>{t?.name}</p>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-subtle)' }}>{t?.meta}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}