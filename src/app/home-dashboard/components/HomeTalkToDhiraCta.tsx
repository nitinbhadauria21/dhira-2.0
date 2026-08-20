'use client';

import React from 'react';
import { Mic } from 'lucide-react';
import { useVoiceSession } from '@/hooks/useVoiceSession';

/** Home orb buddy width (px); 60% larger than the prior 88px cut-out. */
const HOME_TALK_BUDDY_WIDTH = Math.round(88 * 1.6);

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
        <span className="home-talk-to-dhira-cta__orb" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/Dhira_New_Listening_Avatar.png"
            alt=""
            width={HOME_TALK_BUDDY_WIDTH}
            className="home-talk-to-dhira-cta__avatar"
            style={{
              animation:
                busy || endCallMode ? 'none' : 'dhira-bob 5.5s ease-in-out infinite',
            }}
          />
        </span>

        <span className="home-talk-to-dhira-cta__mic" aria-hidden="true">
          <Mic size={18} strokeWidth={2.25} />
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
      </button>
    </div>
  );
}

/** End-call styling only once connected (not while still connecting). */
function conversationConnected(isActive: boolean, isConnecting: boolean): boolean {
  return isActive && !isConnecting;
}
