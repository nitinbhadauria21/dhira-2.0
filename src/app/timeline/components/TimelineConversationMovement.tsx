'use client';

import React from 'react';
import MoodBadge from '@/components/MoodBadge';
import type { TimelineChatDay } from '@/lib/timelineChat';
import { Sparkles } from 'lucide-react';

export default function TimelineConversationMovement({ day }: { day: TimelineChatDay | null }) {
  if (!day || day.sessionCount === 0) {
    return (
      <section className="timeline-movement-card dhira-card theme-transition" aria-labelledby="timeline-movement-title">
        <h2 id="timeline-movement-title" className="timeline-section-title">
          How your conversations moved
        </h2>
        <div className="timeline-movement-empty">
          <p>When you chat with Dhira, you&apos;ll see how your mood shifted here — privately, without the full transcript.</p>
        </div>
      </section>
    );
  }

  const { movement } = day;

  return (
    <section className="timeline-movement-card dhira-card theme-transition" aria-labelledby="timeline-movement-title">
      <h2 id="timeline-movement-title" className="timeline-section-title">
        How your conversations moved
      </h2>

      <div className="timeline-movement-grid">
        <div className="timeline-mood-endcap">
          <p className="timeline-mood-endcap-label">Came in feeling</p>
          <div className="timeline-mood-endcap-body">
            <span className="timeline-mood-emoji" aria-hidden>
              {movement.cameIn.emoji}
            </span>
            <div>
              <MoodBadge mood={movement.cameIn.mood} size="md" />
              <p className="timeline-mood-endcap-sub">{movement.cameIn.subtext}</p>
            </div>
          </div>
        </div>

        <div className="timeline-movement-path" aria-label="Mood steps through the day">
          {movement.steps.map((step) => (
            <div key={`${step.order}-${step.mood}`} className="timeline-movement-step">
              <span className="timeline-movement-step-num">{step.order}</span>
              <div
                className="timeline-movement-step-pill"
                style={{ borderLeftColor: step.color }}
              >
                <p className="timeline-movement-step-label">{step.label}</p>
                <p className="timeline-movement-step-desc">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="timeline-mood-endcap timeline-mood-endcap-right">
          <p className="timeline-mood-endcap-label">Left feeling</p>
          <div className="timeline-mood-endcap-body">
            <span className="timeline-mood-emoji" aria-hidden>
              {movement.left.emoji}
            </span>
            <div>
              <MoodBadge mood={movement.left.mood} size="md" />
              <p className="timeline-mood-endcap-sub">{movement.left.subtext}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="timeline-movement-insight theme-transition">
        <Sparkles size={16} style={{ color: 'var(--color-accent)', flexShrink: 0 }} aria-hidden />
        <p>{movement.insight}</p>
      </div>
    </section>
  );
}
