'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useConversation, ConversationProvider } from '@elevenlabs/react';

type LogTurn = {
  id: string;
  role: 'user' | 'dhira';
  content: string;
  at: string;
};

type VoiceSessionPayload =
  | { connectionType: 'websocket'; signedUrl: string; agentId?: string }
  | { connectionType: 'webrtc'; conversationToken: string; agentId?: string }
  | { connectionType: 'webrtc'; agentId: string };

function formatClock() {
  return new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function ElevenLabsWidgetInner() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [turns, setTurns] = useState<LogTurn[]>([]);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMood, setSavedMood] = useState<string | null>(null);
  const [closingReply, setClosingReply] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const turnsRef = useRef<LogTurn[]>([]);
  const finalizedRef = useRef(false);
  const startingRef = useRef(false);
  const micStreamRef = useRef<MediaStream | null>(null);
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);

  useEffect(() => {
    turnsRef.current = turns;
  }, [turns]);

  const releaseMic = useCallback(() => {
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
  }, []);

  const releaseWakeLock = useCallback(async () => {
    try {
      await wakeLockRef.current?.release();
    } catch {
      /* ignore */
    }
    wakeLockRef.current = null;
  }, []);

  const finalizeVoice = useCallback(async (snapshot: LogTurn[]) => {
    if (finalizedRef.current || snapshot.length === 0) return;
    finalizedRef.current = true;
    setSaving(true);
    setStatusNote('Saving this voice chat to your DHIRA log…');
    try {
      const res = await fetch('/api/elevenlabs/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turns: snapshot.map((t) => ({ role: t.role, content: t.content })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatusNote(data.error || 'Could not save the voice chat.');
        finalizedRef.current = false;
        return;
      }
      setSavedMood(typeof data.mood === 'string' ? data.mood : null);
      setClosingReply(typeof data.reply === 'string' ? data.reply : null);
      setStatusNote(
        data.crisis
          ? 'Saved. DHIRA also surfaced crisis support.'
          : `Saved to your chat log${data.mood ? ` · mood: ${data.mood}` : ''}.`,
      );
    } catch {
      setStatusNote('Could not save the voice chat. Please try again.');
      finalizedRef.current = false;
    } finally {
      setSaving(false);
    }
  }, []);

  const conversation = useConversation({
    onConnect: () => {
      setStatusNote('Connected — speak whenever you are ready. Tap End Call when you are done.');
      setPanelOpen(true);
    },
    onDisconnect: () => {
      void releaseWakeLock();
      releaseMic();
      setStatusNote('Call ended. Writing the log…');
      void finalizeVoice(turnsRef.current);
    },
    onError: (error: unknown) => {
      console.error('Dhira voice error:', error);
      const message =
        typeof error === 'string'
          ? error
          : error instanceof Error
            ? error.message
            : 'Voice connection hit a snag.';
      setStatusNote(`${message} You can try again or use text chat.`);
      setPanelOpen(true);
    },
    onMessage: (payload) => {
      const role: 'user' | 'dhira' =
        payload.role === 'user' || payload.source === 'user' ? 'user' : 'dhira';
      const content = (payload.message || '').trim();
      if (!content) return;
      setTurns((prev) => [
        ...prev,
        {
          id: `voice-${Date.now()}-${prev.length}`,
          role,
          content,
          at: formatClock(),
        },
      ]);
      setPanelOpen(true);
    },
  });

  const isActive = conversation.status === 'connected' || conversation.status === 'connecting';

  useEffect(() => {
    return () => {
      releaseMic();
      void releaseWakeLock();
    };
  }, [releaseMic, releaseWakeLock]);

  const toggleCall = useCallback(async () => {
    if (isActive) {
      await conversation.endSession();
      return;
    }
    if (startingRef.current) return;
    startingRef.current = true;
    setIsStarting(true);

    try {
      setClosingReply(null);
      setSavedMood(null);
      setStatusNote('Connecting to DHIRA…');
      setTurns([]);
      turnsRef.current = [];
      finalizedRef.current = false;
      setPanelOpen(true);

      const sessionRes = await fetch('/api/elevenlabs/session', { credentials: 'include' });
      const sessionJson = (await sessionRes.json().catch(() => ({}))) as VoiceSessionPayload & {
        error?: string;
      };
      if (!sessionRes.ok) {
        setStatusNote(sessionJson.error || 'Could not start voice. Please sign in and try again.');
        return;
      }

      try {
        micStreamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch {
        setStatusNote('Microphone permission is needed for Talk to Dhira.');
        return;
      }

      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await (
            navigator as Navigator & {
              wakeLock: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> };
            }
          ).wakeLock.request('screen');
        } catch {
          /* optional — ignore if blocked */
        }
      }

      if (sessionJson.connectionType === 'websocket' && 'signedUrl' in sessionJson) {
        await conversation.startSession({
          signedUrl: sessionJson.signedUrl,
          connectionType: 'websocket',
          useWakeLock: true,
        });
      } else if ('conversationToken' in sessionJson && sessionJson.conversationToken) {
        await conversation.startSession({
          conversationToken: sessionJson.conversationToken,
          connectionType: 'webrtc',
          useWakeLock: true,
        });
      } else if ('agentId' in sessionJson && sessionJson.agentId) {
        await conversation.startSession({
          agentId: sessionJson.agentId,
          connectionType: 'webrtc',
          useWakeLock: true,
        });
      } else {
        setStatusNote('Voice setup is incomplete on the server. Please try text chat.');
      }
    } catch (err) {
      console.error('Failed to start Dhira call:', err);
      releaseMic();
      void releaseWakeLock();
      setStatusNote('Could not connect to voice. Check your network and try again.');
      setPanelOpen(true);
    } finally {
      startingRef.current = false;
      setIsStarting(false);
    }
  }, [conversation, isActive, releaseMic, releaseWakeLock]);

  return (
    <>
      <style>{`
        @keyframes dhira-breathe {
          0% { transform: scale(0.9); box-shadow: 0 0 0px rgba(192, 132, 252, 0.4); }
          50% { transform: scale(1.1); box-shadow: 0 0 15px rgba(192, 132, 252, 0.8), 0 0 30px rgba(250, 204, 21, 0.4); }
          100% { transform: scale(0.9); box-shadow: 0 0 0px rgba(192, 132, 252, 0.4); }
        }
      `}</style>

      {panelOpen ? (
        <div
          role="dialog"
          aria-label="Talk to Dhira voice log"
          style={{
            position: 'fixed',
            right: 24,
            bottom: 88,
            zIndex: 10001,
            width: 'min(360px, calc(100vw - 32px))',
            maxHeight: 'min(420px, calc(100vh - 160px))',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 18,
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            boxShadow: '0 12px 40px rgba(20, 24, 48, 0.18)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '12px 14px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  margin: 0,
                }}
              >
                Voice log
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 11,
                  color: 'var(--color-text-subtle)',
                  margin: '2px 0 0',
                }}
              >
                Live transcript · saved to Chat when you end
              </p>
            </div>
            <button
              type="button"
              aria-label="Close voice log"
              onClick={() => setPanelOpen(false)}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                fontSize: 18,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {turns.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
                {isActive
                  ? 'Listening… your words will appear here as you talk.'
                  : 'Press Talk to Dhira to start. The transcript will show here.'}
              </p>
            ) : (
              turns.map((t) => (
                <div
                  key={t.id}
                  style={{
                    alignSelf: t.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '92%',
                    padding: '8px 10px',
                    borderRadius: 12,
                    backgroundColor:
                      t.role === 'user' ? 'var(--color-primary-soft)' : 'var(--color-surface-alt)',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 11,
                      color: 'var(--color-text-subtle)',
                      margin: '0 0 3px',
                    }}
                  >
                    {t.role === 'user' ? 'You' : 'DHIRA'} · {t.at}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 14,
                      color: 'var(--color-text)',
                      margin: 0,
                      lineHeight: 1.45,
                    }}
                  >
                    {t.content}
                  </p>
                </div>
              ))
            )}

            {closingReply ? (
              <div
                style={{
                  marginTop: 4,
                  padding: '10px 12px',
                  borderRadius: 12,
                  borderLeft: '3px solid var(--color-accent)',
                  backgroundColor: 'var(--color-surface-alt)',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--color-text-subtle)',
                    margin: '0 0 4px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  After the call{savedMood ? ` · ${savedMood}` : ''}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 14,
                    color: 'var(--color-text)',
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {closingReply}
                </p>
              </div>
            ) : null}
          </div>

          <div
            style={{
              padding: '10px 12px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {statusNote ? (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                {saving ? 'Saving… ' : ''}
                {statusNote}
              </p>
            ) : null}
            <Link
              href="/chat-with-dhira"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--color-primary)',
              }}
            >
              Open full chat log →
            </Link>
          </div>
        </div>
      ) : null}

      <button
        onClick={toggleCall}
        disabled={conversation.status === 'connecting' || isStarting}
        aria-label={isActive ? 'End call with Dhira' : 'Talk to Dhira'}
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
          cursor: conversation.status === 'connecting' ? 'wait' : 'pointer',
          opacity: conversation.status === 'connecting' ? 0.85 : 1,
          backgroundColor: isActive ? '#f87171' : '#ffffff',
          color: isActive ? '#ffffff' : 'var(--color-primary, #5a67b8)',
          fontFamily: 'var(--font-ui, Inter, sans-serif)',
          fontSize: '15px',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          boxShadow: '0 4px 24px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.05)',
          transition:
            'transform 0.15s ease, box-shadow 0.15s ease, background-color 0.2s ease, color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            '0 4px 24px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.05)';
        }}
      >
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #c084fc 0%, #facc15 100%)',
            animation: 'dhira-breathe 3s ease-in-out infinite',
          }}
        />
        {conversation.status === 'connecting'
          ? 'Connecting...'
          : isActive
            ? 'End Call'
            : 'Talk to Dhira'}
      </button>

      {!panelOpen && !isActive && turns.length > 0 ? (
        <button
          type="button"
          onClick={() => setPanelOpen(true)}
          style={{
            position: 'fixed',
            bottom: 78,
            right: 24,
            zIndex: 9999,
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-muted)',
            borderRadius: 999,
            padding: '6px 12px',
            fontFamily: 'var(--font-ui)',
            fontSize: 12,
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          }}
        >
          Show voice log
        </button>
      ) : null}
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
