'use client';

import React from 'react';
import Link from 'next/link';

export default function YoBroFooter() {
  return (
    <footer
      style={{
        backgroundColor: '#0D0F1E',
        paddingBlock: '48px 32px',
        paddingInline: 'clamp(20px, 4vw, 40px)',
        borderTop: '1px solid rgba(139,159,255,0.15)',
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 32,
        }}
      >
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
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
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontWeight: 800,
                fontSize: 20,
                color: '#E8EAFF',
                letterSpacing: '-0.04em',
              }}
            >
              YoBro
            </span>
          </div>
          <p
            style={{
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontSize: 13,
              color: '#6B72A0',
              maxWidth: 220,
              lineHeight: 1.6,
            }}
          >
            Your AI buddy — different vibe, same care.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-12 flex-wrap">
          <div>
            <p
              style={{
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontWeight: 700,
                fontSize: 12,
                color: '#9BA3D4',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              App
            </p>
            {[
              { label: 'Sign Up', href: '/sign-up' },
              { label: 'Sign In', href: '/sign-in' },
              { label: 'Chat', href: '/yobro/chat' },
            ]?.map((link) => (
              <Link
                key={link?.label}
                href={link?.href}
                style={{
                  display: 'block',
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                  fontSize: 14,
                  color: '#6B72A0',
                  textDecoration: 'none',
                  marginBottom: 8,
                }}
              >
                {link?.label}
              </Link>
            ))}
          </div>
          <div>
            <p
              style={{
                fontFamily: '"DM Sans", system-ui, sans-serif',
                fontWeight: 700,
                fontSize: 12,
                color: '#9BA3D4',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              Legal
            </p>
            {[
              { label: 'Terms', href: '/terms' },
              { label: 'Privacy', href: '/terms' },
            ]?.map((link) => (
              <Link
                key={link?.label}
                href={link?.href}
                style={{
                  display: 'block',
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                  fontSize: 14,
                  color: '#6B72A0',
                  textDecoration: 'none',
                  marginBottom: 8,
                }}
              >
                {link?.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: 960,
          margin: '32px auto 0',
          paddingTop: 24,
          borderTop: '1px solid rgba(139,159,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <p
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: 12,
            color: '#3D4060',
          }}
        >
          © 2026 YoBro · Crisis line: Tele-MANAS 14416
        </p>
        <p
          style={{
            fontFamily: '"DM Sans", system-ui, sans-serif',
            fontSize: 12,
            color: '#3D4060',
          }}
        >
          Not a therapist. Just your bro. 🤜
        </p>
      </div>
    </footer>
  );
}
