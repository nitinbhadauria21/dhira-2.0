'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { EmailOtpType } from '@supabase/supabase-js';
import AuthScenePanel from '@/components/AuthScenePanel';
import BrandLockup from '@/components/BrandLockup';
import PasswordRevealInput from '@/components/PasswordRevealInput';
import { ThemeProvider } from '@/components/ThemeProvider';
import { completePasswordReset } from '@/lib/authClient';
import { getBrowserSupabase } from '@/lib/supabaseBrowser';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sb = getBrowserSupabase();
      if (!sb) {
        if (!cancelled) {
          setError('Supabase is not configured. See docs/SUPABASE_PASSWORD_RESET.md.');
          setCheckingSession(false);
        }
        return;
      }

      const tokenHash = searchParams.get('token_hash');
      const otpType = searchParams.get('type') as EmailOtpType | null;
      if (tokenHash && otpType) {
        const { error: verifyErr } = await sb.auth.verifyOtp({
          type: otpType,
          token_hash: tokenHash,
        });
        if (verifyErr) {
          if (!cancelled) {
            router.replace(
              `/forgot-password?error=${encodeURIComponent(verifyErr.message || 'Invalid reset link')}`,
            );
          }
          return;
        }
        if (!cancelled) {
          router.replace('/reset-password');
          setCheckingSession(false);
        }
        return;
      }

      const code = searchParams.get('code');
      if (code) {
        const { error: exchangeErr } = await sb.auth.exchangeCodeForSession(code);
        if (exchangeErr) {
          if (!cancelled) {
            const msg = /pkce|code verifier/i.test(exchangeErr.message)
              ? 'Open the reset email on the same browser where you clicked Send reset link, or ask your developer to run configure:password-reset-template.'
              : exchangeErr.message;
            router.replace(`/forgot-password?error=${encodeURIComponent(msg)}`);
          }
          return;
        }
        if (!cancelled) {
          router.replace('/reset-password');
          setCheckingSession(false);
        }
        return;
      }

      const { data } = await sb.auth.getSession();
      if (!cancelled) {
        if (!data.session) {
          router.replace('/forgot-password?error=Reset+link+expired+or+missing.+Request+a+new+one.');
          return;
        }
        setCheckingSession(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  const handleSubmit = async () => {
    setError(null);
    if (password.length < 8) {
      setError('Please use at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await completePasswordReset(password);
      router.push('/home-dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update password');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-text-muted)' }}>Loading…</p>
      </div>
    );
  }

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
              Choose a new password
            </h2>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-text-muted)', marginTop: 6 }}>
              At least 8 characters. You will go straight to your dashboard when done.
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

          <PasswordRevealInput
            id="reset-password"
            value={password}
            onChange={setPassword}
            label="New password"
            autoComplete="new-password"
            className="mb-4"
          />
          <PasswordRevealInput
            id="reset-password-confirm"
            value={confirm}
            onChange={setConfirm}
            label="Confirm new password"
            autoComplete="new-password"
            className="mb-6"
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !password || !confirm}
            className="btn-primary w-full justify-center"
            style={{ fontSize: 16, padding: '13px 24px', opacity: loading || !password || !confirm ? 0.6 : 1 }}
          >
            {loading ? 'Saving…' : 'Update password'}
          </button>

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

export default function ResetPasswordPage() {
  return (
    <ThemeProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
          <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-text-muted)' }}>Loading…</p>
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </ThemeProvider>
  );
}
