'use client';

import React from 'react';
import Link from 'next/link';
import DhiraAvatar from '@/components/DhiraAvatar';
import { ArrowRight } from 'lucide-react';

interface HomeGreetingProps {
  onStartCheckin: () => void;
}

// Mock data — backend: load from memory_notes table for this profile
const memoryRecall = {
  line: 'Last time, work was sitting heavy on you — how\'s that today?',
  topic: 'work',
};

const userName = 'Aarav'; // From profiles.anon_id display name

export default function HomeGreeting({ onStartCheckin }: HomeGreetingProps) {
  // Hour-based greeting — computed statically for SSR safety
  const hour = 22; // Mock: late evening
  const greeting = hour >= 21 || hour < 5
    ? 'Good evening'
    : hour < 12
      ? 'Good morning' :'Good afternoon';

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
                fontSize: 'clamp(22px, 3vw, 32px)',
                fontWeight: 500,
                color: 'var(--color-text)',
                lineHeight: 1.2,
              }}
            >
              {greeting}, {userName}.
            </h1>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Dhira is here.
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

      {/* Memory recall banner */}
      <div
        className="memory-banner flex items-start gap-3"
      >
        <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>🌙</span>
        <div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', color: 'var(--color-text)', lineHeight: 1.55 }}>
            <span style={{ color: 'var(--color-text-subtle)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
              Dhira remembers
            </span>
            &ldquo;{memoryRecall.line}&rdquo;
          </p>
        </div>
      </div>

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