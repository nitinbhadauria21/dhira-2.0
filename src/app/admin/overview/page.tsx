'use client';

import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { Users, MessageSquare, BookOpen, AlertTriangle, CheckCircle, Clock, Activity,  } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


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

const moodData = [
  { label: 'Calm', pct: 28, color: '#63A183' },
  { label: 'Anxious', pct: 22, color: '#AEA1DA' },
  { label: 'Sad', pct: 18, color: '#5A67B8' },
  { label: 'Hopeful', pct: 16, color: '#EFA94A' },
  { label: 'Overwhelmed', pct: 10, color: '#C56B5C' },
  { label: 'Other', pct: 6, color: '#918EA0' },
];

const recentActivity = [
  { time: '2 min ago', event: 'Check-in sent to 3 users', type: 'info' },
  { time: '14 min ago', event: 'Risk event flagged — hand-off fired', type: 'warning' },
  { time: '1 hr ago', event: 'Mood tagging agent processed 47 entries', type: 'success' },
  { time: '3 hr ago', event: 'Memory agent summarised 12 sessions', type: 'success' },
  { time: '6 hr ago', event: 'Proactive engine ran — 18 sent, 0 failed', type: 'success' },
];

export default function AdminOverviewPage() {
  return (
    <AdminLayout title="Overview" subtitle="Live snapshot of Dhira's health and usage">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Active users (7d)"
          value="142"
          sub="Unique anonymous sessions"
          icon={Users}
          accent="var(--color-primary)"
          trend="+12%"
          trendUp
        />
        <StatCard
          label="Check-ins sent"
          value="318"
          sub="Last 7 days"
          icon={MessageSquare}
          accent="var(--color-accent)"
          trend="+8%"
          trendUp
        />
        <StatCard
          label="Journal entries"
          value="1,204"
          sub="All time"
          icon={BookOpen}
          accent="var(--color-lavender)"
          trend="+5%"
          trendUp
        />
        <StatCard
          label="Risk events"
          value="3"
          sub="Last 7 days — all handed off"
          icon={AlertTriangle}
          accent="var(--color-crisis)"
          trend="+1"
          trendUp={false}
        />
      </div>

      {/* Two-column: Mood mix + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        {/* Mood mix */}
        <div className="dhira-card p-5 lg:col-span-2">
          <h2
            className="text-h3 mb-4"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
          >
            Mood mix (7d)
          </h2>
          <div className="flex flex-col gap-3">
            {moodData.map((m) => (
              <div key={m.label} className="flex items-center gap-3">
                <span
                  style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', width: '90px', flexShrink: 0 }}
                >
                  {m.label}
                </span>
                <div
                  className="flex-1 rounded-full overflow-hidden"
                  style={{ height: '8px', backgroundColor: 'var(--color-surface-alt)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${m.pct}%`, backgroundColor: m.color, transition: 'width 0.6s ease' }}
                  />
                </div>
                <span
                  style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-subtle)', width: '32px', textAlign: 'right', flexShrink: 0 }}
                >
                  {m.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="dhira-card p-5 lg:col-span-3">
          <h2
            className="text-h3 mb-4"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
          >
            Recent activity
          </h2>
          <div className="flex flex-col gap-3">
            {recentActivity.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-3 pb-3"
                style={{ borderBottom: i < recentActivity.length - 1 ? '1px solid var(--color-border)' : 'none' }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    backgroundColor:
                      a.type === 'warning' ?'rgba(197,107,92,0.12)'
                        : a.type === 'success' ?'rgba(99,161,131,0.12)' :'var(--color-primary-soft)',
                  }}
                >
                  {a.type === 'warning' ? (
                    <AlertTriangle size={13} style={{ color: 'var(--color-crisis)' }} />
                  ) : a.type === 'success' ? (
                    <CheckCircle size={13} style={{ color: 'var(--color-sage)' }} />
                  ) : (
                    <Activity size={13} style={{ color: 'var(--color-primary)' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text)' }}>
                    {a.event}
                  </p>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '2px' }}>
                    <Clock size={11} className="inline mr-1" />
                    {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
