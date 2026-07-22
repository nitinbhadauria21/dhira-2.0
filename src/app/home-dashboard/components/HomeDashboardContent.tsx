'use client';

import React, { useState, useEffect, useCallback } from 'react';
import HomeGreeting from './HomeGreeting';
import HomeMoodCard from './HomeMoodCard';
import HomeStreakCard from './HomeStreakCard';
import HomeMiniTimeline from './HomeMiniTimeline';
import HomeProactiveCard from './HomeProactiveCard';
import HomeJournalRecent from './HomeJournalRecent';
import MoodCheckInModal from './MoodCheckInModal';

export interface DashboardData {
  alias: string;
  language: 'english' | 'hinglish';
  latestMood: { mood: string; intensity: number; topic: string } | null;
  memory: { summary: string; carryForward: string } | null;
  streak: number;
  totalSessions: number;
  last7: { date: string; mood: string | null }[];
  recentJournal: { summary: string; topic: string; createdAt: string }[];
}

export default function HomeDashboardContent() {
  const [moodModalOpen, setMoodModalOpen] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/home');
      const json = await res.json();
      if (!json.error) setData(json as DashboardData);
    } catch {
      /* keep prior data on failure */
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="relative min-h-screen">
      {/* ── Organic blob 1: indigo top-right ── */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: '600px',
          height: '550px',
          background: 'radial-gradient(ellipse 55% 60% at 60% 40%, rgba(90, 103, 184, 0.13) 0%, rgba(174, 161, 218, 0.06) 55%, transparent 75%)',
          filter: 'blur(50px)',
          borderRadius: '40% 60% 55% 45% / 50% 45% 55% 50%',
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      {/* ── Organic blob 2: amber bottom-left ── */}
      <div
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{
          width: '480px',
          height: '420px',
          background: 'radial-gradient(ellipse 60% 55% at 40% 60%, rgba(239, 169, 74, 0.1) 0%, transparent 65%)',
          filter: 'blur(60px)',
          borderRadius: '55% 45% 40% 60% / 45% 55% 50% 50%',
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      {/* ── Organic blob 3: sage mid-center ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '35%',
          left: '30%',
          width: '350px',
          height: '280px',
          background: 'radial-gradient(ellipse, rgba(99, 161, 131, 0.07) 0%, transparent 65%)',
          filter: 'blur(55px)',
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      {/* ── Illustrated SVG background ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.12, zIndex: 1 }}
        aria-hidden="true"
      >
        <defs>
          <pattern id="dash-dots" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="var(--color-border)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dash-dots)" />

        {/* Illustrated organic curves */}
        <path
          d="M 0 200 Q 400 120 800 200 Q 1200 280 1600 200"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="1"
          opacity="0.15"
          strokeDasharray="6 18"
        />
        <path
          d="M 0 600 Q 500 520 1000 600 Q 1300 650 1600 580"
          fill="none"
          stroke="var(--color-lavender)"
          strokeWidth="1"
          opacity="0.12"
          strokeDasharray="5 20"
        />

        {/* Organic shapes */}
        <ellipse cx="100" cy="150" rx="20" ry="13" fill="var(--color-lavender)" opacity="0.1" transform="rotate(-15, 100, 150)" />
        <ellipse cx="1500" cy="300" rx="18" ry="11" fill="var(--color-accent)" opacity="0.1" transform="rotate(12, 1500, 300)" />
        <ellipse cx="800" cy="700" rx="22" ry="14" fill="var(--color-sage)" opacity="0.08" />

        {/* Asterisk accents */}
        {[
          { x: 250, y: 400, size: 6, color: 'var(--color-lavender)', opacity: 0.22 },
          { x: 1400, y: 150, size: 5, color: 'var(--color-primary)', opacity: 0.2 },
          { x: 700, y: 100, size: 6, color: 'var(--color-accent)', opacity: 0.18 },
          { x: 1200, y: 600, size: 5, color: 'var(--color-sage)', opacity: 0.2 },
        ]?.map((star, i) => (
          <g key={`dash-star-${i}`} transform={`translate(${star?.x}, ${star?.y})`} opacity={star?.opacity}>
            <line x1={-star?.size} y1="0" x2={star?.size} y2="0" stroke={star?.color} strokeWidth="1.5" />
            <line x1="0" y1={-star?.size} x2="0" y2={star?.size} stroke={star?.color} strokeWidth="1.5" />
            <line x1={-star?.size * 0.7} y1={-star?.size * 0.7} x2={star?.size * 0.7} y2={star?.size * 0.7} stroke={star?.color} strokeWidth="1" />
            <line x1={star?.size * 0.7} y1={-star?.size * 0.7} x2={-star?.size * 0.7} y2={star?.size * 0.7} stroke={star?.color} strokeWidth="1" />
          </g>
        ))}

        {/* Decorative rings */}
        <circle cx="1550" cy="500" r="18" fill="none" stroke="var(--color-lavender)" strokeWidth="1" opacity="0.15" />
        <circle cx="50" cy="500" r="14" fill="none" stroke="var(--color-sage)" strokeWidth="1" opacity="0.15" />

        {/* Scattered dots */}
        {[
          [400, 80], [900, 350], [1300, 80], [200, 650], [1100, 700], [600, 500], [1450, 400],
        ]?.map(([cx, cy], i) => (
          <circle key={`dash-dot-${i}`} cx={cx} cy={cy} r={1.5} fill="var(--color-primary)" opacity={0.18} />
        ))}
      </svg>
      <div
        className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10 2xl:px-16 py-8"
      >
        {/* Greeting + CTA row */}
        <HomeGreeting
          onStartCheckin={() => setMoodModalOpen(true)}
          alias={data?.alias}
          memoryLine={data?.memory?.summary ?? null}
        />

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
          {/* Mood card — hero, spans 2 cols on xl */}
          <div className="xl:col-span-2">
        <HomeMoodCard
          onLogMood={() => setMoodModalOpen(true)}
          latestMood={
            data?.latestMood
              ? {
                  ...data.latestMood,
                  loggedAt: new Date().toLocaleTimeString('en-IN', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  }),
                }
              : null
          }
          trendLabel={data?.latestMood && data.latestMood.intensity >= 0.55 ? 'Lower than yesterday' : null}
        />
          </div>

          {/* Streak card */}
          <div className="xl:col-span-1">
            <HomeStreakCard streak={data?.streak ?? 0} totalSessions={data?.totalSessions ?? 0} />
          </div>

          {/* Proactive check-in card */}
          <div className="xl:col-span-1">
            <HomeProactiveCard />
          </div>

          {/* Mini timeline — spans 3 cols on xl */}
          <div className="xl:col-span-3">
            <HomeMiniTimeline last7={data?.last7 ?? []} />
          </div>

          {/* Recent journal */}
          <div className="xl:col-span-1">
            <HomeJournalRecent entries={data?.recentJournal ?? []} />
          </div>
        </div>

        {/* Mood check-in modal */}
        <MoodCheckInModal
          isOpen={moodModalOpen}
          onClose={() => setMoodModalOpen(false)}
          onSaved={loadData}
        />
      </div>
    </div>
  );
}