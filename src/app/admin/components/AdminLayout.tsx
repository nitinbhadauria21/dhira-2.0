'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, ShieldAlert, Zap, BookHeart, BarChart3,
  Lock, Users, SlidersHorizontal, UserCog, LogOut, Menu, ChevronRight, ShieldOff,
} from 'lucide-react';
import { getAdminSession, clearAdminSession, AdminSession } from '@/lib/adminAuth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  demo?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Overview', href: '/admin/overview', icon: LayoutDashboard, demo: true },
  { label: 'Trust & Safety', href: '/admin/safety', icon: ShieldAlert, demo: true },
  { label: 'Engine Health', href: '/admin/engine-health', icon: Zap, demo: true },
  { label: 'Resources', href: '/admin/resources', icon: BookHeart, demo: true },
  { label: 'Mood Insights', href: '/admin/mood-insights', icon: BarChart3 },
  { label: 'Consent & Privacy', href: '/admin/consent', icon: Lock },
  { label: 'User Cohorts', href: '/admin/cohorts', icon: Users },
  { label: 'Prompt Config', href: '/admin/config', icon: SlidersHorizontal },
  { label: 'Roles & Access', href: '/admin/roles', icon: UserCog },
];

type AuthState = 'checking' | 'authorized' | 'unauthorized' | 'forbidden';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [session, setSession] = useState<AdminSession | null>(null);

  useEffect(() => {
    const s = getAdminSession();
    if (!s) {
      // No session at all → redirect to sign-in
      setAuthState('unauthorized');
      router.replace('/admin/login');
      return;
    }
    if (s.role !== 'admin') {
      // Authenticated but not an admin
      setAuthState('forbidden');
      setSession(s);
      return;
    }
    setSession(s);
    setAuthState('authorized');
  }, [router]);

  const handleLogout = () => {
    clearAdminSession();
    router.push('/admin/login');
  };

  // ── Loading / redirect state ──────────────────────────────────────────────
  if (authState === 'checking' || authState === 'unauthorized') {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <span
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--color-primary)' }}
        />
      </div>
    );
  }

  // ── Access Denied (authenticated but wrong role) ──────────────────────────
  if (authState === 'forbidden') {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <div
          className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(220,38,38,0.08) 0%, transparent 70%)' }}
        />
        <div className="w-full max-w-sm text-center">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
            style={{ backgroundColor: 'var(--color-crisis-surface)', border: '1px solid var(--color-crisis)' }}
          >
            <ShieldOff size={28} style={{ color: 'var(--color-crisis)' }} />
          </div>
          <h1
            className="mb-2"
            style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}
          >
            Access Denied
          </h1>
          <p
            className="mb-1"
            style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', color: 'var(--color-text-muted)' }}
          >
            Your account (<strong>{session?.email}</strong>) does not have admin privileges.
          </p>
          <p
            className="mb-8"
            style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text-subtle)' }}
          >
            Contact your team administrator to request access.
          </p>
          <button
            onClick={handleLogout}
            className="btn-primary"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // ── Authorised admin view ─────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="px-6 py-5 flex items-center gap-3"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 0 16px rgba(90,103,184,0.4)' }}
        >
          <ShieldAlert size={16} color="white" />
        </div>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Dhira
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--color-text-subtle)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Admin Console
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p
          className="px-3 mb-2"
          style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          Demo Day
        </p>
        {navItems.filter(i => i.demo).map((item) => {
          const NavIcon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-150"
              style={{
                backgroundColor: active ? 'var(--color-primary-soft)' : 'transparent',
                color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontFamily: 'var(--font-ui)',
                fontSize: '14px',
                fontWeight: active ? 600 : 400,
              }}
            >
              <NavIcon size={16} />
              {item.label}
              {active && <ChevronRight size={14} className="ml-auto" style={{ color: 'var(--color-primary)' }} />}
            </Link>
          );
        })}

        <p
          className="px-3 mt-5 mb-2"
          style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          Soon / Later
        </p>
        {navItems.filter(i => !i.demo).map((item) => {
          const NavIcon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-150"
              style={{
                backgroundColor: active ? 'var(--color-primary-soft)' : 'transparent',
                color: active ? 'var(--color-primary)' : 'var(--color-text-subtle)',
                fontFamily: 'var(--font-ui)',
                fontSize: '14px',
                fontWeight: active ? 600 : 400,
              }}
            >
              <NavIcon size={16} />
              {item.label}
              {active && <ChevronRight size={14} className="ml-auto" style={{ color: 'var(--color-primary)' }} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer — show logged-in email + sign out */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid var(--color-border)' }}>
        {session?.email && (
          <p
            className="px-3 mb-2 truncate"
            style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-subtle)' }}
          >
            {session.email}
          </p>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-all duration-150"
          style={{ color: 'var(--color-text-subtle)', fontFamily: 'var(--font-ui)', fontSize: '14px' }}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-56 flex-shrink-0 fixed top-0 left-0 bottom-0 z-30"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          onClick={() => setSidebarOpen(false)}
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-6 py-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg"
              style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface-alt)' }}
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600, color: 'var(--color-text)' }}>
                {title}
              </h1>
              {subtitle && (
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: 'var(--color-primary-soft)', border: '1px solid var(--color-border)' }}
            >
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-primary)', fontWeight: 500 }}>
                Live
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
