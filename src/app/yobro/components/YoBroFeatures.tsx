'use client';

import React from 'react';

const FEATURES = [
  {
    emoji: '👂',
    title: 'Listens without the lecture',
    body: "YoBro hears you out — no unsolicited advice, no \"have you tried journaling?\" Just a bro who gets it.",
    quote: '"Bro that sounds rough. Tell me more."',
    accent: '#3D52E0',
    accentSoft: '#EBF0FF',
    span: 2,
  },
  {
    emoji: '🧠',
    title: 'Remembers your story',
    body: "YoBro keeps quiet notes so next time he picks up right where you left off. No re-explaining.",
    quote: '"Last week work was killing you — how\'s that now?"',
    accent: '#FF6B35',
    accentSoft: '#FFF0EB',
    span: 1,
  },
  {
    emoji: '📲',
    title: 'Slides in first',
    body: "Set your window and YoBro checks in on you — because sometimes the hardest part is starting.",
    quote: '"Aye, you good? Haven\'t heard from you."',
    accent: '#2EC4B6',
    accentSoft: '#E6FAFA',
    span: 1,
  },
  {
    emoji: '🛡️',
    title: 'Safety always on',
    body: "When things get heavy, YoBro steps back and connects you to real help — Tele-MANAS 14416, free 24×7.",
    quote: '"You don\'t have to carry this alone, bro."',
    accent: '#8B9FFF',
    accentSoft: '#F0F2FF',
    span: 2,
  },
];

export default function YoBroFeatures() {
  return (
    <section
      id="features"
      style={{
        backgroundColor: '#F0F4FF',
        paddingBlock: 'clamp(64px, 10vw, 96px)',
        paddingInline: 'clamp(20px, 4vw, 40px)',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Section header */}
        <div className="text-center mb-12">
          <span
            style={{
              background: 'rgba(61,82,224,0.1)',
              border: '1px solid rgba(61,82,224,0.2)',
              borderRadius: 100,
              padding: '5px 14px',
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontWeight: 700,
              fontSize: 11,
              color: '#3D52E0',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              display: 'inline-block',
              marginBottom: 16,
            }}
          >
            What YoBro does
          </span>
          <h2
            style={{
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(28px, 4vw, 40px)',
              color: '#1A1D3A',
              letterSpacing: '-0.04em',
              lineHeight: 1.15,
            }}
          >
            Built different. <span style={{ color: '#3D52E0' }}>For real ones.</span>
          </h2>
        </div>

        {/* Bento grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {FEATURES?.map((feat, i) => (
            <div
              key={feat?.title}
              style={{
                gridColumn: `span ${feat?.span}`,
                backgroundColor: '#fff',
                borderRadius: 20,
                border: '1px solid #D0D9FF',
                padding: '28px 28px 24px',
                boxShadow: '0 2px 16px rgba(61,82,224,0.06)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Accent blob */}
              <div
                style={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  backgroundColor: feat?.accentSoft,
                  opacity: 0.7,
                  pointerEvents: 'none',
                }}
                aria-hidden="true"
              />

              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: feat?.accentSoft,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  marginBottom: 16,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {feat?.emoji}
              </div>

              <h3
                style={{
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                  fontWeight: 700,
                  fontSize: 18,
                  color: '#1A1D3A',
                  letterSpacing: '-0.02em',
                  marginBottom: 8,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {feat?.title}
              </h3>
              <p
                style={{
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                  fontSize: 14,
                  color: '#4A4E72',
                  lineHeight: 1.6,
                  marginBottom: 14,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {feat?.body}
              </p>
              <div
                style={{
                  backgroundColor: feat?.accentSoft,
                  borderLeft: `3px solid ${feat?.accent}`,
                  borderRadius: '0 8px 8px 0',
                  padding: '8px 12px',
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                  fontSize: 13,
                  color: feat?.accent,
                  fontWeight: 600,
                  fontStyle: 'italic',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {feat?.quote}
              </div>
            </div>
          ))}
        </div>

        {/* Safety callout */}
        <div
          id="safety"
          style={{
            marginTop: 24,
            backgroundColor: '#fff',
            borderRadius: 20,
            border: '1.5px solid #D0D9FF',
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: 32 }}>🔒</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p
              style={{
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontWeight: 700,
                fontSize: 16,
                color: '#1A1D3A',
                marginBottom: 4,
              }}
            >
              No shortcuts on safety — ever
            </p>
            <p
              style={{
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontSize: 13,
                color: '#4A4E72',
                lineHeight: 1.5,
              }}
            >
              YoBro has the same crisis detection, safety escalation, and mental health guardrails. Different vibe, same care. Tele-MANAS 14416 always a tap away.
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            {['Crisis detection', 'Safe messaging', 'Real help links']?.map((tag) => (
              <span
                key={tag}
                style={{
                  backgroundColor: '#EBF0FF',
                  color: '#3D52E0',
                  borderRadius: 100,
                  padding: '4px 12px',
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
