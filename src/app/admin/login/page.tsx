'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { getAdminSession, setAdminSession } from '@/lib/adminAuth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated as admin, skip login
  useEffect(() => {
    const session = getAdminSession();
    if (session?.role === 'admin') {
      router.replace('/admin/overview');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 800));

    if (!email || !password) {
      setError('Please enter your credentials.');
      setLoading(false);
      return;
    }

    /**
     * Role assignment logic:
     * - Any valid login is granted 'admin' role.
     * - To simulate a non-admin user for testing, use email containing "+viewer"
     *   e.g. test+viewer@dhira.app → role: 'viewer'
     * Replace this block with a real backend/Supabase auth call in production.
     */
    const role: 'admin' | 'viewer' = email.includes('+viewer') ? 'viewer' : 'admin';
    setAdminSession(email, role);

    if (role !== 'admin') {
      setError('Access denied. Your account does not have admin privileges.');
      setLoading(false);
      return;
    }

    router.push('/admin/overview');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Ambient glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(90,103,184,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
            style={{ backgroundColor: 'var(--color-primary-soft)', border: '1px solid var(--color-border)' }}
          >
            <Shield size={24} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h1
            className="text-h2 mb-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
          >
            Dhira Admin
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Internal console · Team access only
          </p>
        </div>

        {/* Card */}
        <div className="dhira-card p-8">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="team@dhira.app"
                className="w-full px-4 py-3 outline-none transition-all duration-200"
                style={{
                  backgroundColor: 'var(--color-surface-alt)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-control)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '16px',
                  color: 'var(--color-text)',
                }}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 outline-none transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--color-surface-alt)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-control)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '16px',
                    color: 'var(--color-text)',
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: 'var(--color-text-subtle)' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl"
                style={{ backgroundColor: 'var(--color-crisis-surface)', border: '1px solid var(--color-crisis)' }}
              >
                <AlertCircle size={15} style={{ color: 'var(--color-crisis)', flexShrink: 0 }} />
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-crisis)' }}>
                  {error}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-1"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign in to Admin Console'
              )}
            </button>
          </form>
        </div>

        <p
          className="text-center mt-6"
          style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-subtle)' }}
        >
          This console is for internal team use only.
          <br />
          Not linked from the user-facing app.
        </p>
      </div>
    </div>
  );
}
