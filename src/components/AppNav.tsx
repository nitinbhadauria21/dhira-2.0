'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, BarChart2, Settings, Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import Icon from '@/components/ui/AppIcon';


const navItems = [
  { label: 'Home', href: '/home-dashboard', icon: Home, key: 'nav-home' },
  { label: 'Chat', href: '/chat-with-dhira', icon: MessageCircle, key: 'nav-chat' },
  { label: 'Timeline', href: '/home-dashboard#timeline', icon: BarChart2, key: 'nav-timeline' },
  { label: 'Settings', href: '/home-dashboard#settings', icon: Settings, key: 'nav-settings' },
];

export default function AppNav() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    const base = href.split('#')[0];
    return pathname === base || pathname === href;
  };

  return (
    <>
      {/* Desktop top nav */}
      <nav
        className="hidden md:flex fixed top-0 left-0 right-0 z-50 items-center justify-between px-8 py-4 theme-transition"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <Link href="/" className="wordmark text-2xl tracking-tight" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--color-text)' }}>
          dhira
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 text-small font-medium transition-all duration-200 rounded-control"
                style={{
                  color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  backgroundColor: active ? 'var(--color-primary-soft)' : 'transparent',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '15px',
                }}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-9 h-9 rounded-control transition-all duration-200"
          style={{
            backgroundColor: 'var(--color-surface-alt)',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
          }}
          aria-label={`Switch to ${theme === 'night' ? 'day' : 'night'} mode`}
        >
          {theme === 'night' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </nav>

      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 theme-transition"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Link href="/" className="wordmark text-xl" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--color-text)' }}>
          dhira
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-control"
            style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
            aria-label="Toggle theme"
          >
            {theme === 'night' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center w-8 h-8 rounded-control"
            style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed top-[64px] left-0 right-0 z-40 fade-in"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={`mobile-${item.key}`}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-6 py-4 transition-all duration-150"
                style={{
                  color: active ? 'var(--color-primary)' : 'var(--color-text)',
                  backgroundColor: active ? 'var(--color-primary-soft)' : 'transparent',
                  borderBottom: '1px solid var(--color-border)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '16px',
                }}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around py-2 theme-transition"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={`bottom-${item.key}`}
              href={item.href}
              className="flex flex-col items-center gap-1 px-4 py-1 transition-all duration-200"
              style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-subtle)' }}
            >
              <Icon size={20} />
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-ui)', fontWeight: active ? 600 : 400 }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}