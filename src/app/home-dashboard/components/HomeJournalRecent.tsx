'use client';

import React from 'react';
import Link from 'next/link';
import MoodBadge from '@/components/MoodBadge';
import { ArrowRight } from 'lucide-react';

// Mock data — backend: query journal_entries last 3 for this profile
const recentEntries = [
  {
    id: 'entry-001',
    date: '11 Jul',
    preview: 'Office mein bilkul mann nahi laga aaj. Sab kuch overwhelming lag raha tha...',
    mood: 'anxious',
    topicTag: 'work',
  },
  {
    id: 'entry-002',
    date: '10 Jul',
    preview: 'Thoda better feel kiya aaj. Ek purani dost se baat hui, achha laga...',
    mood: 'hopeful',
    topicTag: 'relationships',
  },
  {
    id: 'entry-003',
    date: '9 Jul',
    preview: 'Neend nahi aayi raat ko. Kuch thoughts loop ho rahe the...',
    mood: 'anxious',
    topicTag: 'self',
  },
];

export default function HomeJournalRecent() {
  return (
    <div className="dhira-card p-6 h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 500, color: 'var(--color-text)' }}>
          Recent entries
        </p>
        <Link
          href="/home-dashboard#timeline"
          style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-primary)' }}
        >
          All
        </Link>
      </div>
      <div className="flex flex-col gap-3 flex-1">
        {recentEntries?.map((entry) => (
          <div
            key={entry?.id}
            className="p-3 rounded-control transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--color-text-subtle)', fontWeight: 500 }}>
                {entry?.date}
              </span>
              <MoodBadge mood={entry?.mood} size="sm" />
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {entry?.preview}
            </p>
          </div>
        ))}
      </div>
      <Link
        href="/chat-with-dhira"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-control transition-all duration-200"
        style={{
          backgroundColor: 'var(--color-primary-soft)',
          color: 'var(--color-primary)',
          fontFamily: 'var(--font-ui)',
          fontSize: '14px',
          fontWeight: 500,
          border: '1px solid transparent',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
      >
        New entry
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}