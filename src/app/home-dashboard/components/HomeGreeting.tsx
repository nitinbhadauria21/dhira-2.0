'use client';

import React from 'react';
import Link from 'next/link';
import DhiraAvatar from '@/components/DhiraAvatar';
import { ArrowRight } from 'lucide-react';

interface HomeGreetingProps {
  onStartCheckin: () => void;
  alias?: string;
  memoryLine?: string | null;
}

export default function HomeGreeting({ onStartCheckin, alias, memoryLine }: HomeGreetingProps) {
  const userName = alias || 'Friend';
  const hour = new Date().getHours();
  const greeting =
    hour >= 21 || hour < 5
      ? 'Late night'
      : hour < 12
        ? 'Good morning'
        : hour < 17
          ? 'Hey'
          : 'Good evening';

  return (
    <div className="mb-2">
      {/* Greeting header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <DhiraAvatar size={52} variant="softer" />
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(24px, 3.5vw, 34px)',
                fontWeight: 650,
                color: 'var(--color-text)',
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
              }}
            >
              {greeting}, {userName}.
            </h1>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
              Dhira is here — no pressure, just space.
            </p>
          </div>
        </div>

        {/* Primary CTA */}
        <Link
          href="/chat-with-dhira"
          className="btn-primary hidden sm:inline-flex items-center gap-2 flex-shrink-0"
          style={{ fontSize: '15px', padding: '10px 20px' }}
        >
          Start today&apos;s check-in
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Memory recall banner — only when there's a real memory to show */}
      {memoryLine && (
        <div
          className="memory-banner flex items-start gap-3"
        >
          <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>🌙</span>
          <div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', color: 'var(--color-text)', lineHeight: 1.55 }}>
              <span style={{ color: 'var(--color-text-subtle)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                Dhira remembers
              </span>
              &ldquo;{memoryLine}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* Mobile CTA */}
      <div className="sm:hidden mt-4">
        <Link href="/chat-with-dhira" className="btn-primary w-full justify-center">
          Start today&apos;s check-in
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}