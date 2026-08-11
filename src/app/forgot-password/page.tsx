'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AuthScenePanel from '@/components/AuthScenePanel';
import BrandLockup from '@/components/BrandLockup';
import { ThemeProvider } from '@/components/ThemeProvider';
import { requestPasswordReset } from '@/lib/authClient';

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

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const err = searchParams.get('error');
    if (err) setError(err);
  }, [searchParams]);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send reset link');
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
        <div className="hidden lg:block h-full min-h-full">
          <AuthScenePanel variant="sign-in" />
        </div>

        <section
          style={{
            padding: '48px 44px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: 'var(--color-surface)',
            minHeight: 520,
          }}
        >
          <div className="mb-6">
            <BrandLockup size={24} />
            <h2 className="mt-8" style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--color-text)' }}>
              Forgot Password
            </h2>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-text-muted)', marginTop: 6 }}>
              We will email you a reset link that works on any browser or phone. Phone-only accounts should use OTP on sign-in instead.
            </p>
          </div>

          {error && (
            <div
              className="mb-4"
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--color-crisis-surface)',
                border: '1px solid var(--color-crisis)',
                color: 'var(--color-crisis)',
                fontFamily: 'var(--font-ui)',
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          {sent ? (
            <div
              className="mb-6"
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)',
                fontFamily: 'var(--font-ui)',
                fontSize: 14,
                color: 'var(--color-text-muted)',
              }}
            >
              If an account exists for that email, a reset link is on its way. Check your inbox and spam folder — you can open the link on any device or browser.
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label htmlFor="forgot-email" style={labelStyle}>
                  Email address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  style={fieldStyle}
                />
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !email.trim()}
                className="btn-primary w-full justify-center"
                style={{ fontSize: 16, padding: '13px 24px', opacity: loading || !email.trim() ? 0.6 : 1 }}
              >
                {loading ? 'Sending link…' : 'Send reset link'}
              </button>
            </>
          )}

          <p className="text-center mt-5" style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-text-muted)' }}>
            <Link href="/sign-in" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
              Back to sign in
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <ThemeProvider>
      <React.Suspense fallback={null}>
        <ForgotPasswordContent />
      </React.Suspense>
    </ThemeProvider>
  );
}
