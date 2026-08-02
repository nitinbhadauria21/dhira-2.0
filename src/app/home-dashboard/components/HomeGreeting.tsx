'use client';

import React, { useEffect, useState } from 'react';
import FloatingBuddy from '@/components/FloatingBuddy';
import { ArrowRight } from 'lucide-react';
import { ARTIFACT_MEMORY_LINE } from '@/lib/artifactDesign';
import { homeGreeting, readStoredShift, type ShiftPreference } from '@/lib/timeOfDay';

interface HomeGreetingProps {
  onStartCheckin: () => void;
  alias?: string;
  shift?: ShiftPreference;
  memoryLine?: string | null;
}

export default function HomeGreeting({
  onStartCheckin,
  alias,
  shift,
  memoryLine,
}: HomeGreetingProps) {
  const userName = alias || 'Friend';
  const [storedShift, setStoredShift] = useState<ShiftPreference>('day');
  const memory = memoryLine?.trim() || ARTIFACT_MEMORY_LINE;
  const greeting = homeGreeting(userName, shift ?? storedShift);

  useEffect(() => {
    setStoredShift(readStoredShift());
  }, []);

  return (
    <div style={{ marginBottom: 8 }}>
      <div className="flex items-start justify-between gap-4" style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-4">
          <FloatingBuddy
            src="/illustrations/dhira_sitting_hi.png"
            alt="DHIRA, waving hello"
            width={78}
            bobAnimation="dhira-bob 5.5s ease-in-out infinite"
          />
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                letterSpacing: '-0.03em',
                color: 'var(--color-text)',
                fontSize: 'clamp(22px, 3vw, 32px)',
                lineHeight: 1.2,
              }}
            >
              {greeting.title}
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 15,
                color: 'var(--color-text-muted)',
                marginTop: 4,
              }}
            >
              {greeting.sub}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onStartCheckin}
          className="btn-primary hidden sm:inline-flex items-center gap-2 flex-shrink-0"
          style={{
            fontSize: 15,
            padding: '10px 20px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Start today&apos;s check-in
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="memory-banner flex items-start gap-3">
        <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>🌙</span>
        <div>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--color-text-subtle)',
              marginBottom: 3,
            }}
          >
            DHIRA remembers
          </p>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 15,
              color: 'var(--color-text)',
              lineHeight: 1.55,
            }}
          >
            &ldquo;{memory}&rdquo;
          </p>
        </div>
      </div>

      <div className="sm:hidden mt-4">
        <button
          type="button"
          onClick={onStartCheckin}
          className="btn-primary w-full justify-center"
          style={{ fontSize: 15, padding: '10px 20px', border: 'none', cursor: 'pointer' }}
        >
          Start today&apos;s check-in
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
