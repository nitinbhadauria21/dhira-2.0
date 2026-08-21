'use client';

import React from 'react';
import MoodBadge from '@/components/MoodBadge';
import type { TimelineMovementBlock } from '@/lib/timelineMoodMovement';
import { ArrowRight } from 'lucide-react';

export type TimelineMovementDay = {
  activityCount: number;
  movement: TimelineMovementBlock;
};

type Props = {
  day: TimelineMovementDay | null;
  title: string;
  emptyCopy: string;
  cameInLabel?: string;
  leftLabel?: string;
};

export default function TimelineConversationMovement({
  day,
  title,
  emptyCopy,
  cameInLabel = 'Came in feeling',
  leftLabel = 'Left feeling',
}: Props) {
  if (!day || day.activityCount === 0) {
    return (
      <section
        className="timeline-movement-card dhira-card theme-transition"
        aria-labelledby="timeline-movement-title"
      >
        <h2 id="timeline-movement-title" className="timeline-section-title">
          {title}
        </h2>
        <div className="timeline-movement-empty">
          <p>{emptyCopy}</p>
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
        {title}
      </h2>

      <div className="timeline-movement-compact">
        <div className="timeline-mood-endcap timeline-mood-endcap-compact">
          <p className="timeline-mood-endcap-label">{cameInLabel}</p>
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
          <p className="timeline-mood-endcap-label">{leftLabel}</p>
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

/** Map chat timeline day to movement card props. */
export function chatDayToMovementDay(
  day: { sessionCount: number; movement: TimelineMovementBlock } | null,
): TimelineMovementDay | null {
  if (!day) return null;
  return { activityCount: day.sessionCount, movement: day.movement };
}

/** Map notebook timeline day to movement card props. */
export function notebookDayToMovementDay(
  day: { entryCount: number; movement: TimelineMovementBlock } | null,
): TimelineMovementDay | null {
  if (!day) return null;
  return { activityCount: day.entryCount, movement: day.movement };
}
