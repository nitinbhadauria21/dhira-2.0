'use client';

import React, { useCallback, useState } from 'react';
import { useConversation, ConversationProvider } from '@elevenlabs/react';

const AGENT_ID = 'agent_1301kymjnjbpevba1tncfhmd5b0m';

function ElevenLabsWidgetInner() {
  const [hasMicPermission, setHasMicPermission] = useState(false);

  const conversation = useConversation({
    onConnect: () => console.log('Connected to Dhira'),
    onDisconnect: () => console.log('Disconnected from Dhira'),
    onError: (error: any) => console.error('Dhira error:', error),
  });

  const isActive = conversation.status === 'connected' || conversation.status === 'connecting';

  const toggleCall = useCallback(async () => {
    if (isActive) {
      await conversation.endSession();
    } else {
      try {
        // Request mic permission manually first to ensure seamless experience
        if (!hasMicPermission) {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          setHasMicPermission(true);
        }
        await conversation.startSession({ agentId: AGENT_ID });
      } catch (err) {
        console.error('Failed to start Dhira call:', err);
      }
    }
  }, [conversation, isActive, hasMicPermission]);

  return (
    <>
      <style>{`
        @keyframes dhira-breathe {
          0% { transform: scale(0.9); box-shadow: 0 0 0px rgba(192, 132, 252, 0.4); }
          50% { transform: scale(1.1); box-shadow: 0 0 15px rgba(192, 132, 252, 0.8), 0 0 30px rgba(250, 204, 21, 0.4); }
          100% { transform: scale(0.9); box-shadow: 0 0 0px rgba(192, 132, 252, 0.4); }
        }
      `}</style>

      {/* Custom "Talk to Dhira" floating button */}
      <button
        onClick={toggleCall}
        aria-label={isActive ? "End call with Dhira" : "Talk to Dhira"}
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
          backgroundColor: isActive ? '#f87171' : '#ffffff', // Red when active to indicate "End Call", white otherwise
          color: isActive ? '#ffffff' : 'var(--color-primary, #5a67b8)',
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
        {isActive ? (
          // Close/End Call icon
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
        ) : (
          // Dhira Breathing Avatar
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
        {conversation.status === 'connecting' ? 'Connecting...' : (isActive ? 'End Call' : 'Talk to Dhira')}
      </button>
    </>
  );
}

export default function ElevenLabsWidget() {
  return (
    <ConversationProvider>
      <ElevenLabsWidgetInner />
    </ConversationProvider>
  );
}
