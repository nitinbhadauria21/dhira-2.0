import React from 'react';
import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer
      className="py-12"
      style={{
        backgroundColor: 'var(--color-surface-alt)',
        borderTop: '1px solid var(--color-border)',
        paddingInline: 'clamp(20px, 4vw, 40px)',
      }}
    >
      <div className="page-wide">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <p className="wordmark text-2xl mb-3">Dhira</p>
            <p
              className="text-small"
              style={{ color: 'var(--color-text-muted)', maxWidth: '28ch', lineHeight: 1.65 }}
            >
              The calm that stays up with you. Private, anonymous, Hinglish-first.
            </p>
          </div>

          <div>
            <p
              className="mb-3 uppercase"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-text-subtle)',
                letterSpacing: '0.1em',
              }}
            >
              App
            </p>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Home', href: '/home-dashboard' },
                { label: 'Chat with Dhira', href: '/chat-with-dhira' },
                { label: 'Privacy Promise', href: '/#privacy' },
                { label: 'Privacy & Terms', href: '/terms' },
              ].map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-small transition-colors"
                  style={{ color: 'var(--color-text-muted)' }}
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
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-text-subtle)',
                letterSpacing: '0.1em',
              }}
            >
              Safety
            </p>
            <div
              className="p-4"
              style={{
                backgroundColor: 'var(--color-crisis-surface)',
                border: '1px solid var(--color-crisis)',
                borderRadius: 'var(--radius-control)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '13px',
                  color: 'var(--color-crisis)',
                  fontWeight: 500,
                }}
              >
                In crisis? Call Tele-MANAS
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '28px',
                  fontWeight: 650,
                  color: 'var(--color-crisis)',
                  marginTop: '4px',
                  letterSpacing: '-0.03em',
                }}
              >
                14416
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '12px',
                  color: 'var(--color-crisis)',
                  opacity: 0.85,
                }}
              >
                Free · 24×7 · India
              </p>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <p className="text-small" style={{ color: 'var(--color-text-subtle)' }}>
            © 2026 Dhira · Made with care in India · Runs in Cursor local only
          </p>
          <p className="text-small text-center-safe" style={{ color: 'var(--color-text-subtle)' }}>
            Dhira listens — never advises. Not a therapist or crisis service.
          </p>
        </div>
      </div>
    </footer>
  );
}
