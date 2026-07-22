'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from '@/components/ThemeProvider';
import AppLayout from '@/components/AppLayout';
import DhiraAvatar from '@/components/DhiraAvatar';
import { User, Globe, Bell, Shield, ChevronRight, Check } from 'lucide-react';
import { signOut } from '@/lib/authClient';


type Language = 'english' | 'hinglish';
type CheckinFrequency = 'daily' | 'every-other-day' | 'weekly';
type NotifyChannel = 'email' | 'whatsapp';

interface ProfileData {
  alias: string;
  language: Language;
  checkinFrequency: CheckinFrequency;
  proactiveCheckins: boolean;
  memoryEnabled: boolean;
  email: string;
  phoneE164: string;
  preferredChannel: NotifyChannel;
  emailOptIn: boolean;
  whatsappOptIn: boolean;
}

function ProfileContent() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({
    alias: 'Friend',
    language: 'hinglish',
    checkinFrequency: 'daily',
    proactiveCheckins: true,
    memoryEnabled: true,
    email: '',
    phoneE164: '',
    preferredChannel: 'email',
    emailOptIn: true,
    whatsappOptIn: false,
  });
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('profile');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/profile');
        const { profile: p } = await res.json();
        if (!cancelled && p) {
          setProfile({
            alias: p.alias,
            language: p.language,
            checkinFrequency: p.checkinFrequency,
            proactiveCheckins: p.consentCheckin,
            memoryEnabled: p.consentMemory,
            email: p.email ?? '',
            phoneE164: p.phoneE164 ?? '',
            preferredChannel: p.preferredChannel ?? 'email',
            emailOptIn: p.emailOptIn ?? true,
            whatsappOptIn: p.whatsappOptIn ?? false,
          });
        }
      } catch {
        /* fall back to defaults on failure */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    // Keep alias/language in localStorage too (used for a fast greeting fallback).
    if (typeof window !== 'undefined') {
      localStorage.setItem('dhira-alias', profile.alias);
      localStorage.setItem('dhira-language', profile.language);
    }
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alias: profile.alias,
          language: profile.language,
          checkinFrequency: profile.checkinFrequency,
          consentCheckin: profile.proactiveCheckins,
          consentMemory: profile.memoryEnabled,
          email: profile.email,
          phoneE164: profile.phoneE164,
          preferredChannel: profile.preferredChannel,
          emailOptIn: profile.emailOptIn,
          whatsappOptIn: profile.whatsappOptIn,
        }),
      });
    } catch {
      /* best-effort; UI still confirms */
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'checkins', label: 'Check-ins', icon: Bell },
    { id: 'account', label: 'Account', icon: Shield },
  ];

  const frequencyOptions: { value: CheckinFrequency; label: string; sub: string }[] = [
    { value: 'daily', label: 'Daily', sub: 'A gentle nudge every day' },
    { value: 'every-other-day', label: 'Every other day', sub: 'A little breathing room' },
    { value: 'weekly', label: 'Weekly', sub: 'Just once a week' },
  ];

  return (
    <div className="relative min-h-screen">
      {/* ── Illustrated background for profile ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true" style={{ zIndex: 0 }}>
        {/* Organic blob top-right */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '500px',
            height: '450px',
            background: 'radial-gradient(ellipse 55% 60% at 60% 40%, rgba(174, 161, 218, 0.12) 0%, transparent 65%)',
            filter: 'blur(55px)',
            borderRadius: '40% 60% 55% 45% / 50% 45% 55% 50%',
          }}
        />
        {/* Organic blob bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '420px',
            height: '380px',
            background: 'radial-gradient(ellipse, rgba(99, 161, 131, 0.09) 0%, transparent 65%)',
            filter: 'blur(60px)',
            borderRadius: '55% 45% 40% 60% / 45% 55% 50% 50%',
          }}
        />
        {/* Illustrated SVG */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.1 }}>
          <defs>
            <pattern id="profile-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="0.8" fill="var(--color-border)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#profile-dots)" />
          <path
            d="M 0 150 Q 400 80 800 150 Q 1200 220 1600 150"
            fill="none"
            stroke="var(--color-lavender)"
            strokeWidth="1"
            opacity="0.18"
            strokeDasharray="6 16"
          />
          {[
            { x: 80, y: 300, size: 5, color: 'var(--color-lavender)', opacity: 0.22 },
            { x: 1500, y: 200, size: 5, color: 'var(--color-primary)', opacity: 0.18 },
            { x: 900, y: 80, size: 6, color: 'var(--color-sage)', opacity: 0.2 },
          ]?.map((star: { x: number; y: number; size: number; color: string; opacity: number }, i: number) => (
            <g key={`prof-star-${i}`} transform={`translate(${star.x}, ${star.y})`} opacity={star.opacity}>
              <line x1={-star.size} y1="0" x2={star.size} y2="0" stroke={star.color} strokeWidth="1.2" />
              <line x1="0" y1={-star.size} x2="0" y2={star.size} stroke={star.color} strokeWidth="1.2" />
              <line x1={-star.size * 0.7} y1={-star.size * 0.7} x2={star.size * 0.7} y2={star.size * 0.7} stroke={star.color} strokeWidth="0.8" />
              <line x1={star.size * 0.7} y1={-star.size * 0.7} x2={-star.size * 0.7} y2={star.size * 0.7} stroke={star.color} strokeWidth="0.8" />
            </g>
          ))}
          <circle cx="1550" cy="400" r="16" fill="none" stroke="var(--color-lavender)" strokeWidth="1" opacity="0.15" />
          <circle cx="50" cy="500" r="12" fill="none" stroke="var(--color-sage)" strokeWidth="1" opacity="0.15" />
        </svg>
      </div>

    <div className="relative z-10 max-w-screen-lg mx-auto px-6 lg:px-10 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1
          className="text-h2"
          style={{ color: 'var(--color-text)' }}
        >
          Profile &amp; Settings
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
          Manage your Dhira alias, preferences, and account settings.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar nav */}
        <aside className="lg:w-56 flex-shrink-0">
          <div className="dhira-card p-2">
            {sections.map((s) => {
              const Icon = s.icon;
              const active = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-control transition-all duration-200 text-left"
                  style={{
                    backgroundColor: active ? 'var(--color-primary-soft)' : 'transparent',
                    color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '15px',
                    fontWeight: active ? 500 : 400,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={16} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Profile section */}
          {activeSection === 'profile' && (
            <div className="dhira-card p-6">
              <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <DhiraAvatar size={64} variant="softer" />
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 500, color: 'var(--color-text)' }}>
                    {profile.alias}
                  </p>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Your Dhira alias
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="profile-alias"
                  style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: '8px' }}
                >
                  Dhira Alias
                </label>
                <input
                  id="profile-alias"
                  type="text"
                  value={profile.alias}
                  onChange={(e) => setProfile((p) => ({ ...p, alias: e.target.value }))}
                  placeholder="Your anonymous alias"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 'var(--radius-control)',
                    border: '1.5px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface-alt)',
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-subtle)', marginTop: '6px' }}>
                  This is how Dhira addresses you. No real name needed.
                </p>
              </div>

              <button
                onClick={handleSave}
                className="btn-primary flex items-center gap-2"
                style={{ fontSize: '15px', padding: '11px 24px' }}
              >
                {saved ? <Check size={16} /> : null}
                {saved ? 'Saved!' : 'Save changes'}
              </button>
            </div>
          )}

          {/* Language section */}
          {activeSection === 'language' && (
            <div className="dhira-card p-6">
              <h2
                className="mb-2"
                style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 500, color: 'var(--color-text)' }}
              >
                Language Preference
              </h2>
              <p className="mb-6" style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', color: 'var(--color-text-muted)' }}>
                Choose how Dhira speaks with you.
              </p>

              <div className="flex flex-col gap-3 mb-6">
                {([
                  { value: 'hinglish', label: 'Hinglish', sub: 'A warm mix of Hindi and English — "Aaj kaisa feel ho raha hai?"', emoji: '🇮🇳' },
                  { value: 'english', label: 'English', sub: 'Clear, gentle English — "How are you feeling today?"', emoji: '🌐' },
                ] as { value: Language; label: string; sub: string; emoji: string }[]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setProfile((p) => ({ ...p, language: opt.value }))}
                    className="flex items-center gap-4 p-4 rounded-card text-left transition-all duration-200"
                    style={{
                      border: `2px solid ${profile.language === opt.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      backgroundColor: profile.language === opt.value ? 'var(--color-primary-soft)' : 'var(--color-surface-alt)',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{opt.emoji}</span>
                    <div className="flex-1">
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', fontWeight: 500, color: 'var(--color-text)' }}>{opt.label}</p>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{opt.sub}</p>
                    </div>
                    {profile.language === opt.value && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      >
                        <Check size={14} color="white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSave}
                className="btn-primary flex items-center gap-2"
                style={{ fontSize: '15px', padding: '11px 24px' }}
              >
                {saved ? <Check size={16} /> : null}
                {saved ? 'Saved!' : 'Save changes'}
              </button>
            </div>
          )}

          {/* Check-ins section */}
          {activeSection === 'checkins' && (
            <div className="dhira-card p-6">
              <h2
                className="mb-2"
                style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 500, color: 'var(--color-text)' }}
              >
                Check-in Frequency
              </h2>
              <p className="mb-6" style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', color: 'var(--color-text-muted)' }}>
                How often should Dhira reach out to you?
              </p>

              <div className="flex flex-col gap-3 mb-6">
                {frequencyOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setProfile((p) => ({ ...p, checkinFrequency: opt.value }))}
                    className="flex items-center gap-4 p-4 rounded-card text-left transition-all duration-200"
                    style={{
                      border: `2px solid ${profile.checkinFrequency === opt.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      backgroundColor: profile.checkinFrequency === opt.value ? 'rgba(239,169,74,0.08)' : 'var(--color-surface-alt)',
                      cursor: 'pointer',
                    }}
                  >
                    <div className="flex-1">
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', fontWeight: 500, color: 'var(--color-text)' }}>{opt.label}</p>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{opt.sub}</p>
                    </div>
                    {profile.checkinFrequency === opt.value && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'var(--color-accent)' }}
                      >
                        <Check size={14} color="#26263A" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Notifications & contact */}
              <div className="flex flex-col gap-4 mb-6 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>
                  How should Dhira reach you?
                </p>
                {/* Channel selector */}
                <div className="flex gap-3">
                  {([
                    { value: 'email', label: 'Email' },
                    { value: 'whatsapp', label: 'WhatsApp' },
                  ] as { value: NotifyChannel; label: string }[]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setProfile((p) => ({ ...p, preferredChannel: opt.value }))}
                      className="flex-1 p-3 rounded-control text-left transition-all duration-200"
                      style={{
                        border: `2px solid ${profile.preferredChannel === opt.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        backgroundColor: profile.preferredChannel === opt.value ? 'var(--color-primary-soft)' : 'var(--color-surface-alt)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: profile.preferredChannel === opt.value ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {/* Email */}
                <div>
                  <label htmlFor="pf-email" style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Email for check-ins</label>
                  <input
                    id="pf-email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-control)', border: '1.5px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text)', fontFamily: 'var(--font-ui)', fontSize: '15px', outline: 'none' }}
                  />
                </div>
                {/* Phone */}
                <div>
                  <label htmlFor="pf-phone" style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>WhatsApp number (with country code)</label>
                  <input
                    id="pf-phone"
                    type="tel"
                    value={profile.phoneE164}
                    onChange={(e) => setProfile((p) => ({ ...p, phoneE164: e.target.value }))}
                    placeholder="+91 98765 43210"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-control)', border: '1.5px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text)', fontFamily: 'var(--font-ui)', fontSize: '15px', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-4 mb-6 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                {[
                  { key: 'proactiveCheckins', label: 'Proactive check-ins', sub: 'Dhira reaches out first within your chosen window' },
                  { key: 'memoryEnabled', label: 'Memory', sub: 'Dhira remembers what you shared last time' },
                  { key: 'emailOptIn', label: 'Email notifications', sub: 'Allow Dhira to reach you over email' },
                  { key: 'whatsappOptIn', label: 'WhatsApp notifications', sub: 'Allow Dhira to reach you over WhatsApp' },
                ].map((toggle) => (
                  <div key={toggle.key} className="flex items-center justify-between gap-4">
                    <div>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', fontWeight: 500, color: 'var(--color-text)' }}>{toggle.label}</p>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{toggle.sub}</p>
                    </div>
                    <button
                      onClick={() => setProfile((p) => ({ ...p, [toggle.key]: !p[toggle.key as keyof ProfileData] }))}
                      className="relative flex-shrink-0 transition-all duration-200"
                      style={{
                        width: '44px',
                        height: '24px',
                        borderRadius: '12px',
                        backgroundColor: profile[toggle.key as keyof ProfileData] ? 'var(--color-primary)' : 'var(--color-border)',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                      aria-label={toggle.label}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: '3px',
                          left: profile[toggle.key as keyof ProfileData] ? '23px' : '3px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: 'white',
                          transition: 'left 0.2s ease',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                        }}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSave}
                className="btn-primary flex items-center gap-2"
                style={{ fontSize: '15px', padding: '11px 24px' }}
              >
                {saved ? <Check size={16} /> : null}
                {saved ? 'Saved!' : 'Save changes'}
              </button>
            </div>
          )}

          {/* Account section */}
          {activeSection === 'account' && (
            <div className="dhira-card p-6">
              <h2
                className="mb-6"
                style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 500, color: 'var(--color-text)' }}
              >
                Account Settings
              </h2>

              <div className="flex flex-col gap-2">
                {[
                  { label: 'Change email address', sub: 'Update your login email', action: 'email' as const },
                  { label: 'Change password', sub: 'Keep your account secure', action: 'password' as const },
                  { label: 'Export my data', sub: 'Download everything Dhira knows about you', action: 'export' as const },
                  { label: 'Privacy settings', sub: 'Control what Dhira stores', action: 'privacy' as const },
                  { label: 'Sign out', sub: 'Sign out of Dhira on this device', action: 'signout' as const },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.action === 'export') window.location.href = '/api/export';
                      if (item.action === 'signout') handleSignOut();
                      if (item.action === 'privacy') setActiveSection('checkins');
                      if (item.action === 'email' || item.action === 'password') {
                        /* UI parity with Claude artifact — full flows land when Auth is live */
                      }
                    }}
                    className="flex items-center justify-between p-4 rounded-card transition-all duration-200 text-left w-full"
                    style={{
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface-alt)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                  >
                    <div>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', fontWeight: 500, color: 'var(--color-text)' }}>{item.label}</p>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{item.sub}</p>
                    </div>
                    <ChevronRight size={16} style={{ color: 'var(--color-text-subtle)', flexShrink: 0 }} />
                  </button>
                ))}
              </div>

              {/* Danger zone */}
              <div
                className="mt-8 p-4 rounded-card"
                style={{ border: '1px solid var(--color-crisis)', backgroundColor: 'var(--color-crisis-surface)' }}
              >
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 500, color: 'var(--color-crisis)', marginBottom: '8px' }}>
                  Danger zone
                </p>
                <button
                  className="btn-ghost"
                  style={{ fontSize: '14px', padding: '8px 16px', borderColor: 'var(--color-crisis)', color: 'var(--color-crisis)' }}
                >
                  Delete my account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ThemeProvider>
      <AppLayout>
        <ProfileContent />
      </AppLayout>
    </ThemeProvider>
  );
}
