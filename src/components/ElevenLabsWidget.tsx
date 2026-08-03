'use client';

import React, { useEffect, useRef, useState } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { 'agent-id': string },
        HTMLElement
      >;
    }
  }
}

const AGENT_ID = 'agent_1301kymjnjbpevba1tncfhmd5b0m';

export default function ElevenLabsWidget() {
  const [open, setOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document.getElementById('elevenlabs-widget-script')) return;
    const script = document.createElement('script');
    script.id = 'elevenlabs-widget-script';
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <>
      {/* Hidden ElevenLabs widget — positioned offscreen when closed */}
      <div
        ref={widgetRef}
        style={{
          position: 'fixed',
          bottom: open ? '90px' : '-9999px',
          right: '24px',
          zIndex: 9999,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.2s ease, bottom 0.3s ease',
        }}
      >
        <elevenlabs-convai agent-id={AGENT_ID} />
      </div>

      <style>{`
        @keyframes dhira-breathe {
          0% { transform: scale(0.9); box-shadow: 0 0 0px rgba(192, 132, 252, 0.4); }
          50% { transform: scale(1.1); box-shadow: 0 0 15px rgba(192, 132, 252, 0.8), 0 0 30px rgba(250, 204, 21, 0.4); }
          100% { transform: scale(0.9); box-shadow: 0 0 0px rgba(192, 132, 252, 0.4); }
        }
      `}</style>

      {/* Custom "Talk to Dhira" floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Talk to Dhira"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 20px',
          borderRadius: '50px',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: open ? 'var(--color-primary, #5a67b8)' : '#ffffff',
          color: open ? '#ffffff' : 'var(--color-primary, #5a67b8)',
          fontFamily: 'var(--font-ui, Inter, sans-serif)',
          fontSize: '15px',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          boxShadow: '0 4px 24px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.05)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease, background-color 0.2s ease, color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.05)';
        }}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #c084fc 0%, #facc15 100%)',
              animation: 'dhira-breathe 3s ease-in-out infinite',
            }}
          />
        )}
        {open ? 'Close' : 'Talk to Dhira'}
      </button>
    </>
  );
}
