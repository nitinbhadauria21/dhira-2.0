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

// Mock initial conversation — backend: load from journal_entries for this session
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-001',
    role: 'dhira',
    content: 'Aaj thoda heavy lag raha hai kya?',
    timestamp: '10:38 PM',
  },
  {
    id: 'msg-002',
    role: 'user',
    content: 'Haan yaar, office mein bilkul mann nahi laga. Sab kuch overwhelming lag raha tha.',
    timestamp: '10:39 PM',
  },
  {
    id: 'msg-003',
    role: 'dhira',
    content: 'Yeh kaafi heavy lag raha hai. Office mein kya hua specifically — ya bas ek general heaviness thi puri din?',
    timestamp: '10:39 PM',
  },
  {
    id: 'msg-004',
    role: 'user',
    content: 'Meeting mein meri baat ko kisi ne seriously nahi liya. Aisa lagta hai jaise main invisible hoon wahan.',
    timestamp: '10:41 PM',
  },
  {
    id: 'msg-005',
    role: 'dhira',
    content: 'That sounds really isolating — to speak and feel like no one received it. Invisible is a heavy word to carry. Yeh feeling pehle bhi aayi hai wahan, ya aaj kuch alag tha?',
    timestamp: '10:41 PM',
  },
];

const CRISIS_TRIGGER_PHRASES = [
  "i don't want to live anymore",
  "i want to die",
  "end my life",
  "kill myself",
  "don't want to be here",
  "test the safety path",
];

export default function ChatContent() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [crisisMode, setCrisisMode] = useState(false);
  const [moodSaved, setMoodSaved] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getDhiraResponse = (userMsg: string): string => {
    const lower = userMsg.toLowerCase();
    if (lower.includes('invisible') || lower.includes('ignored')) {
      return 'I hear you. Being dismissed like that — it leaves a mark. What was the main feeling sitting with you after that meeting?';
    }
    if (lower.includes('work') || lower.includes('office') || lower.includes('job')) {
      return 'Yeh work pressure kaafi heavy ho sakta hai. Kya aaj ka din unusually bad tha, ya yeh kuch time se chal raha hai?';
    }
    if (lower.includes('lonely') || lower.includes('alone') || lower.includes('akela')) {
      return 'Loneliness is one of the quietest kinds of heavy. Yeh feeling — is it mostly at work, or does it follow you home too?';
    }
    if (lower.includes('better') || lower.includes('okay') || lower.includes('theek')) {
      return "I'm glad something shifted a little. What helped, even slightly?";
    }
    if (lower.includes('should i') || lower.includes('what should')) {
      return "I can't decide that for you, and I wouldn't want to. But I can help you put what you're feeling into words. What feels most stuck right now?";
    }
    if (lower.includes('am i depressed') || lower.includes('have anxiety') || lower.includes('diagnos')) {
      return "I can't diagnose anything, and I really don't want to give you the wrong kind of guidance. What I can do is stay with you while you sort through what you're feeling. What's been the hardest part lately?";
    }
    return "That sounds heavy. Take your time. What's sitting with you most right now?";
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const isCrisis = CRISIS_TRIGGER_PHRASES.some((p) => content.toLowerCase().includes(p));

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };

    setMessages((prev) => [...prev, userMsg]);

    if (isCrisis) {
      setIsTyping(true);
      await new Promise((r) => setTimeout(r, 1200));
      setIsTyping(false);
      setCrisisMode(true);
      // Backend: saveRiskEvent({ risk_level: 'CRISIS', signal: 'self-harm language detected', profile_id })
      return;
    }

    setIsTyping(true);
    // Backend: POST /api/chat with { message: content, sessionId } → Primary Agent → Safety Monitor → response
    await new Promise((r) => setTimeout(r, 1600 + Math.random() * 800));
    setIsTyping(false);

    const dhiraReply: ChatMessage = {
      id: `msg-dhira-${Date.now()}`,
      role: 'dhira',
      content: getDhiraResponse(content),
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };

    setMessages((prev) => [...prev, dhiraReply]);

    // After 5 messages, show mood save nudge
    if (messages.length >= 7 && !moodSaved) {
      setMoodSaved(true);
    }
  };

  if (crisisMode) {
    return <CrisisHandoff onBack={() => setCrisisMode(false)} />;
  }

  return (
    <div
      className="flex flex-col"
      style={{
        height: 'calc(100vh - 144px)',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Chat header */}
      <ChatHeader messageCount={messages.length} />

      {/* Memory banner */}
      <ChatMemoryBanner />

      {/* Crisis demo shortcut */}
      <div
        className="px-4 py-2 flex items-center gap-2"
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
      <div className="flex-1 overflow-y-auto px-4 py-6" style={{ scrollBehavior: 'smooth' }}>
        <ChatThread messages={messages} isTyping={isTyping} />
        <div ref={threadEndRef} />
      </div>

      {/* Mood save nudge */}
      {moodSaved && (
        <div
          className="px-4 py-3 flex items-center justify-between fade-in"
          style={{ backgroundColor: 'var(--color-primary-soft)', borderTop: '1px solid var(--color-primary)' }}
        >
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Mood tagged: <strong style={{ color: 'var(--color-text)' }}>Anxious · Work</strong>
          </p>
          <button
            onClick={() => setMoodSaved(false)}
            style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-primary)', fontWeight: 500 }}
          >
            ✓ Saved
          </button>
        </div>
      )}

      {/* Input bar */}
      <ChatInputBar onSend={handleSendMessage} disabled={isTyping} />
    </div>
  );
}