'use client';

import React, { useMemo, useState } from 'react';
import { MOOD_COLORS as ARTIFACT_MOODS, MOOD_LEGEND, type MoodId } from '@/lib/artifactDesign';
import { moodTileHeight } from '@/lib/timeOfDay';

export type HorizonMoodDay = {
  key: string;
  day: string;
  date: string;
  mood: string | null;
  logged: boolean;
  isToday?: boolean;
};

const MOOD_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(ARTIFACT_MOODS).map(([key, value]) => [key, value.bg])
);

const moodLabels: Record<string, string> = Object.fromEntries(
  Object.entries(ARTIFACT_MOODS).map(([key, value]) => [key, value.label])
);

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  return [0, 2, 4].map((start) => parseInt(clean.slice(start, start + 2), 16));
}

function mix(hex: string, target: '#FFFFFF' | '#000000', amount: number) {
  const source = hexToRgb(hex);
  const dest = target === '#FFFFFF' ? [255, 255, 255] : [0, 0, 0];
  return `#${source
    .map((channel, index) =>
      Math.round(channel + (dest[index] - channel) * amount)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`;
}

function alpha(hex: string, opacity: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default function HorizonMoodTiles({
  days,
  className = '',
  enableMobileScroll = false,
}: {
  days: HorizonMoodDay[];
  className?: string;
  enableMobileScroll?: boolean;
}) {
  const initialSelected = Math.max(
    0,
    days.findIndex((day) => day.isToday)
  );
  const [selectedIndex, setSelectedIndex] = useState(
    initialSelected === -1 ? days.length - 1 : initialSelected
  );
  const selected = days[selectedIndex] ?? days[days.length - 1];

  const legend = useMemo(() => {
    const seen = new Set(
      days.filter((day) => day.logged && day.mood).map((day) => day.mood as MoodId)
    );
    const ordered = MOOD_LEGEND.filter((mood) => seen.has(mood));
    const extras = Array.from(seen).filter((mood) => !ordered.includes(mood));
    return [...ordered, ...extras];
  }, [days]);

  const selectedColor =
    selected?.logged && selected.mood ? MOOD_COLORS[selected.mood] : 'var(--color-border)';
  const selectedLabel =
    selected?.logged && selected.mood
      ? (moodLabels[selected.mood] ?? selected.mood)
      : 'No check-in yet';

  const tilesGrid = (
    <div className="relative grid grid-cols-7 items-end" style={{ gap: 18 }}>
        <span
          aria-hidden="true"
          className="absolute left-0 right-0"
          style={{ bottom: 26, height: 1, backgroundColor: 'var(--color-border)' }}
        />
        {days.map((day, index) => {
          const selectedDay = index === selectedIndex;
          const color =
            day.logged && day.mood ? (MOOD_COLORS[day.mood] ?? MOOD_COLORS.neutral) : 'transparent';
          const ghostToday = day.isToday && !day.logged;
          const labelColor = selectedDay ? 'var(--color-primary)' : 'var(--color-text-subtle)';
          const height = moodTileHeight(day.logged ? day.mood : null);

          return (
            <button
              key={day.key}
              type="button"
              onClick={() => setSelectedIndex(index)}
              title={`${day.day} ${day.date} · ${day.logged && day.mood ? (moodLabels[day.mood] ?? day.mood) : 'Not logged'}`}
              className="group grid h-full justify-items-center gap-2 border-0 bg-transparent p-0"
              style={{ gridTemplateRows: 'auto 1fr auto', cursor: 'pointer' }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 10.5,
                  letterSpacing: '0.14em',
                  color: labelColor,
                  fontWeight: selectedDay ? 600 : 400,
                }}
              >
                {day.day.toUpperCase()}
              </span>
              <span
                className="relative self-end transition-all duration-200 group-hover:-translate-y-1.5"
                style={{
                  width: '100%',
                  maxWidth: 52,
                  height,
                  borderRadius: 14,
                  background: day.logged
                    ? `linear-gradient(165deg, ${mix(color, '#FFFFFF', 0.34)} 0%, ${color} 62%, ${mix(color, '#000000', 0.12)} 100%)`
                    : ghostToday
                      ? 'linear-gradient(180deg, rgba(255,255,255,0.08), transparent)'
                      : 'transparent',
                  border: ghostToday
                    ? '1.5px dashed var(--color-text-subtle)'
                    : selectedDay
                      ? '2px solid var(--color-primary)'
                      : day.logged
                        ? '1px solid rgba(255,255,255,0.35)'
                        : '1px dashed var(--color-border)',
                  boxShadow: day.logged
                    ? selectedDay
                      ? `0 14px 26px ${alpha(color, 0.42)}`
                      : `0 6px 14px ${alpha(color, 0.26)}`
                    : 'none',
                  transform: selectedDay ? 'translateY(-7px)' : 'translateY(0)',
                  transformOrigin: 'bottom',
                }}
              >
                {day.logged && (
                  <>
                    <span
                      aria-hidden="true"
                      className="absolute left-1.5 right-1.5 top-1.5"
                      style={{
                        height: '34%',
                        borderRadius: 10,
                        background:
                          'linear-gradient(180deg, rgba(255,255,255,0.42), rgba(255,255,255,0))',
                      }}
                    />
                    {day.isToday && (
                      <span
                        aria-hidden="true"
                        className="absolute left-1/2 rounded-full"
                        style={{
                          bottom: 8,
                          width: 5,
                          height: 5,
                          transform: 'translateX(-50%)',
                          backgroundColor: 'rgba(255,255,255,0.75)',
                        }}
                      />
                    )}
                  </>
                )}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 11.5,
                  color: labelColor,
                  fontWeight: selectedDay ? 600 : 400,
                }}
              >
                {day.date}
              </span>
            </button>
          );
        })}
      </div>
  );

  return (
    <div className={className}>
      {enableMobileScroll ? (
        <div className="horizon-tiles-scroll md:overflow-visible">
          <div className="horizon-tiles-scroll-inner md:min-w-0">{tilesGrid}</div>
        </div>
      ) : (
        tilesGrid
      )}

      <div
        className="mt-4 flex items-center gap-2 rounded-[14px] px-3.5 py-2.5"
        style={{
          backgroundColor: 'var(--color-surface-alt)',
          borderLeft: `3px solid ${selectedColor}`,
        }}
      >
        <span
          className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
          style={{ backgroundColor: selectedColor }}
        />
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 13.5,
            color: 'var(--color-text)',
            fontWeight: 500,
          }}
        >
          {selected ? `${selected.day} ${selected.date} · ${selectedLabel}` : 'Your week'}
        </span>
        <span
          style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-text-muted)' }}
        >
          {selected?.isToday
            ? 'today'
            : selected?.logged
              ? 'saved check-in'
              : 'waiting for a check-in'}
        </span>
      </div>

      {legend.length > 0 && (
        <div
          className="mt-4 flex flex-wrap gap-3 border-t pt-4"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {legend.map((mood) => (
            <span key={mood} className="inline-flex items-center gap-1.5">
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: MOOD_COLORS[mood] }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 11.5,
                  color: 'var(--color-text-subtle)',
                }}
              >
                {moodLabels[mood]}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
