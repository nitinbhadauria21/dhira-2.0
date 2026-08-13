'use client';

import React from 'react';
import { BarChart2 } from 'lucide-react';
import MoodBadge from '@/components/MoodBadge';
import HorizonMoodTiles, { type HorizonMoodDay } from '@/components/HorizonMoodTiles';

export interface WeeklyData {
  series: { weekStart: string; label: string; checkins: number; avgValence: number }[];
  thisWeek: {
    checkins: number;
    avgIntensity: number;
    moodMix: { mood: string; count: number }[];
    topTopics: { topic: string; count: number }[];
  };
}

function TimelineStatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="timeline-stat-tile theme-transition">
      <p className="timeline-stat-value">{value}</p>
      <p className="timeline-stat-label">{label}</p>
    </div>
  );
}

export default function TimelineWeeklySection({
  weekly,
  weekDays,
}: {
  weekly: WeeklyData | null;
  weekDays: HorizonMoodDay[];
}) {
  const hasCheckins = weekly != null && weekly.series.some((s) => s.checkins > 0);

  return (
    <section className="timeline-weekly-card dhira-card theme-transition" aria-labelledby="timeline-weekly-title">
      <div className="flex items-center gap-2 mb-5">
        <BarChart2 size={18} style={{ color: 'var(--color-primary)' }} aria-hidden />
        <h2
          id="timeline-weekly-title"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 500,
            color: 'var(--color-text)',
          }}
        >
          Your week with DHIRA
        </h2>
      </div>

      {hasCheckins && weekly ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <TimelineStatTile label="Check-ins this week" value={String(weekly.thisWeek.checkins)} />
            <TimelineStatTile
              label="Avg intensity"
              value={`${Math.round(weekly.thisWeek.avgIntensity * 100)}%`}
            />
            <TimelineStatTile label="Top mood" value={weekly.thisWeek.moodMix[0]?.mood ?? '—'} />
            <TimelineStatTile label="Top topic" value={weekly.thisWeek.topTopics[0]?.topic ?? '—'} />
          </div>
          <HorizonMoodTiles days={weekDays} enableMobileScroll />
          {weekly.thisWeek.moodMix.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {weekly.thisWeek.moodMix.map((m) => (
                <span key={m.mood} className="flex items-center gap-1.5">
                  <MoodBadge mood={m.mood} size="sm" />
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 12,
                      color: 'var(--color-text-subtle)',
                    }}
                  >
                    ×{m.count}
                  </span>
                </span>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {weekly && (
            <p
              className="mb-4"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 14,
                color: 'var(--color-text-muted)',
              }}
            >
              Your week is waiting for its first check-in. When you log a mood, it will show up here.
            </p>
          )}
          <HorizonMoodTiles days={weekDays} enableMobileScroll />
        </>
      )}
    </section>
  );
}
