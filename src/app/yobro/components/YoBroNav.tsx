'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function YoBroNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #D0D9FF' : '1px solid transparent',
        boxShadow: scrolled ? '0 2px 16px rgba(61,82,224,0.08)' : 'none',
      }}
    >
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16">
        {/* YoBro Wordmark */}
        <Link href="/yobro" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #3D52E0 0%, #FF6B35 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            🤜
          </div>
          <div className="flex flex-col leading-none">
            <span
              style={{
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontWeight: 800,
                fontSize: 22,
                color: '#1A1D3A',
                letterSpacing: '-0.04em',
              }}
            >
              YoBro
            </span>
            <span
              style={{
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontWeight: 500,
                fontSize: 9,
                color: '#3D52E0',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                marginTop: 1,
              }}
            >
              YOUR BUDDY AI
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {[
            { label: 'Features', href: '#features' },
            { label: 'Safety', href: '#safety' },
          ]?.map((item) => (
            <a
              key={item?.label}
              href={item?.href}
              style={{
                color: '#4A4E72',
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontSize: 15,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              {item?.label}
            </a>
          ))}
          <Link
            href="/sign-in"
            style={{
              color: '#4A4E72',
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontSize: 15,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            style={{
              background: 'linear-gradient(135deg, #3D52E0 0%, #5B6FFF 100%)',
              color: '#fff',
              borderRadius: 14,
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontWeight: 700,
              fontSize: 14,
              padding: '9px 22px',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(61,82,224,0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            🤜 Slide in
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl"
          style={{ backgroundColor: '#EBF0FF', border: '1px solid #D0D9FF', color: '#3D52E0' }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden"
          style={{
            backgroundColor: '#fff',
            borderTop: '1px solid #D0D9FF',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <a href="#features" onClick={() => setMobileOpen(false)} style={{ color: '#1A1D3A', fontFamily: '"DM Sans", system-ui, sans-serif', fontSize: 16, fontWeight: 500, textDecoration: 'none' }}>Features</a>
          <a href="#safety" onClick={() => setMobileOpen(false)} style={{ color: '#1A1D3A', fontFamily: '"DM Sans", system-ui, sans-serif', fontSize: 16, fontWeight: 500, textDecoration: 'none' }}>Safety</a>
          <Link href="/sign-in" onClick={() => setMobileOpen(false)} style={{ color: '#1A1D3A', fontFamily: '"DM Sans", system-ui, sans-serif', fontSize: 16, fontWeight: 500, textDecoration: 'none' }}>Sign In</Link>
          <Link
            href="/sign-up"
            onClick={() => setMobileOpen(false)}
            style={{
              background: 'linear-gradient(135deg, #3D52E0 0%, #5B6FFF 100%)',
              color: '#fff',
              borderRadius: 14,
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontWeight: 700,
              fontSize: 15,
              padding: '12px 24px',
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            🤜 Slide in — it&apos;s free
          </Link>
        </div>
      )}
    </nav>
  );
}
