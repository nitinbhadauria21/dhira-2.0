import React from 'react';
import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer
      className="py-12 relative z-10"
      style={{
        backgroundColor: 'var(--color-bg)',
        borderTop: '1px solid var(--color-border)',
        paddingInline: 'clamp(20px, 4vw, 40px)',
      }}
    >
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <p className="wordmark text-2xl mb-3">Dhira</p>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 14,
                color: 'var(--color-text-muted)',
                maxWidth: 240,
                lineHeight: 1.65,
              }}
            >
              The calm that stays up with you. Private, anonymous, Hinglish-first.
            </p>
          </div>

          <div>
            <p
              className="mb-3 uppercase"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--color-text-subtle)',
                letterSpacing: '0.08em',
              }}
            >
              App
            </p>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Home', href: '/home-dashboard' },
                { label: 'Chat with Dhira', href: '/chat-with-dhira' },
                { label: 'Privacy Promise', href: '/terms' },
              ].map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 14,
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p
              className="mb-3 uppercase"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--color-text-subtle)',
                letterSpacing: '0.08em',
              }}
            >
              Safety
            </p>
            <div
              className="p-4"
              style={{
                backgroundColor: 'var(--color-crisis-surface)',
                border: '1px solid var(--color-crisis)',
                borderRadius: 12,
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  color: 'var(--color-crisis)',
                  lineHeight: 1.55,
                }}
              >
                If you or someone you know is in crisis: Please call Tele-MANAS at 14416 — free, 24×7,
                India-wide. Dhira is a listening companion, not a crisis service.
              </p>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-text-subtle)' }}>
            © 2026 dhira · Made with care in India · Cursor local
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-text-subtle)' }}>
            dhira is a listening companion, not a therapist or crisis service.
          </p>
        </div>
      </div>
    </footer>
  );
}
