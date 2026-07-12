'use client';

import React, { useState } from 'react';

import DhiraAvatar from '@/components/DhiraAvatar';
import { Phone, ArrowRight, Heart, ExternalLink } from 'lucide-react';

interface CrisisHandoffProps {
  onBack: () => void;
}

export default function CrisisHandoff({ onBack }: CrisisHandoffProps) {
  const [calling, setCalling] = useState(false);

  const handleCall = () => {
    setCalling(true);
    // In production: tel:14416
    window.open('tel:14416', '_self');
    setTimeout(() => setCalling(false), 3000);
  };

  return (
    <div
      className="flex flex-col min-h-full items-center justify-center px-6 py-12 fade-in"
      style={{
        backgroundColor: 'var(--color-crisis-surface)',
        minHeight: 'calc(100vh - 144px)',
      }}
    >
      <div className="max-w-lg w-full mx-auto flex flex-col gap-8">
        {/* Dhira avatar — warm, present */}
        <div className="flex justify-center">
          <DhiraAvatar size={64} variant="softer" />
        </div>

        {/* Crisis message — exact copy from spec */}
        <div
          className="rounded-card p-6"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: `1.5px solid var(--color-crisis)`,
            boxShadow: `0 0 32px rgba(197, 107, 92, 0.15)`,
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              fontWeight: 500,
              color: 'var(--color-crisis)',
              lineHeight: 1.3,
              marginBottom: '16px',
            }}
          >
            I&apos;m here with you right now.
          </p>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '17px',
              color: 'var(--color-text)',
              lineHeight: 1.7,
            }}
          >
            I&apos;m really sorry you&apos;re feeling this way, and I&apos;m concerned about your safety.
            Please reach out right now to someone who can be with you. In India you can call{' '}
            <strong style={{ color: 'var(--color-crisis)' }}>Tele-MANAS at 14416</strong> (free, 24×7),
            or contact your local emergency services. If there&apos;s someone you trust nearby, please
            reach out to them too. You don&apos;t have to be alone with this.
          </p>
        </div>

        {/* Primary CTA — Call button */}
        <button
          onClick={handleCall}
          className="flex items-center justify-center gap-3 w-full py-5 rounded-card transition-all duration-200"
          style={{
            backgroundColor: 'var(--color-crisis)',
            color: '#ffffff',
            fontFamily: 'var(--font-ui)',
            fontSize: '20px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: `0 0 32px rgba(197, 107, 92, 0.4)`,
            transform: calling ? 'scale(0.98)' : 'scale(1)',
          }}
          aria-label="Call Tele-MANAS 14416"
        >
          <Phone size={22} />
          📞 Call Tele-MANAS · 14416
        </button>

        {/* Verified counsellor card */}
        <div
          className="rounded-card p-5 flex items-center justify-between gap-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}
            >
              <Heart size={18} />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
                Verified counsellor
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="inline-block rounded-full"
                  style={{ width: 7, height: 7, backgroundColor: 'var(--color-sage)', flexShrink: 0 }}
                />
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-sage)' }}>
                  Available now — tap to connect
                </span>
              </div>
            </div>
          </div>
          <button
            className="flex items-center gap-1 flex-shrink-0"
            style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-primary)', fontWeight: 500 }}
          >
            Connect
            <ExternalLink size={13} />
          </button>
        </div>

        {/* Trusted person nudge */}
        <div
          className="rounded-control p-4 text-center"
          style={{ backgroundColor: 'var(--color-primary-soft)', border: '1px solid var(--color-primary)' }}
        >
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', color: 'var(--color-text)', lineHeight: 1.6 }}>
            💙 Is there someone you trust nearby? A friend, family member, or neighbour?{' '}
            <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Please reach out to them too.</span>
          </p>
        </div>

        {/* Exit line */}
        <div className="text-center">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 transition-all duration-200"
            style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text-subtle)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-subtle)')}
          >
            I&apos;m somewhere safe now
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Footer note */}
        <p
          className="text-center"
          style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-subtle)', lineHeight: 1.5 }}
        >
          Tele-MANAS 14416 is free, government-backed, and available 24×7 across India.
          <br />
          dhira is a listening companion — not a crisis service.
        </p>
      </div>
    </div>
  );
}