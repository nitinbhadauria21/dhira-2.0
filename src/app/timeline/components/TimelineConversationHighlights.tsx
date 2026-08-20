'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, MessageSquareQuote } from 'lucide-react';
import type { TimelineChatDay } from '@/lib/timelineChat';

export default function TimelineConversationHighlights({ day }: { day: TimelineChatDay | null }) {
  const hasHighlights = day != null && day.highlights.length > 0;

  return (
    <section
      className="timeline-highlights-card dhira-card theme-transition"
      aria-labelledby="timeline-highlights-title"
    >
      <div className="flex items-center gap-2 mb-5">
        <MessageSquareQuote size={18} style={{ color: 'var(--color-primary)' }} aria-hidden />
        <h2 id="timeline-highlights-title" className="timeline-section-title" style={{ margin: 0 }}>
          Conversation highlights
        </h2>
      </div>

      {!hasHighlights ? (
        <div className="timeline-movement-empty">
          <p>Short snippets from your chats will appear here — never the full conversation.</p>
        </div>
      ) : (
        <>
          <div className="timeline-highlights-quotes">
            {day!.highlights.map((h, i) => (
              <blockquote key={i} className="timeline-highlight-quote">
                <p>&ldquo;{h.quote}&rdquo;</p>
                <footer>{h.time}</footer>
              </blockquote>
            ))}
          </div>

          <Link
            href={`/chat-with-dhira?from=timeline&date=${day!.date}`}
            className="timeline-view-conversation-btn"
          >
            View conversation
            <ChevronRight size={18} aria-hidden />
          </Link>
        </>
      )}
    </section>
  );
}
