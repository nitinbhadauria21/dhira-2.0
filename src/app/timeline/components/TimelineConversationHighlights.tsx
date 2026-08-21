'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, MessageSquareQuote } from 'lucide-react';

type Highlight = { quote: string; time: string };

type Props = {
  day: { date: string; highlights: Highlight[] } | null;
  title: string;
  emptyCopy: string;
  viewHref?: string;
  viewLabel?: string;
};

export default function TimelineConversationHighlights({
  day,
  title,
  emptyCopy,
  viewHref,
  viewLabel = 'View conversation',
}: Props) {
  const hasHighlights = day != null && day.highlights.length > 0;

  return (
    <section
      className="timeline-highlights-card dhira-card theme-transition"
      aria-labelledby="timeline-highlights-title"
    >
      <div className="flex items-center gap-2 mb-5">
        <MessageSquareQuote size={18} style={{ color: 'var(--color-primary)' }} aria-hidden />
        <h2 id="timeline-highlights-title" className="timeline-section-title" style={{ margin: 0 }}>
          {title}
        </h2>
      </div>

      {!hasHighlights ? (
        <div className="timeline-movement-empty">
          <p>{emptyCopy}</p>
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

          {viewHref ? (
            <Link href={viewHref} className="timeline-view-conversation-btn">
              {viewLabel}
              <ChevronRight size={18} aria-hidden />
            </Link>
          ) : null}
        </>
      )}
    </section>
  );
}
