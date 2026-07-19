'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line,
} from 'recharts';
import { useChartBrand, MOOD_PALETTE } from '@/lib/brand';

interface WeekPoint { label: string; checkins: number; activeUsers: number; avgValence: number; crisisEvents: number; proactiveSends: number; delivered: number }
interface Dist { mood?: string; topic?: string; count: number }
interface Params {
  totalUsers: number; avgCheckinsPerUser: number; emailOptInPct: number; whatsappOptInPct: number;
  memoryOptInPct: number; hinglishPct: number; deliverySuccessPct: number; crisisTotal: number;
}
interface Data { series: WeekPoint[]; moodDistribution: Dist[]; topicDistribution: Dist[]; hourHistogram: { hour: number; count: number }[]; params: Params }

export default function AdminMoodInsightsPage() {
  const brand = useChartBrand();
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/admin/weekly');
        const json = await res.json();
        if (!cancelled && !json.error) setData(json);
      } catch { /* ignore */ }
    };
    load();
    const t = setInterval(load, 8000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  const maxMood = Math.max(1, ...(data?.moodDistribution.map((d) => d.count) ?? [1]));

  return (
    <AdminLayout title="Mood Insights" subtitle="Weekly check-in analytics — anonymous, aggregate only">
      {/* Parameter cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Param label="Avg check-ins / user" value={data ? String(data.params.avgCheckinsPerUser) : '—'} />
        <Param label="Hinglish users" value={data ? `${data.params.hinglishPct}%` : '—'} />
        <Param label="Memory opt-in" value={data ? `${data.params.memoryOptInPct}%` : '—'} />
        <Param label="Notif. delivery" value={data ? `${data.params.deliverySuccessPct}%` : '—'} />
      </div>

      {/* Weekly check-ins + valence */}
      <div className="dhira-card p-5 mb-6">
        <h2 className="mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, color: 'var(--color-text)' }}>
          Weekly check-ins &amp; mood valence (8 weeks)
        </h2>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <ComposedChart data={data?.series ?? []} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid stroke={brand.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: brand.text, fontSize: 12 }} tickLine={false} axisLine={{ stroke: brand.border }} />
              <YAxis allowDecimals={false} tick={{ fill: brand.text, fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${brand.border}`, fontFamily: 'var(--font-ui)', fontSize: 13 }} />
              <Bar dataKey="checkins" name="Check-ins" fill={brand.primary} radius={[6, 6, 0, 0]} maxBarSize={34} />
              <Bar dataKey="activeUsers" name="Active users" fill={brand.sage} radius={[6, 6, 0, 0]} maxBarSize={34} />
              <Line dataKey="avgValence" name="Avg valence" stroke={brand.accent} strokeWidth={2} dot={{ r: 3, fill: brand.accent }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Mood distribution */}
        <div className="dhira-card p-5">
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, color: 'var(--color-text)' }}>
            Mood mix (30 days)
          </h2>
          {data && data.moodDistribution.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.moodDistribution.map((d) => (
                <div key={d.mood} className="flex items-center gap-3">
                  <span style={{ width: 90, fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{d.mood}</span>
                  <div className="flex-1 rounded-full overflow-hidden" style={{ height: 8, backgroundColor: 'var(--color-surface-alt)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(d.count / maxMood) * 100}%`, backgroundColor: MOOD_PALETTE[d.mood ?? 'neutral'] ?? brand.primary }} />
                  </div>
                  <span style={{ width: 28, textAlign: 'right', fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-subtle)' }}>{d.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyNote />
          )}
        </div>

        {/* Topic distribution */}
        <div className="dhira-card p-5">
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, color: 'var(--color-text)' }}>
            Topics (30 days)
          </h2>
          {data && data.topicDistribution.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.topicDistribution.map((d) => (
                <span key={d.topic} className="px-3 py-1.5 rounded-full" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)', fontFamily: 'var(--font-ui)', fontSize: '13px', textTransform: 'capitalize' }}>
                  {d.topic} · {d.count}
                </span>
              ))}
            </div>
          ) : (
            <EmptyNote />
          )}
        </div>
      </div>

      {/* Time-of-day */}
      <div className="dhira-card p-5">
        <h2 className="mb-1" style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, color: 'var(--color-text)' }}>
          When people reach out (time of day)
        </h2>
        <p className="mb-4" style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-subtle)' }}>
          Validates Dhira&apos;s &ldquo;2 AM companion&rdquo; thesis.
        </p>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={data?.hourHistogram ?? []} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid stroke={brand.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: brand.text, fontSize: 11 }} tickLine={false} axisLine={{ stroke: brand.border }} />
              <YAxis allowDecimals={false} tick={{ fill: brand.text, fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${brand.border}`, fontFamily: 'var(--font-ui)', fontSize: 13 }} labelFormatter={(h) => `${h}:00`} />
              <Bar dataKey="count" name="Check-ins" fill={brand.accent} radius={[4, 4, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
}

function Param({ label, value }: { label: string; value: string }) {
  return (
    <div className="dhira-card p-5" style={{ borderLeft: '3px solid var(--color-primary)' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1 }}>{value}</p>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>{label}</p>
    </div>
  );
}

function EmptyNote() {
  return (
    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text-muted)' }}>
      No check-in data yet — this fills in as users log moods and chat.
    </p>
  );
}
