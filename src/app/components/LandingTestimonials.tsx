import React from 'react';

const testimonials = [
  {
    key: 'testi-aarav',
    quote: 'Pehli baar kisi ne mujhe sirf suna — bina kuch solve karne ki koshish kiye. That felt different.',
    name: 'Aarav S.',
    meta: 'Mumbai · 3 weeks with Dhira',
    moodColor: '#8FBCA4',
    mood: 'Calmer',
  },
  {
    key: 'testi-priya',
    quote: 'The 2 AM check-in message felt like someone actually cared enough to show up. Unexpected.',
    name: 'Priya K.',
    meta: 'Bengaluru · 5-day streak',
    moodColor: '#79C2C4',
    mood: 'Hopeful',
  },
  {
    key: 'testi-rohan',
    quote: 'Mujhe pata tha ye AI hai, phir bhi laga koi sun raha hai. That\'s the whole point, isn\'t it.',
    name: 'Rohan M.',
    meta: 'Delhi · 2 weeks with Dhira',
    moodColor: '#F0C46B',
    mood: 'Lighter',
  },
];

export default function LandingTestimonials() {
  return (
    <section
      className="py-24 px-6 lg:px-10"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="max-w-screen-xl mx-auto">
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
              className="dhira-card p-6 flex flex-col gap-5 feature-card-hover"
            >
              {/* Mood tag */}
              <div className="flex items-center gap-2">
                <span
                  className="inline-block rounded-full"
                  style={{ width: 10, height: 10, backgroundColor: t?.moodColor, flexShrink: 0 }}
                />
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-subtle)', fontWeight: 500 }}>
                  Feeling: {t?.mood}
                </span>
              </div>

              <blockquote
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
                className="pt-4 flex items-center gap-3"
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