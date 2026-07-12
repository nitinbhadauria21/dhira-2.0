'use client';

import React, { useState } from 'react';
import HomeGreeting from './HomeGreeting';
import HomeMoodCard from './HomeMoodCard';
import HomeStreakCard from './HomeStreakCard';
import HomeMiniTimeline from './HomeMiniTimeline';
import HomeProactiveCard from './HomeProactiveCard';
import HomeJournalRecent from './HomeJournalRecent';
import MoodCheckInModal from './MoodCheckInModal';

export default function HomeDashboardContent() {
  const [moodModalOpen, setMoodModalOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* Rich background visuals */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(ellipse, rgba(90, 103, 184, 0.1) 0%, transparent 65%)',
          filter: 'blur(60px)',
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(239, 169, 74, 0.08) 0%, transparent 65%)',
          filter: 'blur(70px)',
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.15, zIndex: 0 }}
        aria-hidden="true"
      >
        <defs>
          <pattern id="dash-dots" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="var(--color-border)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dash-dots)" />
      </svg>

      <div
        className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10 2xl:px-16 py-8"
      >
        {/* Greeting + CTA row */}
        <HomeGreeting onStartCheckin={() => setMoodModalOpen(true)} />

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
          {/* Mood card — hero, spans 2 cols on xl */}
          <div className="xl:col-span-2">
            <HomeMoodCard onLogMood={() => setMoodModalOpen(true)} />
          </div>

          {/* Streak card */}
          <div className="xl:col-span-1">
            <HomeStreakCard />
          </div>

          {/* Proactive check-in card */}
          <div className="xl:col-span-1">
            <HomeProactiveCard />
          </div>

          {/* Mini timeline — spans 3 cols on xl */}
          <div className="xl:col-span-3">
            <HomeMiniTimeline />
          </div>

          {/* Recent journal */}
          <div className="xl:col-span-1">
            <HomeJournalRecent />
          </div>
        </div>

        {/* Mood check-in modal */}
        <MoodCheckInModal isOpen={moodModalOpen} onClose={() => setMoodModalOpen(false)} />
      </div>
    </div>
  );
}