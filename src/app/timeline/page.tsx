'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ThemeProvider } from '@/components/ThemeProvider';
import AppLayout from '@/components/AppLayout';
import MoodBadge from '@/components/MoodBadge';
import HorizonMoodTiles, { type HorizonMoodDay } from '@/components/HorizonMoodTiles';
import { Search, MessageCircle, Bell, BookOpen, BarChart2, Plus } from 'lucide-react';
import { MOOD_COLORS, type MoodId } from '@/lib/artifactDesign';
import type { NotebookEntry } from '@/lib/types';

interface WeekPoint {
  weekStart: string;
  label: string;
  checkins: number;
  avgValence: number;
}
interface WeeklyData {
  series: WeekPoint[];
  thisWeek: {
    checkins: number;
    avgIntensity: number;
    moodMix: { mood: string; count: number }[];
    topTopics: { topic: string; count: number }[];
  };
}
interface HomeWeekData {
  last7: { date: string; mood: string | null }[];
}
interface ChatDay {
  date: string;
  messages: { id: string; role: 'user' | 'dhira'; content: string; createdAt: string }[];
}
interface Notification {
  id: string;
  channel: string;
  type: string;
  content: string;
  status: string;
  createdAt: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="dhira-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Icon size={18} style={{ color: 'var(--color-primary)' }} />
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            fontWeight: 500,
            color: 'var(--color-text)',
          }}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function TimelineContent() {
  const [weekly, setWeekly] = useState<WeeklyData | null>(null);
  const [homeWeek, setHomeWeek] = useState<HomeWeekData | null>(null);
  const [notebook, setNotebook] = useState<NotebookEntry[]>([]);
  const [notebookLoading, setNotebookLoading] = useState(true);
  const [chatDays, setChatDays] = useState<ChatDay[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [query, setQuery] = useState('');

  const loadNotebook = useCallback(async () => {
    setNotebookLoading(true);
    try {
      const res = await fetch('/api/notebook?limit=50');
      const data = await res.json();
      setNotebook(data.entries ?? []);
    } catch {
      setNotebook([]);
    } finally {
      setNotebookLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [w, c, n, h] = await Promise.all([
          fetch('/api/weekly').then((r) => r.json()),
          fetch('/api/chat-history').then((r) => r.json()),
          fetch('/api/notifications').then((r) => r.json()),
          fetch('/api/home').then((r) => r.json()),
        ]);
        if (!w.error) setWeekly(w);
        setChatDays(c.days ?? []);
        setNotifications(n.notifications ?? []);
        if (!h.error) setHomeWeek({ last7: h.last7 ?? [] });
      } catch {
        /* ignore */
      }
    })();
    loadNotebook();
  }, [loadNotebook]);

  const filteredNotebook = notebook.filter((entry) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      entry.body.toLowerCase().includes(q) ||
      entry.mood.toLowerCase().includes(q) ||
      entry.topics.some((topic) => topic.toLowerCase().includes(q))
    );
  });

  const weekDays: HorizonMoodDay[] = (homeWeek?.last7 ?? []).map((d) => {
    const dateObj = new Date(`${d.date}T00:00:00`);
    return {
      key: `day-${d.date}`,
      day: WEEKDAYS[dateObj.getDay()],
      date: String(dateObj.getDate()),
      mood: d.mood,
      logged: d.mood != null,
      isToday: d.date === new Date().toISOString().slice(0, 10),
    };
  });

  return (
    <div className="max-w-screen-lg mx-auto px-6 lg:px-10 py-8 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="text-h2" style={{ color: 'var(--color-text)' }}>
            My DHIRA
          </h1>
          <p
            className="text-body"
            style={{ color: 'var(--color-text-muted)', marginTop: '6px', fontSize: '15px' }}
          >
            Your week, notebook, chats, and check-ins — one calm place.
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illustrations/spot_timeline.png"
          alt="Your journey over time, moment by moment"
          className="hidden sm:block"
          style={{
            width: 220,
            height: 88,
            objectFit: 'cover',
            borderRadius: 14,
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        />
      </div>

      {/* Weekly summary */}
      <SectionCard icon={BarChart2} title="Your week with DHIRA">
        {weekly && weekly.series.some((s) => s.checkins > 0) ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
              <Stat label="Check-ins this week" value={String(weekly.thisWeek.checkins)} />
              <Stat
                label="Avg intensity"
                value={`${Math.round(weekly.thisWeek.avgIntensity * 100)}%`}
              />
              <Stat label="Top mood" value={weekly.thisWeek.moodMix[0]?.mood ?? '—'} />
              <Stat label="Top topic" value={weekly.thisWeek.topTopics[0]?.topic ?? '—'} />
            </div>
            <HorizonMoodTiles days={weekDays} />
            {weekly.thisWeek.moodMix.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {weekly.thisWeek.moodMix.map((m) => (
                  <span key={m.mood} className="flex items-center gap-1.5">
                    <MoodBadge mood={m.mood} size="sm" />
                    <span
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '12px',
                        color: 'var(--color-text-subtle)',
                      }}
                    >
                      ×{m.count}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          <HorizonMoodTiles days={weekDays} />
        )}
      </SectionCard>

      {/* Notebook logs */}
      <SectionCard icon={BookOpen} title="Notebook logs">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/notebook"
            className="inline-flex items-center gap-1.5 rounded-control px-3.5 py-2"
            style={{
              backgroundColor: 'var(--color-primary-soft)',
              border: '1px solid var(--color-primary)',
              color: 'var(--color-primary)',
              fontFamily: 'var(--font-ui)',
              fontSize: 13.5,
              fontWeight: 500,
            }}
          >
            <Plus size={14} />
            New entry
          </Link>
          <div
            className="flex items-center gap-3 rounded-control px-3 py-2"
            style={{
              backgroundColor: 'var(--color-surface-alt)',
              border: '1px solid var(--color-border)',
            }}
          >
            <FannedMoodSpines entries={notebook} />
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 17,
                  fontWeight: 600,
                  color: 'var(--color-text)',
                }}
              >
                {notebook.length} {notebook.length === 1 ? 'entry' : 'entries'}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 11.5,
                  color: 'var(--color-text-subtle)',
                }}
              >
                {notebook.filter((entry) => entry.mode === 'speak').length} spoken ·{' '}
                {notebook.filter((entry) => entry.mode === 'write').length} written
              </p>
            </div>
          </div>
        </div>
        <div
          className="flex items-center gap-2 mb-4 px-3 py-2 rounded-control"
          style={{
            backgroundColor: 'var(--color-surface-alt)',
            border: '1.5px solid var(--color-border)',
          }}
        >
          <Search size={15} style={{ color: 'var(--color-text-subtle)' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your entries (mood, topic, words)…"
            className="flex-1 bg-transparent outline-none"
            style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text)' }}
          />
        </div>
        {notebookLoading ? (
          <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading notebook">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="p-4 rounded-control animate-pulse"
                style={{ backgroundColor: 'var(--color-surface-alt)', height: 72 }}
              />
            ))}
          </div>
        ) : filteredNotebook.length === 0 ? (
          <EmptyNote
            text={
              query
                ? 'No entries match that search.'
                : 'Your Notebook entries will appear here after your first written or spoken note.'
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filteredNotebook.map((e) => (
              <div
                key={e.id}
                className="p-4 rounded-control"
                style={{ backgroundColor: 'var(--color-surface-alt)' }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '12px',
                        color: 'var(--color-text-subtle)',
                        fontWeight: 500,
                      }}
                    >
                      {fmtDate(e.createdAt)}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '11.5px',
                        color: 'var(--color-text-subtle)',
                      }}
                    >
                      {e.mode === 'speak' ? '🎙 voice' : '✍ written'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MoodBadge mood={e.mood} size="sm" />
                    {e.topics[0] && <MoodBadge mood={e.topics[0]} size="sm" />}
                  </div>
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '14px',
                    color: 'var(--color-text)',
                    lineHeight: 1.55,
                  }}
                >
                  {e.body}
                </p>
                {e.shareWithDhira && (
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '12px',
                      color: 'var(--color-text-subtle)',
                      marginTop: '6px',
                      fontStyle: 'italic',
                    }}
                  >
                    🌙 Shared with DHIRA memory
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Recent chat history */}
      <SectionCard icon={MessageCircle} title="Recent chat history">
        {chatDays.length === 0 ? (
          <EmptyNote text="Your conversations with DHIRA will show up here." />
        ) : (
          <div className="flex flex-col gap-5">
            {chatDays.map((day) => (
              <div key={day.date}>
                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-text-subtle)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '10px',
                  }}
                >
                  {fmtDate(day.date)}
                </p>
                <div className="flex flex-col gap-2">
                  {day.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className="max-w-[80%] px-3 py-2 rounded-control"
                        style={{
                          backgroundColor:
                            m.role === 'user'
                              ? 'var(--color-primary-soft)'
                              : 'var(--color-surface-alt)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        <p
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '14px',
                            color: 'var(--color-text)',
                            lineHeight: 1.5,
                          }}
                        >
                          {m.content}
                        </p>
                        <span
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '10px',
                            color: 'var(--color-text-subtle)',
                          }}
                        >
                          {fmtTime(m.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Notification inbox */}
      <SectionCard icon={Bell} title="Check-ins DHIRA sent you">
        {notifications.length === 0 ? (
          <EmptyNote text="When DHIRA reaches out (email or WhatsApp), those check-ins appear here." />
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-control"
                style={{
                  backgroundColor: 'var(--color-surface-alt)',
                  borderLeft: '3px solid var(--color-accent)',
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--color-text-subtle)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {n.type.replace(/_/g, ' ')} · {n.channel}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '11px',
                      color: n.status === 'failed' ? 'var(--color-crisis)' : 'var(--color-sage)',
                    }}
                  >
                    {n.status}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '14px',
                    color: 'var(--color-text)',
                    lineHeight: 1.5,
                    fontStyle: 'italic',
                  }}
                >
                  &ldquo;{n.content}&rdquo;
                </p>
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '11px',
                    color: 'var(--color-text-subtle)',
                  }}
                >
                  {fmtDate(n.createdAt)} · {fmtTime(n.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-control" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '22px',
          fontWeight: 600,
          color: 'var(--color-text)',
          textTransform: 'capitalize',
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '12px',
          color: 'var(--color-text-subtle)',
          marginTop: '2px',
        }}
      >
        {label}
      </p>
    </div>
  );
}

function FannedMoodSpines({ entries }: { entries: NotebookEntry[] }) {
  const fallback: MoodId[] = ['anxious', 'hopeful', 'calm', 'neutral'];
  const moods = (entries.length ? entries.map((entry) => entry.mood as MoodId) : fallback).slice(
    0,
    4
  );
  const positions = [
    { x: 0, y: 8, rot: -5 },
    { x: 4, y: 5, rot: -2 },
    { x: 8, y: 2, rot: 2 },
    { x: 12, y: 0, rot: 5 },
  ];

  return (
    <span aria-hidden="true" className="relative h-11 w-10 flex-shrink-0">
      {moods
        .slice()
        .reverse()
        .map((mood, index) => {
          const pos = positions[index] ?? positions[0];
          return (
            <span
              key={`${mood}-${index}`}
              className="absolute"
              style={{
                left: pos.x,
                top: pos.y,
                width: 26,
                height: 34,
                borderRadius: '3px 5px 5px 3px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderLeft: `4px solid ${MOOD_COLORS[mood]?.bg ?? MOOD_COLORS.neutral.bg}`,
                boxShadow: '0 1px 3px rgba(30,35,64,0.12)',
                transform: `rotate(${pos.rot}deg)`,
              }}
            />
          );
        })}
      <span
        className="absolute"
        style={{
          left: 14,
          top: -2,
          width: 5,
          height: 22,
          borderRadius: '0 0 2px 2px',
          backgroundColor: 'var(--color-accent)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
        }}
      />
    </span>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <div
      className="p-5 rounded-control text-center"
      style={{ backgroundColor: 'var(--color-surface-alt)' }}
    >
      <p
        style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text-muted)' }}
      >
        {text}
      </p>
    </div>
  );
}

export default function TimelinePage() {
  return (
    <ThemeProvider>
      <AppLayout>
        <TimelineContent />
      </AppLayout>
    </ThemeProvider>
  );
}
