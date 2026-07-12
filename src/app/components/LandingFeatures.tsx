import React from 'react';

const features = [
  {
    key: 'feat-listens',
    emoji: '👂',
    title: 'Listens, never advises',
    body: 'Dhira reflects your feelings and asks one gentle question at a time. No prescriptions, no unsolicited advice — just a space to be heard.',
    detail: '"That sounds heavy. Tell me more."',
    accent: 'var(--color-lavender)',
    span: 'xl:col-span-2',
  },
  {
    key: 'feat-remembers',
    emoji: '🌙',
    title: 'Remembers gently',
    body: 'After each chat, Dhira keeps a quiet note of what you shared. Next time, she starts from where you left off.',
    detail: '"Last time work was sitting heavy on you — how\'s that today?"',
    accent: 'var(--color-primary)',
    span: 'xl:col-span-1',
  },
  {
    key: 'feat-reaches',
    emoji: '💬',
    title: 'Reaches out first',
    body: 'Within your chosen window, Dhira checks in unprompted — because sometimes the hardest thing is starting the conversation.',
    detail: '"Kal thoda heavy lag raha tha. Just checking in."',
    accent: 'var(--color-sage)',
    span: 'xl:col-span-1',
  },
  {
    key: 'feat-safety',
    emoji: '🕊️',
    title: 'Safety built in',
    body: 'When things feel too heavy, Dhira steps back and connects you to real help — Tele-MANAS 14416, free and 24×7.',
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
      {/* Background decorative elements */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(ellipse, rgba(174, 161, 218, 0.1) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(99, 161, 131, 0.08) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
        aria-hidden="true"
      />
      {/* Subtle dot grid */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.2, zIndex: 0 }}
        aria-hidden="true"
      >
        <defs>
          <pattern id="feat-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" fill="var(--color-border)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#feat-dots)" />
      </svg>
      <div className="max-w-screen-xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <p
            className="mb-3 uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-accent)', fontWeight: 600, letterSpacing: '0.12em' }}
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
            >
              {/* Card accent glow */}
              <div
                className="absolute top-0 right-0 pointer-events-none"
                style={{
                  width: '120px',
                  height: '120px',
                  background: `radial-gradient(ellipse, ${f?.accent}22 0%, transparent 70%)`,
                  filter: 'blur(20px)',
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