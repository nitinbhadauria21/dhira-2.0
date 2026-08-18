import React from 'react';
import DhiraAvatar from '@/components/DhiraAvatar';
import MoodBadge from '@/components/MoodBadge';
import { sanitizeDhiraReplyForDisplay } from '@/lib/dhiraReplySanitize';
import type { ChatMessage } from './ChatContent';

interface ChatThreadProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

export default function ChatThread({ messages, isTyping }: ChatThreadProps) {
  return (
    <div className="flex flex-col gap-5">
      {messages.length === 0 ? (
        <div className="mb-3 flex flex-col items-center gap-1 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/illustrations/dhira_chat_scene.png"
            alt="DHIRA sitting with open speech bubbles, waiting to listen"
            style={{
              width: 'min(220px, 62%)',
              height: 'auto',
              filter: 'drop-shadow(0 12px 22px rgba(30,35,64,0.13))',
            }}
          />
          <p
            style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-text-subtle)' }}
          >
            This space is yours. Take your time.
          </p>
        </div>
      ) : null}
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex items-end gap-2 fade-in ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
        >
          {/* Avatar — Dhira only */}
          {msg.role === 'dhira' && <DhiraAvatar size={28} variant="softer" />}

          {/* User avatar placeholder */}
          {msg.role === 'user' && (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
              style={{
                backgroundColor: 'var(--color-primary-soft)',
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-ui)',
              }}
            >
              A
            </div>
          )}

          <div
            className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={msg.role === 'dhira' ? 'chat-bubble-dhira' : 'chat-bubble-user'}>
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '16px',
                  lineHeight: 1.6,
                  color: 'var(--color-text)',
                  margin: 0,
                }}
              >
                {msg.role === 'dhira' ? sanitizeDhiraReplyForDisplay(msg.content) : msg.content}
              </p>
            </div>
            <div
              className="flex items-center gap-2"
              style={{
                paddingLeft: msg.role === 'dhira' ? '4px' : '0',
                paddingRight: msg.role === 'user' ? '4px' : '0',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '11px',
                  color: 'var(--color-text-subtle)',
                }}
              >
                {msg.timestamp}
              </span>
              {msg.role === 'user' && msg.mood && msg.mood !== 'neutral' ? (
                <MoodBadge mood={msg.mood} size="sm" />
              ) : null}
            </div>
          </div>
        </div>
      ))}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex items-end gap-2 fade-in">
          <DhiraAvatar size={28} variant="softer" />
          <div
            className="chat-bubble-dhira flex items-center gap-1.5"
            style={{ padding: '14px 18px' }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={`typing-dot-${i}`}
                className="inline-block rounded-full"
                style={{
                  width: 7,
                  height: 7,
                  backgroundColor: 'var(--color-text-subtle)',
                  animation: 'typingBounce 1.2s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes typingBounce {
          0%,
          60%,
          100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-6px);
          }
        }
      `}</style>
    </div>
  );
}
