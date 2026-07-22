'use client';

import React from 'react';
import { useTheme } from '@/components/ThemeProvider';

/**
 * Fixed full-viewport animated SVG backdrop from the Standalone landing HTML.
 * Day theme matches cream #FAF6EF; night uses night surface tones.
 */
export default function LandingBackdrop() {
  const { theme } = useTheme();
  const isNight = theme === 'night';
  const base = isNight ? '#14162A' : '#FAF6EF';
  const vignetteEdge = isNight ? '#0E1020' : '#E5DCD0';
  const vignetteCenter = isNight ? '#14162A' : '#FAF6EF';

  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: isNight ? 0.35 : 0.2,
        zIndex: 0,
      }}
    >
      <defs>
        <linearGradient id="hero-grad-lavender" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#C5BBE4" />
          <stop offset="50%" stopColor="#AEA1DA" />
          <stop offset="100%" stopColor="#9384C4" />
        </linearGradient>
        <linearGradient id="hero-grad-amber" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EFA94A" />
          <stop offset="100%" stopColor="#F6C88A" />
        </linearGradient>
        <linearGradient id="hero-grad-sage" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8ABF9F" />
          <stop offset="100%" stopColor="#63A183" />
        </linearGradient>
        <radialGradient id="hero-vignette" cx="50%" cy="50%" r="70%">
          <stop offset="50%" stopColor={vignetteCenter} stopOpacity="0" />
          <stop offset="100%" stopColor={vignetteEdge} stopOpacity={isNight ? 0.75 : 0.6} />
        </radialGradient>
        <filter id="hero-hand-drawn" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="hero-heavy-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="60" />
        </filter>
      </defs>

      <rect width="100%" height="100%" fill={base} />

      <g filter="url(#hero-heavy-blur)">
        <circle cx="200" cy="150" r="350" fill="#AEA1DA" opacity="0.2" />
        <circle cx="1050" cy="650" r="400" fill="#EFA94A" opacity="0.15" />
        <circle cx="150" cy="700" r="300" fill="#63A183" opacity="0.1" />
        <circle cx="600" cy="400" r="450" fill="#FFFFFF" opacity={isNight ? 0.08 : 0.5} />
      </g>

      <g fill="none" strokeWidth="1.5" strokeLinecap="round" filter="url(#hero-hand-drawn)" opacity="0.5">
        <path
          className="dhira-anim-draw-line"
          stroke="#5A67B8"
          d="M 120 280 C 350 150, 550 500, 980 520"
        />
        <path
          className="dhira-anim-draw-line"
          stroke="#AEA1DA"
          strokeWidth="2"
          style={{ animationDelay: '-7s' }}
          d="M 280 700 C 450 850, 750 550, 1080 350"
        />
        <path
          className="dhira-anim-draw-line"
          stroke="#5A67B8"
          strokeDasharray="8 12"
          style={{ animationDelay: '-14s' }}
          d="M 400 120 C 550 350, 850 250, 1150 700"
        />
        <path
          className="dhira-anim-draw-line"
          stroke="#AEA1DA"
          style={{ animationDelay: '-3s' }}
          d="M 50 500 C 250 450, 400 200, 700 100"
        />
      </g>

      <g filter="url(#hero-hand-drawn)">
        <path
          className="dhira-anim-float-lav"
          fill="url(#hero-grad-lavender)"
          opacity="0.9"
          style={{ transformOrigin: '250px 250px' }}
          d="M 240 100 C 480 -10, 620 260, 500 440 C 380 620, 140 540, 50 410 C -40 280, 0 210, 240 100 Z"
        />
        <path
          className="dhira-anim-float-amb"
          fill="url(#hero-grad-amber)"
          opacity="0.9"
          style={{ transformOrigin: '950px 600px' }}
          d="M 960 320 C 1040 480, 1220 560, 1140 740 C 1060 920, 800 870, 750 730 C 700 590, 880 480, 960 320 Z"
        />
        <path
          className="dhira-anim-float-sag"
          fill="url(#hero-grad-sage)"
          opacity="0.9"
          style={{ transformOrigin: '250px 600px' }}
          d="M 260 460 C 440 400, 540 580, 460 760 C 380 940, 100 890, 60 750 C 180 810, 340 680, 260 460 Z"
        />
      </g>

      <g filter="url(#hero-hand-drawn)">
        <circle className="dhira-anim-float-el" stroke="#5A67B8" cx="680" cy="220" r="22" fill="none" strokeWidth="2" />
        <circle className="dhira-anim-float-el-slow" stroke="#5A67B8" cx="880" cy="140" r="14" fill="none" strokeWidth="1.5" />
        <circle className="dhira-anim-float-rev" stroke="#5A67B8" cx="380" cy="680" r="28" fill="none" strokeWidth="2" />
        <circle className="dhira-anim-float-el" stroke="#5A67B8" cx="1080" cy="580" r="10" fill="none" strokeWidth="2" />
        <circle className="dhira-anim-float-el-slow" stroke="#AEA1DA" cx="480" cy="160" r="18" fill="none" strokeWidth="2.5" />
        <circle className="dhira-anim-float-rev" stroke="#AEA1DA" cx="780" cy="660" r="24" fill="none" strokeWidth="2" />
        <circle className="dhira-anim-float-el" stroke="#AEA1DA" cx="160" cy="580" r="12" fill="none" strokeWidth="1.5" />
        <path className="dhira-anim-float-el" stroke="#5A67B8" d="M 820 420 L 844 420 M 832 408 L 832 432" strokeWidth="2.5" strokeLinecap="round" />
        <path className="dhira-anim-float-el-slow" stroke="#EFA94A" d="M 320 220 L 336 220 M 328 212 L 328 228" strokeWidth="2" strokeLinecap="round" />
        <path className="dhira-anim-float-rev" stroke="#AEA1DA" d="M 600 720 L 616 720 M 608 712 L 608 728" strokeWidth="2" strokeLinecap="round" />
        <path
          className="dhira-anim-float-el-slow"
          stroke="#5A67B8"
          d="M 840 180 C 910 140, 940 230, 880 260 C 820 290, 790 200, 860 170"
          fill="none"
          strokeWidth="1.5"
        />
      </g>

      <g>
        <circle className="dhira-anim-dot-pulse" fill="#5A67B8" cx="580" cy="360" r="7" />
        <circle className="dhira-anim-dot-pulse" fill="#AEA1DA" cx="920" cy="290" r="9" style={{ animationDelay: '-2s' }} />
        <circle className="dhira-anim-dot-pulse" fill="#EFA94A" cx="420" cy="520" r="6" style={{ animationDelay: '-4s' }} />
        <circle className="dhira-anim-dot-pulse" fill="#63A183" cx="720" cy="510" r="8" style={{ animationDelay: '-1s' }} />
        <circle className="dhira-anim-dot-pulse" fill="#5A67B8" cx="270" cy="310" r="5" style={{ animationDelay: '-3s' }} />
        <circle className="dhira-anim-dot-pulse" fill="#AEA1DA" cx="1020" cy="780" r="7" style={{ animationDelay: '-5s' }} />
        <circle className="dhira-anim-dot-pulse" fill="#63A183" cx="120" cy="180" r="6" style={{ animationDelay: '-2.5s' }} />
      </g>

      <rect width="100%" height="100%" fill="url(#hero-vignette)" pointerEvents="none" />
    </svg>
  );
}
