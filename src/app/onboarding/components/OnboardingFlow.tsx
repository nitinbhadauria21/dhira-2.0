'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import StepSplash from './StepSplash';
import StepPrivacy from './StepPrivacy';
import StepSetup from './StepSetup';
import StepContract from './StepContract';

export type Language = 'english' | 'hinglish';

export interface OnboardingData {
  alias: string;
  language: Language;
  consentCheckin: boolean;
  consentMemory: boolean;
  checkinFrequency: 'daily' | 'every-other-day' | 'weekly';
}

const TOTAL_STEPS = 4;

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    alias: '',
    language: 'hinglish',
    consentCheckin: true,
    consentMemory: true,
    checkinFrequency: 'daily',
  });

  const next = useCallback(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)), []);
  const back = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);

  const updateData = useCallback((patch: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const finish = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dhira-onboarding-done', 'true');
      localStorage.setItem('dhira-alias', data.alias || 'Friend');
      localStorage.setItem('dhira-language', data.language);
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
        }),
      });
    } catch {
      /* if the save fails we still let them in; they can re-save in Settings */
    }
    router.push('/home-dashboard');
  }, [data, router]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Top wordmark */}
      <header className="flex items-center justify-between px-6 pt-6 pb-2 max-w-lg mx-auto w-full">
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '22px',
            letterSpacing: '-0.03em',
            color: 'var(--color-text)',
          }}
        >
          dhira
        </span>

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
        <div className="w-full max-w-lg">
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
      <footer className="px-6 pb-6 text-center max-w-lg mx-auto w-full">
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
