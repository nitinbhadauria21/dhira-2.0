'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { MOOD_COLORS as ARTIFACT_MOODS, MOOD_LEGEND } from '@/lib/artifactDesign';

const MOOD_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(ARTIFACT_MOODS).map(([k, v]) => [k, v.bg]),
);

const moodLabels: Record<string, string> = Object.fromEntries(
  Object.entries(ARTIFACT_MOODS).map(([k, v]) => [k, v.label]),
);

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface HomeMiniTimelineProps {
  last7: { date: string; mood: string | null }[];
}

export default function HomeMiniTimeline({ last7 }: HomeMiniTimelineProps) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const weekMoods = last7.map((d) => {
    const dateObj = new Date(d.date + 'T00:00:00');
    return {
      key: `day-${d.date}`,
      day: WEEKDAYS[dateObj.getDay()],
      date: String(dateObj.getDate()),
      mood: d.mood ?? 'neutral',
      logged: d.mood != null,
      isToday: d.date === todayKey,
    };
  });

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
          href="/timeline"
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
        {MOOD_LEGEND.map((mood) => (
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