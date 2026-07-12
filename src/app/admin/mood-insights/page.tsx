'use client';

import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { Tag } from 'lucide-react';

const moodTrend = [
  { day: 'Mon', calm: 30, anxious: 20, sad: 15, hopeful: 20, other: 15 },
  { day: 'Tue', calm: 25, anxious: 25, sad: 18, hopeful: 18, other: 14 },
  { day: 'Wed', calm: 28, anxious: 22, sad: 20, hopeful: 16, other: 14 },
  { day: 'Thu', calm: 32, anxious: 18, sad: 16, hopeful: 22, other: 12 },
  { day: 'Fri', calm: 35, anxious: 20, sad: 14, hopeful: 20, other: 11 },
  { day: 'Sat', calm: 38, anxious: 17, sad: 12, hopeful: 22, other: 11 },
  { day: 'Sun', calm: 28, anxious: 24, sad: 18, hopeful: 18, other: 12 },
];

const topTopics = [
  { label: 'Work stress', count: 284, color: '#AEA1DA' },
  { label: 'Relationships', count: 231, color: '#5A67B8' },
  { label: 'Loneliness', count: 198, color: '#EFA94A' },
  { label: 'Sleep issues', count: 167, color: '#63A183' },
  { label: 'Family pressure', count: 143, color: '#C56B5C' },
  { label: 'Academic stress', count: 121, color: '#918EA0' },
];

export default function AdminMoodInsightsPage() {
  const maxCount = Math.max(...topTopics?.map((t) => t?.count));

  return (
    <AdminLayout title="Mood & Topic Insights" subtitle="Aggregate, anonymous mood and topic trends — no personal data">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Mood trend chart */}
        <div className="dhira-card p-5">
          <h2 className="text-h3 mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
            Mood trend (7d)
          </h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-subtle)', marginBottom: '20px' }}>
            % of sessions per mood per day
          </p>
          <div className="flex items-end gap-2 h-40">
            {moodTrend?.map((d) => (
              <div key={d?.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col-reverse rounded-lg overflow-hidden" style={{ height: '120px' }}>
                  {[
                    { key: 'calm', color: '#63A183', val: d?.calm },
                    { key: 'hopeful', color: '#EFA94A', val: d?.hopeful },
                    { key: 'anxious', color: '#AEA1DA', val: d?.anxious },
                    { key: 'sad', color: '#5A67B8', val: d?.sad },
                    { key: 'other', color: '#918EA0', val: d?.other },
                  ]?.map((seg) => (
                    <div
                      key={seg?.key}
                      style={{ height: `${seg?.val}%`, backgroundColor: seg?.color, transition: 'height 0.4s ease' }}
                    />
                  ))}
                </div>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--color-text-subtle)' }}>
                  {d?.day}
                </span>
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4">
            {[
              { label: 'Calm', color: '#63A183' },
              { label: 'Hopeful', color: '#EFA94A' },
              { label: 'Anxious', color: '#AEA1DA' },
              { label: 'Sad', color: '#5A67B8' },
              { label: 'Other', color: '#918EA0' },
            ]?.map((l) => (
              <div key={l?.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l?.color }} />
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-subtle)' }}>
                  {l?.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top topics */}
        <div className="dhira-card p-5">
          <h2 className="text-h3 mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
            Top topics
          </h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-subtle)', marginBottom: '20px' }}>
            Most discussed themes (all time)
          </p>
          <div className="flex flex-col gap-3">
            {topTopics?.map((t) => (
              <div key={t?.label} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-36 flex-shrink-0">
                  <Tag size={12} style={{ color: t?.color }} />
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    {t?.label}
                  </span>
                </div>
                <div className="flex-1 rounded-full overflow-hidden" style={{ height: '8px', backgroundColor: 'var(--color-surface-alt)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(t?.count / maxCount) * 100}%`, backgroundColor: t?.color }}
                  />
                </div>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-subtle)', width: '36px', textAlign: 'right' }}>
                  {t?.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div
        className="px-5 py-4 rounded-2xl"
        style={{ backgroundColor: 'var(--color-primary-soft)', border: '1px solid var(--color-border)' }}
      >
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          All data is aggregate and anonymous. No individual user can be identified. Topics are tagged by the Mood Tagging Agent — never by reading message content directly.
        </p>
      </div>
    </AdminLayout>
  );
}
