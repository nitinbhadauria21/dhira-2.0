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
          gap: '10px',
          padding: '14px 20px',
          borderRadius: '50px',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: open ? 'var(--color-primary, #5a67b8)' : 'var(--color-primary, #5a67b8)',
          color: '#fff',
          fontFamily: 'var(--font-ui, Inter, sans-serif)',
          fontSize: '15px',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          boxShadow: '0 4px 24px rgba(90,103,184,0.35), 0 1px 4px rgba(0,0,0,0.12)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease, background-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(90,103,184,0.45), 0 2px 8px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(90,103,184,0.35), 0 1px 4px rgba(0,0,0,0.12)';
        }}
      >
        {/* Mic / close icon */}
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}
        {open ? 'Close' : 'Talk to Dhira'}
      </button>
    </>
  );
}
