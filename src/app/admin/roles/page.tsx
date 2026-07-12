'use client';

import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { UserCog, Shield, Eye, Plus, Check, X } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface AdminUser {
  id: string;
  alias: string;
  role: 'super-admin' | 'safety-reviewer' | 'viewer';
  addedOn: string;
  lastLogin: string;
  active: boolean;
}

const initialUsers: AdminUser[] = [
  { id: 'u-001', alias: 'Team Lead', role: 'super-admin', addedOn: '2026-06-01', lastLogin: '2026-07-12', active: true },
  { id: 'u-002', alias: 'Safety Reviewer', role: 'safety-reviewer', addedOn: '2026-06-15', lastLogin: '2026-07-11', active: true },
  { id: 'u-003', alias: 'Observer', role: 'viewer', addedOn: '2026-07-01', lastLogin: '2026-07-10', active: true },
];

const roleConfig = {
  'super-admin': { label: 'Super Admin', color: 'var(--color-primary)', bg: 'var(--color-primary-soft)', icon: Shield },
  'safety-reviewer': { label: 'Safety Reviewer', color: 'var(--color-crisis)', bg: 'rgba(197,107,92,0.12)', icon: Eye },
  'viewer': { label: 'Viewer', color: 'var(--color-text-subtle)', bg: 'var(--color-surface-alt)', icon: Eye },
};

export default function AdminRolesPage() {
  const [users, setUsers] = useState(initialUsers);

  const toggleActive = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
  };

  return (
    <AdminLayout title="Admin Roles & Access" subtitle="Manage who has access to the admin console">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {Object.entries(roleConfig).map(([key, rc]) => {
          const count = users.filter((u) => u.role === key && u.active).length;
          const Icon = rc.icon;
          return (
            <div key={key} className="dhira-card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: rc.bg }}>
                <Icon size={18} style={{ color: rc.color }} />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 600, color: rc.color, lineHeight: 1 }}>{count}</p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{rc.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dhira-card overflow-hidden mb-4">
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)' }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--color-text)' }}>
            Admin users
          </h2>
          <button className="btn-ghost py-1.5 px-3 text-sm" style={{ fontSize: '13px' }}>
            <Plus size={14} /> Add user
          </button>
        </div>

        {users.map((user, i) => {
          const rc = roleConfig[user.role];
          const RoleIcon = rc.icon;
          return (
            <div
              key={user.id}
              className="flex items-center justify-between px-5 py-4"
              style={{
                borderBottom: i < users.length - 1 ? '1px solid var(--color-border)' : 'none',
                opacity: user.active ? 1 : 0.5,
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: rc.bg }}
                >
                  <UserCog size={16} style={{ color: rc.color }} />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>
                    {user.alias}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                      style={{ backgroundColor: rc.bg, color: rc.color, fontFamily: 'var(--font-ui)' }}
                    >
                      <RoleIcon size={10} /> {rc.label}
                    </span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-subtle)' }}>
                      Last login: {user.lastLogin}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(user.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
                  style={{
                    backgroundColor: user.active ? 'rgba(99,161,131,0.12)' : 'var(--color-surface-alt)',
                    color: user.active ? 'var(--color-sage)' : 'var(--color-text-subtle)',
                    border: '1px solid var(--color-border)',
                    fontFamily: 'var(--font-ui)',
                  }}
                >
                  {user.active ? <Check size={11} /> : <X size={11} />}
                  {user.active ? 'Active' : 'Disabled'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="flex items-start gap-3 px-5 py-4 rounded-2xl"
        style={{ backgroundColor: 'var(--color-primary-soft)', border: '1px solid var(--color-border)' }}
      >
        <Shield size={15} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Admin access is role-gated. Super Admins have full access. Safety Reviewers can only view the Trust & Safety monitor. Viewers have read-only access to Overview and Insights.
        </p>
      </div>
    </AdminLayout>
  );
}
