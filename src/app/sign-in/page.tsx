'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ThemeProvider } from '@/components/ThemeProvider';
import DhiraAvatar from '@/components/DhiraAvatar';

function SignInContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* ── Organic background blobs ── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: '800px',
          height: '600px',
          background: 'radial-gradient(ellipse 55% 60% at 50% 40%, rgba(90, 103, 184, 0.16) 0%, rgba(174, 161, 218, 0.07) 50%, transparent 70%)',
          filter: 'blur(40px)',
          borderRadius: '50% 50% 45% 55% / 55% 45% 50% 50%',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 pointer-events-none"
        style={{
          width: '450px',
          height: '420px',
          background: 'radial-gradient(ellipse 60% 55% at 55% 55%, rgba(239, 169, 74, 0.13) 0%, transparent 65%)',
          filter: 'blur(55px)',
          borderRadius: '45% 55% 40% 60% / 55% 45% 50% 50%',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/4 left-0 pointer-events-none"
        style={{
          width: '300px',
          height: '280px',
          background: 'radial-gradient(ellipse, rgba(99, 161, 131, 0.09) 0%, transparent 65%)',
          filter: 'blur(50px)',
          borderRadius: '55% 45% 50% 50% / 50% 50% 45% 55%',
        }}
        aria-hidden="true"
      />
      {/* ── Illustrated SVG decorations ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
        style={{ zIndex: 0, opacity: 0.14 }}
      >
        <defs>
          <pattern id="signin-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="var(--color-border)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#signin-dots)" />
        {/* Organic curves */}
        <path
          d="M 0 120 Q 300 60 600 120 Q 900 180 1200 120 Q 1350 90 1440 120"
          fill="none"
          stroke="var(--color-lavender)"
          strokeWidth="1.2"
          opacity="0.2"
          strokeDasharray="7 16"
        />
        <path
          d="M 0 500 Q 400 440 800 500 Q 1100 550 1440 480"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="1"
          opacity="0.15"
          strokeDasharray="5 18"
        />
        {/* Organic shapes */}
        <ellipse cx="120" cy="200" rx="22" ry="14" fill="var(--color-lavender)" opacity="0.12" transform="rotate(-18, 120, 200)" />
        <ellipse cx="1320" cy="150" rx="18" ry="11" fill="var(--color-accent)" opacity="0.12" transform="rotate(12, 1320, 150)" />
        <ellipse cx="200" cy="550" rx="16" ry="10" fill="var(--color-sage)" opacity="0.1" />
        {/* Asterisk accents */}
        {[
          { x: 80, y: 380, size: 6, color: 'var(--color-lavender)', opacity: 0.25 },
          { x: 1380, y: 300, size: 5, color: 'var(--color-primary)', opacity: 0.22 },
          { x: 700, y: 80, size: 6, color: 'var(--color-accent)', opacity: 0.2 },
          { x: 1200, y: 500, size: 5, color: 'var(--color-sage)', opacity: 0.2 },
        ]?.map((star: { x: number; y: number; size: number; color: string; opacity: number }, i: number) => (
          <g key={`si-star-${i}`} transform={`translate(${star.x}, ${star.y})`} opacity={star.opacity}>
            <line x1={-star.size} y1="0" x2={star.size} y2="0" stroke={star.color} strokeWidth="1.5" />
            <line x1="0" y1={-star.size} x2="0" y2={star.size} stroke={star.color} strokeWidth="1.5" />
            <line x1={-star.size * 0.7} y1={-star.size * 0.7} x2={star.size * 0.7} y2={star.size * 0.7} stroke={star.color} strokeWidth="1" />
            <line x1={star.size * 0.7} y1={-star.size * 0.7} x2={-star.size * 0.7} y2={star.size * 0.7} stroke={star.color} strokeWidth="1" />
          </g>
        ))}
        <circle cx="1400" cy="450" r="18" fill="none" stroke="var(--color-lavender)" strokeWidth="1" opacity="0.18" />
        <circle cx="40" cy="450" r="14" fill="none" stroke="var(--color-sage)" strokeWidth="1" opacity="0.15" />
      </svg>
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <DhiraAvatar size={56} variant="softer" pulse />
          <Link
            href="/"
            className="mt-4"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '28px',
              letterSpacing: '-0.03em',
              color: 'var(--color-text)',
            }}
          >
            Dhira
          </Link>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
            Welcome back. We&apos;ve been here.
          </p>
        </div>

        {/* Card */}
        <div className="dhira-card p-8">
          {/* Google Sign In */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 mb-6 transition-all duration-200"
            style={{
              padding: '13px 20px',
              borderRadius: 'var(--radius-control)',
              border: '1.5px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-ui)',
              fontSize: '15px',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-card)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.backgroundColor = 'var(--color-primary-soft)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.backgroundColor = 'var(--color-surface)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-subtle)' }}>or sign in with email</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="signin-email"
              style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: '6px' }}
            >
              Email address
            </label>
            <input
              id="signin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e?.target?.value)}
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 'var(--radius-control)',
                border: '1.5px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-alt)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-ui)',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="signin-password"
                style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)' }}
              >
                Password
              </label>
              <a
                href="#"
                style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-primary)' }}
              >
                Forgot password?
              </a>
            </div>
            <input
              id="signin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e?.target?.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 'var(--radius-control)',
                border: '1.5px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-alt)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-ui)',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            />
          </div>

          {/* Submit */}
          <button
            type="button"
            className="btn-primary w-full justify-center"
            style={{ fontSize: '16px', padding: '13px 24px' }}
          >
            Sign In
          </button>

          {/* Sign up link */}
          <p
            className="text-center mt-5"
            style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text-muted)' }}
          >
            New to Dhira?{' '}
            <Link href="/sign-up" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
              Create an account
            </Link>
          </p>
        </div>

        {/* Safety note */}
        <p
          className="text-center mt-6"
          style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-subtle)' }}
        >
          🔒 Your data is private &nbsp;·&nbsp; 🕊️ No real name needed
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <ThemeProvider>
      <SignInContent />
    </ThemeProvider>
  );
}
