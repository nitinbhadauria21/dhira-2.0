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
      className="py-24 px-6 lg:px-10"
      style={{ backgroundColor: 'var(--color-surface-alt)' }}
    >
      <div className="max-w-screen-xl mx-auto">
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
            <div key={step?.key} className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span
                  className="font-display text-4xl font-medium flex-shrink-0"
                  style={{ color: 'var(--color-primary)', opacity: 0.35, fontFamily: 'var(--font-display)', lineHeight: 1 }}
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