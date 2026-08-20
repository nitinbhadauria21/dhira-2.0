'use client';

import React, { useMemo } from 'react';
import { MessageCircle } from 'lucide-react';
import type { TimelineChatDay, TimelineChatWeek } from '@/lib/timelineChat';
import { formatDaySummary } from '@/lib/timelineChat';

export type TimelineTab = 'all' | 'checkins' | 'chats' | 'notebook';

const TABS: { id: TimelineTab; label: string }[] = [
  { id: 'all', label: 'All activity' },
  { id: 'checkins', label: 'Check-ins' },
  { id: 'chats', label: 'Chats' },
  { id: 'notebook', label: 'Notebook' },
];

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="timeline-stat-tile theme-transition">
      <p className="timeline-stat-value">{value}</p>
      <p className="timeline-stat-label">{label}</p>
    </div>
  );
}

function ChatBubble({ color }: { color: string }) {
  return (
    <span className="timeline-chat-bubble" style={{ backgroundColor: color }} aria-hidden="true" />
  );
}

function DaySummaryBar({ day }: { day: TimelineChatDay }) {
  if (!day.sessionCount) {
    return <span>No conversations on this day yet.</span>;
  }

  const text = formatDaySummary(day);
  const arcMatch = text.match(/You moved (.+) across the day\./);
  if (!arcMatch) return <span>{text}</span>;

  const before = text.slice(0, text.indexOf('You moved '));
  const arc = arcMatch[1];
  return (
    <>
      {before}
      You moved{' '}
      {arc.split(' → ').map((part, i, arr) => (
        <React.Fragment key={i}>
          {i > 0 && ' → '}
          <strong>{part}</strong>
        </React.Fragment>
      ))}{' '}
      across the day.
    </>
  );
}

export default function TimelineChatWeekSection({
  data,
  activeTab,
  onTabChange,
  selectedDate,
  onSelectDate,
}: {
  data: TimelineChatWeek | null;
  activeTab: TimelineTab;
  onTabChange: (tab: TimelineTab) => void;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}) {
  const selectedDay = useMemo(() => {
    if (!data?.days.length) return null;
    if (selectedDate) return data.days.find((d) => d.date === selectedDate) ?? null;
    const withChats = [...data.days].reverse().find((d) => d.sessionCount > 0);
    return withChats ?? data.days[data.days.length - 1];
  }, [data, selectedDate]);

  const showChatPanel = activeTab === 'chats' || activeTab === 'all';

  return (
    <section
      className="timeline-weekly-card dhira-card theme-transition"
      aria-labelledby="timeline-chat-week-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} style={{ color: 'var(--color-primary)' }} aria-hidden />
          <h2
            id="timeline-chat-week-title"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              fontWeight: 500,
              color: 'var(--color-text)',
            }}
          >
            Your week with DHIRA
          </h2>
        </div>
      </div>

      <div className="timeline-tab-row" role="tablist" aria-label="Timeline activity type">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`timeline-tab${activeTab === tab.id ? ' timeline-tab-active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {showChatPanel && data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5 mt-5">
            <StatTile
              value={String(data.stats.conversations)}
              label={data.stats.conversations === 1 ? 'conversation' : 'conversations'}
            />
            <StatTile value={data.stats.commonShift} label="most common shift" />
            <StatTile value={`${data.stats.avgSupportMinutes} min`} label="avg support time" />
            <StatTile value={data.stats.exitMood} label="exit mood" />
          </div>

          <div className="timeline-chat-week-strip-wrap">
            <div className="timeline-chat-week-strip">
              {data.days.map((day) => (
                <DayColumn
                  key={day.date}
                  day={day}
                  selected={selectedDay?.date === day.date}
                  onSelect={() => onSelectDate(day.date)}
                />
              ))}
            </div>

            <div className="timeline-chat-legend" aria-label="Mood colors">
              {data.legend.map((item) => (
                <span key={`${item.mood}-${item.label}`} className="timeline-chat-legend-item">
                  <span
                    className="timeline-chat-legend-dot"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.label}</span>
                </span>
              ))}
            </div>
          </div>

          {selectedDay && (
            <div className="timeline-day-summary-bar theme-transition">
              <DaySummaryBar day={selectedDay} />
            </div>
          )}
        </>
      )}

      {!showChatPanel && (
        <p
          className="mt-4"
          style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-text-muted)' }}
        >
          {activeTab === 'checkins'
            ? 'Check-in stats are below.'
            : activeTab === 'notebook'
              ? 'Your notebook entries are below.'
              : 'Your full activity is shown below.'}
        </p>
      )}

      {!data && showChatPanel && (
        <p
          className="mt-4"
          style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-text-muted)' }}
        >
          Loading your chat week…
        </p>
      )}
    </section>
  );
}

function DayColumn({
  day,
  selected,
  onSelect,
}: {
  day: TimelineChatDay;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`timeline-chat-day-col${selected ? ' timeline-chat-day-col-selected' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${day.weekdayShort} ${day.dayNum}, ${day.sessionCount} conversations`}
    >
      <span className="timeline-chat-day-label">{day.weekdayShort}</span>
      <span className="timeline-chat-day-num">{day.dayNum}</span>
      <div className="timeline-chat-day-bubbles">
        {day.bubbles.length === 0 ? (
          <span className="timeline-chat-day-empty" aria-hidden />
        ) : (
          day.bubbles.map((b, i) => <ChatBubble key={`${b.time}-${i}`} color={b.color} />)
        )}
      </div>
    </button>
  );
}

export type { TimelineChatDay };
