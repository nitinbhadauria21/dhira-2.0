'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';

interface ChatHeaderProps {
  messageCount: number;
}

export default function ChatHeader({ messageCount }: ChatHeaderProps) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 flex-shrink-0"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex items-center gap-3">
        <Link
          href="/home-dashboard"
          className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150"
          style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}
          aria-label="Back to home"
        >
          <ArrowLeft size={16} />
        </Link>

        <span className="relative flex h-[50px] w-[50px] flex-shrink-0 items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            style={{
              border: '1.5px solid var(--color-sage)',
              animation: 'chatListenRing 2.8s ease-out infinite',
            }}
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            style={{
              border: '1.5px solid var(--color-sage)',
              animation: 'chatListenRing 2.8s ease-out infinite',
              animationDelay: '-1.4s',
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/dhira_listening_avatar.png"
            alt="DHIRA, listening"
            className="relative rounded-full"
            style={{
              width: 46,
              height: 46,
              objectFit: 'contain',
              padding: 1,
              backgroundColor: 'var(--color-primary-soft)',
              border: '1.5px solid var(--color-border)',
            }}
          />
        </span>

        <div>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '17px',
              fontWeight: 650,
              color: 'var(--color-text)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            DHIRA
          </p>
          <div className="flex items-center gap-1.5">
            <span className="flex h-2.5 items-end gap-0.5">
              {[4, 9, 6].map((height, index) => (
                <span
                  key={height}
                  className="w-0.5 rounded-full"
                  style={{
                    height,
                    backgroundColor: 'var(--color-sage)',
                    animation: 'chatListenBar 1.1s ease-in-out infinite',
                    animationDelay: `${index * -0.35}s`,
                  }}
                />
              ))}
            </span>
            <span
              style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-sage)' }}
            >
              Listening
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '12px',
            color: 'var(--color-text-subtle)',
          }}
        >
          {messageCount} messages
        </span>
        <button
          className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150"
          style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}
          aria-label="More options"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
      <style jsx>{`
        @keyframes chatListenRing {
          0% {
            transform: scale(0.86);
            opacity: 0.55;
          }
          70% {
            transform: scale(1.3);
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }
        @keyframes chatListenBar {
          0%,
          100% {
            transform: scaleY(0.45);
          }
          50% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  );
}
