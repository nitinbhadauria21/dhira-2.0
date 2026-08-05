'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from './ThemeProvider';
import AppNav from './AppNav';
import { Toaster } from 'sonner';
import ElevenLabsWidget from './ElevenLabsWidget';

interface AppLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

const TRACKED_PREFIXES = [
  '/home-dashboard',
  '/chat-with-dhira',
  '/notebook',
  '/timeline',
  '/profile',
];

export default function AppLayout({ children, showNav = true }: AppLayoutProps) {
  const pathname = usePathname();

  // Remember where the signed-in user last spent time, so sign-in can resume there.
  useEffect(() => {
    if (!showNav || !pathname) return;
    if (TRACKED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
      try {
        localStorage.setItem('dhira-last-route', pathname);
      } catch {
        /* ignore quota / private mode */
      }
    }
  }, [pathname, showNav]);

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
      {showNav && <ElevenLabsWidget />}
    </ThemeProvider>
  );
}
