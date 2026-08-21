'use client';

import React from 'react';
import { BarChart2, CheckCircle, Heart, Sprout, Star } from 'lucide-react';
import FloatingBuddy from '@/components/FloatingBuddy';

const MILESTONES = [
  { label: 'Check-in', icon: CheckCircle, color: '#79C2C4' },
  { label: 'Reflect', icon: Heart, color: '#E8A0B4' },
  { label: 'Understand', icon: BarChart2, color: '#8794DA' },
  { label: 'Grow', icon: Sprout, color: '#AEA1DA' },
  { label: 'Be You', icon: Star, color: '#F0C46B' },
] as const;

/** Percent positions along the journey path (viewBox 0–100) */
const NODE_POSITIONS = [
  { x: 18, y: 62 },
  { x: 32, y: 48 },
  { x: 50, y: 38 },
  { x: 68, y: 48 },
  { x: 84, y: 58 },
];

export default function TimelineJourneyHero() {
  return (
    <section className="timeline-hero theme-transition" aria-labelledby="timeline-hero-title">
      <div className="timeline-hero-grid">
        <div className="timeline-hero-copy">
          <h1 id="timeline-hero-title" className="text-h2" style={{ color: 'var(--color-text)' }}>
            My DHIRA
          </h1>
          <p
            className="text-body"
            style={{ color: 'var(--color-text-muted)', marginTop: 6, fontSize: 15, maxWidth: 420 }}
          >
            Your week, notebook, chats, and check-ins — one calm place.
          </p>
          <div className="timeline-journey-card theme-transition">
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 17,
                fontWeight: 600,
                color: 'var(--color-text)',
                marginBottom: 4,
              }}
            >
              Your journey matters.
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-text-muted)' }}>
              Track your week. Celebrate small wins.
            </p>
          </div>
        </div>

        <div className="timeline-journey-visual" aria-hidden="true">
          <div className="timeline-journey-canvas">
            <svg
              className="timeline-path-svg"
              viewBox="0 0 100 72"
              preserveAspectRatio="none"
              fill="none"
            >
              <defs>
                <linearGradient id="timelinePathGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="var(--timeline-path-stroke)" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="var(--timeline-path-stroke)" />
                  <stop offset="100%" stopColor="var(--timeline-path-stroke)" stopOpacity="0.65" />
                </linearGradient>
                <filter id="timelinePathGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                className="timeline-path-glow"
                d="M 4 58 C 18 52, 28 42, 38 36 S 58 32, 72 38 S 88 52, 96 56"
                stroke="url(#timelinePathGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                filter="url(#timelinePathGlow)"
              />
            </svg>

            {MILESTONES.map((m, i) => {
              const pos = NODE_POSITIONS[i];
              const Icon = m.icon;
              return (
                <div
                  key={m.label}
                  className="timeline-milestone"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <span className="timeline-milestone-label">{m.label}</span>
                  <span
                    className="timeline-milestone-node"
                    style={{ '--milestone-color': m.color } as React.CSSProperties}
                  >
                    <Icon size={14} strokeWidth={2.2} color="#fff" aria-hidden />
                  </span>
                </div>
              );
            })}

            <div className="timeline-buddy-wrap">
              <FloatingBuddy
                src="/illustrations/dhira_sitting_hi.png"
                alt=""
                width={90}
                className="hidden sm:block timeline-buddy-desktop"
              />
              <FloatingBuddy
                src="/illustrations/dhira_sitting_hi.png"
                alt=""
                width={70}
                className="sm:hidden timeline-buddy-mobile"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
