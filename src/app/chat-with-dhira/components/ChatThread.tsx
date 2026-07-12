import React from 'react';
import DhiraAvatar from '@/components/DhiraAvatar';
import type { ChatMessage } from './ChatContent';

interface ChatThreadProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

export default function ChatThread({ messages, isTyping }: ChatThreadProps) {
  return (
    <div className="flex flex-col gap-5">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex items-end gap-2 fade-in ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
        >
          {/* Avatar — Dhira only */}
          {msg.role === 'dhira' && (
            <DhiraAvatar size={28} variant="softer" />
          )}

          {/* User avatar placeholder */}
          {msg.role === 'user' && (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
              style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)', fontFamily: 'var(--font-ui)' }}
            >
              A
            </div>
          )}

          <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={msg.role === 'dhira' ? 'chat-bubble-dhira' : 'chat-bubble-user'}>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '16px', lineHeight: 1.6, color: 'var(--color-text)', margin: 0 }}>
                {msg.content}
              </p>
            </div>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--color-text-subtle)', paddingLeft: msg.role === 'dhira' ? '4px' : '0', paddingRight: msg.role === 'user' ? '4px' : '0' }}>
              {msg.timestamp}
            </span>
          </div>
        </div>
      ))}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex items-end gap-2 fade-in">
          <DhiraAvatar size={28} variant="softer" />
          <div className="chat-bubble-dhira flex items-center gap-1.5" style={{ padding: '14px 18px' }}>
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
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}