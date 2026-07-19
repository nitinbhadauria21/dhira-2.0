'use client';

import React from 'react';
import Link from 'next/link';
import MoodBadge from '@/components/MoodBadge';
import { ArrowRight } from 'lucide-react';

interface JournalEntry {
  summary: string;
  topic: string;
  createdAt: string;
}

interface HomeJournalRecentProps {
  entries: JournalEntry[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function HomeJournalRecent({ entries }: HomeJournalRecentProps) {
  const recentEntries = entries.map((e, i) => ({
    id: `entry-${i}`,
    date: formatDate(e.createdAt),
    preview: e.summary,
    topicTag: e.topic,
  }));

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
        {recentEntries.length === 0 && (
          <div
            className="p-4 rounded-control text-center"
            style={{ backgroundColor: 'var(--color-surface-alt)' }}
          >
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Your reflections will appear here after your first chat with Dhira.
            </p>
          </div>
        )}
        {recentEntries.map((entry) => (
          <div
            key={entry.id}
            className="p-3 rounded-control transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--color-text-subtle)', fontWeight: 500 }}>
                {entry.date}
              </span>
              <MoodBadge mood={entry.topicTag} size="sm" />
            </div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {entry.preview}
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