'use client';

import React from 'react';
import MoodBadge from '@/components/MoodBadge';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface HomeMoodCardProps {
  onLogMood: () => void;
}

// Mock data — backend: query mood_logs where profile_id = current AND date = today
const todayMood = {
  mood: 'anxious',
  valence: 0.32,
  intensity: 0.65,
  topic: 'work',
  time: '10:42 PM',
  trend: 'down' as 'up' | 'down' | 'flat',
  trendNote: 'Lower than yesterday',
};

export default function HomeMoodCard({ onLogMood }: HomeMoodCardProps) {
  const moodColors: Record<string, string> = {
    anxious: '#8794DA',
    calm: '#8FBCA4',
    happy: '#F0C46B',
    sad: '#7089B0',
    stressed: '#E0A94F',
    neutral: '#B9B2A4',
    hopeful: '#79C2C4',
    lonely: '#A99BC9',
    overwhelmed: '#9C6B8E',
    angry: '#C56B5C',
  };

  const moodColor = moodColors[todayMood.mood] ?? '#B9B2A4';

  const TrendIcon = todayMood.trend === 'up' ? TrendingUp : todayMood.trend === 'down' ? TrendingDown : Minus;
  const trendColor = todayMood.trend === 'up' ? 'var(--color-sage)' : todayMood.trend === 'down' ? 'var(--color-crisis)' : 'var(--color-text-subtle)';

  return (
    <div
      className="dhira-card p-6 h-full flex flex-col gap-5"
      style={{ minHeight: '220px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Today&apos;s mood
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Logged at {todayMood.time}
          </p>
        </div>
        <button
          onClick={onLogMood}
          className="btn-ghost"
          style={{ fontSize: '13px', padding: '6px 14px' }}
        >
          Update
        </button>
      </div>

      {/* Mood display */}
      <div className="flex items-center gap-4">
        {/* Mood orb */}
        <div
          className="rounded-full flex-shrink-0 flex items-center justify-center"
          style={{
            width: 64,
            height: 64,
            backgroundColor: moodColor,
            boxShadow: `0 0 24px ${moodColor}55`,
          }}
        >
          <span style={{ fontSize: '26px' }}>
            {todayMood.mood === 'anxious' ? '😰' : todayMood.mood === 'calm' ? '😌' : todayMood.mood === 'happy' ? '😊' : todayMood.mood === 'sad' ? '😔' : '😶'}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <MoodBadge mood={todayMood.mood} size="lg" />
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Topic: <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{todayMood.topic}</span>
          </p>
        </div>
      </div>

      {/* Intensity bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-subtle)' }}>
            Emotional intensity
          </span>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            {Math.round(todayMood.intensity * 100)}%
          </span>
        </div>
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: 6, backgroundColor: 'var(--color-border)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${todayMood.intensity * 100}%`, backgroundColor: moodColor }}
          />
        </div>
      </div>

      {/* Trend */}
      <div className="flex items-center gap-2 mt-auto">
        <TrendIcon size={14} style={{ color: trendColor }} />
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: trendColor }}>
          {todayMood.trendNote}
        </span>
      </div>
    </div>
  );
}