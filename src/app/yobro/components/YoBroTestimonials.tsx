'use client';

import React from 'react';

const TESTIMONIALS = [
  {
    quote: "Bhai, finally something that doesn't feel like a therapy session. YoBro just gets it.",
    name: 'Arjun T.',
    meta: 'Delhi · 3 weeks with YoBro',
    mood: '🔥 Feeling lighter',
    moodColor: '#FF6B35',
  },
  {
    quote: "The 2 AM check-in hit different. Didn't expect an AI to actually show up like that.",
    name: 'Karan M.',
    meta: 'Bengaluru · 5-day streak',
    mood: '💪 More grounded',
    moodColor: '#3D52E0',
  },
  {
    quote: "I knew it was AI, but it still felt like someone actually gave a damn. That's the whole point.",
    name: 'Rohan S.',
    meta: 'Mumbai · 2 weeks with YoBro',
    mood: '✨ Clearer head',
    moodColor: '#2EC4B6',
  },
];

export default function YoBroTestimonials() {
  return (
    <section
      style={{
        backgroundColor: '#1A1D3A',
        paddingBlock: 'clamp(64px, 10vw, 96px)',
        paddingInline: 'clamp(20px, 4vw, 40px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800,
          height: 400,
          background: 'radial-gradient(ellipse, rgba(61,82,224,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="text-center mb-12">
          <span
            style={{
              background: 'rgba(139,159,255,0.15)',
              border: '1px solid rgba(139,159,255,0.3)',
              borderRadius: 100,
              padding: '5px 14px',
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontWeight: 700,
              fontSize: 11,
              color: '#8B9FFF',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              display: 'inline-block',
              marginBottom: 16,
            }}
          >
            Real talk from the squad
          </span>
          <h2
            style={{
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(28px, 4vw, 40px)',
              color: '#E8EAFF',
              letterSpacing: '-0.04em',
              lineHeight: 1.15,
            }}
          >
            Bros who&apos;ve been there
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {TESTIMONIALS?.map((t) => (
            <div
              key={t?.name}
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(139,159,255,0.2)',
                borderRadius: 20,
                padding: '28px 24px',
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* Quote marks */}
              <div
                style={{
                  fontSize: 40,
                  lineHeight: 1,
                  color: '#3D52E0',
                  fontFamily: 'Georgia, serif',
                  marginBottom: 12,
                  opacity: 0.6,
                }}
              >
                &ldquo;
              </div>
              <p
                style={{
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                  fontSize: 15,
                  color: '#C8CCEE',
                  lineHeight: 1.65,
                  marginBottom: 20,
                  fontStyle: 'italic',
                }}
              >
                {t?.quote}
              </p>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p
                    style={{
                      fontFamily: '"DM Sans", system-ui, sans-serif',
                      fontWeight: 700,
                      fontSize: 14,
                      color: '#E8EAFF',
                    }}
                  >
                    {t?.name}
                  </p>
                  <p
                    style={{
                      fontFamily: '"DM Sans", system-ui, sans-serif',
                      fontSize: 12,
                      color: '#6B72A0',
                    }}
                  >
                    {t?.meta}
                  </p>
                </div>
                <span
                  style={{
                    backgroundColor: `${t?.moodColor}22`,
                    color: t?.moodColor,
                    borderRadius: 100,
                    padding: '4px 12px',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {t?.mood}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <p
            style={{
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontSize: 20,
              color: '#9BA3D4',
              marginBottom: 24,
              fontWeight: 500,
            }}
          >
            Your bro&apos;s waiting. No cap.
          </p>
          <a
            href="/sign-up"
            style={{
              background: 'linear-gradient(135deg, #3D52E0 0%, #FF6B35 100%)',
              color: '#fff',
              borderRadius: 14,
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontWeight: 700,
              fontSize: 17,
              padding: '15px 36px',
              textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(61,82,224,0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            🤜 Meet YoBro — it&apos;s free
          </a>
        </div>
      </div>
    </section>
  );
}
