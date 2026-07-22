'use client';

import React from 'react';
import MoodBadge from '@/components/MoodBadge';
import { TrendingDown } from 'lucide-react';
import { MOOD_COLORS, MOOD_EMOJI, type MoodId } from '@/lib/artifactDesign';

interface HomeMoodCardProps {
  onLogMood: () => void;
  latestMood: { mood: string; intensity: number; topic: string; loggedAt?: string } | null;
  trendLabel?: string | null;
}

export default function HomeMoodCard({ onLogMood, latestMood, trendLabel }: HomeMoodCardProps) {
  if (!latestMood) {
    return (
      <div
        className="dhira-card p-6 h-full flex flex-col gap-5"
        style={{ minHeight: 220, backdropFilter: 'blur(14px)' }}
      >
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--color-text-subtle)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Today&apos;s mood
        </p>
        <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center">
          <span style={{ fontSize: 34 }}>🌙</span>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 14,
              color: 'var(--color-text-muted)',
              maxWidth: 240,
            }}
          >
            No mood logged yet. Whenever you&apos;re ready, check in — there&apos;s no right answer.
          </p>
          <button onClick={onLogMood} className="btn-primary" style={{ fontSize: 14, padding: '9px 18px' }}>
            Check in now
          </button>
        </div>
      </div>
    );
  }

  const moodKey = (latestMood.mood in MOOD_COLORS ? latestMood.mood : 'neutral') as MoodId;
  const moodColor = MOOD_COLORS[moodKey].bg;
  const intensityPct = Math.round(latestMood.intensity * 100);

  return (
    <div
      className="dhira-card p-6 h-full flex flex-col gap-5"
      style={{ minHeight: 220, backdropFilter: 'blur(14px)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-text-subtle)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Today&apos;s mood
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-text-muted)' }}>
            {latestMood.loggedAt ? `Logged at ${latestMood.loggedAt}` : 'How you\'ve been feeling'}
          </p>
        </div>
        <button onClick={onLogMood} className="btn-ghost" style={{ fontSize: 13, padding: '6px 14px' }}>
          Update
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div
          className="rounded-full flex-shrink-0 flex items-center justify-center"
          style={{
            width: 64,
            height: 64,
            backgroundColor: moodColor,
            boxShadow: `0 0 24px ${moodColor}59`,
            fontSize: 26,
          }}
        >
          {MOOD_EMOJI[moodKey]}
        </div>
        <div className="flex flex-col gap-1">
          <MoodBadge mood={latestMood.mood} size="lg" />
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-text-muted)' }}>
            Topic:{' '}
            <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{latestMood.topic}</span>
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-text-subtle)' }}>
            Emotional intensity
          </span>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              color: 'var(--color-text-muted)',
              fontWeight: 500,
            }}
          >
            {intensityPct}%
          </span>
        </div>
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: 6, backgroundColor: 'var(--color-border)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${intensityPct}%`, backgroundColor: moodColor }}
          />
        </div>
      </div>

      {trendLabel && (
        <div className="flex items-center gap-2 mt-auto">
          <TrendingDown size={14} style={{ color: 'var(--color-crisis)' }} />
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-crisis)' }}>
            {trendLabel}
          </span>
        </div>
      )}
    </div>
  );
}
