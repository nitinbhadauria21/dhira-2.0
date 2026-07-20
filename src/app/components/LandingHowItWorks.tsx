import React from 'react';

const steps = [
  {
    key: 'step-name',
    number: '01',
    title: 'Pick an alias',
    body: 'Create a private space with email or phone. Use any nickname — never your real name. Your rules from minute one.',
  },
  {
    key: 'step-contract',
    number: '02',
    title: 'Set your check-in window',
    body: 'Tell Dhira when she may reach out — late night, a few times a week, in Hinglish or English. Pause anytime.',
  },
  {
    key: 'step-chat',
    number: '03',
    title: 'Talk. Be heard.',
    body: 'Open chat anytime, or let Dhira come to you. She listens, reflects, and asks one gentle question.',
  },
  {
    key: 'step-timeline',
    number: '04',
    title: 'See your week in My Dhira',
    body: 'Mood, journal, chats, and check-in history in one calm place — no judgement, just colour and continuity.',
  },
];

export default function LandingHowItWorks() {
  return (
    <section
      className="page-section relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface-alt)' }}
    >
      <div className="page-wide relative z-10">
        <div className="text-center-safe mb-12 mx-auto" style={{ maxWidth: '32rem' }}>
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
            How it works
          </p>
          <h2 className="text-h2" style={{ color: 'var(--color-text)' }}>
            Four quiet steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.key} className="flex flex-col gap-3">
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '40px',
                  fontWeight: 650,
                  color: 'var(--color-primary)',
                  opacity: 0.45,
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                }}
              >
                {step.number}
              </span>
              <h3 className="text-h3" style={{ color: 'var(--color-text)' }}>
                {step.title}
              </h3>
              <p
                className="text-body"
                style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}
              >
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
