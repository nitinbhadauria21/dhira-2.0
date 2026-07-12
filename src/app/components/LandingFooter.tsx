import React from 'react';
import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer
      className="py-12 px-6 lg:px-10"
      style={{ backgroundColor: 'var(--color-bg)', borderTop: '1px solid var(--color-border)' }}
    >
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <p
              className="wordmark text-2xl mb-3"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--color-text)' }}
            >
              dhira
            </p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.65, maxWidth: '240px' }}>
              The calm that stays up with you. Private, anonymous, Hinglish-first.
            </p>
          </div>

          {/* Links */}
          <div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
              App
            </p>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Home', href: '/home-dashboard' },
                { label: 'Chat with Dhira', href: '/chat-with-dhira' },
                { label: 'Privacy Promise', href: '/home-dashboard' },
              ]?.map((l) => (
                <Link
                  key={`footer-link-${l?.label}`}
                  href={l?.href}
                  style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                >
                  {l?.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Safety */}
          <div>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-subtle)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Safety
            </p>
            <div
              className="p-4 rounded-control"
              style={{ backgroundColor: 'var(--color-crisis-surface)', border: '1px solid var(--color-crisis)' }}
            >
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-crisis)', lineHeight: 1.55, fontWeight: 500 }}>
                🕊️ In crisis? Call Tele-MANAS
              </p>
              <p
                style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 600, color: 'var(--color-crisis)', marginTop: '4px' }}
              >
                14416
              </p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-crisis)', opacity: 0.8 }}>
                Free · 24×7 · India
              </p>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-subtle)' }}>
            © 2026 dhira · Made with care in India
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-subtle)' }}>
            dhira is a listening companion, not a therapist or crisis service.
          </p>
        </div>
      </div>
    </footer>
  );
}