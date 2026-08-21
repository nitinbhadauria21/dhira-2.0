'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from '@/components/ThemeProvider';
import AppLayout from '@/components/AppLayout';
import DhiraAvatar from '@/components/DhiraAvatar';
import BrandLockup from '@/components/BrandLockup';
import FloatingBuddy from '@/components/FloatingBuddy';
import { User, Globe, Bell, Shield, ChevronRight, Check } from 'lucide-react';
import { signOut } from '@/lib/authClient';
import { FREQUENCY_OPTIONS, PROFILE_LANGUAGE_OPTIONS } from '@/lib/artifactDesign';
import {
  readStoredShift,
  SHIFT_OPTIONS,
  writeStoredShift,
  type ShiftPreference,
} from '@/lib/timeOfDay';

type Language = 'english' | 'hinglish';
type CheckinFrequency = 'daily' | 'every-other-day' | 'weekly';
type NotifyChannel = 'email' | 'whatsapp' | 'telegram';

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
  telegramOptIn: boolean;
  telegramConnected: boolean;
  shift: ShiftPreference;
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
    telegramOptIn: false,
    telegramConnected: false,
    shift: 'day',
  });
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [telegramLinkPending, setTelegramLinkPending] = useState(false);
  const [telegramActionMessage, setTelegramActionMessage] = useState<string | null>(null);
  const [telegramBusy, setTelegramBusy] = useState(false);

  const refreshTelegramStatus = async () => {
    try {
      const res = await fetch('/api/telegram/link');
      if (!res.ok) return;
      const data = await res.json();
      setTelegramEnabled(!!data.telegramEnabled);
      if (typeof data.telegramConnected === 'boolean') {
        setProfile((p) => ({
          ...p,
          telegramConnected: data.telegramConnected,
          telegramOptIn: data.profile?.telegramOptIn ?? p.telegramOptIn,
        }));
      }
      if (data.telegramConnected) setTelegramLinkPending(false);
    } catch {
      /* best-effort */
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const localShift = readStoredShift();
      try {
        const [profileRes, telegramRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/telegram/link'),
        ]);
        const { profile: p } = await profileRes.json();
        const tg = telegramRes.ok ? await telegramRes.json() : null;
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
            telegramOptIn: p.telegramOptIn ?? false,
            telegramConnected: p.telegramConnected ?? false,
            shift: p.shift ?? localShift,
          });
          setTelegramEnabled(!!tg?.telegramEnabled);
        } else if (!cancelled) {
          setProfile((current) => ({ ...current, shift: localShift }));
        }
      } catch {
        if (!cancelled) setProfile((current) => ({ ...current, shift: localShift }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!telegramLinkPending) return;
    const id = window.setInterval(() => {
      void refreshTelegramStatus();
    }, 4000);
    return () => window.clearInterval(id);
  }, [telegramLinkPending]);

  const handleConnectTelegram = async () => {
    setTelegramBusy(true);
    setTelegramActionMessage(null);
    try {
      const res = await fetch('/api/telegram/link', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setTelegramActionMessage(data.error ?? 'Could not start Telegram connection.');
        return;
      }
      if (data.connected) {
        setProfile((p) => ({ ...p, telegramConnected: true, telegramOptIn: true }));
        setTelegramActionMessage('Telegram is already connected.');
        return;
      }
      if (data.botUrl) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile && data.appUrl) {
          window.location.href = data.appUrl;
        } else {
          window.open(data.botUrl, '_blank', 'noopener,noreferrer');
        }
        setTelegramLinkPending(true);
        setTelegramActionMessage(
          isMobile
            ? 'In the Telegram app, tap Start on the Dhira bot, then return here.'
            : 'If a Telegram login screen opened: scan the QR with your phone (Telegram → Settings → Devices → Link Desktop Device), then tap START on the Dhira bot. Or open Connect on your phone instead.',
        );
      }
    } catch {
      setTelegramActionMessage('Could not start Telegram connection.');
    } finally {
      setTelegramBusy(false);
    }
  };

  const handleDisconnectTelegram = async () => {
    setTelegramBusy(true);
    setTelegramActionMessage(null);
    try {
      const res = await fetch('/api/telegram/disconnect', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setTelegramActionMessage(data.error ?? 'Could not disconnect Telegram.');
        return;
      }
      setProfile((p) => ({
        ...p,
        telegramConnected: false,
        telegramOptIn: false,
        preferredChannel: p.preferredChannel === 'telegram' ? 'email' : p.preferredChannel,
      }));
      setTelegramLinkPending(false);
      setTelegramActionMessage('Telegram disconnected.');
    } catch {
      setTelegramActionMessage('Could not disconnect Telegram.');
    } finally {
      setTelegramBusy(false);
    }
  };

  const handleTestTelegram = async () => {
    setTelegramBusy(true);
    setTelegramActionMessage(null);
    try {
      const res = await fetch('/api/telegram/test', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setTelegramActionMessage(data.error ?? 'Test message failed.');
        if (res.status === 400 || res.status === 502) {
          await refreshTelegramStatus();
        }
        return;
      }
      setTelegramActionMessage('Test message sent — check Telegram.');
    } catch {
      setTelegramActionMessage('Test message failed.');
    } finally {
      setTelegramBusy(false);
    }
  };

  const handleSave = async () => {
    // Keep alias/language in localStorage too (used for a fast greeting fallback).
    if (typeof window !== 'undefined') {
      localStorage.setItem('dhira-alias', profile.alias);
      localStorage.setItem('dhira-language', profile.language);
      writeStoredShift(profile.shift);
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
          telegramOptIn: profile.telegramOptIn,
          shift: profile.shift,
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
    router.push('/');
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User, iconColor: '#7C6AED' },
    { id: 'language', label: 'Language', icon: Globe, iconColor: '#5BA3D9' },
    { id: 'checkins', label: 'Check-ins', icon: Bell, iconColor: '#E8A87C' },
    { id: 'account', label: 'Account', icon: Shield, iconColor: '#4A90C4' },
  ];

  const frequencyOptions = FREQUENCY_OPTIONS;

  return (
    <div className="relative min-h-screen">
      {/* ── Illustrated background for profile ── */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
        style={{ zIndex: 0 }}
      >
        {/* Organic blob top-right */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '500px',
            height: '450px',
            background:
              'radial-gradient(ellipse 55% 60% at 60% 40%, rgba(174, 161, 218, 0.12) 0%, transparent 65%)',
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
            <pattern
              id="profile-dots"
              x="0"
              y="0"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
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
          ]?.map(
            (
              star: { x: number; y: number; size: number; color: string; opacity: number },
              i: number
            ) => (
              <g
                key={`prof-star-${i}`}
                transform={`translate(${star.x}, ${star.y})`}
                opacity={star.opacity}
              >
                <line
                  x1={-star.size}
                  y1="0"
                  x2={star.size}
                  y2="0"
                  stroke={star.color}
                  strokeWidth="1.2"
                />
                <line
                  x1="0"
                  y1={-star.size}
                  x2="0"
                  y2={star.size}
                  stroke={star.color}
                  strokeWidth="1.2"
                />
                <line
                  x1={-star.size * 0.7}
                  y1={-star.size * 0.7}
                  x2={star.size * 0.7}
                  y2={star.size * 0.7}
                  stroke={star.color}
                  strokeWidth="0.8"
                />
                <line
                  x1={star.size * 0.7}
                  y1={-star.size * 0.7}
                  x2={-star.size * 0.7}
                  y2={star.size * 0.7}
                  stroke={star.color}
                  strokeWidth="0.8"
                />
              </g>
            )
          )}
          <circle
            cx="1550"
            cy="400"
            r="16"
            fill="none"
            stroke="var(--color-lavender)"
            strokeWidth="1"
            opacity="0.15"
          />
          <circle
            cx="50"
            cy="500"
            r="12"
            fill="none"
            stroke="var(--color-sage)"
            strokeWidth="1"
            opacity="0.15"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-screen-lg mx-auto px-6 lg:px-10 py-8">
        {/* Page header */}
        <div className="mb-8 flex items-end gap-4">
          <FloatingBuddy
            src="/illustrations/dhira_settings.png"
            alt="DHIRA holding a settings dial"
            width={78}
            bobAnimation="dhira-bob 5.5s ease-in-out infinite"
          />
          <div>
            <BrandLockup href="/home-dashboard" size={18} className="mb-3" />
            <h1 className="text-h2" style={{ color: 'var(--color-text)' }}>
              Profile &amp; Settings
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '15px',
                color: 'var(--color-text-muted)',
                marginTop: '6px',
              }}
            >
              Manage your DHIRA alias, preferences, and account settings.
            </p>
          </div>
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
                    <Icon size={16} color={s.iconColor} aria-hidden />
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
                {/* Growth banner — Profile.dc “Your growth, your story” */}
                <div
                  className="relative mb-6 overflow-hidden"
                  style={{
                    height: '128px',
                    borderRadius: '12px',
                    background:
                      'linear-gradient(115deg, #CFC6EA 0%, #B4A8DE 34%, #EBDEEE 66%, #F5DCC2 100%)',
                  }}
                >
                  <svg
                    viewBox="0 0 640 128"
                    preserveAspectRatio="xMidYMax slice"
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full"
                  >
                    <defs>
                      <radialGradient id="pfSun" cx="50%" cy="40%" r="60%">
                        <stop offset="0%" stopColor="#FFF3DF" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#FFF3DF" stopOpacity="0" />
                      </radialGradient>
                      <linearGradient id="pfTrunk" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="#6E4F3A" />
                        <stop offset="100%" stopColor="#8A6A4E" />
                      </linearGradient>
                      <radialGradient id="pfFol1" cx="40%" cy="35%" r="70%">
                        <stop offset="0%" stopColor="#A9CDB4" />
                        <stop offset="100%" stopColor="#6FA486" />
                      </radialGradient>
                      <radialGradient id="pfFol2" cx="40%" cy="35%" r="70%">
                        <stop offset="0%" stopColor="#8FBCA4" />
                        <stop offset="100%" stopColor="#5C976F" />
                      </radialGradient>
                      <radialGradient id="pfFol3" cx="45%" cy="40%" r="70%">
                        <stop offset="0%" stopColor="#7FB093" />
                        <stop offset="100%" stopColor="#4F8763" />
                      </radialGradient>
                    </defs>
                    <circle cx="500" cy="30" r="90" fill="url(#pfSun)" />
                    <ellipse cx="505" cy="124" rx="120" ry="10" fill="#5C4A6E" opacity="0.14" />
                    <path
                      d="M498 124 C500 100 497 84 494 70 C493 64 490 60 484 55 C489 57 493 60 495 63 C494 52 492 46 487 40 C493 44 497 50 499 58 C501 50 505 45 512 41 C506 48 503 55 503 64 C507 58 512 55 519 53 C512 58 506 65 505 74 C503 90 505 106 508 124 Z"
                      fill="url(#pfTrunk)"
                    />
                    <g>
                      <ellipse cx="466" cy="46" rx="26" ry="20" fill="url(#pfFol3)" opacity="0.95" />
                      <ellipse cx="535" cy="44" rx="27" ry="21" fill="url(#pfFol3)" opacity="0.95" />
                      <ellipse cx="481" cy="28" rx="27" ry="21" fill="url(#pfFol2)" />
                      <ellipse cx="522" cy="26" rx="26" ry="20" fill="url(#pfFol2)" />
                      <ellipse cx="501" cy="16" rx="30" ry="20" fill="url(#pfFol1)" />
                      <ellipse cx="493" cy="30" rx="16" ry="11" fill="#BCD9C4" opacity="0.55" />
                      <ellipse cx="516" cy="20" rx="10" ry="7" fill="#CDE4D3" opacity="0.5" />
                    </g>
                    <circle cx="470" cy="66" r="2.2" fill="#F0C46B" opacity="0.85" />
                    <circle cx="540" cy="60" r="2.2" fill="#F0C46B" opacity="0.85" />
                    <circle cx="512" cy="70" r="1.8" fill="#EFA94A" opacity="0.7" />
                    <g opacity="0.5" fill="#63A183">
                      <path d="M430 112 q3 -10 1 -16 q6 4 5 12 z" />
                      <path d="M585 116 q3 -9 1 -14 q5 4 4 11 z" />
                    </g>
                  </svg>
                  <div
                    className="absolute inset-0 flex flex-col justify-center gap-2.5"
                    style={{ padding: '0 200px 0 28px' }}
                  >
                    <div>
                      <p
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '20px',
                          fontWeight: 600,
                          color: '#3A3560',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        Your growth, your story
                      </p>
                      <p
                        style={{
                          fontFamily: 'var(--font-ui)',
                          fontSize: '12.5px',
                          color: '#5C5584',
                          marginTop: '2px',
                        }}
                      >
                        Small check-ins, quietly adding up.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { n: '24', label: 'days' },
                        { n: '36', label: 'entries' },
                        { n: '18', label: 'badges' },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="flex items-baseline gap-1.5"
                          style={{
                            background: 'rgba(255,255,255,.55)',
                            backdropFilter: 'blur(6px)',
                            border: '1px solid rgba(255,255,255,.7)',
                            borderRadius: '10px',
                            padding: '4px 12px',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: '15px',
                              fontWeight: 600,
                              color: '#3A3560',
                            }}
                          >
                            {stat.n}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-ui)',
                              fontSize: '11px',
                              color: '#5C5584',
                            }}
                          >
                            {stat.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center gap-4 mb-6 pb-6"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <DhiraAvatar size={64} variant="softer" />
                  <div>
                    <p
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '20px',
                        fontWeight: 500,
                        color: 'var(--color-text)',
                      }}
                    >
                      {profile.alias}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '14px',
                        color: 'var(--color-text-muted)',
                        marginTop: '2px',
                      }}
                    >
                      Your DHIRA alias
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="profile-alias"
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-ui)',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--color-text-muted)',
                      marginBottom: '8px',
                    }}
                  >
                    DHIRA Alias
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
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '13px',
                      color: 'var(--color-text-subtle)',
                      marginTop: '6px',
                    }}
                  >
                    This is how DHIRA addresses you. No real name needed.
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
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    fontWeight: 500,
                    color: 'var(--color-text)',
                  }}
                >
                  Language Preference
                </h2>
                <p
                  className="mb-6"
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '15px',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Choose how DHIRA speaks with you.
                </p>

                <div className="flex flex-col gap-3 mb-6">
                  {(
                    PROFILE_LANGUAGE_OPTIONS as {
                      value: Language;
                      label: string;
                      sub: string;
                      emoji: string;
                    }[]
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setProfile((p) => ({ ...p, language: opt.value }))}
                      className="flex items-center gap-4 p-4 rounded-card text-left transition-all duration-200"
                      style={{
                        border: `2px solid ${profile.language === opt.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        backgroundColor:
                          profile.language === opt.value
                            ? 'var(--color-primary-soft)'
                            : 'var(--color-surface-alt)',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{opt.emoji}</span>
                      <div className="flex-1">
                        <p
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '15px',
                            fontWeight: 500,
                            color: 'var(--color-text)',
                          }}
                        >
                          {opt.label}
                        </p>
                        <p
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '13px',
                            color: 'var(--color-text-muted)',
                            marginTop: '2px',
                          }}
                        >
                          {opt.sub}
                        </p>
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
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    fontWeight: 500,
                    color: 'var(--color-text)',
                  }}
                >
                  Check-in Frequency
                </h2>
                <p
                  className="mb-6"
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '15px',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  How often should DHIRA reach out to you?
                </p>

                <div className="flex flex-col gap-3 mb-6">
                  {frequencyOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setProfile((p) => ({ ...p, checkinFrequency: opt.value }))}
                      className="flex items-center gap-4 p-4 rounded-card text-left transition-all duration-200"
                      style={{
                        border: `2px solid ${profile.checkinFrequency === opt.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        backgroundColor:
                          profile.checkinFrequency === opt.value
                            ? 'rgba(239,169,74,0.08)'
                            : 'var(--color-surface-alt)',
                        cursor: 'pointer',
                      }}
                    >
                      <div className="flex-1">
                        <p
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '15px',
                            fontWeight: 500,
                            color: 'var(--color-text)',
                          }}
                        >
                          {opt.label}
                        </p>
                        <p
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '13px',
                            color: 'var(--color-text-muted)',
                            marginTop: '2px',
                          }}
                        >
                          {opt.sub}
                        </p>
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

                {/* Shift rhythm */}
                <div
                  className="flex flex-col gap-3 mb-6 pt-4"
                  style={{ borderTop: '1px solid var(--color-border)' }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--color-text)',
                      }}
                    >
                      When do you usually work?
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '13px',
                        color: 'var(--color-text-subtle)',
                        marginTop: '2px',
                      }}
                    >
                      DHIRA greets you by your rhythm, not the clock. You set this — it is never
                      inferred from your activity.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SHIFT_OPTIONS.map((opt) => {
                      const selected = profile.shift === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setProfile((p) => ({ ...p, shift: opt.key }))}
                          className="flex items-center gap-3 p-3 rounded-control text-left transition-all duration-200"
                          style={{
                            border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            backgroundColor: selected
                              ? 'var(--color-primary-soft)'
                              : 'var(--color-surface-alt)',
                            cursor: 'pointer',
                          }}
                        >
                          <span
                            aria-hidden="true"
                            className="h-4 w-4 flex-shrink-0 rounded-full"
                            style={{
                              border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-text-subtle)'}`,
                              backgroundColor: selected ? 'var(--color-primary)' : 'transparent',
                            }}
                          />
                          <span>
                            <span
                              style={{
                                display: 'block',
                                fontFamily: 'var(--font-ui)',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: selected ? 'var(--color-primary)' : 'var(--color-text)',
                              }}
                            >
                              {opt.label}
                            </span>
                            <span
                              style={{
                                display: 'block',
                                fontFamily: 'var(--font-ui)',
                                fontSize: '12px',
                                color: 'var(--color-text-subtle)',
                              }}
                            >
                              {opt.hint}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notifications & contact */}
                <div
                  className="flex flex-col gap-4 mb-6 pt-4"
                  style={{ borderTop: '1px solid var(--color-border)' }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                    }}
                  >
                    How should DHIRA reach you?
                  </p>
                  {/* Channel selector */}
                  <div className="flex flex-wrap gap-3">
                    {(
                      [
                        { value: 'email', label: 'Email' },
                        { value: 'whatsapp', label: 'WhatsApp' },
                        ...(telegramEnabled
                          ? [{ value: 'telegram' as const, label: 'Telegram' }]
                          : []),
                      ] as { value: NotifyChannel; label: string }[]
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setProfile((p) => ({ ...p, preferredChannel: opt.value }))}
                        className="flex-1 p-3 rounded-control text-left transition-all duration-200"
                        style={{
                          border: `2px solid ${profile.preferredChannel === opt.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          backgroundColor:
                            profile.preferredChannel === opt.value
                              ? 'var(--color-primary-soft)'
                              : 'var(--color-surface-alt)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-ui)',
                          fontSize: '14px',
                          fontWeight: 500,
                          color:
                            profile.preferredChannel === opt.value
                              ? 'var(--color-primary)'
                              : 'var(--color-text-muted)',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {/* Email */}
                  <div>
                    <label
                      htmlFor="pf-email"
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '13px',
                        color: 'var(--color-text-muted)',
                        marginBottom: '6px',
                      }}
                    >
                      Email for check-ins
                    </label>
                    <input
                      id="pf-email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                      placeholder="you@example.com"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-control)',
                        border: '1.5px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface-alt)',
                        color: 'var(--color-text)',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '15px',
                        outline: 'none',
                      }}
                    />
                  </div>
                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="pf-phone"
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '13px',
                        color: 'var(--color-text-muted)',
                        marginBottom: '6px',
                      }}
                    >
                      WhatsApp number (with country code)
                    </label>
                    <input
                      id="pf-phone"
                      type="tel"
                      value={profile.phoneE164}
                      onChange={(e) => setProfile((p) => ({ ...p, phoneE164: e.target.value }))}
                      placeholder="+91 98765 43210"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-control)',
                        border: '1.5px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface-alt)',
                        color: 'var(--color-text)',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '15px',
                        outline: 'none',
                      }}
                    />
                  </div>
                  {telegramEnabled && (
                    <div
                      className="p-4 rounded-card"
                      style={{
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface-alt)',
                      }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <p
                            style={{
                              fontFamily: 'var(--font-ui)',
                              fontSize: '14px',
                              fontWeight: 600,
                              color: 'var(--color-text)',
                            }}
                          >
                            Telegram
                          </p>
                          <p
                            style={{
                              fontFamily: 'var(--font-ui)',
                              fontSize: '13px',
                              color: 'var(--color-text-muted)',
                              marginTop: '2px',
                            }}
                          >
                            {profile.telegramConnected
                              ? 'Connected — proactive check-ins can reach you here.'
                              : 'Connect your Telegram chat for gentle check-ins.'}
                          </p>
                        </div>
                        {profile.telegramConnected && (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                            style={{
                              fontFamily: 'var(--font-ui)',
                              fontSize: '12px',
                              fontWeight: 500,
                              color: 'var(--color-primary)',
                              backgroundColor: 'var(--color-primary-soft)',
                            }}
                          >
                            <Check size={12} aria-hidden />
                            Connected
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!profile.telegramConnected ? (
                          <button
                            type="button"
                            onClick={() => void handleConnectTelegram()}
                            disabled={telegramBusy}
                            className="btn-primary"
                            style={{ fontSize: '14px', padding: '9px 18px' }}
                          >
                            {telegramBusy ? 'Opening…' : 'Connect Telegram'}
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => void handleTestTelegram()}
                              disabled={telegramBusy}
                              className="btn-ghost"
                              style={{ fontSize: '14px', padding: '9px 18px' }}
                            >
                              Send test message
                            </button>
                            <p
                              style={{
                                flexBasis: '100%',
                                fontFamily: 'var(--font-ui)',
                                fontSize: '12px',
                                color: 'var(--color-text-subtle)',
                                margin: 0,
                              }}
                            >
                              Sends from Dhira to your Telegram chat — it does not open Telegram. Check the Dhira bot chat on your phone.
                            </p>
                            <button
                              type="button"
                              onClick={() => void handleDisconnectTelegram()}
                              disabled={telegramBusy}
                              className="btn-ghost"
                              style={{
                                fontSize: '14px',
                                padding: '9px 18px',
                                borderColor: 'var(--color-border)',
                              }}
                            >
                              Disconnect
                            </button>
                          </>
                        )}
                      </div>
                      {telegramLinkPending && !profile.telegramConnected && (
                        <p
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '12px',
                            color: 'var(--color-text-subtle)',
                            marginTop: '10px',
                          }}
                        >
                          Waiting for you to tap Start in Telegram…
                        </p>
                      )}
                      {telegramActionMessage && (
                        <p
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '12px',
                            color: 'var(--color-text-muted)',
                            marginTop: '10px',
                          }}
                        >
                          {telegramActionMessage}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Toggles */}
                <div
                  className="flex flex-col gap-4 mb-6 pt-4"
                  style={{ borderTop: '1px solid var(--color-border)' }}
                >
                  {[
                    {
                      key: 'proactiveCheckins',
                      label: 'Proactive check-ins',
                      sub: 'DHIRA reaches out first within your chosen window',
                    },
                    {
                      key: 'memoryEnabled',
                      label: 'Memory',
                      sub: 'DHIRA remembers what you shared last time',
                    },
                    {
                      key: 'emailOptIn',
                      label: 'Email notifications',
                      sub: 'Allow DHIRA to reach you over email',
                    },
                    {
                      key: 'whatsappOptIn',
                      label: 'WhatsApp notifications',
                      sub: 'Allow DHIRA to reach you over WhatsApp',
                    },
                    ...(profile.telegramConnected
                      ? [
                          {
                            key: 'telegramOptIn' as const,
                            label: 'Telegram notifications',
                            sub: 'Allow DHIRA to reach you over Telegram',
                          },
                        ]
                      : []),
                  ].map((toggle) => (
                    <div key={toggle.key} className="flex items-center justify-between gap-4">
                      <div>
                        <p
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '15px',
                            fontWeight: 500,
                            color: 'var(--color-text)',
                          }}
                        >
                          {toggle.label}
                        </p>
                        <p
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '13px',
                            color: 'var(--color-text-muted)',
                            marginTop: '2px',
                          }}
                        >
                          {toggle.sub}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setProfile((p) => ({
                            ...p,
                            [toggle.key]: !p[toggle.key as keyof ProfileData],
                          }))
                        }
                        className="relative flex-shrink-0 transition-all duration-200"
                        style={{
                          width: '44px',
                          height: '24px',
                          borderRadius: '12px',
                          backgroundColor: profile[toggle.key as keyof ProfileData]
                            ? 'var(--color-primary)'
                            : 'var(--color-border)',
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
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    fontWeight: 500,
                    color: 'var(--color-text)',
                  }}
                >
                  Account Settings
                </h2>

                <div className="flex flex-col gap-2">
                  {[
                    {
                      label: 'Change email address',
                      sub: 'Update your login email',
                      action: 'email' as const,
                    },
                    {
                      label: 'Change password',
                      sub: 'Keep your account secure',
                      action: 'password' as const,
                    },
                    {
                      label: 'Export my data',
                      sub: 'Download everything DHIRA knows about you',
                      action: 'export' as const,
                    },
                    {
                      label: 'Privacy settings',
                      sub: 'Control what DHIRA stores',
                      action: 'privacy' as const,
                    },
                    {
                      label: 'Sign out',
                      sub: 'Sign out of DHIRA on this device',
                      action: 'signout' as const,
                    },
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
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor = 'var(--color-primary)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor = 'var(--color-border)')
                      }
                    >
                      <div>
                        <p
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '15px',
                            fontWeight: 500,
                            color: 'var(--color-text)',
                          }}
                        >
                          {item.label}
                        </p>
                        <p
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '13px',
                            color: 'var(--color-text-muted)',
                            marginTop: '2px',
                          }}
                        >
                          {item.sub}
                        </p>
                      </div>
                      <ChevronRight
                        size={16}
                        style={{ color: 'var(--color-text-subtle)', flexShrink: 0 }}
                      />
                    </button>
                  ))}
                </div>

                {/* Danger zone */}
                <div
                  className="mt-8 p-4 rounded-card"
                  style={{
                    border: '1px solid var(--color-crisis)',
                    backgroundColor: 'var(--color-crisis-surface)',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--color-crisis)',
                      marginBottom: '8px',
                    }}
                  >
                    Danger zone
                  </p>
                  <button
                    className="btn-ghost"
                    style={{
                      fontSize: '14px',
                      padding: '8px 16px',
                      borderColor: 'var(--color-crisis)',
                      color: 'var(--color-crisis)',
                    }}
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
