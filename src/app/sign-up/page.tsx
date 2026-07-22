'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from '@/components/ThemeProvider';
import DhiraAvatar from '@/components/DhiraAvatar';
import { signUpEmail, requestOtp, verifyOtp } from '@/lib/authClient';

function SignUpContent() {
  const router = useRouter();
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!agreedTerms) return;
    setError(null);
    setLoading(true);
    try {
      await signUpEmail(email.trim(), password, alias.trim() || 'Friend');
      // New account created + signed in → continue to onboarding.
      router.push('/onboarding');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create your account');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!agreedTerms) return;
    setError(null);
    setLoading(true);
    try {
      const { devCode: code } = await requestOtp(phone.trim());
      setOtpSent(true);
      setDevCode(code ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!agreedTerms) return;
    setError(null);
    setLoading(true);
    try {
      await verifyOtp(phone.trim(), otp.trim(), alias.trim() || 'Friend');
      router.push('/onboarding');
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
        className="absolute top-0 right-1/4 pointer-events-none"
        style={{
          width: '700px',
          height: '600px',
          background: 'radial-gradient(ellipse 55% 60% at 55% 40%, rgba(174, 161, 218, 0.17) 0%, rgba(90, 103, 184, 0.07) 50%, transparent 70%)',
          filter: 'blur(45px)',
          borderRadius: '50% 50% 45% 55% / 55% 45% 50% 50%',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{
          width: '500px',
          height: '450px',
          background: 'radial-gradient(ellipse 60% 55% at 40% 60%, rgba(239, 169, 74, 0.13) 0%, transparent 65%)',
          filter: 'blur(55px)',
          borderRadius: '55% 45% 40% 60% / 45% 55% 50% 50%',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 right-0 pointer-events-none"
        style={{
          width: '320px',
          height: '300px',
          background: 'radial-gradient(ellipse, rgba(99, 161, 131, 0.09) 0%, transparent 65%)',
          filter: 'blur(50px)',
          borderRadius: '45% 55% 50% 50% / 50% 50% 55% 45%',
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
          <pattern id="signup-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#signup-grid)" />
        {/* Organic curves */}
        <path
          d="M 0 100 Q 360 40 720 100 Q 1080 160 1440 100"
          fill="none"
          stroke="var(--color-lavender)"
          strokeWidth="1.2"
          opacity="0.2"
          strokeDasharray="7 16"
        />
        <path
          d="M 0 550 Q 400 490 800 550 Q 1100 600 1440 530"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="1"
          opacity="0.15"
          strokeDasharray="5 18"
        />
        {/* Organic shapes */}
        <ellipse cx="100" cy="180" rx="24" ry="15" fill="var(--color-lavender)" opacity="0.12" transform="rotate(-20, 100, 180)" />
        <ellipse cx="1340" cy="200" rx="20" ry="12" fill="var(--color-accent)" opacity="0.12" transform="rotate(15, 1340, 200)" />
        <ellipse cx="700" cy="600" rx="18" ry="11" fill="var(--color-sage)" opacity="0.1" />
        {/* Asterisk accents */}
        {[
          { x: 200, y: 420, size: 6, color: 'var(--color-lavender)', opacity: 0.25 },
          { x: 1260, y: 120, size: 5, color: 'var(--color-primary)', opacity: 0.22 },
          { x: 800, y: 80, size: 6, color: 'var(--color-accent)', opacity: 0.2 },
          { x: 60, y: 550, size: 5, color: 'var(--color-sage)', opacity: 0.2 },
        ]?.map((star: { x: number; y: number; size: number; color: string; opacity: number }, i: number) => (
          <g key={`su-star-${i}`} transform={`translate(${star.x}, ${star.y})`} opacity={star.opacity}>
            <line x1={-star.size} y1="0" x2={star.size} y2="0" stroke={star.color} strokeWidth="1.5" />
            <line x1="0" y1={-star.size} x2="0" y2={star.size} stroke={star.color} strokeWidth="1.5" />
            <line x1={-star.size * 0.7} y1={-star.size * 0.7} x2={star.size * 0.7} y2={star.size * 0.7} stroke={star.color} strokeWidth="1" />
            <line x1={star.size * 0.7} y1={-star.size * 0.7} x2={-star.size * 0.7} y2={star.size * 0.7} stroke={star.color} strokeWidth="1" />
          </g>
        ))}
        <circle cx="1400" cy="400" r="20" fill="none" stroke="var(--color-lavender)" strokeWidth="1" opacity="0.18" />
        <circle cx="40" cy="300" r="14" fill="none" stroke="var(--color-sage)" strokeWidth="1" opacity="0.15" />
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
            A safe space, just for you.
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '6px', textAlign: 'center' }}>
            Alias only. Never your real name.
          </p>
        </div>

        {/* Card */}
        <div className="dhira-card p-8">
          {/* Google — UI parity with Claude artifact (wired when OAuth is configured) */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 mb-4"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '15px',
              fontWeight: 500,
              color: 'var(--color-text)',
              backgroundColor: 'var(--color-surface)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius-control)',
              padding: '12px 16px',
              cursor: 'pointer',
            }}
            onClick={() => setError('Google sign-up is coming soon — use email or phone for now.')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
          <div className="flex items-center gap-3 mb-5">
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-border)' }} />
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-text-subtle)' }}>
              or create with email
            </span>
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-border)' }} />
          </div>

          {/* Mode toggle: email or phone */}
          <div className="flex gap-2 mb-5 p-1 rounded-control" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
            {(['email', 'phone'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null); setOtpSent(false); setDevCode(null); }}
                className="flex-1 py-2 rounded-control transition-all"
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '14px',
                  fontWeight: 500,
                  backgroundColor: mode === m ? 'var(--color-surface)' : 'transparent',
                  color: mode === m ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  boxShadow: mode === m ? 'var(--shadow-card)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {m === 'email' ? 'Email + password' : 'Phone + OTP'}
              </button>
            ))}
          </div>

          {/* Alias */}
          <div className="mb-4">
            <label
              htmlFor="signup-alias"
              style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: '6px' }}
            >
              Your Dhira alias <span style={{ color: 'var(--color-text-subtle)', fontWeight: 400 }}>(not your real name)</span>
            </label>
            <input
              id="signup-alias"
              type="text"
              value={alias}
              onChange={(e) => setAlias(e?.target?.value)}
              placeholder="e.g. Stargazer, Chai Lover…"
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

          {/* Email + password */}
          {mode === 'email' && (
            <>
              <div className="mb-4">
                <label
                  htmlFor="signup-email"
                  style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: '6px' }}
                >
                  Email address
                </label>
                <input
                  id="signup-email"
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

              <div className="mb-6">
                <label
                  htmlFor="signup-password"
                  style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: '6px' }}
                >
                  Create a password
                </label>
                <input
                  id="signup-password"
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
            </>
          )}

          {/* Phone + OTP */}
          {mode === 'phone' && (
            <div className="mb-6">
              <label
                htmlFor="signup-phone"
                style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: '6px' }}
              >
                Phone number (with country code)
              </label>
              <input
                id="signup-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e?.target?.value)}
                placeholder="+91 98765 43210"
                disabled={otpSent}
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
                  opacity: otpSent ? 0.7 : 1,
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              />
              {otpSent && (
                <>
                  <label
                    htmlFor="signup-otp"
                    style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)', margin: '14px 0 6px' }}
                  >
                    Enter the 6-digit code
                  </label>
                  <input
                    id="signup-otp"
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => setOtp(e?.target?.value)}
                    placeholder="••••••"
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
                      letterSpacing: '0.2em',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                  />
                  {devCode && (
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-accent-text)', marginTop: '8px' }}>
                      Dev code: <strong>{devCode}</strong> (SMS not configured)
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Terms & Conditions checkbox */}
          <div
            className="mb-6 p-4 rounded-card"
            style={{
              backgroundColor: agreedTerms ? 'var(--color-primary-soft)' : 'var(--color-surface-alt)',
              border: `1.5px solid ${agreedTerms ? 'var(--color-primary)' : 'var(--color-border)'}`,
              transition: 'all 0.2s ease',
            }}
          >
            <label htmlFor="terms-checkbox" className="flex items-start gap-3 cursor-pointer">
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  id="terms-checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e?.target?.checked)}
                  className="sr-only"
                />
                {/* Visual only — label/htmlFor toggles the real checkbox (avoid double-toggle). */}
                <div
                  className="w-5 h-5 rounded flex items-center justify-center transition-all duration-200 pointer-events-none"
                  aria-hidden="true"
                  style={{
                    backgroundColor: agreedTerms ? 'var(--color-primary)' : 'var(--color-surface)',
                    border: `2px solid ${agreedTerms ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  }}
                >
                  {agreedTerms && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '14px',
                  color: 'var(--color-text)',
                  lineHeight: 1.55,
                }}
                onClick={() => setAgreedTerms(!agreedTerms)}
              >
                Do you agree with the{' '}
                <Link
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e?.stopPropagation()}
                  style={{ color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'underline' }}
                >
                  terms and conditions
                </Link>{' '}
                of Dhira?
              </span>
            </label>
          </div>

          {error && (
            <div
              className="mb-4"
              style={{ padding: '10px 12px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--color-crisis-surface)', border: '1px solid var(--color-crisis)', color: 'var(--color-crisis)', fontFamily: 'var(--font-ui)', fontSize: '13px' }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={() => {
              if (mode === 'email') handleSignUp();
              else if (!otpSent) handleRequestOtp();
              else handleVerifyOtp();
            }}
            className="btn-accent w-full justify-center"
            style={{
              fontSize: '16px',
              padding: '13px 24px',
              opacity: agreedTerms && !loading ? 1 : 0.55,
              cursor: agreedTerms && !loading ? 'pointer' : 'not-allowed',
            }}
            disabled={!agreedTerms || loading || (mode === 'email' ? !email.trim() || !password.trim() : !phone.trim() || (otpSent && !otp.trim()))}
          >
            {loading
              ? (mode === 'phone' && !otpSent ? 'Sending code…' : mode === 'phone' ? 'Verifying…' : 'Creating your account…')
              : mode === 'phone' && !otpSent
                ? 'Send verification code'
                : mode === 'phone'
                  ? 'Verify & create account'
                  : 'Create my Dhira account'}
          </button>

          {/* Sign in link */}
          <p
            className="text-center mt-5"
            style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text-muted)' }}
          >
            Already have an account?{' '}
            <Link href="/sign-in" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
              Sign in
            </Link>
          </p>
        </div>

        {/* Privacy note */}
        <p
          className="text-center mt-6"
          style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-subtle)' }}
        >
          🕊️ No real name required &nbsp;·&nbsp; 🔒 End-to-end private &nbsp;·&nbsp; 🎚️ You control everything
        </p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <ThemeProvider>
      <SignUpContent />
    </ThemeProvider>
  );
}
