import React from 'react';

// Mock data — backend: compute from mood_logs consecutive days
const streakData = {
  current: 6,
  longest: 14,
  totalSessions: 23,
  memberSince: '18 Jun 2026',
};

export default function HomeStreakCard() {
  return (
    <div className="dhira-card p-6 h-full flex flex-col gap-4">
      {/* Header */}
      <div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
          Check-in streak
        </p>
      </div>
      {/* Streak number */}
      <div className="flex flex-col items-center justify-center flex-1 py-2">
        <div className="streak-badge text-2xl px-4 py-2 mb-2" style={{ fontSize: '36px', borderRadius: '16px', padding: '12px 20px' }}>
          🔥 {streakData?.current}
        </div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
          days in a row
        </p>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
          You&apos;ve shown up. That matters.
        </p>
      </div>
      {/* Stats row */}
      <div
        className="grid grid-cols-2 gap-3 pt-4"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <div className="text-center">
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 500, color: 'var(--color-text)' }}>
            {streakData?.longest}
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--color-text-subtle)' }}>
            longest
          </p>
        </div>
        <div className="text-center">
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 500, color: 'var(--color-text)' }}>
            {streakData?.totalSessions}
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--color-text-subtle)' }}>
            sessions
          </p>
        </div>
      </div>
    </div>
  );
}