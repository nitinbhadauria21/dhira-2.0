'use client';

import React from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import LandingBackdrop from './components/LandingBackdrop';
import LandingNav from './components/LandingNav';
import LandingHero from './components/LandingHero';
import LandingFeatures from './components/LandingFeatures';
import LandingHowItWorks from './components/LandingHowItWorks';
import LandingTestimonials from './components/LandingTestimonials';
import LandingCTA from './components/LandingCTA';
import LandingFooter from './components/LandingFooter';

export default function LandingPage() {
  return (
    <ThemeProvider>
      <div className="min-h-screen theme-transition relative" style={{ backgroundColor: 'var(--color-bg)' }}>
        <LandingBackdrop />
        <div className="relative z-10">
          <LandingNav />
          <LandingHero />
          <LandingFeatures />
          <LandingHowItWorks />
          <LandingTestimonials />
          <LandingCTA />
          <LandingFooter />
        </div>
      </div>
    </ThemeProvider>
  );
}
