'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const MOODS = [
  { id: 'hyped', emoji: '🔥', label: 'Hyped', color: '#FF6B35' },
  { id: 'solid', emoji: '💪', label: 'Solid', color: '#3D52E0' },
  { id: 'chill', emoji: '😎', label: 'Chill', color: '#2EC4B6' },
  { id: 'meh', emoji: '😐', label: 'Meh', color: '#8B9FFF' },
  { id: 'stressed', emoji: '😤', label: 'Stressed', color: '#FF9F43' },
  { id: 'anxious', emoji: '😰', label: 'Anxious', color: '#8B9FFF' },
  { id: 'low', emoji: '😔', label: 'Low', color: '#7089B0' },
  { id: 'angry', emoji: '🌋', label: 'Angry', color: '#E53E3E' },
];

const WEEK = [
  { day: 'Mon', mood: '💪', color: '#3D52E0' },
  { day: 'Tue', mood: '😤', color: '#FF9F43' },
  { day: 'Wed', mood: '😰', color: '#8B9FFF' },
  { day: 'Thu', mood: '😎', color: '#2EC4B6' },
  { day: 'Fri', mood: '🔥', color: '#FF6B35' },
  { day: 'Sat', mood: '😎', color: '#2EC4B6' },
  { day: 'Sun', mood: null, color: '#2A2F55' },
];

export default function YoBroDashboard() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  return (
    <div
      style={{
        backgroundColor: '#0D0F1E',
        minHeight: '100vh',
        fontFamily: '"DM Sans", system-ui, sans-serif',
        paddingBottom: 80,
      }}
    >
      {/* Top nav */}
      <nav
        style={{
          backgroundColor: '#151829',
          borderBottom: '1px solid #2A2F55',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div className="flex items-center gap-2">
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: 'linear-gradient(135deg, #3D52E0 0%, #FF6B35 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            🤜
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: 18,
              color: '#E8EAFF',
              letterSpacing: '-0.04em',
            }}
          >
            YoBro
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3D52E0 0%, #FF6B35 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            👤
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
        {/* Greeting */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: '#6B72A0', fontWeight: 500, marginBottom: 4 }}>
            Sunday, 18 Sep · Night
          </p>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: '#E8EAFF',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
            }}
          >
            Yo Arjun 👋
          </h1>
          <p style={{ fontSize: 15, color: '#9BA3D4', marginTop: 4, fontWeight: 400 }}>
            What&apos;s the vibe today, bro?
          </p>
        </div>

        {/* YoBro proactive card */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(61,82,224,0.25) 0%, rgba(255,107,53,0.15) 100%)',
            border: '1px solid rgba(61,82,224,0.35)',
            borderRadius: 20,
            padding: '18px 20px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3D52E0 0%, #FF6B35 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            🤖
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, color: '#C8CCEE', lineHeight: 1.55, fontWeight: 500 }}>
              &ldquo;Aye bro — work was stressing you out last week. How&apos;s that situation now? Slide in whenever.&rdquo;
            </p>
            <Link
              href="/chat-with-dhira"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 10,
                background: 'linear-gradient(135deg, #3D52E0 0%, #5B6FFF 100%)',
                color: '#fff',
                borderRadius: 10,
                padding: '7px 16px',
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              🤜 Talk to YoBro
            </Link>
          </div>
        </div>

        {/* Mood check-in */}
        <div
          style={{
            backgroundColor: '#151829',
            border: '1px solid #2A2F55',
            borderRadius: 20,
            padding: '20px',
            marginBottom: 20,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#E8EAFF', letterSpacing: '-0.02em' }}>
              Vibe check 🎯
            </h2>
            <span style={{ fontSize: 12, color: '#6B72A0', fontWeight: 500 }}>Today</span>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
            }}
          >
            {MOODS?.map((mood) => (
              <button
                key={mood?.id}
                onClick={() => setSelectedMood(mood?.id)}
                style={{
                  backgroundColor: selectedMood === mood?.id ? `${mood?.color}22` : '#1E2240',
                  border: selectedMood === mood?.id ? `1.5px solid ${mood?.color}` : '1.5px solid transparent',
                  borderRadius: 12,
                  padding: '10px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: 22 }}>{mood?.emoji}</span>
                <span style={{ fontSize: 10, color: selectedMood === mood?.id ? mood?.color : '#6B72A0', fontWeight: 600 }}>
                  {mood?.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              backgroundColor: '#151829',
              border: '1px solid #2A2F55',
              borderRadius: 20,
              padding: '18px 20px',
            }}
          >
            <p style={{ fontSize: 12, color: '#6B72A0', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Streak 🔥</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#FF6B35', letterSpacing: '-0.04em', lineHeight: 1 }}>6</p>
            <p style={{ fontSize: 12, color: '#6B72A0', marginTop: 4 }}>days straight, bro</p>
          </div>
          <div
            style={{
              backgroundColor: '#151829',
              border: '1px solid #2A2F55',
              borderRadius: 20,
              padding: '18px 20px',
            }}
          >
            <p style={{ fontSize: 12, color: '#6B72A0', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sessions 💬</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#3D52E0', letterSpacing: '-0.04em', lineHeight: 1 }}>24</p>
            <p style={{ fontSize: 12, color: '#6B72A0', marginTop: 4 }}>total chats</p>
          </div>
        </div>

        {/* Week mood strip */}
        <div
          style={{
            backgroundColor: '#151829',
            border: '1px solid #2A2F55',
            borderRadius: 20,
            padding: '18px 20px',
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#E8EAFF', marginBottom: 14, letterSpacing: '-0.02em' }}>
            This week&apos;s vibe 📊
          </h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
            {WEEK?.map((day) => (
              <div key={day?.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: day?.mood ? `${day?.color}22` : '#1E2240',
                    border: `1.5px solid ${day?.mood ? day?.color : '#2A2F55'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                  }}
                >
                  {day?.mood || '·'}
                </div>
                <span style={{ fontSize: 10, color: '#6B72A0', fontWeight: 600 }}>{day?.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent journal */}
        <div
          style={{
            backgroundColor: '#151829',
            border: '1px solid #2A2F55',
            borderRadius: 20,
            padding: '18px 20px',
          }}
        >
          <div className="flex items-center justify-between mb-14px">
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#E8EAFF', letterSpacing: '-0.02em', marginBottom: 14 }}>
              Recent drops 📝
            </h2>
          </div>
          {[
            { date: 'Fri 15 Sep', preview: 'Office mein bilkul mann nahi laga. Sab kuch overwhelming...', mood: '😤' },
            { date: 'Thu 14 Sep', preview: 'Thoda better feel kiya. Ek purani dost se baat hui...', mood: '🔥' },
          ]?.map((entry, i) => (
            <div
              key={i}
              style={{
                padding: '12px 0',
                borderBottom: i === 0 ? '1px solid #2A2F55' : 'none',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{entry?.mood}</span>
              <div>
                <p style={{ fontSize: 11, color: '#6B72A0', fontWeight: 600, marginBottom: 3 }}>{entry?.date}</p>
                <p style={{ fontSize: 13, color: '#9BA3D4', lineHeight: 1.5 }}>{entry?.preview}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom tab bar */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#151829',
          borderTop: '1px solid #2A2F55',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '10px 0 16px',
          zIndex: 50,
        }}
      >
        {[
          { emoji: '🏠', label: 'Home', active: true },
          { emoji: '💬', label: 'Chat', active: false },
          { emoji: '📝', label: 'Notes', active: false },
          { emoji: '📊', label: 'Timeline', active: false },
          { emoji: '👤', label: 'Profile', active: false },
        ]?.map((item) => (
          <button
            key={item?.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 12px',
            }}
          >
            <span style={{ fontSize: 20 }}>{item?.emoji}</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: item?.active ? 700 : 500,
                color: item?.active ? '#3D52E0' : '#6B72A0',
              }}
            >
              {item?.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
