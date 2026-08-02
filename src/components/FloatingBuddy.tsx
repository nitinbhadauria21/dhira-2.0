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
 * Cut-out buddy with warm halo + soft contact shadow (CalmLink pack).
 */
export default function FloatingBuddy({
  src,
  alt,
  width = 78,
  height = 'auto',
  className = '',
  bobAnimation = 'dhira-bob 5.5s ease-in-out infinite',
}: FloatingBuddyProps) {
  return (
    <div
      className={`relative inline-flex items-end justify-center flex-shrink-0 ${className}`}
      style={{ width: typeof width === 'number' ? width : width }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          inset: '-18% -10% -8%',
          background:
            'radial-gradient(ellipse at 50% 55%, rgba(255,240,186,0.95) 0%, rgba(240,186,72,0.3) 42%, transparent 70%)',
          filter: 'blur(7px)',
          animation: 'dhira-halo 6s ease-in-out infinite',
          zIndex: 0,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          inset: '-8% -2% 8%',
          background:
            'radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.85) 0%, rgba(255,230,160,0.35) 40%, transparent 68%)',
          filter: 'blur(9px)',
          mixBlendMode: 'screen',
          animation: 'dhira-halo 6s ease-in-out infinite',
          animationDelay: '-1.2s',
          zIndex: 0,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2"
        style={{
          bottom: 2,
          width: '70%',
          height: 10,
          transform: 'translateX(-50%)',
          background: 'radial-gradient(ellipse at center, rgba(40,30,10,0.28) 0%, transparent 72%)',
          filter: 'blur(2px)',
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
          filter: 'drop-shadow(0 8px 16px rgba(40,30,10,0.28)) drop-shadow(0 0 18px rgba(255,225,150,0.35))',
          animation: bobAnimation,
          transformOrigin: '50% 92%',
          display: 'block',
        }}
      />
    </div>
  );
}
