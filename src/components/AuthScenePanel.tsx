'use client';

import React, { useEffect, useMemo, useState } from 'react';
import BrandLockup from '@/components/BrandLockup';
import FloatingBuddy from '@/components/FloatingBuddy';
import {
  authSceneForNow,
  readStoredShift,
  writeStoredShift,
  SHIFT_OPTIONS,
  type ShiftPreference,
} from '@/lib/timeOfDay';

type AuthScenePanelProps = {
  variant: 'sign-in' | 'sign-up';
  minHeight?: number;
  onShiftChange?: (shift: ShiftPreference) => void;
};

function saveShiftToProfile(shift: ShiftPreference) {
  void fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shift }),
  }).catch(() => {
    // Auth pages are often anonymous; localStorage is the source of truth until login.
  });
}

export default function AuthScenePanel({
  variant,
  minHeight = 560,
  onShiftChange,
}: AuthScenePanelProps) {
  const [shift, setShift] = useState<ShiftPreference>('day');
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    setShift(readStoredShift());
  }, []);

  const scene = useMemo(() => authSceneForNow(shift), [shift]);
  const selectedShift = SHIFT_OPTIONS.find((opt) => opt.key === shift) ?? SHIFT_OPTIONS[0];
  const isSignUp = variant === 'sign-up';

  const pickShift = (nextShift: ShiftPreference) => {
    setShift(nextShift);
    writeStoredShift(nextShift);
    saveShiftToProfile(nextShift);
    onShiftChange?.(nextShift);
    setPickerOpen(false);
  };

  return (
    <aside
      style={{
        position: 'relative',
        minHeight,
        height: '100%',
        alignSelf: 'stretch',
        padding: '48px 44px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 32,
        background: scene.sky,
        overflow: 'hidden',
        transition: 'background 1.2s ease',
      }}
    >
      <svg
        viewBox="0 0 480 620"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          <radialGradient id={`${variant}-scene-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF2C6" stopOpacity="0.56" />
            <stop offset="100%" stopColor="#FFF2C6" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${variant}-hill-a`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#637B8C" stopOpacity="0.78" />
            <stop offset="100%" stopColor="#33495B" stopOpacity="0.88" />
          </linearGradient>
          <linearGradient id={`${variant}-hill-b`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#937E9A" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#4F5778" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <circle cx="368" cy="118" r="116" fill={`url(#${variant}-scene-glow)`} className="dhira-auth-glow" />
        <circle cx="368" cy="118" r="26" fill="#FFF4DA" opacity="0.95" />
        <g fill="#FFFFFF" opacity="0.34">
          {[
            [60, 70, 1.6],
            [140, 42, 1.2],
            [216, 88, 1.8],
            [96, 150, 1.3],
            [268, 46, 1.4],
            [430, 196, 1.5],
            [30, 250, 1.2],
            [188, 176, 1.1],
          ].map(([cx, cy, r], index) => (
            <circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r={r}
              className="dhira-auth-twinkle"
              style={{ animationDelay: `${index * -0.55}s` }}
            />
          ))}
        </g>
        <g fill="#FFFFFF" opacity="0.16">
          <ellipse cx="118" cy="120" rx="46" ry="17" />
          <ellipse cx="152" cy="110" rx="32" ry="14" />
          <ellipse cx="330" cy="206" rx="38" ry="14" />
          <ellipse cx="360" cy="198" rx="26" ry="11" />
        </g>
        <path
          d="M0 510 C 90 460, 180 528, 280 494 C 360 466, 430 488, 480 472 L480 620 L0 620 Z"
          fill={`url(#${variant}-hill-b)`}
        />
        <path
          d="M0 562 C 110 524, 210 578, 320 548 C 400 526, 440 542, 480 532 L480 620 L0 620 Z"
          fill={`url(#${variant}-hill-a)`}
        />
      </svg>

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
        <BrandLockup color="#FFFFFF" />
        <span
          style={{
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.14)',
            border: '1px solid rgba(255,255,255,0.22)',
            fontFamily: 'var(--font-ui)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: scene.badgeColor,
          }}
        >
          <span
            aria-hidden="true"
            style={{ width: 6, height: 6, borderRadius: '50%', background: scene.badgeDot, display: 'inline-block' }}
          />
          {scene.badge}
        </span>
      </div>

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <FloatingBuddy
          src="/illustrations/dhira_orb.png"
          alt="DHIRA, a small robot buddy holding a glowing light"
          width={78}
        />

        <div>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.66)',
              marginBottom: 10,
            }}
          >
            {scene.eyebrow}
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(30px, 3.6vw, 42px)',
              fontWeight: 600,
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
            }}
          >
            {scene.h1}
            <br />
            {scene.h2}
          </h1>
        </div>

        <div
          style={{
            padding: '16px 18px',
            borderRadius: 16,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
            borderLeft: `3px solid ${scene.accent}`,
            maxWidth: 340,
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.62)',
              marginBottom: 5,
            }}
          >
            {isSignUp ? 'What this space promises' : scene.memLabel}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 15,
              color: '#F1EEF9',
              lineHeight: 1.55,
              fontStyle: 'italic',
            }}
          >
            "{isSignUp ? 'Alias only. No real name needed. DHIRA listens without judgment.' : scene.mem}"
          </p>
        </div>

        <div style={{ position: 'relative', alignSelf: 'flex-start' }}>
          <button
            type="button"
            onClick={() => setPickerOpen((open) => !open)}
            aria-expanded={pickerOpen}
            title="DHIRA follows your rhythm, not the clock"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 14px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.1)',
              border: '1px dashed rgba(255,255,255,0.32)',
              color: 'rgba(255,255,255,0.86)',
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 7.5V12l3 1.8" />
            </svg>
            {selectedShift.label}
            <span style={{ opacity: 0.6, fontSize: 10 }}>v</span>
          </button>

          {pickerOpen && (
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: 0,
                zIndex: 5,
                width: 250,
                padding: 8,
                borderRadius: 14,
                background: 'rgba(22,20,44,0.94)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.18)',
                boxShadow: '0 14px 34px rgba(0,0,0,0.4)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.5)',
                  padding: '4px 8px 8px',
                }}
              >
                When do you usually work?
              </p>
              {SHIFT_OPTIONS.map((opt) => {
                const selected = opt.key === shift;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => pickShift(opt.key)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 10px',
                      borderRadius: 10,
                      border: 'none',
                      background: selected ? 'rgba(255,255,255,0.16)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'var(--font-ui)',
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: '50%',
                        flexShrink: 0,
                        border: `1.5px solid ${selected ? '#F6C06B' : 'rgba(255,255,255,0.34)'}`,
                        background: selected ? '#F6C06B' : 'transparent',
                      }}
                    />
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#F1EEF9' }}>
                        {opt.label}
                      </span>
                      <span style={{ display: 'block', fontSize: 11.5, color: 'rgba(255,255,255,0.55)' }}>
                        {opt.hint}
                      </span>
                    </span>
                  </button>
                );
              })}
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'rgba(255,255,255,0.45)', padding: '8px 8px 4px', lineHeight: 1.45 }}>
                You choose this - DHIRA never guesses it from your activity.
              </p>
            </div>
          )}
        </div>

        {isSignUp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, maxWidth: 340 }}>
            {['Private from the first hello', 'State and city help local safety support', 'Your rhythm shapes greetings'].map((perk) => (
              <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: 9, fontFamily: 'var(--font-ui)', fontSize: 13.5, color: 'rgba(255,255,255,0.8)' }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.16)', fontSize: 10, color: '#FFFFFF' }}>
                  ✓
                </span>
                {perk}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexWrap: 'wrap', gap: 18 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-ui)', fontSize: 12.5, color: 'rgba(255,255,255,0.72)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8FBCA4" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
            <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
          </svg>
          {isSignUp ? 'End-to-end private' : 'Private by design'}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-ui)', fontSize: 12.5, color: 'rgba(255,255,255,0.72)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F6C06B" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 14c2-6 6-9 11-9 0 5-3 9-8 10l-3 3" />
            <path d="M4 18c1-2 2.5-3 4.5-3.5" />
          </svg>
          No real name needed
        </span>
      </div>
    </aside>
  );
}
