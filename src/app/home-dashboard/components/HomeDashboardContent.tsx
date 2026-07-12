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
    <div
      className="max-w-screen-xl mx-auto px-6 lg:px-10 2xl:px-16 py-8"
    >
      {/* Greeting + CTA row */}
      <HomeGreeting onStartCheckin={() => setMoodModalOpen(true)} />

      {/* Bento grid:
          7 cards → grid-cols-4
          Row 1: Mood card (spans 2 cols) + Streak card (1 col) + Proactive card (1 col)
          Row 2: Mini timeline (spans 3 cols) + Recent journal (1 col)
      */}
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
  );
}