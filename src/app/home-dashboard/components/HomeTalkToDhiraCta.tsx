'use client';

import React from 'react';
import { Mic } from 'lucide-react';
import FloatingBuddy from '@/components/FloatingBuddy';
import { useVoiceSession } from '@/hooks/useVoiceSession';

export default function HomeTalkToDhiraCta() {
  const { toggleCall, isActive, isStarting, isConnecting } = useVoiceSession();

  const busy = isStarting || isConnecting;
  const endCallMode = isActive && conversationConnected(isActive, isConnecting);

  let ariaLabel = 'Talk to Dhira';
  if (busy) ariaLabel = 'Connecting to Dhira';
  else if (endCallMode) ariaLabel = 'End call with Dhira';

  let title = 'Talk to Dhira';
  if (busy) title = 'Connecting…';
  else if (endCallMode) title = 'End Call';

  return (
    <div className="home-talk-to-dhira-cta-wrap">
      <button
        type="button"
        className={`home-talk-to-dhira-cta${endCallMode ? ' home-talk-to-dhira-cta--active' : ''}`}
        onClick={toggleCall}
        disabled={busy}
        aria-label={ariaLabel}
      >
        <FloatingBuddy
          src="/illustrations/dhira_listening_avatar.png"
          alt="DHIRA, listening"
          width={52}
          bobAnimation={busy || endCallMode ? 'none' : 'dhira-bob 5.5s ease-in-out infinite'}
          className="home-talk-to-dhira-cta__buddy"
        />

        <span className="home-talk-to-dhira-cta__mic" aria-hidden="true">
          <Mic size={22} strokeWidth={2.25} />
        </span>

        <span className="home-talk-to-dhira-cta__copy">
          <span className="home-talk-to-dhira-cta__title">{title}</span>
          {!endCallMode && !busy ? (
            <span className="home-talk-to-dhira-cta__subtitle">
              Tap and start speaking — I&apos;m listening.
            </span>
          ) : endCallMode ? (
            <span className="home-talk-to-dhira-cta__subtitle">Tap to end the voice session</span>
          ) : (
            <span className="home-talk-to-dhira-cta__subtitle">Setting up your microphone…</span>
          )}
        </span>

        <span className="home-talk-to-dhira-cta__visual" aria-hidden="true">
          <span className="home-talk-to-dhira-cta__wave">
            {[0.45, 0.75, 1, 0.65, 0.9, 0.55, 0.8].map((scale, i) => (
              <span
                key={i}
                className="home-talk-to-dhira-cta__wave-bar"
                style={{ transform: `scaleY(${scale})` }}
              />
            ))}
          </span>
        </span>
      </button>
    </div>
  );
}

/** End-call styling only once connected (not while still connecting). */
function conversationConnected(isActive: boolean, isConnecting: boolean): boolean {
  return isActive && !isConnecting;
}
