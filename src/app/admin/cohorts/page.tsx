'use client';

import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { Users, Calendar } from 'lucide-react';

const cohorts = [
  { id: 'C-001', label: 'Week 1 (Jul 1–7)', users: 38, avgSessions: 4.2, retentionD7: 68, mood: 'Anxious → Calm' },
  { id: 'C-002', label: 'Week 2 (Jul 8–14)', users: 51, avgSessions: 3.8, retentionD7: 72, mood: 'Sad → Hopeful' },
  { id: 'C-003', label: 'Week 3 (Jul 15–21)', users: 29, avgSessions: 5.1, retentionD7: 79, mood: 'Overwhelmed → Calm' },
  { id: 'C-004', label: 'Week 4 (Jul 22–28)', users: 24, avgSessions: 2.9, retentionD7: 58, mood: 'Anxious → Anxious' },
];

export default function AdminCohortsPage() {
  return (
    <AdminLayout title="User Cohorts (Anonymous)" subtitle="Anonymous cohort engagement — no personal data">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="dhira-card p-5" style={{ borderLeft: '3px solid var(--color-primary)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 600, color: 'var(--color-primary)', lineHeight: 1 }}>142</p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Total anonymous users</p>
        </div>
        <div className="dhira-card p-5" style={{ borderLeft: '3px solid var(--color-sage)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 600, color: 'var(--color-sage)', lineHeight: 1 }}>69%</p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Avg D7 retention</p>
        </div>
        <div className="dhira-card p-5" style={{ borderLeft: '3px solid var(--color-accent)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 600, color: 'var(--color-accent)', lineHeight: 1 }}>4.0</p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Avg sessions per user</p>
        </div>
      </div>
      <div className="dhira-card overflow-hidden">
        <div
          className="px-5 py-3"
          style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)' }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--color-text)' }}>
            Weekly cohorts
          </h2>
        </div>
        <div
          className="grid px-5 py-3"
          style={{ gridTemplateColumns: '1.5fr 80px 100px 80px 1fr', borderBottom: '1px solid var(--color-border)' }}
        >
          {['Cohort', 'Users', 'Avg sessions', 'D7 retention', 'Mood shift']?.map((h) => (
            <span key={h} style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {h}
            </span>
          ))}
        </div>
        {cohorts?.map((c, i) => (
          <div
            key={c?.id}
            className="grid px-5 py-4 items-center"
            style={{ gridTemplateColumns: '1.5fr 80px 100px 80px 1fr', borderBottom: i < cohorts?.length - 1 ? '1px solid var(--color-border)' : 'none' }}
          >
            <div className="flex items-center gap-2">
              <Calendar size={13} style={{ color: 'var(--color-text-subtle)' }} />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text)' }}>{c?.label}</span>
            </div>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text)' }}>{c?.users}</span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text)' }}>{c?.avgSessions}</span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: c?.retentionD7 >= 70 ? 'var(--color-sage)' : 'var(--color-accent)', fontWeight: 600 }}>
              {c?.retentionD7}%
            </span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)' }}>{c?.mood}</span>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
