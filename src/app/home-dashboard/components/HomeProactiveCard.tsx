'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, ArrowRight } from 'lucide-react';

// Mock data — backend: proactive check-in from proactive agent via check-in contract
const proactiveData = {
  message: 'Kal thoda heavy lag raha tha. Just checking in — how are you sitting with it today?',
  time: '10:15 PM',
  contractNote: 'Sent within your 8 PM–11 PM window',
};

export default function HomeProactiveCard() {
  return (
    <div
      className="dhira-card p-6 h-full flex flex-col gap-4"
      style={{
        borderLeft: '3px solid var(--color-accent)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--color-accent)', opacity: 0.9 }}
        >
          <Bell size={13} color="#26263A" />
        </div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 600, color: 'var(--color-accent)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Dhira checked in
        </p>
      </div>
      {/* Message */}
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', color: 'var(--color-text)', lineHeight: 1.6, fontStyle: 'italic', flex: 1 }}>
        &ldquo;{proactiveData?.message}&rdquo;
      </p>
      {/* Contract note */}
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-subtle)' }}>
        🎚️ {proactiveData?.contractNote}
      </p>
      {/* Respond CTA */}
      <Link
        href="/chat-with-dhira"
        className="flex items-center gap-2 mt-1"
        style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-primary)', fontWeight: 500 }}
      >
        Respond to Dhira
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}