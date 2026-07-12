'use client';

import React from 'react';
import Link from 'next/link';
import DhiraAvatar from '@/components/DhiraAvatar';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';

interface ChatHeaderProps {
  messageCount: number;
}

export default function ChatHeader({ messageCount }: ChatHeaderProps) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 flex-shrink-0"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex items-center gap-3">
        <Link
          href="/home-dashboard"
          className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150"
          style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}
          aria-label="Back to home"
        >
          <ArrowLeft size={16} />
        </Link>

        <DhiraAvatar size={36} variant="softer" />

        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 500, color: 'var(--color-text)', lineHeight: 1.2 }}>
            dhira
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block rounded-full"
              style={{ width: 7, height: 7, backgroundColor: 'var(--color-sage)' }}
            />
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-sage)' }}>
              Listening
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-subtle)' }}>
          {messageCount} messages
        </span>
        <button
          className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150"
          style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}
          aria-label="More options"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}