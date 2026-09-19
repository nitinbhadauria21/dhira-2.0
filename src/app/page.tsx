'use client';

import React from 'react';
import Link from 'next/link';
import YoBroNav from './yobro/components/YoBroNav';
import YoBroHero from './yobro/components/YoBroHero';
import YoBroFeatures from './yobro/components/YoBroFeatures';
import YoBroTestimonials from './yobro/components/YoBroTestimonials';
import YoBroFooter from './yobro/components/YoBroFooter';

export default function HomePage() {
  return (
    <div
      style={{
        backgroundColor: '#F0F4FF',
        minHeight: '100vh',
        fontFamily: '"DM Sans", system-ui, sans-serif',
      }}
    >
      <YoBroNav />
      <YoBroHero />
      <YoBroFeatures />
      <YoBroTestimonials />
      <YoBroFooter />

      {/* Mockup preview nav */}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          backgroundColor: '#1A1D3A',
          border: '1px solid #2A2F55',
          borderRadius: 16,
          padding: '12px 16px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <p
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: 10,
            color: '#6B72A0',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 2,
          }}
        >
          🎨 Mockup Screens
        </p>
        <Link
          href="/"
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: 13,
            color: '#8B9FFF',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          🏠 Landing Page
        </Link>
        <Link
          href="/yobro/dashboard"
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: 13,
            color: '#8B9FFF',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          📊 Dashboard
        </Link>
        <Link
          href="/yobro/chat"
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: 13,
            color: '#8B9FFF',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          💬 Chat
        </Link>
      </div>
    </div>
  );
}
