'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ThemeProvider } from '@/components/ThemeProvider';
import AppLayout from '@/components/AppLayout';
import MoodBadge from '@/components/MoodBadge';
import TimelineJourneyHero from '@/app/timeline/components/TimelineJourneyHero';
import TimelineWeeklySection, {
  type WeeklyData,
} from '@/app/timeline/components/TimelineWeeklySection';
import TimelineChatWeekSection, {
  type TimelineTab,
} from '@/app/timeline/components/TimelineChatWeekSection';
import TimelineConversationMovement from '@/app/timeline/components/TimelineConversationMovement';
import TimelineConversationHighlights from '@/app/timeline/components/TimelineConversationHighlights';
import type { HorizonMoodDay } from '@/components/HorizonMoodTiles';
import type { TimelineChatWeek } from '@/lib/timelineChat';
import { Search, Bell, BookOpen, Plus } from 'lucide-react';
import { MOOD_COLORS, type MoodId } from '@/lib/artifactDesign';
import type { NotebookEntry } from '@/lib/types';

interface HomeWeekData {
  last7: { date: string; mood: string | null }[];
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

function formatChannelLabel(channel: string) {
  if (channel === 'telegram') return 'Telegram';
  if (channel === 'whatsapp') return 'WhatsApp';
  if (channel === 'email') return 'Email';
  return channel;
}

function formatNotificationType(type: string) {
  return type.replace(/_/g, ' ');
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
  const [chatWeek, setChatWeek] = useState<TimelineChatWeek | null>(null);
  const [notebook, setNotebook] = useState<NotebookEntry[]>([]);
  const [notebookLoading, setNotebookLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TimelineTab>('chats');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } catch {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [w, n, h, chats] = await Promise.all([
          fetch('/api/weekly').then((r) => r.json()),
          fetch('/api/notifications').then((r) => r.json()),
          fetch('/api/home').then((r) => r.json()),
          fetch('/api/timeline/chats').then((r) => r.json()),
        ]);
        if (!w.error) setWeekly(w);
        setNotifications(n.notifications ?? []);
        if (!h.error) setHomeWeek({ last7: h.last7 ?? [] });
        if (!chats.error) setChatWeek(chats);
      } catch {
        /* ignore */
      }
    })();
    loadNotebook();
  }, [loadNotebook]);

  useEffect(() => {
    if (activeTab === 'checkins' || activeTab === 'all') {
      void loadNotifications();
    }
  }, [activeTab, loadNotifications]);

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

  const selectedChatDay = useMemo(() => {
    if (!chatWeek?.days.length) return null;
    if (selectedDate) return chatWeek.days.find((d) => d.date === selectedDate) ?? null;
    const withChats = [...chatWeek.days].reverse().find((d) => d.sessionCount > 0);
    return withChats ?? chatWeek.days[chatWeek.days.length - 1];
  }, [chatWeek, selectedDate]);

  const showChatDetail = activeTab === 'chats' || activeTab === 'all';
  const showCheckins = activeTab === 'checkins' || activeTab === 'all';
  const showNotebook = activeTab === 'notebook' || activeTab === 'all';

  return (
    <div className="max-w-screen-lg mx-auto px-6 lg:px-10 py-8 flex flex-col gap-6 theme-transition">
      <TimelineJourneyHero />

      <TimelineChatWeekSection
        data={chatWeek}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {showChatDetail && (
        <div className="timeline-detail-grid">
          <TimelineConversationMovement day={selectedChatDay} />
          <TimelineConversationHighlights day={selectedChatDay} />
        </div>
      )}

      {showCheckins && <TimelineWeeklySection weekly={weekly} weekDays={weekDays} />}

      {showNotebook && (
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
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '14px',
                color: 'var(--color-text)',
              }}
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
      )}

      {(activeTab === 'all' || activeTab === 'checkins') && (
        <SectionCard icon={Bell} title="Check-ins DHIRA sent you">
          {notifications.length === 0 ? (
            <EmptyNote text="When DHIRA reaches out (email, WhatsApp, or Telegram), those check-ins appear here." />
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
                      {formatNotificationType(n.type)} · {formatChannelLabel(n.channel)}
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
      )}
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
