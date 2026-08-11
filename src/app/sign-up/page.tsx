'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthScenePanel from '@/components/AuthScenePanel';
import BrandLockup from '@/components/BrandLockup';
import PasswordRevealInput from '@/components/PasswordRevealInput';
import { ThemeProvider } from '@/components/ThemeProvider';
import { signUpEmail, requestOtp, verifyOtp, signInWithGoogle } from '@/lib/authClient';
import { PHONE_OTP_AUTH_ENABLED } from '@/lib/authUi';
import { resetDhiraClientStateForNewAccount } from '@/lib/dhiraClientCache';
import { INDIA_STATES } from '@/lib/indiaStates';
import { phoneAuthError } from '@/lib/twilio/phone';

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
  height: 44,
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

function RequiredMark() {
  return <span style={{ color: 'var(--color-crisis)' }}> *</span>;
}

function SignUpContent() {
  const router = useRouter();
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [alias, setAlias] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const showEmailForm = !PHONE_OTP_AUTH_ENABLED || mode === 'email';

  const firstError = () => {
    if (!alias.trim()) return 'Please choose a DHIRA alias.';
    if (!state.trim()) return 'Please select your state.';
    if (!city.trim()) return 'Please enter your city.';
    if (showEmailForm) {
      if (!email.trim()) return 'Please enter your email address.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'That email address does not look quite right.';
      if (password.length < 8) return 'Please create a password with at least 8 characters.';
    } else {
      if (!phone.trim() || phone.trim() === '+91') return 'Please enter your phone number with country code.';
      const phoneErr = phoneAuthError(phone);
      if (phoneErr) return phoneErr;
      if (otpSent && !otp.trim()) return 'Please enter the OTP code.';
    }
    if (!agreedTerms) return 'Please agree to the terms and conditions to continue.';
    return null;
  };

  const validate = () => {
    const message = firstError();
    setError(message);
    return !message;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUpEmail(email.trim(), password, alias.trim(), {
        state: state.trim(),
        city: city.trim(),
      });
      resetDhiraClientStateForNewAccount();
      if (typeof window !== 'undefined') {
        localStorage.setItem('dhira-alias', alias.trim());
      }
      router.push('/onboarding');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create your account');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { devCode: code } = await requestOtp(phone.trim());
      setOtpSent(true);
      setDevCode(code ?? null);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await verifyOtp(phone.trim(), otp.trim(), alias.trim(), {
        state: state.trim(),
        city: city.trim(),
      });
      resetDhiraClientStateForNewAccount();
      if (typeof window !== 'undefined') {
        localStorage.setItem('dhira-alias', alias.trim());
      }
      router.push('/onboarding');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not verify code');
    } finally {
      setLoading(false);
    }
  };

  const incomplete = Boolean(firstError());

  const handlePrimarySubmit = () => {
    if (showEmailForm) {
      handleSignUp();
      return;
    }
    if (!otpSent) handleRequestOtp();
    else handleVerifyOtp();
  };

  const primaryLabel = () => {
    if (loading) {
      if (!showEmailForm) {
        return otpSent ? 'Verifying...' : 'Sending code...';
      }
      return 'Creating your account...';
    }
    if (!showEmailForm) {
      return otpSent ? 'Verify & create account' : 'Send verification code';
    }
    return 'Create my DHIRA account';
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div
        className="w-full grid items-stretch"
        style={{
          maxWidth: 1060,
          gridTemplateColumns: 'minmax(0, 1.02fr) minmax(390px, 0.98fr)',
          borderRadius: 28,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-soft)',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <div className="hidden lg:block h-full min-h-full">
          <AuthScenePanel variant="sign-up" />
        </div>

        <section
          style={{
            padding: '48px 44px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: 'var(--color-surface)',
            minHeight: PHONE_OTP_AUTH_ENABLED ? 660 : 620,
          }}
        >
          <div className="mb-6">
            <BrandLockup size={24} />
            <h2 className="mt-8" style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--color-text)' }}>
              Create your account
            </h2>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-text-muted)', marginTop: 2 }}>
              Alias only. Never your real name.
            </p>
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
              resetDhiraClientStateForNewAccount();
              try {
                await signInWithGoogle('/onboarding');
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Google sign-up failed');
                setLoading(false);
              }
            }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-border)' }} />
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-text-subtle)' }}>or create with email</span>
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-border)' }} />
          </div>

          {PHONE_OTP_AUTH_ENABLED && (
            <div className="flex gap-2 mb-5 p-1 rounded-control" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
              {(['email', 'phone'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setError(null);
                    setOtpSent(false);
                    setDevCode(null);
                    setOtp('');
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
                  {m === 'email' ? 'Email + password' : 'Phone + OTP'}
                </button>
              ))}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="signup-alias" style={labelStyle}>
              Your DHIRA alias <RequiredMark /> <span style={{ color: 'var(--color-text-subtle)', fontWeight: 400 }}>(not your real name)</span>
            </label>
            <input
              id="signup-alias"
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="e.g. Stargazer, Chai Lover..."
              style={fieldStyle}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label htmlFor="signup-state" style={labelStyle}>
                State <RequiredMark />
              </label>
              <select
                id="signup-state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                style={{ ...fieldStyle, color: state ? 'var(--color-text)' : 'var(--color-text-subtle)' }}
              >
                <option value="">Select your state...</option>
                {INDIA_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="signup-city" style={labelStyle}>
                City <RequiredMark />
              </label>
              <input
                id="signup-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Pune"
                style={fieldStyle}
              />
            </div>
          </div>

          {showEmailForm ? (
            <>
              <div className="mb-4">
                <label htmlFor="signup-email" style={labelStyle}>
                  Email address <RequiredMark />
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  style={fieldStyle}
                />
              </div>
              <PasswordRevealInput
                id="signup-password"
                value={password}
                onChange={setPassword}
                label="Create a password"
                requiredMark
                autoComplete="new-password"
                className="mb-6"
              />
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-text-subtle)', marginTop: '-16px', marginBottom: 18 }}>
                At least 8 characters.
              </p>
            </>
          ) : (
            <div className="mb-6">
              <label htmlFor="signup-phone" style={labelStyle}>
                Phone number (with country code) <RequiredMark />
              </label>
              <input
                id="signup-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                disabled={otpSent}
                style={{ ...fieldStyle, opacity: otpSent ? 0.7 : 1 }}
              />
              {otpSent && (
                <>
                  <label htmlFor="signup-otp" style={{ ...labelStyle, marginTop: 14 }}>
                    Enter the 6-digit code <RequiredMark />
                  </label>
                  <input
                    id="signup-otp"
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    style={{ ...fieldStyle, letterSpacing: '0.2em' }}
                  />
                  {devCode && (
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-accent-text)', marginTop: 8 }}>
                      Dev code: <strong>{devCode}</strong> (SMS not configured)
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setAgreedTerms((v) => !v)}
            className="mb-5"
            style={{
              width: '100%',
              textAlign: 'left',
              padding: 16,
              borderRadius: 16,
              backgroundColor: agreedTerms ? 'var(--color-primary-soft)' : 'var(--color-surface-alt)',
              border: `1.5px solid ${agreedTerms ? 'var(--color-primary)' : 'var(--color-border)'}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                flexShrink: 0,
                marginTop: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: agreedTerms ? 'var(--color-primary)' : 'var(--color-surface)',
                border: `2px solid ${agreedTerms ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}
            >
              {agreedTerms && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-text)', lineHeight: 1.55 }}>
              Do you agree with the{' '}
              <Link href="/terms" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'underline' }}>
                terms and conditions
              </Link>{' '}
              of DHIRA? <RequiredMark />
            </span>
          </button>

          {error && (
            <div className="mb-4" style={{ padding: '10px 12px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--color-crisis-surface)', border: '1px solid var(--color-crisis)', color: 'var(--color-crisis)', fontFamily: 'var(--font-ui)', fontSize: 13 }}>
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handlePrimarySubmit}
            className="btn-accent w-full justify-center"
            style={{
              fontSize: 16,
              padding: '13px 24px',
              opacity: incomplete || loading ? 0.62 : 1,
              cursor: loading ? 'wait' : 'pointer',
            }}
            disabled={loading}
          >
            {primaryLabel()}
          </button>

          <p className="text-center mt-5" style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link href="/sign-in" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
              Sign in
            </Link>
          </p>
        </section>
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
