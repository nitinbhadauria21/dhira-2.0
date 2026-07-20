'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export default function LandingNav() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'var(--color-surface)' : 'transparent',
          borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
          boxShadow: scrolled ? 'var(--shadow-card)' : 'none',
        }}
      >
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16">
          {/* Wordmark */}
          <Link
            href="/"
            className="wordmark text-2xl"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--color-text)' }}
          >
            Dhira
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {[
              { label: 'Features', href: '#features' },
              { label: 'Safety', href: '#safety' },
            ]?.map((item) => (
              <a
                key={`landing-nav-${item?.label}`}
                href={item?.href}
                className="transition-colors duration-200"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '15px', fontWeight: 400 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                {item?.label}
              </a>
            ))}

            <Link
              href="/sign-in"
              className="transition-colors duration-200"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-ui)', fontSize: '15px' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
            >
              Sign In
            </Link>

            <Link href="/sign-up" className="btn-accent" style={{ fontSize: '14px', padding: '8px 20px', fontWeight: 600 }}>
              Start free
            </Link>

            <button
              onClick={toggleTheme}
              className="flex items-center justify-center rounded-control transition-all duration-200"
              style={{ width: 36, height: 36, backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
              aria-label="Toggle theme"
            >
              {theme === 'night' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center rounded-control"
              style={{ width: 34, height: 34, backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
              aria-label="Toggle theme"
            >
              {theme === 'night' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex items-center justify-center rounded-control"
              style={{ width: 34, height: 34, backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={14} /> : <Menu size={14} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden fade-in"
            style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              <a href="#features" onClick={() => setMobileOpen(false)} style={{ color: 'var(--color-text)', fontFamily: 'var(--font-ui)', fontSize: '16px' }}>Features</a>
              <a href="#safety" onClick={() => setMobileOpen(false)} style={{ color: 'var(--color-text)', fontFamily: 'var(--font-ui)', fontSize: '16px' }}>Safety</a>
              <Link href="/sign-in" onClick={() => setMobileOpen(false)} style={{ color: 'var(--color-text)', fontFamily: 'var(--font-ui)', fontSize: '16px' }}>Sign In</Link>
              <Link href="/sign-up" onClick={() => setMobileOpen(false)} className="btn-accent w-full justify-center">Start free</Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}