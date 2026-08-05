'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getBrowserSupabase } from '@/lib/supabaseBrowser';

/**
 * Completes Supabase OAuth (e.g. Google) and sets Dhira's session cookie.
 * Plain English: Google sends the user back here; we turn that into a login
 * cookie, then send them to onboarding (or wherever `next` says).
 */
function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const sb = getBrowserSupabase();
        if (!sb) throw new Error('Supabase is not configured for Google sign-in.');

        // Prefer code exchange when present; otherwise read an existing session.
        const code = searchParams.get('code');
        if (code) {
          const { error: exchangeError } = await sb.auth.exchangeCodeForSession(code);
          if (exchangeError) throw new Error(exchangeError.message);
        }

        const { data, error: sessionError } = await sb.auth.getSession();
        if (sessionError) throw new Error(sessionError.message);
        const token = data.session?.access_token;
        if (!token) throw new Error('Google sign-in did not return a session. Try again.');

        const email = data.session?.user?.email ?? undefined;
        const metaAlias =
          (data.session?.user?.user_metadata?.alias as string | undefined) ||
          (data.session?.user?.user_metadata?.full_name as string | undefined) ||
          (data.session?.user?.user_metadata?.name as string | undefined);

        const res = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken: token,
            email,
            alias: metaAlias || 'Friend',
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || 'Could not create your DHIRA session');

        if (metaAlias && typeof window !== 'undefined' && metaAlias !== 'Friend') {
          localStorage.setItem('dhira-alias', metaAlias);
        }

        const next = searchParams.get('next') || '/onboarding';
        if (!cancelled) router.replace(next);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Google sign-in failed');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div style={{ maxWidth: 420, textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            color: 'var(--color-text)',
            marginBottom: 8,
          }}
        >
          {error ? 'Sign-in hiccup' : 'Finishing Google sign-in…'}
        </p>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--color-text-muted)' }}>
          {error || 'One moment — we are opening your private space.'}
        </p>
        {error ? (
          <button
            type="button"
            className="btn-primary mt-6"
            onClick={() => router.replace('/sign-in')}
            style={{ border: 'none', cursor: 'pointer' }}
          >
            Back to sign in
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackInner />
    </Suspense>
  );
}
