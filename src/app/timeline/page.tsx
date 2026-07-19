'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import AppLayout from '@/components/AppLayout';
import MoodBadge from '@/components/MoodBadge';
import { Search, MessageCircle, Bell, BookOpen, BarChart2 } from 'lucide-react';
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart,
} from 'recharts';
import { useChartBrand } from '@/lib/brand';

interface WeekPoint { weekStart: string; label: string; checkins: number; avgValence: number }
interface WeeklyData {
  series: WeekPoint[];
  thisWeek: { checkins: number; avgIntensity: number; moodMix: { mood: string; count: number }[]; topTopics: { topic: string; count: number }[] };
}
interface JournalEntry { id: string; summary: string; mood: string; topic: string; carryForward: string; createdAt: string }
interface ChatDay { date: string; messages: { id: string; role: 'user' | 'dhira'; content: string; createdAt: string }[] }
interface Notification { id: string; channel: string; type: string; content: string; status: string; createdAt: string }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="dhira-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Icon size={18} style={{ color: 'var(--color-primary)' }} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 500, color: 'var(--color-text)' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function TimelineContent() {
  const brand = useChartBrand();
  const [weekly, setWeekly] = useState<WeeklyData | null>(null);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [journalLoading, setJournalLoading] = useState(true);
  const [chatDays, setChatDays] = useState<ChatDay[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [query, setQuery] = useState('');

  const loadJournal = useCallback(async (q: string) => {
    setJournalLoading(true);
    try {
      const res = await fetch(`/api/journal${q ? `?q=${encodeURIComponent(q)}` : ''}`);
      const data = await res.json();
      setJournal(data.entries ?? []);
    } catch {
      setJournal([]);
    } finally {
      setJournalLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [w, c, n] = await Promise.all([
          fetch('/api/weekly').then((r) => r.json()),
          fetch('/api/chat-history').then((r) => r.json()),
          fetch('/api/notifications').then((r) => r.json()),
        ]);
        if (!w.error) setWeekly(w);
        setChatDays(c.days ?? []);
        setNotifications(n.notifications ?? []);
      } catch {
        /* ignore */
      }
    })();
    loadJournal('');
  }, [loadJournal]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => loadJournal(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query, loadJournal]);

  return (
    <div className="max-w-screen-lg mx-auto px-6 lg:px-10 py-8 flex flex-col gap-6">
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 500, color: 'var(--color-text)' }}>
          My Dhira
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          Your week, your journal, and every conversation — all in one calm place.
        </p>
      </div>

      {/* Weekly summary */}
      <SectionCard icon={BarChart2} title="Your week with Dhira">
        {weekly && weekly.series.some((s) => s.checkins > 0) ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
              <Stat label="Check-ins this week" value={String(weekly.thisWeek.checkins)} />
              <Stat label="Avg intensity" value={`${Math.round(weekly.thisWeek.avgIntensity * 100)}%`} />
              <Stat label="Top mood" value={weekly.thisWeek.moodMix[0]?.mood ?? '—'} />
              <Stat label="Top topic" value={weekly.thisWeek.topTopics[0]?.topic ?? '—'} />
            </div>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <ComposedChart data={weekly.series} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid stroke={brand.border} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: brand.text, fontSize: 12 }} axisLine={{ stroke: brand.border }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: brand.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: `1px solid ${brand.border}`, fontFamily: 'var(--font-ui)', fontSize: 13 }}
                    formatter={(v: number, name: string) => [v, name === 'checkins' ? 'Check-ins' : 'Avg valence']}
                  />
                  <Bar dataKey="checkins" name="checkins" fill={brand.primary} radius={[6, 6, 0, 0]} maxBarSize={34} />
                  <Line dataKey="avgValence" name="avgValence" stroke={brand.accent} strokeWidth={2} dot={{ r: 3, fill: brand.accent }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            {weekly.thisWeek.moodMix.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {weekly.thisWeek.moodMix.map((m) => (
                  <span key={m.mood} className="flex items-center gap-1.5">
                    <MoodBadge mood={m.mood} size="sm" />
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-subtle)' }}>×{m.count}</span>
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          <EmptyNote text="Your weekly view fills in as you check in. Log a mood or chat with Dhira to get started." />
        )}
      </SectionCard>

      {/* Journal logs */}
      <SectionCard icon={BookOpen} title="Journal logs">
        <div
          className="flex items-center gap-2 mb-4 px-3 py-2 rounded-control"
          style={{ backgroundColor: 'var(--color-surface-alt)', border: '1.5px solid var(--color-border)' }}
        >
          <Search size={15} style={{ color: 'var(--color-text-subtle)' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your reflections (mood, topic, words)…"
            className="flex-1 bg-transparent outline-none"
            style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text)' }}
          />
        </div>
        {journalLoading ? (
          <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading journal">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="p-4 rounded-control animate-pulse"
                style={{ backgroundColor: 'var(--color-surface-alt)', height: 72 }}
              />
            ))}
          </div>
        ) : journal.length === 0 ? (
          <EmptyNote text={query ? 'No entries match that search.' : 'Your reflections will appear here after your first chat with Dhira.'} />
        ) : (
          <div className="flex flex-col gap-3">
            {journal.map((e) => (
              <div key={e.id} className="p-4 rounded-control" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-subtle)', fontWeight: 500 }}>{fmtDate(e.createdAt)}</span>
                  <div className="flex items-center gap-2">
                    <MoodBadge mood={e.mood} size="sm" />
                    <MoodBadge mood={e.topic} size="sm" />
                  </div>
                </div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text)', lineHeight: 1.55 }}>{e.summary}</p>
                {e.carryForward && (
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '6px', fontStyle: 'italic' }}>
                    🌙 {e.carryForward}
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
          <EmptyNote text="Your conversations with Dhira will show up here." />
        ) : (
          <div className="flex flex-col gap-5">
            {chatDays.map((day) => (
              <div key={day.date}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                  {fmtDate(day.date)}
                </p>
                <div className="flex flex-col gap-2">
                  {day.messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className="max-w-[80%] px-3 py-2 rounded-control"
                        style={{
                          backgroundColor: m.role === 'user' ? 'var(--color-primary-soft)' : 'var(--color-surface-alt)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text)', lineHeight: 1.5 }}>{m.content}</p>
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--color-text-subtle)' }}>{fmtTime(m.createdAt)}</span>
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
      <SectionCard icon={Bell} title="Check-ins Dhira sent you">
        {notifications.length === 0 ? (
          <EmptyNote text="When Dhira reaches out (email or WhatsApp), those check-ins appear here." />
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 rounded-control" style={{ backgroundColor: 'var(--color-surface-alt)', borderLeft: '3px solid var(--color-accent)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {n.type.replace(/_/g, ' ')} · {n.channel}
                  </span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: n.status === 'failed' ? 'var(--color-crisis)' : 'var(--color-sage)' }}>{n.status}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text)', lineHeight: 1.5, fontStyle: 'italic' }}>&ldquo;{n.content}&rdquo;</p>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--color-text-subtle)' }}>{fmtDate(n.createdAt)} · {fmtTime(n.createdAt)}</span>
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
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 600, color: 'var(--color-text)', textTransform: 'capitalize' }}>{value}</p>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '2px' }}>{label}</p>
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <div className="p-5 rounded-control text-center" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text-muted)' }}>{text}</p>
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
