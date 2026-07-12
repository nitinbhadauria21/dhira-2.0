import React from 'react';

const steps = [
  {
    key: 'step-name',
    number: '01',
    title: 'Choose a name — any name',
    body: 'Pick a nickname. No email, no ID, no real name ever required. You\'re anonymous from the first moment.',
  },
  {
    key: 'step-contract',
    title: 'Set your check-in window',
    number: '02',
    body: 'Tell Dhira when she may reach out — 10 PM to 1 AM, a few times a week, in Hinglish. Your rules.',
  },
  {
    key: 'step-chat',
    number: '03',
    title: 'Talk. Be heard.',
    body: 'Open a chat anytime, or let Dhira come to you. She listens, reflects, and asks one gentle question.',
  },
  {
    key: 'step-timeline',
    number: '04',
    title: 'Watch your mood move',
    body: 'A quiet 14-day mood timeline shows you how you\'ve been — no judgement, just colour and continuity.',
  },
];

export default function LandingHowItWorks() {
  return (
    <section
      className="py-24 px-6 lg:px-10 relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface-alt)' }}
    >
      {/* ── Organic background blobs ── */}
      <div
        className="absolute top-0 left-1/4 pointer-events-none"
        style={{
          width: '500px',
          height: '400px',
          background: 'radial-gradient(ellipse 55% 60% at 50% 50%, rgba(174, 161, 218, 0.12) 0%, transparent 65%)',
          filter: 'blur(50px)',
          borderRadius: '50% 50% 45% 55% / 55% 45% 50% 50%',
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-1/4 pointer-events-none"
        style={{
          width: '400px',
          height: '350px',
          background: 'radial-gradient(ellipse, rgba(99, 161, 131, 0.1) 0%, transparent 65%)',
          filter: 'blur(55px)',
          borderRadius: '45% 55% 50% 50% / 50% 50% 55% 45%',
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      {/* ── Illustrated SVG decorations ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.14, zIndex: 1 }}
        aria-hidden="true"
      >
        {/* Horizontal flowing line connecting steps */}
        <path
          d="M 80 200 Q 360 140 640 200 Q 920 260 1200 200 Q 1360 170 1440 200"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="1"
          opacity="0.2"
          strokeDasharray="6 14"
        />
        {/* Decorative organic shapes */}
        <ellipse cx="200" cy="120" rx="24" ry="15" fill="var(--color-lavender)" opacity="0.12" transform="rotate(-20, 200, 120)" />
        <ellipse cx="1240" cy="300" rx="20" ry="13" fill="var(--color-sage)" opacity="0.12" transform="rotate(15, 1240, 300)" />
        <ellipse cx="720" cy="400" rx="18" ry="11" fill="var(--color-accent)" opacity="0.1" transform="rotate(-10, 720, 400)" />

        {/* Asterisk accents */}
        {[
          { x: 100, y: 350, size: 6, color: 'var(--color-lavender)', opacity: 0.28 },
          { x: 1340, y: 150, size: 5, color: 'var(--color-primary)', opacity: 0.25 },
          { x: 720, y: 80, size: 7, color: 'var(--color-accent)', opacity: 0.22 },
        ]?.map((star, i) => (
          <g key={`hiw-star-${i}`} transform={`translate(${star?.x}, ${star?.y})`} opacity={star?.opacity}>
            <line x1={-star?.size} y1="0" x2={star?.size} y2="0" stroke={star?.color} strokeWidth="1.5" />
            <line x1="0" y1={-star?.size} x2="0" y2={star?.size} stroke={star?.color} strokeWidth="1.5" />
            <line x1={-star?.size * 0.7} y1={-star?.size * 0.7} x2={star?.size * 0.7} y2={star?.size * 0.7} stroke={star?.color} strokeWidth="1" />
            <line x1={star?.size * 0.7} y1={-star?.size * 0.7} x2={-star?.size * 0.7} y2={star?.size * 0.7} stroke={star?.color} strokeWidth="1" />
          </g>
        ))}

        {/* Decorative rings */}
        <circle cx="1380" cy="350" r="16" fill="none" stroke="var(--color-lavender)" strokeWidth="1" opacity="0.2" />
        <circle cx="60" cy="200" r="12" fill="none" stroke="var(--color-sage)" strokeWidth="1" opacity="0.18" />

        {/* Scattered dots */}
        {[
          [300, 80], [600, 350], [900, 100], [1100, 380], [400, 420], [800, 50], [1300, 280],
        ]?.map(([cx, cy], i) => (
          <circle key={`hiw-dot-${i}`} cx={cx} cy={cy} r={1.5} fill="var(--color-primary)" opacity={0.2} />
        ))}
      </svg>
      <div className="max-w-screen-xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <p
            className="mb-3 uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-lavender)', fontWeight: 600, letterSpacing: '0.12em' }}
          >
            How it works
          </p>
          <h2
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 500, color: 'var(--color-text)' }}
          >
            Four quiet steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {steps?.map((step, idx) => (
            <div key={step?.key} className="flex flex-col gap-4 relative">
              {/* Step number glow */}
              <div
                className="absolute -top-2 -left-2 pointer-events-none"
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'radial-gradient(ellipse, rgba(90, 103, 184, 0.1) 0%, transparent 70%)',
                  filter: 'blur(12px)',
                }}
                aria-hidden="true"
              />
              <div className="flex items-center gap-4">
                <span
                  className="font-display text-4xl font-medium flex-shrink-0"
                  style={{ color: 'var(--color-primary)', opacity: 0.4, fontFamily: 'var(--font-display)', lineHeight: 1 }}
                >
                  {step?.number}
                </span>
                {idx < steps?.length - 1 && (
                  <div
                    className="hidden xl:block flex-1 h-px"
                    style={{ backgroundColor: 'var(--color-border)' }}
                    aria-hidden="true"
                  />
                )}
              </div>
              <h3
                style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, color: 'var(--color-text)' }}
              >
                {step?.title}
              </h3>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', color: 'var(--color-text-muted)', lineHeight: 1.65 }}>
                {step?.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}