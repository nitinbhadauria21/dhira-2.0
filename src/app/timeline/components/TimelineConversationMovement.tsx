'use client';

import React from 'react';
import MoodBadge from '@/components/MoodBadge';
import type { TimelineChatDay } from '@/lib/timelineChat';
import { ArrowRight } from 'lucide-react';

export default function TimelineConversationMovement({ day }: { day: TimelineChatDay | null }) {
  if (!day || day.sessionCount === 0) {
    return (
      <section
        className="timeline-movement-card dhira-card theme-transition"
        aria-labelledby="timeline-movement-title"
      >
        <h2 id="timeline-movement-title" className="timeline-section-title">
          How your conversations moved
        </h2>
        <div className="timeline-movement-empty">
          <p>
            When you chat with Dhira, you&apos;ll see how your mood shifted here — privately,
            without the full transcript.
          </p>
        </div>
      </section>
    );
  }

  const { movement } = day;

  return (
    <section
      className="timeline-movement-card dhira-card theme-transition"
      aria-labelledby="timeline-movement-title"
    >
      <h2 id="timeline-movement-title" className="timeline-section-title">
        How your conversations moved
      </h2>

      <div className="timeline-movement-compact">
        <div className="timeline-mood-endcap timeline-mood-endcap-compact">
          <p className="timeline-mood-endcap-label">Came in feeling</p>
          <div className="timeline-mood-endcap-body">
            <span className="timeline-mood-emoji timeline-mood-emoji-sm" aria-hidden>
              {movement.cameIn.emoji}
            </span>
            <div className="timeline-mood-endcap-text">
              <MoodBadge mood={movement.cameIn.mood} size="sm" />
              <p className="timeline-mood-endcap-sub">{movement.cameIn.subtext}</p>
            </div>
          </div>
        </div>

        <div className="timeline-movement-bridge" aria-hidden="true">
          <ArrowRight size={20} />
          <span className="timeline-movement-shift-label">{movement.shiftLabel}</span>
        </div>

        <div className="timeline-mood-endcap timeline-mood-endcap-compact">
          <p className="timeline-mood-endcap-label">Left feeling</p>
          <div className="timeline-mood-endcap-body">
            <span className="timeline-mood-emoji timeline-mood-emoji-sm" aria-hidden>
              {movement.left.emoji}
            </span>
            <div className="timeline-mood-endcap-text">
              <MoodBadge mood={movement.left.mood} size="sm" />
              <p className="timeline-mood-endcap-sub">{movement.left.subtext}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="timeline-movement-narrative theme-transition">
        {movement.narrative.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </section>
  );
}
