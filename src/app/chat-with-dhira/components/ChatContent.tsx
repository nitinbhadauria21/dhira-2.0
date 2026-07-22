'use client';

import React, { useState, useRef, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import ChatMemoryBanner from './ChatMemoryBanner';
import ChatThread from './ChatThread';
import ChatInputBar from './ChatInputBar';
import CrisisHandoff from './CrisisHandoff';

export type MessageRole = 'dhira' | 'user' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  mood?: string;
  isCrisisDemo?: boolean;
}

// A single warm opening line, shown only when there's no saved history yet.
const OPENING_GREETING: ChatMessage = {
  id: 'msg-greeting',
  role: 'dhira',
  content: 'Aaj thoda heavy lag raha hai kya?',
  timestamp: '',
};

function formatTime(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function ChatContent() {
  const [messages, setMessages] = useState<ChatMessage[]>([OPENING_GREETING]);
  const [isTyping, setIsTyping] = useState(false);
  const [crisisMode, setCrisisMode] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Load this user's saved chat history on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/messages');
        const data = await res.json();
        if (cancelled) return;
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(
            data.messages.map((m: { id: string; role: 'user' | 'dhira'; content: string; createdAt: string }) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              timestamp: formatTime(m.createdAt),
            })),
          );
        }
      } catch {
        /* keep the opening greeting on failure */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: formatTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setShowReferral(false);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });
      const data = await res.json();
      setIsTyping(false);

      if (data?.crisis) {
        // Server-side Escalation Agent detected a crisis → hand off, log happens server-side.
        setCrisisMode(true);
        return;
      }

      const dhiraReply: ChatMessage = {
        id: `msg-dhira-${Date.now()}`,
        role: 'dhira',
        content: data?.reply || "I'm here with you. Tell me a little more?",
        timestamp: formatTime(),
      };
      setMessages((prev) => [...prev, dhiraReply]);
      if (data?.showReferralCard) setShowReferral(true);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-dhira-${Date.now()}`,
          role: 'dhira',
          content: "I'm having trouble responding right now, but I'm still here. Try again in a moment?",
          timestamp: formatTime(),
        },
      ]);
    }
  };

  if (crisisMode) {
    return <CrisisHandoff onBack={() => setCrisisMode(false)} />;
  }

  return (
    <div
      className="flex flex-col relative"
      style={{
        height: 'calc(100vh - 144px)',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* ── Illustrated background for chat ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true" style={{ zIndex: 0 }}>
        {/* Organic blob top-right */}
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '300px',
            height: '280px',
            background: 'radial-gradient(ellipse 55% 60% at 60% 40%, rgba(90, 103, 184, 0.1) 0%, transparent 65%)',
            filter: 'blur(40px)',
            borderRadius: '40% 60% 55% 45% / 50% 45% 55% 50%',
          }}
        />
        {/* Organic blob bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            left: '-30px',
            width: '260px',
            height: '240px',
            background: 'radial-gradient(ellipse, rgba(239, 169, 74, 0.08) 0%, transparent 65%)',
            filter: 'blur(45px)',
            borderRadius: '55% 45% 40% 60% / 45% 55% 50% 50%',
          }}
        />
        {/* Illustrated SVG */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.1 }}
        >
          <defs>
            <pattern id="chat-dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="0.8" fill="var(--color-border)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#chat-dots)" />
          {/* Subtle organic curve */}
          <path
            d="M 0 100 Q 200 60 400 100 Q 600 140 800 100"
            fill="none"
            stroke="var(--color-lavender)"
            strokeWidth="1"
            opacity="0.2"
            strokeDasharray="5 15"
          />
          {/* Asterisk accents */}
          {[
            { x: 30, y: 200, size: 5, color: 'var(--color-lavender)', opacity: 0.2 },
            { x: 760, y: 150, size: 4, color: 'var(--color-primary)', opacity: 0.18 },
            { x: 400, y: 50, size: 5, color: 'var(--color-accent)', opacity: 0.15 },
          ]?.map((star, i) => (
            <g key={`chat-star-${i}`} transform={`translate(${star.x}, ${star.y})`} opacity={star.opacity}>
              <line x1={-star.size} y1="0" x2={star.size} y2="0" stroke={star.color} strokeWidth="1.2" />
              <line x1="0" y1={-star.size} x2="0" y2={star.size} stroke={star.color} strokeWidth="1.2" />
              <line x1={-star.size * 0.7} y1={-star.size * 0.7} x2={star.size * 0.7} y2={star.size * 0.7} stroke={star.color} strokeWidth="0.8" />
              <line x1={star.size * 0.7} y1={-star.size * 0.7} x2={-star.size * 0.7} y2={star.size * 0.7} stroke={star.color} strokeWidth="0.8" />
            </g>
          ))}
        </svg>
      </div>

      {/* Chat header */}
      <div className="relative z-10">
        <ChatHeader messageCount={messages.length} />
      </div>

      {/* Memory banner */}
      <div className="relative z-10">
        <ChatMemoryBanner />
      </div>

      {/* Crisis demo shortcut */}
      <div
        className="px-4 py-2 flex items-center gap-2 relative z-10"
        style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)' }}
      >
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-subtle)' }}>
          Demo shortcut:
        </span>
        <button
          onClick={() => handleSendMessage("I don't want to live anymore")}
          className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-150"
          style={{
            backgroundColor: 'var(--color-crisis-surface)',
            color: 'var(--color-crisis)',
            border: '1px solid var(--color-crisis)',
            fontFamily: 'var(--font-ui)',
            fontSize: '12px',
          }}
        >
          Test safety path →
        </button>
      </div>

      {/* Thread */}
      <div className="flex-1 overflow-y-auto px-4 py-6 relative z-10" style={{ scrollBehavior: 'smooth' }}>
        <ChatThread messages={messages} isTyping={isTyping} />
        <div ref={threadEndRef} />
      </div>

      {/* Gentle therapist-referral card — shown on medium-risk distress (below full crisis) */}
      {showReferral && (
        <div
          className="px-4 py-3 flex items-center justify-between fade-in relative z-10"
          style={{ backgroundColor: 'var(--color-primary-soft)', borderTop: '1px solid var(--color-primary)' }}
        >
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text-muted)' }}>
            If it helps, someone who can support you: <strong style={{ color: 'var(--color-text)' }}>Tele-MANAS 14416</strong> — free, 24×7.
          </p>
          <button
            onClick={() => setShowReferral(false)}
            style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-primary)', fontWeight: 500 }}
            aria-label="Dismiss support note"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="relative z-10">
        <ChatInputBar onSend={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
}