import React from 'react';

const testimonials = [
  {
    key: 'testi-aarav',
    quote:
      'Pehli baar kisi ne mujhe sirf suna — bina kuch solve karne ki koshish kiye. That felt different.',
    name: 'Aarav S.',
    meta: 'Mumbai · 3 weeks with Dhira',
    moodColor: '#7FB89A',
    mood: 'Calmer',
  },
  {
    key: 'testi-priya',
    quote:
      'The 2 AM check-in felt like someone actually cared enough to show up. Unexpected — in a good way.',
    name: 'Priya K.',
    meta: 'Bengaluru · 5-day streak',
    moodColor: '#79C2C4',
    mood: 'Hopeful',
  },
  {
    key: 'testi-rohan',
    quote:
      'Mujhe pata tha ye AI hai, phir bhi laga koi sun raha hai. That\'s the whole point, isn\'t it.',
    name: 'Rohan M.',
    meta: 'Delhi · My Dhira weekly view',
    moodColor: '#F5BC5C',
    mood: 'Lighter',
  },
];

export default function LandingTestimonials() {
  return (
    <section
      className="page-section relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="page-wide relative z-10">
        <div className="text-center-safe mb-12 mx-auto" style={{ maxWidth: '32rem' }}>
          <p
            className="mb-3 uppercase"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '12px',
              color: 'var(--color-sage)',
              fontWeight: 600,
              letterSpacing: '0.14em',
            }}
          >
            What people say
          </p>
          <h2 className="text-h2" style={{ color: 'var(--color-text)' }}>
            Felt, not just read
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.key}
              className="feature-card-hover p-6 flex flex-col gap-5"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block rounded-full"
                  style={{ width: 10, height: 10, backgroundColor: t.moodColor, flexShrink: 0 }}
                />
                <span
                  className="text-small"
                  style={{ color: 'var(--color-text-subtle)', fontWeight: 500 }}
                >
                  Feeling: {t.mood}
                </span>
              </div>

              <blockquote
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '17px',
                  fontWeight: 500,
                  fontStyle: 'italic',
                  color: 'var(--color-text)',
                  lineHeight: 1.55,
                  margin: 0,
                  letterSpacing: '-0.015em',
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div
                className="pt-4 flex items-center gap-3 mt-auto"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                  style={{
                    backgroundColor: 'var(--color-primary-soft)',
                    color: 'var(--color-primary)',
                    fontFamily: 'var(--font-ui)',
                  }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                    }}
                  >
                    {t.name}
                  </p>
                  <p className="text-small" style={{ color: 'var(--color-text-subtle)' }}>
                    {t.meta}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
