'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BrandLockup from '@/components/BrandLockup';
import StepSplash from './StepSplash';
import StepPrivacy from './StepPrivacy';
import StepSetup from './StepSetup';
import StepContract from './StepContract';
import { readStoredShift, writeStoredShift, type ShiftPreference } from '@/lib/timeOfDay';

export type Language = 'english' | 'hinglish';

export interface OnboardingData {
  alias: string;
  language: Language;
  consentCheckin: boolean;
  consentMemory: boolean;
  checkinFrequency: 'daily' | 'every-other-day' | 'weekly';
  shift: ShiftPreference;
}

const TOTAL_STEPS = 4;

function scrollToTop() {
  if (typeof window === 'undefined') return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
}

export default function OnboardingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    alias: '',
    language: 'hinglish',
    consentCheckin: true,
    consentMemory: true,
    checkinFrequency: 'daily',
    shift: 'day',
  });

  useEffect(() => {
    const stored = readStoredShift();
    setData((prev) => (prev.shift === stored ? prev : { ...prev, shift: stored }));
  }, []);

  // Prefill alias (and language) from signup / saved profile so we don't ask twice.
  useEffect(() => {
    let cancelled = false;
    const aliasFromOAuth = searchParams.get('alias')?.trim() || '';
    if (aliasFromOAuth && typeof window !== 'undefined') {
      localStorage.setItem('dhira-alias', aliasFromOAuth);
    }
    (async () => {
      const cachedAlias =
        aliasFromOAuth ||
        (typeof window !== 'undefined' ? localStorage.getItem('dhira-alias') || '' : '');
      const cachedLang =
        typeof window !== 'undefined' ? localStorage.getItem('dhira-language') : null;
      try {
        const res = await fetch('/api/profile');
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        const profile = json?.profile;
        const aliasFromProfile =
          profile?.alias && profile.alias !== 'Friend' ? String(profile.alias) : '';
        const alias = aliasFromProfile || cachedAlias;
        setData((prev) => ({
          ...prev,
          ...(alias ? { alias } : {}),
          ...(profile?.language === 'english' || profile?.language === 'hinglish'
            ? { language: profile.language }
            : cachedLang === 'english' || cachedLang === 'hinglish'
              ? { language: cachedLang }
              : {}),
          ...(profile?.shift ? { shift: profile.shift } : {}),
        }));
      } catch {
        if (!cancelled && cachedAlias) {
          setData((prev) => ({ ...prev, alias: cachedAlias }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const next = useCallback(() => {
    scrollToTop();
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, []);
  const back = useCallback(() => {
    scrollToTop();
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [step]);

  const updateData = useCallback((patch: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const finish = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dhira-onboarding-done', 'true');
      localStorage.setItem('dhira-alias', data.alias || 'Friend');
      localStorage.setItem('dhira-language', data.language);
      writeStoredShift(data.shift);
    }
    // Persist the anonymous profile + check-in contract to the backend.
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alias: data.alias || 'Friend',
          language: data.language,
          consentCheckin: data.consentCheckin,
          consentMemory: data.consentMemory,
          checkinFrequency: data.checkinFrequency,
          shift: data.shift,
        }),
      });
    } catch {
      /* if the save fails we still let them in; they can re-save in Settings */
    }
    router.push('/home-dashboard');
  }, [data, router]);

  const contentMaxClass = 'max-w-lg';

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Top wordmark */}
      <header className={`flex items-center justify-between px-6 pt-6 pb-2 mx-auto w-full ${contentMaxClass}`}>
        <BrandLockup href="/" size={22} />

        {/* Step dots */}
        {step > 0 && (
          <div className="flex items-center gap-2">
            {Array.from({ length: TOTAL_STEPS - 1 }).map((_, i) => (
              <div
                key={`dot-${i}`}
                style={{
                  width: i < step - 1 ? 8 : i === step - 1 ? 10 : 6,
                  height: i < step - 1 ? 8 : i === step - 1 ? 10 : 6,
                  borderRadius: '50%',
                  backgroundColor:
                    i < step - 1
                      ? 'var(--color-primary)'
                      : i === step - 1
                      ? 'var(--color-accent)'
                      : 'var(--color-border)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        )}
      </header>

      {/* Step content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className={`w-full ${contentMaxClass}`}>
          {step === 0 && <StepSplash onNext={next} />}
          {step === 1 && <StepPrivacy onNext={next} onBack={back} />}
          {step === 2 && (
            <StepSetup
              data={data}
              onChange={updateData}
              onNext={next}
              onBack={back}
            />
          )}
          {step === 3 && (
            <StepContract
              data={data}
              onChange={updateData}
              onFinish={finish}
              onBack={back}
            />
          )}
        </div>
      </main>

      {/* Safety footer */}
      <footer className={`px-6 pb-6 text-center mx-auto w-full ${contentMaxClass}`}>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '13px',
            color: 'var(--color-text-subtle)',
            lineHeight: 1.5,
          }}
        >
          In crisis? Call{' '}
          <strong style={{ color: 'var(--color-crisis)' }}>Tele-MANAS 14416</strong>
          {' '}— free, 24×7, India-wide.
        </p>
      </footer>
    </div>
  );
}
