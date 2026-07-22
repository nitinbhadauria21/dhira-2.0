'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DhiraAvatar from '@/components/DhiraAvatar';
import { ArrowRight } from 'lucide-react';

interface HomeGreetingProps {
  onStartCheckin: () => void;
  alias?: string;
  memoryLine?: string | null;
}

function greetingForHour(hour: number): string {
  if (hour >= 21 || hour < 5) return 'Late night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeGreeting({ onStartCheckin, alias, memoryLine }: HomeGreetingProps) {
  const userName = alias || 'Friend';
  // Stable first paint (server + client) then local clock — avoids hydration mismatch.
  const [greeting, setGreeting] = useState('Hey');

  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours()));
  }, []);

  return (
    <div style={{ marginBottom: 8 }}>
      <div
        className="flex items-start justify-between gap-4"
        style={{ marginBottom: 24 }}
      >
        <div className="flex items-center gap-4">
          <DhiraAvatar size={52} variant="softer" />
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
              {greeting}, {userName}.
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 15,
                color: 'var(--color-text-muted)',
                marginTop: 4,
              }}
            >
              Dhira is here.
            </p>
          </div>
        </div>

        <Link
          href="/chat-with-dhira"
          className="btn-primary hidden sm:inline-flex items-center gap-2 flex-shrink-0"
          style={{ fontSize: 15, padding: '10px 20px', borderRadius: 12 }}
        >
          Start today&apos;s check-in
          <ArrowRight size={16} />
        </Link>
      </div>

      {memoryLine && (
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
              Dhira remembers
            </p>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 15,
                color: 'var(--color-text)',
                lineHeight: 1.55,
              }}
            >
              &ldquo;{memoryLine}&rdquo;
            </p>
          </div>
        </div>
      )}

      <div className="sm:hidden mt-4">
        <Link
          href="/chat-with-dhira"
          className="btn-primary w-full justify-center"
          style={{ fontSize: 15, padding: '10px 20px' }}
        >
          Start today&apos;s check-in
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
