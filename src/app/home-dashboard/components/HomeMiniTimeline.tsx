'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Mock data — backend: query mood_logs last 7 days for this profile
const MOOD_COLORS: Record<string, string> = {
  happy:       '#F0C46B',
  calm:        '#8FBCA4',
  hopeful:     '#79C2C4',
  neutral:     '#B9B2A4',
  stressed:    '#E0A94F',
  anxious:     '#8794DA',
  lonely:      '#A99BC9',
  overwhelmed: '#9C6B8E',
  sad:         '#7089B0',
  angry:       '#C56B5C',
};

const weekMoods = [
  { key: 'day-sat', day: 'Sat', date: '5', mood: 'calm', logged: true },
  { key: 'day-sun', day: 'Sun', date: '6', mood: 'hopeful', logged: true },
  { key: 'day-mon', day: 'Mon', date: '7', mood: 'stressed', logged: true },
  { key: 'day-tue', day: 'Tue', date: '8', mood: 'overwhelmed', logged: true },
  { key: 'day-wed', day: 'Wed', date: '9', mood: 'anxious', logged: true },
  { key: 'day-thu', day: 'Thu', date: '10', mood: 'anxious', logged: true },
  { key: 'day-fri', day: 'Fri', date: '11', mood: 'anxious', logged: true, isToday: true },
];

const moodLabels: Record<string, string> = {
  happy: 'Happy', calm: 'Calm', hopeful: 'Hopeful', neutral: 'Neutral',
  stressed: 'Stressed', anxious: 'Anxious', lonely: 'Lonely',
  overwhelmed: 'Overwhelmed', sad: 'Sad', angry: 'Angry',
};

export default function HomeMiniTimeline() {
  return (
    <div className="dhira-card p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
            This week
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, color: 'var(--color-text)' }}>
            7-day mood view
          </p>
        </div>
        <Link
          href="/home-dashboard#timeline"
          className="flex items-center gap-1"
          style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-primary)', fontWeight: 500 }}
        >
          Full timeline
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-3">
        {weekMoods.map((day) => {
          const color = day.logged ? MOOD_COLORS[day.mood] : 'var(--color-border)';
          return (
            <div key={day.key} className="flex flex-col items-center gap-2">
              {/* Day label */}
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '11px',
                  fontWeight: day.isToday ? 600 : 400,
                  color: day.isToday ? 'var(--color-primary)' : 'var(--color-text-subtle)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {day.day}
              </span>

              {/* Mood swatch */}
              <div
                className="rounded-control flex items-center justify-center transition-all duration-200"
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  maxWidth: '52px',
                  backgroundColor: color,
                  border: day.isToday ? `2px solid var(--color-primary)` : '2px solid transparent',
                  boxShadow: day.logged ? `0 0 12px ${color}44` : 'none',
                  cursor: day.logged ? 'pointer' : 'default',
                }}
                title={day.logged ? moodLabels[day.mood] : 'Not logged'}
              />

              {/* Date */}
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '11px',
                  color: day.isToday ? 'var(--color-primary)' : 'var(--color-text-subtle)',
                  fontWeight: day.isToday ? 600 : 400,
                }}
              >
                {day.date}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-5 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
        {['calm', 'hopeful', 'stressed', 'anxious', 'overwhelmed'].map((mood) => (
          <div key={`legend-${mood}`} className="flex items-center gap-1.5">
            <span
              className="inline-block rounded-full flex-shrink-0"
              style={{ width: 8, height: 8, backgroundColor: MOOD_COLORS[mood] }}
            />
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--color-text-subtle)' }}>
              {moodLabels[mood]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}