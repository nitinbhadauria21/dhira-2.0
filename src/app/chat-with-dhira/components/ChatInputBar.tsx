'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Square } from 'lucide-react';

interface ChatInputBarProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInputBar({ onSend, disabled = false }: ChatInputBarProps) {
  const [value, setValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setVoiceSupported(Boolean(SR));
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

  const toggleRecording = () => {
    if (!voiceSupported) return;

    // Stop if already recording.
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = 'en-IN'; // Hinglish speakers are understood well by en-IN
    recognition.interimResults = false;
    recognition.continuous = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => r[0].transcript)
        .join(' ');
      setValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);

    recognitionRef.current = recognition;
    setIsRecording(true);
    recognition.start();
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
          placeholder={disabled ? 'Dhira is thinking...' : 'Type or speak...'}
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
          aria-label="Message Dhira"
        />

        {/* Voice button */}
        <button
          onClick={toggleRecording}
          disabled={!voiceSupported || disabled}
          className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 transition-all duration-200"
          style={{
            backgroundColor: isRecording ? 'var(--color-crisis)' : 'var(--color-primary-soft)',
            color: isRecording ? '#ffffff' : 'var(--color-primary)',
            opacity: !voiceSupported ? 0.4 : 1,
            cursor: !voiceSupported ? 'not-allowed' : 'pointer',
          }}
          aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
        >
          {isRecording ? <Square size={13} /> : <Mic size={14} />}
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
        style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--color-text-subtle)', lineHeight: 1.4 }}
      >
        dhira listens — not a therapist or crisis service.{' '}
        <span style={{ color: 'var(--color-crisis)', fontWeight: 500 }}>Crisis? Call 14416</span>
      </p>
    </div>
  );
}