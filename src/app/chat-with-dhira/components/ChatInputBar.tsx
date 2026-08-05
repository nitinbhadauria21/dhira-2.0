'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import {
  isBrowserSpeechRecognitionAvailable,
  startContinuousSpeechRecognition,
  type ContinuousSpeechSession,
} from '@/lib/browserSpeechRecognition';

interface ChatInputBarProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInputBar({ onSend, disabled = false }: ChatInputBarProps) {
  const [value, setValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechSessionRef = useRef<ContinuousSpeechSession | null>(null);
  /** Text in the box before this Speak session started — finals append after it. */
  const baseTextRef = useRef('');

  useEffect(() => {
    setVoiceSupported(isBrowserSpeechRecognitionAvailable());
    return () => speechSessionRef.current?.stop();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const stopRecording = () => {
    speechSessionRef.current?.stop();
    speechSessionRef.current = null;
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (!voiceSupported) return;

    if (isRecording) {
      stopRecording();
      return;
    }

    baseTextRef.current = value.trim();
    const session = startContinuousSpeechRecognition({
      onUpdate: (combined) => {
        const base = baseTextRef.current;
        setValue(base ? (combined ? `${base} ${combined}` : base) : combined);
      },
      onFatalError: () => {
        stopRecording();
      },
    });

    if (!session) return;
    speechSessionRef.current = session;
    setIsRecording(true);
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div
      className="flex-shrink-0 px-4 py-3"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <div
        className="flex items-end gap-2 rounded-control px-3 py-2"
        style={{
          backgroundColor: 'var(--color-surface-alt)',
          border: '1.5px solid var(--color-border)',
          transition: 'border-color 0.2s ease',
        }}
        onFocusCapture={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
        onBlurCapture={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? 'DHIRA is thinking...'
              : isRecording
                ? "Go ahead — I'm listening…"
                : 'Type, or tap Speak to talk'
          }
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent resize-none outline-none"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '16px',
            color: 'var(--color-text)',
            lineHeight: 1.5,
            minHeight: '24px',
            maxHeight: '120px',
            overflowY: 'auto',
            caretColor: 'var(--color-primary)',
          }}
          aria-label="Message DHIRA"
        />

        {/* Voice button */}
        <button
          onClick={toggleRecording}
          disabled={!voiceSupported || disabled}
          className="relative inline-flex h-8 flex-shrink-0 items-center gap-2 rounded-full px-3 transition-all duration-200"
          style={{
            backgroundColor: isRecording ? 'rgba(99,161,131,0.16)' : 'var(--color-primary-soft)',
            color: isRecording ? 'var(--color-sage)' : 'var(--color-primary)',
            border: `1px solid ${isRecording ? 'var(--color-sage)' : 'transparent'}`,
            opacity: !voiceSupported ? 0.4 : 1,
            cursor: !voiceSupported ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-ui)',
            fontSize: '12.5px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
          aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
        >
          <span
            aria-hidden="true"
            className="absolute inset-[-1px] rounded-full"
            style={{
              border: '1.5px solid var(--color-sage)',
              opacity: isRecording ? 1 : 0,
              animation: 'inputListenRing 2.2s ease-out infinite',
            }}
          />
          <span aria-hidden="true" className="relative flex h-[13px] items-center gap-0.5">
            {[5, 12, 8, 11].map((height, index) => (
              <span
                key={`${height}-${index}`}
                className="w-[2.5px] rounded-full"
                style={{
                  height,
                  backgroundColor: 'currentColor',
                  transformOrigin: 'center',
                  animation: 'inputListenBar 1s ease-in-out infinite',
                  animationDelay: `${[-0, -0.3, -0.6, -0.15][index]}s`,
                  animationPlayState: isRecording ? 'running' : 'paused',
                }}
              />
            ))}
          </span>
          <span className="relative">{isRecording ? 'Listening' : 'Speak'}</span>
        </button>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 transition-all duration-200"
          style={{
            backgroundColor: canSend ? 'var(--color-primary)' : 'var(--color-border)',
            color: canSend ? '#ffffff' : 'var(--color-text-subtle)',
            cursor: !canSend ? 'not-allowed' : 'pointer',
            transform: canSend ? 'scale(1)' : 'scale(0.95)',
          }}
          aria-label="Send message"
        >
          <Send size={14} />
        </button>
      </div>

      {/* Disclaimer */}
      <p
        className="text-center mt-2"
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          color: 'var(--color-text-subtle)',
          lineHeight: 1.4,
        }}
      >
        DHIRA listens — not a therapist or crisis service.{' '}
        <span style={{ color: 'var(--color-crisis)', fontWeight: 500 }}>Crisis? Call 14416</span>
      </p>
      <style jsx>{`
        @keyframes inputListenRing {
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
        @keyframes inputListenBar {
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
