'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MoreHorizontal, Mic, Send } from 'lucide-react';

const INITIAL_MESSAGES = [
  {
    role: 'yobro',
    text: "Yo bro 👋 What\'s good? You slid in — I\'m all ears.",
    time: '10:02 PM',
  },
  {
    role: 'user',
    text: "Man, work's been killing me lately. My manager keeps piling stuff on.",
    time: '10:03 PM',
  },
  {
    role: 'yobro',
    text: "Oof, that sounds rough. Like, is it the workload itself or more the feeling that it's never gonna stop?",
    time: '10:03 PM',
  },
  {
    role: 'user',
    text: "Both honestly. I feel like I can\'t say no either.",
    time: '10:04 PM',
  },
  {
    role: 'yobro',
    text: "That\'s a tough spot — caught between not wanting to disappoint and just being completely drained. How long has this been going on?",
    time: '10:04 PM',
  },
];

export default function YoBroChatPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input?.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: input?.trim(), time: 'Now' },
    ]);
    setInput('');
  };

  return (
    <div
      style={{
        backgroundColor: '#0D0F1E',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"DM Sans", system-ui, sans-serif',
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      {/* Chat header */}
      <div
        style={{
          backgroundColor: '#151829',
          borderBottom: '1px solid #2A2F55',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/yobro/dashboard"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              backgroundColor: '#1E2240',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9BA3D4',
              textDecoration: 'none',
              flexShrink: 0,
            }}
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </Link>

          {/* Avatar with pulse rings */}
          <div style={{ position: 'relative', width: 46, height: 46, flexShrink: 0 }}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '1.5px solid #3D52E0',
                animation: 'yobro-ring 2.8s ease-out infinite',
              }}
              aria-hidden="true"
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '1.5px solid #3D52E0',
                animation: 'yobro-ring 2.8s ease-out infinite',
                animationDelay: '-1.4s',
              }}
              aria-hidden="true"
            />
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3D52E0 0%, #FF6B35 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                position: 'relative',
                zIndex: 1,
              }}
            >
              🤖
            </div>
          </div>

          <div>
            <p
              style={{
                fontWeight: 800,
                fontSize: 16,
                color: '#E8EAFF',
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
              }}
            >
              YoBro
            </p>
            <div className="flex items-center gap-1.5">
              <span className="flex items-end gap-0.5" style={{ height: 10 }}>
                {[4, 9, 6]?.map((h, i) => (
                  <span
                    key={h}
                    style={{
                      width: 2,
                      height: h,
                      borderRadius: 2,
                      backgroundColor: '#3D52E0',
                      display: 'block',
                      animation: 'yobro-bar 1.1s ease-in-out infinite',
                      animationDelay: `${i * -0.35}s`,
                    }}
                  />
                ))}
              </span>
              <span style={{ fontSize: 11, color: '#3D52E0', fontWeight: 600 }}>Listening</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span style={{ fontSize: 11, color: '#6B72A0' }}>{messages?.length} messages</span>
          <button
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#1E2240',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9BA3D4',
              cursor: 'pointer',
            }}
            aria-label="More options"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Memory banner */}
      <div
        style={{
          backgroundColor: 'rgba(61,82,224,0.12)',
          borderBottom: '1px solid rgba(61,82,224,0.2)',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 14 }}>🧠</span>
        <p style={{ fontSize: 12, color: '#8B9FFF', fontWeight: 500 }}>
          YoBro remembers: work stress from last week, feeling drained
        </p>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {messages?.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: msg?.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
              gap: 10,
            }}
          >
            {msg?.role === 'yobro' && (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3D52E0 0%, #FF6B35 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                🤖
              </div>
            )}
            <div
              style={{
                maxWidth: '72%',
                backgroundColor: msg?.role === 'user' ? '#3D52E0' : '#1E2240',
                borderRadius: msg?.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                padding: '12px 16px',
                border: msg?.role === 'yobro' ? '1px solid #2A2F55' : 'none',
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  color: msg?.role === 'user' ? '#fff' : '#C8CCEE',
                  lineHeight: 1.55,
                  fontWeight: 400,
                }}
              >
                {msg?.text}
              </p>
              <p
                style={{
                  fontSize: 10,
                  color: msg?.role === 'user' ? 'rgba(255,255,255,0.55)' : '#6B72A0',
                  marginTop: 4,
                  textAlign: msg?.role === 'user' ? 'right' : 'left',
                }}
              >
                {msg?.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div
        style={{
          backgroundColor: '#151829',
          borderTop: '1px solid #2A2F55',
          padding: '12px 16px 20px',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: '#1E2240',
            borderRadius: 16,
            border: '1px solid #2A2F55',
            padding: '10px 14px',
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e?.target?.value)}
            onKeyDown={(e) => e?.key === 'Enter' && handleSend()}
            placeholder="Talk to YoBro..."
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontSize: 15,
              color: '#E8EAFF',
              fontWeight: 400,
            }}
          />
          <button
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#1A1D3A',
              border: '1px solid #2A2F55',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6B72A0',
              cursor: 'pointer',
            }}
            aria-label="Voice input"
          >
            <Mic size={15} />
          </button>
          <button
            onClick={handleSend}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: input?.trim()
                ? 'linear-gradient(135deg, #3D52E0 0%, #5B6FFF 100%)'
                : '#1A1D3A',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: input?.trim() ? '#fff' : '#6B72A0',
              cursor: input?.trim() ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
            }}
            aria-label="Send message"
          >
            <Send size={15} />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes yobro-ring {
          0% { transform: scale(0.86); opacity: 0.55; }
          70% { transform: scale(1.3); opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes yobro-bar {
          0%, 100% { transform: scaleY(0.45); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
