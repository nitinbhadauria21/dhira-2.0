'use client';

import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Send,
} from 'lucide-react';

interface RunRecord {
  id: string;
  timestamp: string;
  sent: number;
  failed: number;
  skipped: number;
  duration: string;
  status: 'success' | 'partial' | 'failed';
}

const runHistory: RunRecord[] = [
  { id: 'run-001', timestamp: '2026-07-12 08:00', sent: 18, failed: 0, skipped: 4, duration: '1.2s', status: 'success' },
  { id: 'run-002', timestamp: '2026-07-11 20:00', sent: 22, failed: 1, skipped: 3, duration: '1.8s', status: 'partial' },
  { id: 'run-003', timestamp: '2026-07-11 08:00', sent: 15, failed: 0, skipped: 6, duration: '1.1s', status: 'success' },
  { id: 'run-004', timestamp: '2026-07-10 20:00', sent: 20, failed: 0, skipped: 2, duration: '1.3s', status: 'success' },
  { id: 'run-005', timestamp: '2026-07-10 08:00', sent: 17, failed: 2, skipped: 5, duration: '2.1s', status: 'partial' },
  { id: 'run-006', timestamp: '2026-07-09 20:00', sent: 0, failed: 0, skipped: 0, duration: '0.3s', status: 'failed' },
  { id: 'run-007', timestamp: '2026-07-09 08:00', sent: 19, failed: 0, skipped: 3, duration: '1.4s', status: 'success' },
];

const statusConfig = {
  success: { label: 'Success', color: 'var(--color-sage)', bg: 'rgba(99,161,131,0.12)', icon: CheckCircle },
  partial: { label: 'Partial', color: 'var(--color-accent)', bg: 'rgba(239,169,74,0.12)', icon: AlertTriangle },
  failed: { label: 'Failed', color: 'var(--color-crisis)', bg: 'rgba(197,107,92,0.12)', icon: XCircle },
};

export default function AdminEngineHealthPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const totalSent = runHistory.reduce((s, r) => s + r.sent, 0);
  const totalFailed = runHistory.reduce((s, r) => s + r.failed, 0);
  const successRate = Math.round(((totalSent) / (totalSent + totalFailed)) * 100);

  return (
    <AdminLayout title="Proactive Engine Health" subtitle="n8n reminder flow status — last run, sent/failed counts">
      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="dhira-card p-5" style={{ borderLeft: '3px solid var(--color-sage)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 600, color: 'var(--color-sage)', lineHeight: 1 }}>
            {successRate}%
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Delivery success rate
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--color-text-subtle)', marginTop: '2px' }}>
            Last 7 days
          </p>
        </div>
        <div className="dhira-card p-5" style={{ borderLeft: '3px solid var(--color-primary)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 600, color: 'var(--color-primary)', lineHeight: 1 }}>
            {totalSent}
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Check-ins sent
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--color-text-subtle)', marginTop: '2px' }}>
            Last 7 days
          </p>
        </div>
        <div className="dhira-card p-5" style={{ borderLeft: '3px solid var(--color-crisis)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 600, color: 'var(--color-crisis)', lineHeight: 1 }}>
            {totalFailed}
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Failed deliveries
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--color-text-subtle)', marginTop: '2px' }}>
            Last 7 days
          </p>
        </div>
        <div className="dhira-card p-5" style={{ borderLeft: '3px solid var(--color-accent)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 600, color: 'var(--color-accent)', lineHeight: 1 }}>
            2×
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Runs per day
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--color-text-subtle)', marginTop: '2px' }}>
            08:00 · 20:00 IST
          </p>
        </div>
      </div>

      {/* Last run status */}
      <div
        className="dhira-card p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(99,161,131,0.12)' }}
          >
            <Zap size={22} style={{ color: 'var(--color-sage)' }} />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>
              Last run: 2026-07-12 08:00 IST
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              18 sent · 0 failed · 4 skipped (user paused) · completed in 1.2s
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ backgroundColor: 'rgba(99,161,131,0.12)', color: 'var(--color-sage)', fontFamily: 'var(--font-ui)' }}
          >
            <CheckCircle size={14} /> Healthy
          </span>
          <button
            onClick={handleRefresh}
            className="btn-ghost py-2 px-3 text-sm"
            style={{ fontSize: '13px' }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Run history */}
      <div className="dhira-card overflow-hidden">
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)' }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--color-text)' }}>
            Run history (7 days)
          </h2>
          <TrendingUp size={16} style={{ color: 'var(--color-text-subtle)' }} />
        </div>

        <div
          className="grid px-5 py-3"
          style={{
            gridTemplateColumns: '1.5fr 60px 60px 60px 70px 80px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {['Timestamp', 'Sent', 'Failed', 'Skipped', 'Duration', 'Status'].map((h) => (
            <span
              key={h}
              style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
            >
              {h}
            </span>
          ))}
        </div>

        {runHistory.map((run, i) => {
          const sc = statusConfig[run.status];
          const StatusIcon = sc.icon;
          return (
            <div
              key={run.id}
              className="grid px-5 py-3.5 items-center"
              style={{
                gridTemplateColumns: '1.5fr 60px 60px 60px 70px 80px',
                borderBottom: i < runHistory.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <div className="flex items-center gap-2">
                <Clock size={13} style={{ color: 'var(--color-text-subtle)' }} />
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text)' }}>
                  {run.timestamp}
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-sage)', fontWeight: 500 }}>
                {run.sent}
              </span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: run.failed > 0 ? 'var(--color-crisis)' : 'var(--color-text-subtle)', fontWeight: run.failed > 0 ? 600 : 400 }}>
                {run.failed}
              </span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text-subtle)' }}>
                {run.skipped}
              </span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                {run.duration}
              </span>
              <span
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit"
                style={{ backgroundColor: sc.bg, color: sc.color, fontFamily: 'var(--font-ui)' }}
              >
                <StatusIcon size={11} />
                {sc.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Config note */}
      <div
        className="flex items-start gap-3 px-5 py-4 rounded-2xl mt-4"
        style={{ backgroundColor: 'var(--color-primary-soft)', border: '1px solid var(--color-border)' }}
      >
        <Send size={15} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          The proactive engine only sends check-ins to users who have <strong>consented</strong> and not paused. Skipped count reflects paused or opted-out users. No personal data is used — only anonymous session tokens and consent flags.
        </p>
      </div>
    </AdminLayout>
  );
}
