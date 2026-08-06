'use client';

import React from 'react';
import FloatingBuddy from '@/components/FloatingBuddy';
import { VOICE_BUDDY_POSE } from '@/lib/buddyGestures';

type VoiceBuddyOverlayProps = {
  visible: boolean;
  fadingOut: boolean;
};

export default function VoiceBuddyOverlay({ visible, fadingOut }: VoiceBuddyOverlayProps) {
  if (!visible && !fadingOut) return null;

  const opacity = fadingOut ? 0 : 1;

  return (
    <div
      aria-hidden={fadingOut}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(20, 24, 48, 0.4)',
        opacity,
        transition: 'opacity 700ms ease-out',
      }}
    >
      <FloatingBuddy src={VOICE_BUDDY_POSE.src} alt={VOICE_BUDDY_POSE.alt} width={104} />
    </div>
  );
}
