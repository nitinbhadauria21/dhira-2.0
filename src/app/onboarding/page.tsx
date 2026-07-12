'use client';

import React from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import OnboardingFlow from './components/OnboardingFlow';

export default function OnboardingPage() {
  return (
    <ThemeProvider>
      <OnboardingFlow />
    </ThemeProvider>
  );
}
