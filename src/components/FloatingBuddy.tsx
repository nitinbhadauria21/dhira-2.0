'use client';

import React from 'react';

type FloatingBuddyProps = {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  /** CSS animation name for bob (default dhira-bob). */
  bobAnimation?: string;
};

/**
 * Cut-out buddy with warm halo + soft contact shadow (ASSETS.md / CalmLink pack).
 * Bob 5.5s and halo 6s stay intentionally out of sync so it feels alive.
 */
export default function FloatingBuddy({
  src,
  alt,
  width = 78,
  height = 'auto',
  className = '',
  bobAnimation = 'dhira-bob 5.5s ease-in-out infinite',
}: FloatingBuddyProps) {
  const numericWidth = typeof width === 'number' ? width : 78;

  return (
    <div
      className={`relative inline-flex items-end justify-center flex-shrink-0 ${className}`}
      style={{
        width: typeof width === 'number' ? width : width,
        minHeight: Math.max(numericWidth * 1.2, 96),
      }}
    >
      {/* 1 — halo base */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2"
        style={{
          width: 132,
          height: 132,
          marginLeft: -66,
          marginTop: -72,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 50% 46%, rgba(255,240,186,.95) 0%, rgba(250,214,110,.6) 28%, rgba(240,186,72,.3) 50%, transparent 74%)',
          filter: 'blur(7px)',
          animation: 'dhira-halo 6s ease-in-out infinite',
          zIndex: 0,
        }}
      />
      {/* 2 — halo core (reads in dark mode too) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2"
        style={{
          width: 132,
          height: 132,
          marginLeft: -66,
          marginTop: -72,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 50% 46%, rgba(255,250,225,.9) 0%, rgba(255,232,150,.5) 34%, transparent 70%)',
          mixBlendMode: 'screen',
          filter: 'blur(9px)',
          animation: 'dhira-halo 6s ease-in-out infinite',
          zIndex: 0,
        }}
      />
      {/* 3 — contact shadow / glow pad */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2"
        style={{
          bottom: 1,
          width: 60,
          height: 13,
          marginLeft: -30,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,214,120,.3), transparent 72%)',
          animation: 'dhira-glow-pad 5.5s ease-in-out infinite',
          zIndex: 0,
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={typeof width === 'number' ? width : undefined}
        style={{
          position: 'relative',
          zIndex: 1,
          width: typeof width === 'number' ? width : width,
          height,
          objectFit: 'contain',
          filter:
            'drop-shadow(0 8px 16px rgba(40,30,10,.3)) drop-shadow(0 0 18px rgba(255,225,150,.4))',
          animation: bobAnimation,
          transformOrigin: '50% 92%',
          display: 'block',
        }}
      />
    </div>
  );
}
