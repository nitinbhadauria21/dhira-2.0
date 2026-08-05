'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Check, Mic, PenLine, RotateCcw, Sparkles } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import BrandLockup from '@/components/BrandLockup';
import FloatingBuddy from '@/components/FloatingBuddy';
import { MOOD_COLORS, MOODS_GRID, MOOD_EMOJI } from '@/lib/artifactDesign';
import { notebookHeadline } from '@/lib/timeOfDay';
import type { MoodLabel, NotebookEntry } from '@/lib/types';
import {
  isBrowserSpeechRecognitionAvailable,
  startContinuousSpeechRecognition,
  type ContinuousSpeechSession,
} from '@/lib/browserSpeechRecognition';

type NotebookMode = 'write' | 'speak';

const OPENER_CHIPS = [
  { label: 'What sat heaviest today?', seed: 'Aaj sabse zyada bhaari kya laga - ' },
  { label: 'One small thing that went right', seed: 'Ek chhoti si achhi baat aaj - ' },
  { label: 'Something I keep replaying', seed: 'Dimaag mein baar baar yeh ghoom raha hai - ' },
  { label: "What I needed and didn't ask for", seed: 'Mujhe zaroorat thi, par maanga nahi - ' },
];

const TOPIC_OPTIONS = ['work', 'family', 'friends', 'sleep', 'money', 'health', 'self', 'love'];

const CARRY_FORWARD: Record<string, string> = {
  work: 'Work was sitting heavy - check how that settled.',
  family: 'Family came up - revisit gently.',
  friends: 'A friendship mattered here - worth returning to.',
  sleep: 'Sleep was hard - ask about the looping thoughts.',
  money: 'Money worry surfaced - tread carefully.',
  health: 'Body felt off - follow up kindly.',
  self: 'This was about how they see themselves.',
  love: 'Something tender came up here.',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function wordCount(text: string) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function NotebookContent() {
  const headline = useMemo(() => notebookHeadline(), []);
  const [entries, setEntries] = useState<NotebookEntry[]>([]);
  const [mode, setMode] = useState<NotebookMode>('write');
  const [draft, setDraft] = useState('');
  const [transcript, setTranscript] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodLabel | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [shareWithDhira, setShareWithDhira] = useState(true);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speechAvailable, setSpeechAvailable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const speechSessionRef = useRef<ContinuousSpeechSession | null>(null);

  const body = mode === 'write' ? draft : transcript;
  const canSave = body.trim().length >= 2 && selectedMood && !recording && !saving;
  const carryTopic = selectedTopics[0] ?? 'self';
  const carryPreview = shareWithDhira
    ? CARRY_FORWARD[carryTopic] ?? 'Something mattered here - worth returning to.'
    : 'Kept private. This one stays yours alone.';

  useEffect(() => {
    setSpeechAvailable(isBrowserSpeechRecognitionAvailable());
    return () => speechSessionRef.current?.stop();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/notebook?limit=30');
        const data = await res.json();
        if (!cancelled) setEntries(data.entries ?? []);
      } catch {
        if (!cancelled) setEntries([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!recording) return undefined;
    const id = window.setInterval(() => setRecordingSeconds((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [recording]);

  const appendOpener = (seed: string) => {
    setMode('write');
    setDraft((current) => `${current}${current.trim() ? '\n\n' : ''}${seed}`);
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((current) =>
      current.includes(topic) ? current.filter((item) => item !== topic) : [...current, topic].slice(0, 4),
    );
  };

  const toggleRecording = () => {
    if (recording) {
      speechSessionRef.current?.stop();
      speechSessionRef.current = null;
      setRecording(false);
      return;
    }

    if (!isBrowserSpeechRecognitionAvailable()) {
      setSpeechAvailable(false);
      setMode('speak');
      setToast('Speech recognition is not available here. Type or paste your transcript instead.');
      return;
    }

    try {
      const session = startContinuousSpeechRecognition({
        onUpdate: (combined) => setTranscript(combined),
        onFatalError: () => {
          setSpeechAvailable(false);
          setRecording(false);
        },
      });
      if (!session) {
        setSpeechAvailable(false);
        setRecording(false);
        return;
      }
      speechSessionRef.current = session;
      setRecordingSeconds(0);
      setRecording(true);
    } catch {
      setSpeechAvailable(false);
      setRecording(false);
    }
  };

  const discard = () => {
    speechSessionRef.current?.stop();
    speechSessionRef.current = null;
    setDraft('');
    setTranscript('');
    setSelectedMood(null);
    setSelectedTopics([]);
    setRecording(false);
    setRecordingSeconds(0);
  };

  const saveEntry = async () => {
    if (!canSave || !selectedMood) return;
    setSaving(true);
    try {
      const res = await fetch('/api/notebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          body: body.trim(),
          mood: selectedMood,
          topics: selectedTopics,
          shareWithDhira,
        }),
      });
      if (!res.ok) throw new Error('save failed');
      const data = await res.json();
      setEntries((current) => [data.entry, ...current]);
      discard();
      setToast('Entry saved to your Notebook.');
      window.setTimeout(() => setToast(null), 3500);
    } catch {
      setToast('Could not save this entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -right-28 top-4 h-80 w-80 rounded-full blur-3xl"
          style={{ background: 'rgba(174,161,218,0.16)' }}
        />
        <div
          className="absolute -left-24 bottom-24 h-72 w-72 rounded-full blur-3xl"
          style={{ background: 'rgba(99,161,131,0.12)' }}
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-screen-xl flex-col gap-7 px-6 py-8 lg:px-10">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div className="flex items-end gap-4">
            <FloatingBuddy
              src="/illustrations/dhira_wave.png"
              alt="DHIRA, waving hello"
              width={78}
              bobAnimation="dhira-bob 5.5s ease-in-out infinite"
            />
            <div>
              <BrandLockup href="/home-dashboard" size={18} className="mb-3" />
              <h1 className="text-h1" style={{ color: 'var(--color-text)' }}>
                {headline.title}
              </h1>
              <p className="mt-2 max-w-2xl text-body" style={{ color: 'var(--color-text-muted)', fontSize: 16 }}>
                {headline.sub} No judgement, no fixing - just a quiet page.
              </p>
            </div>
          </div>

          <div className="dhira-card flex items-center gap-3 px-4 py-3">
            <span className="text-xl" aria-hidden="true">
              🕯
            </span>
            <div>
              <p className="text-small font-semibold" style={{ color: 'var(--color-text)' }}>
                {entries.length ? `${entries.length} saved entries` : 'First page waiting'}
              </p>
              <p className="text-small" style={{ color: 'var(--color-text-subtle)', fontSize: 12 }}>
                Write when it helps. No streak to protect.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
          <div className="dhira-card overflow-hidden" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <div
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              style={{ backgroundColor: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)' }}
            >
              <div
                className="flex items-center gap-1 rounded-control p-1"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                {(['write', 'speak'] as NotebookMode[]).map((item) => {
                  const active = mode === item;
                  const Icon = item === 'write' ? PenLine : Mic;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setMode(item)}
                      className="inline-flex items-center gap-2 rounded-[9px] px-4 py-2 text-small font-medium transition-all"
                      style={{
                        backgroundColor: active ? 'var(--color-primary-soft)' : 'transparent',
                        color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        border: 'none',
                      }}
                    >
                      <Icon size={15} />
                      {item === 'write' ? 'Write' : 'Speak'}
                    </button>
                  );
                })}
              </div>
              <span className="text-small" style={{ color: 'var(--color-text-subtle)', fontSize: 12 }}>
                {mode === 'write'
                  ? `${wordCount(draft)} words`
                  : recording
                    ? `Recording ${formatDuration(recordingSeconds)}`
                    : transcript
                      ? `${wordCount(transcript)} transcript words`
                      : 'Tap to start'}
              </span>
            </div>

            {mode === 'write' ? (
              <div className="px-6 py-5">
                <div className="mb-4 flex flex-wrap gap-2">
                  {OPENER_CHIPS.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => appendOpener(chip.seed)}
                      className="rounded-full px-3 py-1.5 text-small transition-all"
                      style={{
                        backgroundColor: 'var(--color-surface-alt)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-muted)',
                        fontSize: 12,
                      }}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Aaj kya chal raha hai? Write in whatever language it comes out in - Hindi, English, both."
                  rows={10}
                  className="w-full resize-y bg-transparent outline-none"
                  style={{
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-display)',
                    fontSize: 19,
                    lineHeight: 1.85,
                    backgroundImage:
                      'repeating-linear-gradient(transparent, transparent 34px, var(--color-border) 34px, var(--color-border) 35px)',
                    backgroundAttachment: 'local',
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5 px-6 py-7">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className="relative flex h-24 w-24 items-center justify-center rounded-full transition-all"
                  style={{
                    backgroundColor: recording ? 'rgba(99,161,131,0.16)' : 'var(--color-primary-soft)',
                    border: `1.5px solid ${recording ? 'var(--color-sage)' : 'transparent'}`,
                    color: recording ? 'var(--color-sage)' : 'var(--color-primary)',
                    boxShadow: recording ? '0 0 0 8px rgba(99,161,131,0.10)' : 'var(--shadow-card)',
                  }}
                  aria-label={recording ? 'Stop recording' : 'Start recording'}
                >
                  {recording ? (
                    <span className="flex h-7 items-end gap-1" aria-hidden="true">
                      {[12, 24, 17, 28, 14].map((height, index) => (
                        <span
                          key={height}
                          className="w-1 rounded-full animate-pulse"
                          style={{ height, backgroundColor: 'currentColor', animationDelay: `${index * 90}ms` }}
                        />
                      ))}
                    </span>
                  ) : (
                    <Mic size={34} />
                  )}
                </button>
                <div className="text-center">
                  <h2 className="text-h3" style={{ color: 'var(--color-text)' }}>
                    {recording ? formatDuration(recordingSeconds) : transcript ? 'Voice note ready' : 'Say it out loud'}
                  </h2>
                  <p className="text-small" style={{ color: 'var(--color-text-subtle)' }}>
                    {speechAvailable
                      ? recording
                        ? 'Take your pauses - DHIRA waits.'
                        : 'Web Speech fills the transcript when available.'
                      : 'Speech recognition is unavailable here, so the transcript stays editable.'}
                  </p>
                </div>
                <div
                  className="w-full rounded-card p-4"
                  style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px dashed var(--color-border)' }}
                >
                  <label
                    htmlFor="notebook-transcript"
                    className="text-small font-semibold uppercase tracking-[0.06em]"
                    style={{ color: 'var(--color-text-subtle)', fontSize: 11 }}
                  >
                    Transcript
                  </label>
                  <textarea
                    id="notebook-transcript"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    rows={5}
                    placeholder={recording ? 'Listening...' : 'Your words will appear here as you speak - you can edit them before saving.'}
                    className="mt-2 w-full resize-y bg-transparent outline-none"
                    style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)', fontSize: 17, lineHeight: 1.75 }}
                  />
                </div>
              </div>
            )}

            <div
              className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
              style={{ backgroundColor: 'var(--color-surface-alt)', borderTop: '1px solid var(--color-border)' }}
            >
              <label className="flex cursor-pointer items-center gap-2 text-small" style={{ color: 'var(--color-text-muted)' }}>
                <input
                  type="checkbox"
                  checked={shareWithDhira}
                  onChange={(e) => setShareWithDhira(e.target.checked)}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                Let DHIRA read this
              </label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={discard} className="btn-ghost px-4 py-2 text-small">
                  Discard
                </button>
                <button
                  type="button"
                  onClick={saveEntry}
                  disabled={!canSave}
                  className="btn-primary px-5 py-2 text-small"
                  style={{ opacity: canSave ? 1 : 0.55, cursor: canSave ? 'pointer' : 'not-allowed' }}
                >
                  {saving ? 'Saving...' : mode === 'write' ? 'Save entry' : 'Save voice note'}
                </button>
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="dhira-card p-5">
              <h2 className="text-h3 mb-4" style={{ color: 'var(--color-text)', fontSize: 18 }}>
                Tag it, so it is findable later
              </h2>
              <TagLabel>How did it feel?</TagLabel>
              <div className="mb-5 flex flex-wrap gap-2">
                {MOODS_GRID.map((mood) => {
                  const active = selectedMood === mood.id;
                  const color = MOOD_COLORS[mood.id];
                  return (
                    <button
                      key={mood.id}
                      type="button"
                      onClick={() => setSelectedMood(mood.id)}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-small font-medium transition-all"
                      style={{
                        backgroundColor: active ? color.bg : 'var(--color-surface-alt)',
                        color: active ? color.text : 'var(--color-text-muted)',
                        border: `1.5px solid ${active ? color.bg : 'var(--color-border)'}`,
                        fontSize: 13,
                      }}
                    >
                      <span aria-hidden="true">{MOOD_EMOJI[mood.id]}</span>
                      {mood.label}
                    </button>
                  );
                })}
              </div>
              <TagLabel>What was it about?</TagLabel>
              <div className="flex flex-wrap gap-2">
                {TOPIC_OPTIONS.map((topic) => {
                  const active = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className="rounded-full px-3 py-1.5 text-small transition-all"
                      style={{
                        backgroundColor: active ? 'var(--color-primary-soft)' : 'var(--color-surface-alt)',
                        color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        fontSize: 13,
                      }}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="rounded-card p-5"
              style={{
                backgroundColor: shareWithDhira ? 'var(--color-primary-soft)' : 'var(--color-surface-alt)',
                border: `1px solid ${shareWithDhira ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}
            >
              <div className="mb-3 flex items-center gap-2">
                <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
                <span
                  className="text-small font-semibold uppercase tracking-[0.06em]"
                  style={{ color: 'var(--color-text-subtle)', fontSize: 11 }}
                >
                  What DHIRA will carry forward
                </span>
              </div>
              <p className="text-body italic" style={{ color: 'var(--color-text)', fontSize: 15 }}>
                "{carryPreview}"
              </p>
              <p className="mt-3 text-small" style={{ color: 'var(--color-text-subtle)', fontSize: 12 }}>
                {shareWithDhira ? 'One line only. Never quoted back to you word for word.' : "DHIRA won't reference this in chat."}
              </p>
            </div>
          </aside>
        </section>

        <section className="dhira-card p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen size={19} style={{ color: 'var(--color-primary)' }} />
              <h2 className="text-h3" style={{ color: 'var(--color-text)' }}>
                Your entries
              </h2>
              <span
                className="rounded-full px-2.5 py-1 text-small"
                style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-subtle)', fontSize: 12 }}
              >
                {entries.length} entries
              </span>
            </div>
            <Link href="/timeline" className="text-small font-medium" style={{ color: 'var(--color-primary)' }}>
              See these in Timeline →
            </Link>
          </div>

          {entries.length === 0 ? (
            <div className="rounded-control p-5" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
              <p className="text-small" style={{ color: 'var(--color-text-muted)' }}>
                Your saved notebook entries will appear here after the first one.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </section>
      </div>

      {toast && (
        <div
          className="fixed bottom-7 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-card px-4 py-3"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-sage)', boxShadow: 'var(--shadow-soft)' }}
        >
          <Check size={16} style={{ color: 'var(--color-sage)' }} />
          <span className="text-small" style={{ color: 'var(--color-text)' }}>
            {toast}
          </span>
          <button type="button" onClick={() => setToast(null)} aria-label="Dismiss" style={{ color: 'var(--color-text-subtle)' }}>
            <RotateCcw size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function TagLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-small font-semibold uppercase tracking-[0.06em]" style={{ color: 'var(--color-text-subtle)', fontSize: 11 }}>
      {children}
    </p>
  );
}

function EntryCard({ entry }: { entry: NotebookEntry }) {
  const color = MOOD_COLORS[entry.mood as keyof typeof MOOD_COLORS] ?? MOOD_COLORS.neutral;
  const firstTopic = entry.topics[0] ?? 'self';
  const preview = entry.body.length > 220 ? `${entry.body.slice(0, 220).trim()}...` : entry.body;

  return (
    <article
      className="rounded-control p-4"
      style={{ backgroundColor: 'var(--color-surface-alt)', borderLeft: `3px solid ${color.bg}` }}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-small font-medium" style={{ color: 'var(--color-text-subtle)', fontSize: 12 }}>
            {formatDate(entry.createdAt)}
          </span>
          <span className="text-small" style={{ color: 'var(--color-text-subtle)', fontSize: 12 }}>
            {entry.mode === 'speak' ? '🎙 voice' : '✍ written'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full px-2.5 py-1 text-small font-medium" style={{ backgroundColor: color.bg, color: color.text, fontSize: 12 }}>
            {entry.mood}
          </span>
          <span
            className="rounded-full px-2.5 py-1 text-small font-medium"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: 12 }}
          >
            {firstTopic}
          </span>
        </div>
      </div>
      <p className="text-small" style={{ color: 'var(--color-text)', lineHeight: 1.55 }}>
        {preview}
      </p>
      <p className="mt-2 text-small italic" style={{ color: 'var(--color-text-subtle)', fontSize: 12 }}>
        {entry.shareWithDhira ? '🌙 DHIRA can gently remember this.' : 'Private entry - not shared with DHIRA.'}
      </p>
    </article>
  );
}

export default function NotebookPage() {
  return (
    <AppLayout>
      <NotebookContent />
    </AppLayout>
  );
}
