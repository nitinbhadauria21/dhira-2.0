'use client';

import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import AppNav from './AppNav';
import { Toaster } from 'sonner';

interface AppLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export default function AppLayout({ children, showNav = true }: AppLayoutProps) {
  return (
    <ThemeProvider>
      {showNav && <AppNav />}
      <main
        className="min-h-screen theme-transition"
        style={{
          backgroundColor: 'var(--color-bg)',
          paddingTop: showNav ? '72px' : '0',
          paddingBottom: showNav ? '72px' : '0',
        }}
      >
        {children}
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            fontFamily: 'var(--font-ui)',
            fontSize: '15px',
            borderRadius: 'var(--radius-control)',
          },
        }}
      />
    </ThemeProvider>
  );
}