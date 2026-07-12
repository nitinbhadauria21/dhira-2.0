'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShieldAlert, Zap, BookHeart, BarChart3, Lock, Users, SlidersHorizontal, UserCog, LogOut, Menu, ChevronRight,  } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


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

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('dhira_admin_session');
      if (!session) {
        router.push('/admin/login');
      }
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dhira_admin_session');
    }
    router.push('/admin/login');
  };

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
          const Icon = item.icon;
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
              <Icon size={16} />
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
          const Icon = item.icon;
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
              <Icon size={16} />
              {item.label}
              {active && <ChevronRight size={14} className="ml-auto" style={{ color: 'var(--color-primary)' }} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid var(--color-border)' }}>
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
