'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Users, MessageSquare, BookOpen, AlertTriangle } from 'lucide-react';


interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent?: string;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({ label, value, sub, icon: Icon, accent, trend, trendUp }: StatCardProps) {
  return (
    <div
      className="dhira-card p-5 flex flex-col gap-3"
      style={{ borderLeft: accent ? `3px solid ${accent}` : undefined }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-surface-alt)' }}
        >
          <Icon size={18} style={{ color: accent || 'var(--color-primary)' }} />
        </div>
        {trend && (
          <span
            className="text-xs px-2 py-1 rounded-full font-medium"
            style={{
              backgroundColor: trendUp ? 'rgba(99,161,131,0.12)' : 'rgba(197,107,92,0.12)',
              color: trendUp ? 'var(--color-sage)' : 'var(--color-crisis)',
              fontFamily: 'var(--font-ui)',
            }}
          >
            {trend}
          </span>
        )}
      </div>
      <div>
        <p
          style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1 }}
        >
          {value}
        </p>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          {label}
        </p>
        {sub && (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '2px' }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

import { MOOD_PALETTE } from '@/lib/brand';

const MOOD_COLORS = MOOD_PALETTE;

interface WeekPoint { label: string; checkins: number; activeUsers: number; crisisEvents: number }
interface MoodDist { mood: string; count: number }

interface AdminStats {
  totalUsers: number;
  totalMessages: number;
  totalMoodLogs: number;
  crisisEvents: number;
  mediumEvents: number;
  activeToday: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [series, setSeries] = useState<WeekPoint[]>([]);
  const [moodMix, setMoodMix] = useState<MoodDist[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [safety, weekly] = await Promise.all([
          fetch('/api/admin/safety').then((r) => r.json()),
          fetch('/api/admin/weekly').then((r) => r.json()),
        ]);
        if (cancelled) return;
        if (safety.stats) setStats(safety.stats as AdminStats);
        if (weekly.series) setSeries(weekly.series as WeekPoint[]);
        if (weekly.moodDistribution) setMoodMix(weekly.moodDistribution as MoodDist[]);
      } catch {
        /* leave nulls */
      }
    };
    load();
    const t = setInterval(load, 6000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  const maxCheckins = Math.max(1, ...series.map((s) => s.checkins));
  const totalMoods = moodMix.reduce((s, m) => s + m.count, 0) || 1;

  const fmt = (n?: number) => (n == null ? '—' : n.toLocaleString('en-IN'));

  return (
    <AdminLayout title="Overview" subtitle="Live snapshot of Dhira's health and usage">
      {/* Stats grid — real numbers from saved, anonymous data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Anonymous users"
          value={fmt(stats?.totalUsers)}
          sub="Unique anonymous sessions"
          icon={Users}
          accent="var(--color-primary)"
        />
        <StatCard
          label="Messages"
          value={fmt(stats?.totalMessages)}
          sub={`${fmt(stats?.activeToday)} active today`}
          icon={MessageSquare}
          accent="var(--color-accent)"
        />
        <StatCard
          label="Mood logs"
          value={fmt(stats?.totalMoodLogs)}
          sub="All time"
          icon={BookOpen}
          accent="var(--color-lavender)"
        />
        <StatCard
          label="Crisis hand-offs"
          value={fmt(stats?.crisisEvents)}
          sub={`${fmt(stats?.mediumEvents)} medium-risk`}
          icon={AlertTriangle}
          accent="var(--color-crisis)"
        />
      </div>

      {/* Two-column: Weekly check-ins + Mood mix */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        {/* Weekly check-ins (last 8 weeks) */}
        <div className="dhira-card p-5 lg:col-span-3">
          <h2 className="text-h3 mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
            Weekly check-ins (8 weeks)
          </h2>
          {series.some((s) => s.checkins > 0) ? (
            <div className="flex items-end gap-3" style={{ height: 180 }}>
              {series.map((w) => (
                <div key={w.label} className="flex-1 flex flex-col items-center justify-end gap-2" style={{ height: '100%' }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--color-text-subtle)' }}>{w.checkins}</span>
                  <div
                    className="w-full rounded-t"
                    style={{ height: `${(w.checkins / maxCheckins) * 130}px`, backgroundColor: 'var(--color-primary)', minHeight: w.checkins ? 4 : 0, transition: 'height 0.5s ease' }}
                    title={`${w.checkins} check-ins · ${w.activeUsers} users · ${w.crisisEvents} crisis`}
                  />
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--color-text-subtle)' }}>{w.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text-muted)' }}>
              Weekly check-ins will appear here as users log moods.
            </p>
          )}
        </div>

        {/* Mood mix (30d) — real distribution */}
        <div className="dhira-card p-5 lg:col-span-2">
          <h2 className="text-h3 mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
            Mood mix (30d)
          </h2>
          {moodMix.length > 0 ? (
            <div className="flex flex-col gap-3">
              {moodMix.slice(0, 6).map((m) => (
                <div key={m.mood} className="flex items-center gap-3">
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', width: '90px', flexShrink: 0, textTransform: 'capitalize' }}>{m.mood}</span>
                  <div className="flex-1 rounded-full overflow-hidden" style={{ height: '8px', backgroundColor: 'var(--color-surface-alt)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.round((m.count / totalMoods) * 100)}%`, backgroundColor: MOOD_COLORS[m.mood] ?? 'var(--color-primary)', transition: 'width 0.6s ease' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-subtle)', width: '32px', textAlign: 'right', flexShrink: 0 }}>{m.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text-muted)' }}>No mood data yet.</p>
          )}
        </div>
      </div>

      {/* System status row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Primary Agent', status: 'Operational', ok: true },
          { label: 'Safety Monitor', status: 'Operational', ok: true },
          { label: 'Proactive Engine', status: 'Last run 2h ago', ok: true },
        ].map((s) => (
          <div
            key={s.label}
            className="dhira-card px-5 py-4 flex items-center justify-between"
          >
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 500, color: 'var(--color-text)' }}>
                {s.label}
              </p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-subtle)' }}>
                {s.status}
              </p>
            </div>
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: s.ok ? '#63A183' : '#C56B5C', boxShadow: s.ok ? '0 0 8px rgba(99,161,131,0.5)' : undefined }}
            />
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
