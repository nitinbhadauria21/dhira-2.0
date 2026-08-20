'use client';

import React from 'react';
import { Mic } from 'lucide-react';
import { useVoiceSession } from '@/hooks/useVoiceSession';

/** Paths that show the compact Talk to Dhira control in the top nav (Home uses inline CTA). */
export const NAV_TALK_TO_DHIRA_PATHS = [
  '/chat-with-dhira',
  '/notebook',
  '/timeline',
  '/profile',
] as const;

export function isNavTalkToDhiraPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return NAV_TALK_TO_DHIRA_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

type NavTalkToDhiraButtonProps = {
  /** Smaller padding on mobile top bar. */
  compact?: boolean;
};

export default function NavTalkToDhiraButton({ compact = false }: NavTalkToDhiraButtonProps) {
  const { toggleCall, isActive, isStarting, isConnecting } = useVoiceSession();

  const busy = isStarting || isConnecting;
  const endCallMode = isActive && !isConnecting;

  let ariaLabel = 'Talk to Dhira';
  if (busy) ariaLabel = 'Connecting to Dhira';
  else if (endCallMode) ariaLabel = 'End call with Dhira';

  const className = [
    'nav-talk-to-dhira',
    compact ? 'nav-talk-to-dhira--compact' : '',
    endCallMode ? 'nav-talk-to-dhira--end-call' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      onClick={toggleCall}
      disabled={busy}
      className={className}
      aria-label={ariaLabel}
    >
      <Mic size={compact ? 15 : 16} strokeWidth={2.25} />
      <span>Talk to Dhira</span>
    </button>
  );
}
