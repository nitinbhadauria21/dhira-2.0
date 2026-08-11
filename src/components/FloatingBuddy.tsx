'use client';

import React from 'react';

const BASE_BUDDY_WIDTH = 78;
const BASE_HALO_SIZE = 132;

type FloatingBuddyProps = {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  /** CSS animation name for bob (default dhira-bob). */
  bobAnimation?: string;
  /** Scale halo with width and center the buddy inside it (onboarding contract hero). */
  centerInHalo?: boolean;
};

/**
 * Cut-out buddy with warm halo + soft contact shadow (ASSETS.md / CalmLink pack).
 * Bob 5.5s and halo 6s stay intentionally out of sync so it feels alive.
 */
export default function FloatingBuddy({
  src,
  alt,
  width = BASE_BUDDY_WIDTH,
  height = 'auto',
  className = '',
  bobAnimation = 'dhira-bob 5.5s ease-in-out infinite',
  centerInHalo = false,
}: FloatingBuddyProps) {
  const numericWidth = typeof width === 'number' ? width : BASE_BUDDY_WIDTH;
  const scale = numericWidth / BASE_BUDDY_WIDTH;
  const haloSize = Math.round(BASE_HALO_SIZE * scale);
  const haloRadius = haloSize / 2;
  const glowPadW = Math.round(60 * scale);
  const glowPadH = Math.round(13 * scale);

  const haloStyle = (extra: React.CSSProperties): React.CSSProperties =>
    centerInHalo
      ? {
          width: haloSize,
          height: haloSize,
          left: '50%',
          top: '50%',
          marginLeft: -haloRadius,
          marginTop: -haloRadius,
          ...extra,
        }
      : {
          width: BASE_HALO_SIZE,
          height: BASE_HALO_SIZE,
          marginLeft: -66,
          marginTop: -72,
          ...extra,
        };

  return (
    <div
      className={`relative inline-flex flex-shrink-0 ${centerInHalo ? 'items-center justify-center' : 'items-end justify-center'} ${className}`}
      style={
        centerInHalo
          ? {
              width: haloSize,
              height: haloSize,
              minWidth: haloSize,
              minHeight: haloSize,
            }
          : {
              width: typeof width === 'number' ? width : width,
              minHeight: Math.max(numericWidth * 1.2, 96),
            }
      }
    >
      {/* 1 — halo base */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2"
        style={{
          ...haloStyle({
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 50% 46%, rgba(255,240,186,.95) 0%, rgba(250,214,110,.6) 28%, rgba(240,186,72,.3) 50%, transparent 74%)',
            filter: 'blur(7px)',
            animation: 'dhira-halo 6s ease-in-out infinite',
            zIndex: 0,
          }),
        }}
      />
      {/* 2 — halo core (reads in dark mode too) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2"
        style={{
          ...haloStyle({
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 50% 46%, rgba(255,250,225,.9) 0%, rgba(255,232,150,.5) 34%, transparent 70%)',
            mixBlendMode: 'screen',
            filter: 'blur(9px)',
            animation: 'dhira-halo 6s ease-in-out infinite',
            zIndex: 0,
          }),
        }}
      />
      {/* 3 — contact shadow / glow pad */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2"
        style={{
          bottom: centerInHalo ? Math.max(4, Math.round(haloSize * 0.06)) : 1,
          width: glowPadW,
          height: glowPadH,
          marginLeft: -glowPadW / 2,
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
          transformOrigin: centerInHalo ? '50% 50%' : '50% 92%',
          display: 'block',
        }}
      />
    </div>
  );
}
