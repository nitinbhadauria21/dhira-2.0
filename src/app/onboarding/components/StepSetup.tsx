'use client';

import React from 'react';
import FloatingBuddy from '@/components/FloatingBuddy';
import type { OnboardingData, Language } from './OnboardingFlow';
import { LANGUAGE_OPTIONS } from '@/lib/artifactDesign';
import { SHIFT_OPTIONS, writeStoredShift } from '@/lib/timeOfDay';
import { onboardingBuddyPanelStyle } from './onboardingBuddyPanel';

interface Props {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const languageOptions: { value: Language; label: string; sub: string }[] = LANGUAGE_OPTIONS;

export default function StepSetup({ data, onChange, onNext, onBack }: Props) {
  const canContinue = data.alias.trim().length >= 1;
  const aliasFromSignup = data.alias.trim().length >= 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="onboarding-split-hero">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-text-subtle)',
            }}
          >
            Step 1 of 2
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 5vw, 36px)',
              fontWeight: 500,
              color: 'var(--color-text)',
              lineHeight: 1.2,
            }}
          >
            {aliasFromSignup ? `We'll keep calling you ${data.alias.trim()}` : 'What should DHIRA call you?'}
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '16px',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
            }}
          >
            {aliasFromSignup
              ? 'You already chose this at sign-up. Change it only if you want — no real name needed.'
              : 'Use any name or alias — no real name needed. This is just how DHIRA will greet you.'}
          </p>
        </div>

        <div style={{ ...onboardingBuddyPanelStyle, minHeight: 220 }}>
          <FloatingBuddy
            src="/illustrations/dhira_setup_wave.png"
            alt="DHIRA waving hello while you choose your alias"
            width={100}
          />
        </div>
      </div>

      {/* Name input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label
          htmlFor="alias-input"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--color-text-muted)',
          }}
        >
          Your name or alias
        </label>
        <input
          id="alias-input"
          type="text"
          value={data.alias}
          onChange={(e) => onChange({ alias: e.target.value })}
          placeholder="e.g. Arjun, Priya, Moon, anything…"
          maxLength={30}
          autoComplete="off"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '17px',
            color: 'var(--color-text)',
            backgroundColor: 'var(--color-surface)',
            border: `1.5px solid ${data.alias.trim() ? 'var(--color-primary)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-control)',
            padding: '14px 16px',
            outline: 'none',
            width: '100%',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = data.alias.trim()
              ? 'var(--color-primary)'
              : 'var(--color-border)')
          }
        />
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '13px',
            color: 'var(--color-text-subtle)',
          }}
        >
          Saved privately in your DHIRA profile — used only to greet you.
        </p>
      </div>

      {/* Language preference */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--color-text-muted)',
          }}
        >
          How should DHIRA talk to you?
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {languageOptions.map((opt) => {
            const selected = data.language === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ language: opt.value })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px 18px',
                  borderRadius: 'var(--radius-control)',
                  border: `1.5px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  backgroundColor: selected ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Radio indicator */}
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: selected ? 'var(--color-primary)' : 'transparent',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {selected && (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#fff',
                      }}
                    />
                  )}
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '16px',
                      fontWeight: 500,
                      color: selected ? 'var(--color-primary)' : 'var(--color-text)',
                      marginBottom: '2px',
                    }}
                  >
                    {opt.label}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '13px',
                      color: 'var(--color-text-subtle)',
                    }}
                  >
                    {opt.sub}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Work shift — user-chosen, never inferred */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--color-text-muted)',
          }}
        >
          When do you usually work?
        </label>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-subtle)', marginTop: -4 }}>
          DHIRA will greet you in your frame of time — not the clock&apos;s.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {SHIFT_OPTIONS.map((opt) => {
            const selected = data.shift === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  writeStoredShift(opt.key);
                  onChange({ shift: opt.key });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-control)',
                  border: `1.5px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  backgroundColor: selected ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', fontWeight: 500, color: 'var(--color-text)' }}>
                    {opt.label}
                  </p>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)' }}>{opt.hint}</p>
                </div>
                {selected ? (
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-primary)' }} />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            fontSize: '16px',
            padding: '14px 24px',
            opacity: canContinue ? 1 : 0.45,
            cursor: canContinue ? 'pointer' : 'not-allowed',
          }}
        >
          Continue
        </button>
        <button
          onClick={onBack}
          className="btn-ghost"
          style={{ width: '100%', justifyContent: 'center', fontSize: '15px' }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
