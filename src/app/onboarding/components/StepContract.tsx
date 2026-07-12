'use client';

import React from 'react';
import type { OnboardingData } from './OnboardingFlow';

interface Props {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
  onFinish: () => void;
  onBack: () => void;
}

const frequencyOptions: { value: OnboardingData['checkinFrequency']; label: string; sub: string }[] = [
  { value: 'daily', label: 'Daily', sub: 'A gentle nudge every day' },
  { value: 'every-other-day', label: 'Every other day', sub: 'A little breathing room' },
  { value: 'weekly', label: 'Weekly', sub: 'Just once a week' },
];

interface ConsentRowProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  body: string;
}

function ConsentRow({ checked, onChange, title, body }: ConsentRowProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '16px 18px',
        borderRadius: 'var(--radius-control)',
        border: `1.5px solid ${checked ? 'var(--color-sage)' : 'var(--color-border)'}`,
        backgroundColor: checked ? 'rgba(99, 161, 131, 0.08)' : 'var(--color-surface)',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Checkbox */}
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: '5px',
          border: `2px solid ${checked ? 'var(--color-sage)' : 'var(--color-border)'}`,
          backgroundColor: checked ? 'var(--color-sage)' : 'transparent',
          flexShrink: 0,
          marginTop: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
      >
        {checked && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '15px',
            fontWeight: 500,
            color: 'var(--color-text)',
            marginBottom: '3px',
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '13px',
            color: 'var(--color-text-muted)',
            lineHeight: 1.55,
          }}
        >
          {body}
        </p>
      </div>
    </button>
  );
}

export default function StepContract({ data, onChange, onFinish, onBack }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
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
          Step 2 of 2
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
          {data.alias ? `${data.alias}, how often should Dhira check in?` : 'How often should Dhira check in?'}
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '16px',
            color: 'var(--color-text-muted)',
            lineHeight: 1.6,
          }}
        >
          You can change this anytime in Settings. Dhira will never reach out without your permission.
        </p>
      </div>

      {/* Frequency selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {frequencyOptions.map((opt) => {
          const selected = data.checkinFrequency === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ checkinFrequency: opt.value })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 18px',
                borderRadius: 'var(--radius-control)',
                border: `1.5px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                backgroundColor: selected ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
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
                  <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#fff' }} />
                )}
              </div>
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '15px',
                    fontWeight: 500,
                    color: selected ? 'var(--color-primary)' : 'var(--color-text)',
                  }}
                >
                  {opt.label}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '13px',
                    color: 'var(--color-text-subtle)',
                    marginLeft: '8px',
                  }}
                >
                  — {opt.sub}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Consent section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--color-text-muted)',
          }}
        >
          Your consent preferences
        </p>
        <ConsentRow
          checked={data.consentCheckin}
          onChange={(v) => onChange({ consentCheckin: v })}
          title="Allow proactive check-ins"
          body="Dhira may send a gentle nudge based on your chosen frequency. You can pause this anytime."
        />
        <ConsentRow
          checked={data.consentMemory}
          onChange={(v) => onChange({ consentMemory: v })}
          title="Allow Dhira to remember"
          body="Dhira stores mood metadata (not your words) to personalise future check-ins. No personal data is stored."
        />
      </div>

      {/* Summary card */}
      <div
        style={{
          padding: '16px 18px',
          borderRadius: 'var(--radius-card)',
          backgroundColor: 'var(--color-surface-alt)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
          }}
        >
          Your setup
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
          {[
            { label: data.alias || 'Anonymous', icon: '👤' },
            { label: data.language === 'hinglish' ? 'Hinglish' : 'English', icon: '💬' },
            {
              label:
                data.checkinFrequency === 'daily' ?'Daily check-ins'
                  : data.checkinFrequency === 'every-other-day' ?'Every other day' :'Weekly check-ins',
              icon: '🔔',
            },
          ].map((tag) => (
            <span
              key={tag.label}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '13px',
                color: 'var(--color-text)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '20px',
                padding: '4px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              {tag.icon} {tag.label}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={onFinish}
          className="btn-accent"
          style={{ width: '100%', justifyContent: 'center', fontSize: '16px', padding: '15px 24px' }}
        >
          Start talking to Dhira →
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
