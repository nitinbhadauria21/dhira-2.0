import React from 'react';

const features = [
  {
    key: 'feat-listens',
    title: 'Listens, never advises',
    body: 'Dhira reflects what you feel and asks one gentle question at a time. No scripts, no unsolicited advice — just space to be heard.',
    detail: '"That sounds heavy. Tell me more."',
    accent: 'var(--color-primary)',
  },
  {
    key: 'feat-remembers',
    title: 'Remembers gently',
    body: 'After each chat, Dhira keeps a quiet note. Next time she starts from where you left off — work, family, that 2 AM spiral.',
    detail: '"Last time work was sitting heavy — how\'s that today?"',
    accent: 'var(--color-lavender)',
  },
  {
    key: 'feat-reaches',
    title: 'Reaches out first',
    body: 'Within your chosen window, Dhira checks in on WhatsApp or email — because sometimes starting is the hard part.',
    detail: '"Kal thoda heavy lag raha tha. Just checking in."',
    accent: 'var(--color-sage)',
  },
  {
    key: 'feat-safety',
    title: 'Safety built in',
    body: 'When things feel too heavy, Dhira steps back and surfaces real help — Tele-MANAS 14416, free and 24×7 across India.',
    detail: 'You don\'t have to be alone with this.',
    accent: 'var(--color-accent)',
  },
];

export default function LandingFeatures() {
  return (
    <section
      id="features"
      className="page-section relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 90% 10%, rgba(139, 150, 214, 0.12) 0%, transparent 60%)',
        }}
      />

      <div className="page-wide relative z-10">
        <div className="text-center-safe mb-12 mx-auto" style={{ maxWidth: '36rem' }}>
          <p
            className="mb-3 uppercase"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              fontWeight: 600,
              letterSpacing: '0.14em',
            }}
          >
            What Dhira does
          </p>
          <h2 className="text-h2" style={{ color: 'var(--color-text)' }}>
            Built for the hour when everything feels loud
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f) => (
            <div
              key={f.key}
              className="feature-card-hover p-6 flex flex-col gap-4"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
                borderTop: `3px solid ${f.accent}`,
              }}
            >
              <h3 className="text-h3" style={{ color: 'var(--color-text)' }}>
                {f.title}
              </h3>
              <p className="text-body" style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>
                {f.body}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '15px',
                  fontStyle: 'italic',
                  fontWeight: 500,
                  color: 'var(--color-text-subtle)',
                  marginTop: 'auto',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                {f.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
