'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import HorizonMoodTiles, { type HorizonMoodDay } from '@/components/HorizonMoodTiles';

import type { MoodId } from '@/lib/artifactDesign';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface HomeMiniTimelineProps {
  last7: { date: string; mood: string | null }[];
}

export default function HomeMiniTimeline({ last7 }: HomeMiniTimelineProps) {
  const todayKey = new Date().toISOString().slice(0, 10);

  // Always show the real last-7 window — empty days stay unlogged for new accounts.
  const weekMoods: HorizonMoodDay[] = last7.map((d) => {
    const dateObj = new Date(d.date + 'T00:00:00');
    return {
      key: `day-${d.date}`,
      day: WEEKDAYS[dateObj.getDay()],
      date: String(dateObj.getDate()),
      mood: (d.mood ?? null) as MoodId | null,
      logged: d.mood != null,
      isToday: d.date === todayKey,
    };
  });

  return (
    <div className="dhira-card p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-text-subtle)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            This week
          </p>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--color-text)',
            }}
          >
            7-day mood view
          </p>
        </div>
        <Link
          href="/timeline"
          className="flex items-center gap-1"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '13px',
            color: 'var(--color-primary)',
            fontWeight: 500,
          }}
        >
          Full timeline
          <ArrowRight size={13} />
        </Link>
      </div>

      <HorizonMoodTiles days={weekMoods} />
    </div>
  );
}
