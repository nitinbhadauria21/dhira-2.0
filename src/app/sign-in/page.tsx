'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthScenePanel from '@/components/AuthScenePanel';
import BrandLockup from '@/components/BrandLockup';
import PasswordRevealInput from '@/components/PasswordRevealInput';
import { ThemeProvider } from '@/components/ThemeProvider';
import { signInEmail, requestOtp, verifyOtp, signInWithGoogle } from '@/lib/authClient';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  height: 46,
  padding: '0 14px',
  borderRadius: 'var(--radius-control)',
  border: '1.5px solid var(--color-border)',
  backgroundColor: 'var(--color-surface-alt)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-ui)',
  fontSize: 15,
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-ui)',
  fontSize: 14,
  fontWeight: 500,
  color: 'var(--color-text-muted)',
  marginBottom: 6,
};

function resolveResumePath(queryNext: string | null): string {
  if (queryNext && queryNext.startsWith('/')) return queryNext;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('dhira-last-route');
    if (saved && saved.startsWith('/')) return saved;
  }
  return '/home-dashboard';
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const oauthErr = searchParams.get('error');
    if (oauthErr) setError(oauthErr);
  }, [searchParams]);

  const goAfterSignIn = () => {
    router.push(resolveResumePath(searchParams.get('next')));
  };

  const handleEmailSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInEmail(email.trim(), password);
      goAfterSignIn();
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
      goAfterSignIn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not verify code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div
        className="w-full grid items-stretch"
        style={{
          maxWidth: 1000,
          gridTemplateColumns: 'minmax(0, 1.05fr) minmax(380px, 0.95fr)',
          borderRadius: 28,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-soft)',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <div className="hidden md:block h-full min-h-full">
          <AuthScenePanel variant="sign-in" />
        </div>

        <section
          style={{
            padding: '48px 44px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: 'var(--color-surface)',
            minHeight: 560,
          }}
        >
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <BrandLockup size={24} />
              <h2 className="mt-8" style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--color-text)' }}>
                Sign in
              </h2>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-text-muted)', marginTop: 2 }}>
                Same private space, right where you left it.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 mb-4"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--color-text)',
              backgroundColor: 'var(--color-surface)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius-control)',
              padding: '12px 16px',
              cursor: 'pointer',
            }}
            onClick={async () => {
              setError(null);
              setLoading(true);
              try {
                const next = resolveResumePath(searchParams.get('next'));
                await signInWithGoogle(next);
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Google sign-in failed');
                setLoading(false);
              }
            }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-border)' }} />
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-text-subtle)' }}>or</span>
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-border)' }} />
          </div>

          <div className="flex gap-2 mb-5 p-1 rounded-control" style={{ backgroundColor: 'var(--color-surface-alt)' }} role="tablist">
            {(['email', 'phone'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className="flex-1 py-2 rounded-control transition-all"
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 14,
                  fontWeight: 500,
                  backgroundColor: mode === m ? 'var(--color-surface)' : 'transparent',
                  color: mode === m ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  boxShadow: mode === m ? 'var(--shadow-card)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {m === 'email' ? 'Email' : 'Phone OTP'}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4" style={{ padding: '10px 12px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--color-crisis-surface)', border: '1px solid var(--color-crisis)', color: 'var(--color-crisis)', fontFamily: 'var(--font-ui)', fontSize: 13 }}>
              {error}
            </div>
          )}

          {mode === 'email' ? (
            <>
              <div className="mb-4">
                <label htmlFor="signin-email" style={labelStyle}>Email address</label>
                <input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  style={fieldStyle}
                />
              </div>
              <div className="mb-6">
                <PasswordRevealInput
                  id="signin-password"
                  value={password}
                  onChange={setPassword}
                  label="Password"
                  labelRight={
                    <a href="#" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-primary)' }}>
                      Forgot?
                    </a>
                  }
                />
              </div>
              <button
                type="button"
                onClick={handleEmailSignIn}
                disabled={loading || !email.trim() || !password}
                className="btn-primary w-full justify-center"
                style={{ fontSize: 16, padding: '13px 24px', opacity: loading || !email.trim() || !password ? 0.6 : 1 }}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </>
          ) : (
            <div>
              <label htmlFor="signin-phone" style={labelStyle}>Phone number (with country code)</label>
              <input
                id="signin-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                disabled={otpSent}
                style={{ ...fieldStyle, opacity: otpSent ? 0.7 : 1 }}
              />
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-text-subtle)', marginTop: 6 }}>
                We will text you a 6-digit code. No password to remember.
              </p>
              {!otpSent ? (
                <button type="button" onClick={handleRequestOtp} disabled={loading || !phone.trim()} className="btn-primary w-full justify-center mt-4" style={{ fontSize: 16, padding: '13px 24px', opacity: loading || !phone.trim() ? 0.6 : 1 }}>
                  {loading ? 'Sending...' : 'Send code'}
                </button>
              ) : (
                <>
                  {devCode && (
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-text-subtle)', marginTop: 8 }}>
                      Dev mode code: <strong style={{ color: 'var(--color-text)' }}>{devCode}</strong> (no SMS provider configured)
                    </p>
                  )}
                  <label htmlFor="signin-otp" style={{ ...labelStyle, marginTop: 14 }}>Enter the 6-digit code</label>
                  <input
                    id="signin-otp"
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    style={fieldStyle}
                  />
                  <button type="button" onClick={handleVerifyOtp} disabled={loading || !otp.trim()} className="btn-primary w-full justify-center mt-4" style={{ fontSize: 16, padding: '13px 24px', opacity: loading || !otp.trim() ? 0.6 : 1 }}>
                    {loading ? 'Verifying...' : 'Verify & sign in'}
                  </button>
                </>
              )}
            </div>
          )}

          <p className="text-center mt-5" style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-text-muted)' }}>
            New to DHIRA?{' '}
            <Link href="/sign-up" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
              Create an account
            </Link>
          </p>
          <p className="text-center mt-5 pt-4" style={{ borderTop: '1px solid var(--color-border)', fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-text-subtle)', lineHeight: 1.5 }}>
            In crisis? Call <strong style={{ color: 'var(--color-crisis)' }}>Tele-MANAS 14416</strong> - free, 24x7.
          </p>
        </section>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <ThemeProvider>
      <Suspense fallback={null}>
        <SignInContent />
      </Suspense>
    </ThemeProvider>
  );
}
