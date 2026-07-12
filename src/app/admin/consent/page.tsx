'use client';

import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { Lock, CheckCircle, Clock, Trash2 } from 'lucide-react';

const consentStats = [
  { label: 'Proactive check-ins', consented: 89, total: 142 },
  { label: 'Memory / personalisation', consented: 76, total: 142 },
  { label: 'Anonymous analytics', consented: 131, total: 142 },
];

const retentionPolicies = [
  { label: 'Mood logs', retention: '90 days', status: 'active' },
  { label: 'Memory notes', retention: '180 days', status: 'active' },
  { label: 'Risk event logs', retention: '365 days', status: 'active' },
  { label: 'Session tokens', retention: '30 days', status: 'active' },
];

export default function AdminConsentPage() {
  return (
    <AdminLayout title="Consent & Privacy Oversight" subtitle="Aggregate consent rates and data-retention view — no personal data">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Consent rates */}
        <div className="dhira-card p-5">
          <h2 className="text-h3 mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
            Consent rates
          </h2>
          <div className="flex flex-col gap-5">
            {consentStats?.map((s) => {
              const pct = Math.round((s?.consented / s?.total) * 100);
              return (
                <div key={s?.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text)' }}>
                      {s?.label}
                    </span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)' }}>
                      {pct}%
                    </span>
                  </div>
                  <div className="rounded-full overflow-hidden" style={{ height: '10px', backgroundColor: 'var(--color-surface-alt)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: 'var(--color-primary)', transition: 'width 0.5s ease' }}
                    />
                  </div>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
                    {s?.consented} of {s?.total} active users
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Retention policies */}
        <div className="dhira-card p-5">
          <h2 className="text-h3 mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
            Data retention policies
          </h2>
          <div className="flex flex-col gap-3">
            {retentionPolicies?.map((p) => (
              <div
                key={p?.label}
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}
              >
                <div className="flex items-center gap-3">
                  <Trash2 size={14} style={{ color: 'var(--color-text-subtle)' }} />
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text)' }}>
                    {p?.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={13} style={{ color: 'var(--color-text-subtle)' }} />
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    {p?.retention}
                  </span>
                  <CheckCircle size={13} style={{ color: 'var(--color-sage)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div
        className="flex items-start gap-3 px-5 py-4 rounded-2xl"
        style={{ backgroundColor: 'var(--color-primary-soft)', border: '1px solid var(--color-border)' }}
      >
        <Lock size={15} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Dhira stores no real names, phone numbers, or addresses. All data is keyed to anonymous session tokens. Users can withdraw consent at any time from Settings.
        </p>
      </div>
    </AdminLayout>
  );
}
