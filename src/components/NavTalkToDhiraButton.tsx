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

  return (
    <button
      type="button"
      onClick={toggleCall}
      disabled={busy}
      className="nav-talk-to-dhira flex items-center gap-2 font-medium transition-all duration-200 rounded-control shrink-0"
      style={{
        padding: compact ? '6px 10px' : '8px 14px',
        color: endCallMode ? '#ef4444' : 'var(--color-primary)',
        backgroundColor: endCallMode
          ? 'color-mix(in srgb, #ef4444 12%, var(--color-surface-alt))'
          : 'var(--color-primary-soft)',
        border: endCallMode
          ? '1px solid color-mix(in srgb, #ef4444 35%, var(--color-border))'
          : '1px solid color-mix(in srgb, var(--color-primary) 25%, var(--color-border))',
        fontFamily: 'var(--font-ui)',
        fontSize: compact ? '13px' : '15px',
        cursor: busy ? 'wait' : 'pointer',
        opacity: busy ? 0.85 : 1,
      }}
      aria-label={ariaLabel}
    >
      <Mic size={compact ? 15 : 16} strokeWidth={2.25} />
      <span>Talk to Dhira</span>
    </button>
  );
}
