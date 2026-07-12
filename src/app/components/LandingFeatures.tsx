import React from 'react';

const features = [
  {
    key: 'feat-listens',
    emoji: '👂',
    title: 'Listens, never advises',
    body: 'Dhira reflects your feelings and asks one gentle question at a time. No prescriptions, no unsolicited advice — just a space to be heard.',
    detail: '"That sounds heavy. Tell me more."',
  },
  {
    key: 'feat-remembers',
    emoji: '🌙',
    title: 'Remembers gently',
    body: 'After each chat, Dhira keeps a quiet note of what you shared. Next time, she starts from where you left off.',
    detail: '"Last time work was sitting heavy on you — how\'s that today?"',
  },
  {
    key: 'feat-reaches',
    emoji: '💬',
    title: 'Reaches out first',
    body: 'Within your chosen window, Dhira checks in unprompted — because sometimes the hardest thing is starting the conversation.',
    detail: '"Kal thoda heavy lag raha tha. Just checking in."',
  },
  {
    key: 'feat-safety',
    emoji: '🕊️',
    title: 'Safety built in',
    body: 'When things feel too heavy, Dhira steps back and connects you to real help — Tele-MANAS 14416, free and 24×7.',
    detail: 'You don\'t have to be alone with this.',
  },
];

export default function LandingFeatures() {
  return (
    <section
      id="features"
      className="py-24 px-6 lg:px-10"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="max-w-screen-xl mx-auto">
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

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {features?.map((f) => (
            <div
              key={f?.key}
              className="dhira-card feature-card-hover p-6 flex flex-col gap-4"
            >
              <div
                className="w-12 h-12 rounded-control flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: 'var(--color-primary-soft)' }}
              >
                {f?.emoji}
              </div>
              <div>
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
                className="mt-auto pt-4"
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