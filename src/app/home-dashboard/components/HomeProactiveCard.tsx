'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, ArrowRight } from 'lucide-react';
import { ARTIFACT_CHECKIN_LINE } from '@/lib/artifactDesign';

/**
 * Proactive check-in card — visual match to Claude artifact "Dhira checked in" card.
 * Manual trigger calls POST /api/checkin (same endpoint Emergent schedules use).
 */
export default function HomeProactiveCard() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const sendCheckin = async () => {
    setLoading(true);
    setNote(null);
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const data = await res.json();
      if (data?.sent && data.message) {
        setMessage(data.message);
      } else {
        setNote(
          data?.reason === 'user has not consented to check-ins'
            ? 'Proactive check-ins are turned off in your settings.'
            : 'Could not generate a check-in right now.',
        );
      }
    } catch {
      setNote('Could not generate a check-in right now.');
    } finally {
      setLoading(false);
    }
  };

  const displayMessage = message ?? (loading ? null : null);

  return (
    <div
      className="dhira-card p-6 h-full flex flex-col gap-4"
      style={{
        borderLeft: '3px solid var(--color-accent)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--color-accent)', opacity: 0.9 }}
        >
          <Bell size={13} color="#26263A" />
        </div>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 12,
            fontWeight: 600,
            color: displayMessage ? 'var(--color-accent)' : 'var(--color-text-muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {displayMessage ? 'Dhira checked in' : 'Proactive check-in'}
        </p>
      </div>

      <p
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 15,
          color: 'var(--color-text)',
          lineHeight: 1.6,
          fontStyle: displayMessage ? 'italic' : 'normal',
          flex: 1,
        }}
      >
        {displayMessage
          ? `\u201C${displayMessage}\u201D`
          : 'Dhira can reach out first, within your chosen window. Want a gentle check-in right now?'}
      </p>

      {displayMessage && (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-text-subtle)' }}>
          🎚️ Sent within your 8 PM–11 PM window
        </p>
      )}

      {note && (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-text-subtle)' }}>
          {note}
        </p>
      )}

      {displayMessage ? (
        <Link
          href="/chat-with-dhira"
          className="flex items-center gap-2 mt-1"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 14,
            color: 'var(--color-primary)',
            fontWeight: 500,
          }}
        >
          Respond to Dhira
          <ArrowRight size={14} />
        </Link>
      ) : (
        <button
          onClick={sendCheckin}
          disabled={loading}
          className="btn-ghost"
          style={{ fontSize: 13, padding: '8px 14px', alignSelf: 'flex-start' }}
        >
          {loading ? 'Dhira is thinking…' : 'Ask Dhira to check in now'}
        </button>
      )}

      {!displayMessage && !loading && (
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 12,
            color: 'var(--color-text-subtle)',
            fontStyle: 'italic',
          }}
        >
          Example: &ldquo;{ARTIFACT_CHECKIN_LINE}&rdquo;
        </p>
      )}
    </div>
  );
}
