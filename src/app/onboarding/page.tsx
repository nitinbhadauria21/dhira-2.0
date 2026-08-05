'use client';

import React, { Suspense } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import OnboardingFlow from './components/OnboardingFlow';

export default function OnboardingPage() {
  return (
    <ThemeProvider>
      <Suspense fallback={null}>
        <OnboardingFlow />
      </Suspense>
    </ThemeProvider>
  );
}
