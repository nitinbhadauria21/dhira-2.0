'use client';

import React from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import LandingNav from './components/LandingNav';
import LandingHero from './components/LandingHero';
import LandingFeatures from './components/LandingFeatures';
import LandingPromises from './components/LandingPromises';
import LandingHowItWorks from './components/LandingHowItWorks';
import LandingTestimonials from './components/LandingTestimonials';
import LandingCTA from './components/LandingCTA';
import LandingFooter from './components/LandingFooter';

export default function LandingPage() {
  return (
    <ThemeProvider>
      <div className="min-h-screen theme-transition" style={{ backgroundColor: 'var(--color-bg)' }}>
        <LandingNav />
        <LandingHero />
        <LandingFeatures />
        <LandingPromises />
        <LandingHowItWorks />
        <LandingTestimonials />
        <LandingCTA />
        <LandingFooter />
      </div>
    </ThemeProvider>
  );
}