import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Fraunces, Mukta } from 'next/font/google';
import '../styles/tailwind.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-fraunces',
  display: 'swap',
});

const mukta = Mukta({
  subsets: ['latin', 'devanagari'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-mukta',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Dhira — The calm that stays up with you',
  description: 'Dhira is a private, anonymous emotional support companion that listens, remembers, and reaches out — never advising, always present.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="night" className={`${fraunces.variable} ${mukta.variable}`}>
      <body className={mukta.className}>
        {children}
      </body>
    </html>
  );
}
