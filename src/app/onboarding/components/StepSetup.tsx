'use client';

import React from 'react';
import type { OnboardingData, Language } from './OnboardingFlow';
import { LANGUAGE_OPTIONS } from '@/lib/artifactDesign';

interface Props {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const languageOptions: { value: Language; label: string; sub: string }[] = LANGUAGE_OPTIONS;

export default function StepSetup({ data, onChange, onNext, onBack }: Props) {
  const canContinue = data.alias.trim().length >= 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Heading */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
          What should Dhira call you?
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '16px',
            color: 'var(--color-text-muted)',
            lineHeight: 1.6,
          }}
        >
          Use any name or alias — no real name needed. This is just how Dhira will greet you.
        </p>
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
          This is stored only in your browser — never on our servers.
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
          How should Dhira talk to you?
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
