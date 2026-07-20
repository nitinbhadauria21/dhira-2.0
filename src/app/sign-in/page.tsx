'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ThemeProvider } from '@/components/ThemeProvider';
import DhiraAvatar from '@/components/DhiraAvatar';
import { signInEmail, requestOtp, verifyOtp } from '@/lib/authClient';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/home-dashboard';

  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInEmail(email.trim(), password);
      router.push(nextPath);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      const { devCode } = await requestOtp(phone.trim());
      setOtpSent(true);
      setDevCode(devCode ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      await verifyOtp(phone.trim(), otp.trim());
      router.push(nextPath);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not verify code');
    } finally {
      setLoading(false);
    }
  };

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
          <p
            className="text-center-safe"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--color-text)',
              marginTop: '10px',
              letterSpacing: '-0.02em',
            }}
          >
            Hey again. Still here.
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '6px', textAlign: 'center' }}>
            Sign in with email or phone — same private space.
          </p>
        </div>

        {/* Card */}
        <div className="dhira-card p-8">
          {/* Mode toggle: email or phone */}
          <div className="flex gap-2 mb-6" role="tablist">
            {(['email', 'phone'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null); }}
                className="flex-1 justify-center"
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-control)',
                  border: `1.5px solid ${mode === m ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  backgroundColor: mode === m ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                  color: mode === m ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {m === 'email' ? 'Email + password' : 'Phone + OTP'}
              </button>
            ))}
          </div>

          {error && (
            <div
              className="mb-4"
              style={{ padding: '10px 12px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--color-crisis-surface)', border: '1px solid var(--color-crisis)', color: 'var(--color-crisis)', fontFamily: 'var(--font-ui)', fontSize: '13px' }}
            >
              {error}
            </div>
          )}

          {/* Phone + OTP */}
          {mode === 'phone' && (
            <div className="mb-2">
              <label htmlFor="signin-phone" style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                Phone number (with country code)
              </label>
              <input
                id="signin-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                disabled={otpSent}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-control)', border: '1.5px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text)', fontFamily: 'var(--font-ui)', fontSize: '15px', outline: 'none' }}
              />
              {!otpSent ? (
                <button type="button" onClick={handleRequestOtp} disabled={loading || !phone.trim()} className="btn-primary w-full justify-center" style={{ fontSize: '16px', padding: '13px 24px', marginTop: '14px', opacity: loading || !phone.trim() ? 0.6 : 1 }}>
                  {loading ? 'Sending…' : 'Send code'}
                </button>
              ) : (
                <>
                  {devCode && (
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '8px' }}>
                      Dev mode code: <strong style={{ color: 'var(--color-text)' }}>{devCode}</strong> (no SMS provider configured)
                    </p>
                  )}
                  <label htmlFor="signin-otp" style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)', margin: '14px 0 6px' }}>
                    Enter the 6-digit code
                  </label>
                  <input
                    id="signin-otp"
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 'var(--radius-control)', border: '1.5px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text)', fontFamily: 'var(--font-ui)', fontSize: '15px', outline: 'none' }}
                  />
                  <button type="button" onClick={handleVerifyOtp} disabled={loading || !otp.trim()} className="btn-primary w-full justify-center" style={{ fontSize: '16px', padding: '13px 24px', marginTop: '14px', opacity: loading || !otp.trim() ? 0.6 : 1 }}>
                    {loading ? 'Verifying…' : 'Verify & sign in'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Email */}
          {mode === 'email' && (
          <>
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
            onClick={handleEmailSignIn}
            disabled={loading || !email.trim() || !password}
            className="btn-primary w-full justify-center"
            style={{ fontSize: '16px', padding: '13px 24px', opacity: loading || !email.trim() || !password ? 0.6 : 1 }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
          </>
          )}

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
      <React.Suspense fallback={null}>
        <SignInContent />
      </React.Suspense>
    </ThemeProvider>
  );
}
