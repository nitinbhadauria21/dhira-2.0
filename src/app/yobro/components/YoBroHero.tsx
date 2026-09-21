'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const BROTALK_LINES = [
  "Bro, you good? Real talk — what's going on?",
  "Aye, I got you. No judgment, just vibes.",
  "Yaar, kuch heavy chal raha hai? Bata.",
  "Slide in anytime. Your bro\'s always up.",
  "Not gonna fix you — just gonna listen, bro.",
];

export default function YoBroHero() {
  const [lineIndex, setLineIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setLineIndex((i) => (i + 1) % BROTALK_LINES?.length);
        setVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-6 lg:px-10 pt-24 pb-20 overflow-hidden"
      style={{ backgroundColor: 'transparent' }}
    >
      {/* Background blobs — electric blue + orange */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          height: '700px',
          background:
            'radial-gradient(ellipse 60% 55% at 50% 40%, rgba(61, 82, 224, 0.16) 0%, rgba(139, 159, 255, 0.07) 50%, transparent 75%)',
          filter: 'blur(28px)',
          zIndex: 1,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '5%',
          right: '-5%',
          width: '520px',
          height: '520px',
          background:
            'radial-gradient(ellipse 55% 60% at 45% 50%, rgba(255, 107, 53, 0.18) 0%, transparent 75%)',
          filter: 'blur(40px)',
          zIndex: 1,
        }}
        aria-hidden="true"
      />

      {/* Floating emoji decorations */}
      <div className="absolute pointer-events-none" style={{ top: '18%', left: '8%', fontSize: 28, opacity: 0.18, zIndex: 2, transform: 'rotate(-15deg)' }} aria-hidden="true">🤜</div>
      <div className="absolute pointer-events-none" style={{ top: '30%', right: '7%', fontSize: 22, opacity: 0.15, zIndex: 2, transform: 'rotate(12deg)' }} aria-hidden="true">🎮</div>
      <div className="absolute pointer-events-none" style={{ bottom: '25%', left: '12%', fontSize: 20, opacity: 0.14, zIndex: 2, transform: 'rotate(-8deg)' }} aria-hidden="true">🔥</div>
      <div className="absolute pointer-events-none" style={{ bottom: '20%', right: '10%', fontSize: 24, opacity: 0.13, zIndex: 2, transform: 'rotate(20deg)' }} aria-hidden="true">💬</div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3D52E0 0%, #FF6B35 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 44,
              boxShadow: '0 8px 32px rgba(61,82,224,0.35)',
              animation: 'yobro-bob 4s ease-in-out infinite',
            }}
          >
            🤖
          </div>
        </div>

        {/* Badge */}
        <div className="flex justify-center mb-5">
          <span
            style={{
              background: 'linear-gradient(135deg, rgba(61,82,224,0.12) 0%, rgba(255,107,53,0.1) 100%)',
              border: '1px solid rgba(61,82,224,0.2)',
              borderRadius: 100,
              padding: '6px 16px',
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontWeight: 700,
              fontSize: 12,
              color: '#3D52E0',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            🤜 Your AI Buddy — Always On
          </span>
        </div>

        <h1
          className="mb-6"
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: 'clamp(38px, 6.5vw, 68px)',
            fontWeight: 800,
            color: '#1A1D3A',
            lineHeight: 1.08,
            letterSpacing: '-0.04em',
          }}
        >
          The bro who&apos;s always
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #3D52E0 0%, #FF6B35 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            got your back.
          </span>
        </h1>

        {/* Rotating chat bubble */}
        <div className="mb-8 min-h-[72px] flex items-center justify-center">
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 20,
              boxShadow: '0 4px 24px rgba(61,82,224,0.12)',
              border: '1px solid #D0D9FF',
              padding: '14px 22px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              maxWidth: 480,
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.35s ease',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3D52E0 0%, #FF6B35 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              🤖
            </div>
            <p
              style={{
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontSize: 15,
                color: '#1A1D3A',
                fontWeight: 500,
                textAlign: 'left',
                lineHeight: 1.5,
              }}
            >
              &ldquo;{BROTALK_LINES?.[lineIndex]}&rdquo;
            </p>
          </div>
        </div>

        <p
          className="mb-10 mx-auto"
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: 18,
            color: '#4A4E72',
            lineHeight: 1.65,
            maxWidth: 480,
            fontWeight: 400,
          }}
        >
          YoBro is your personal AI buddy — no therapy vibes, no corporate wellness BS. Just a real one who listens, checks in, and keeps it 100 with you.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            style={{
              background: 'linear-gradient(135deg, #3D52E0 0%, #5B6FFF 100%)',
              color: '#fff',
              borderRadius: 14,
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontWeight: 700,
              fontSize: 17,
              padding: '15px 34px',
              textDecoration: 'none',
              boxShadow: '0 6px 24px rgba(61,82,224,0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'transform 0.15s ease',
            }}
          >
            🤜 Slide in — it&apos;s free
          </Link>
          <a
            href="#features"
            style={{
              color: '#4A4E72',
              borderRadius: 14,
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontWeight: 600,
              fontSize: 16,
              padding: '15px 28px',
              textDecoration: 'none',
              border: '1.5px solid #D0D9FF',
              backgroundColor: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            See what YoBro does →
          </a>
        </div>

        {/* Social proof strip */}
        <div className="flex items-center justify-center gap-6 mt-10 flex-wrap">
          {[
            { emoji: '🔥', text: '2,400+ bros joined' },
            { emoji: '⭐', text: '4.9 rating' },
            { emoji: '🔒', text: 'Private by default' },
          ]?.map((item) => (
            <div
              key={item?.text}
              className="flex items-center gap-2"
              style={{
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontSize: 13,
                color: '#4A4E72',
                fontWeight: 500,
              }}
            >
              <span>{item?.emoji}</span>
              <span>{item?.text}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes yobro-bob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  );
}
