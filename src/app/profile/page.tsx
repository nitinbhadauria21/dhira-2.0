'use client';

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import AppLayout from '@/components/AppLayout';
import DhiraAvatar from '@/components/DhiraAvatar';
import { User, Globe, Bell, Shield, ChevronRight, Check } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


type Language = 'english' | 'hinglish';
type CheckinFrequency = 'daily' | 'every-other-day' | 'weekly';

interface ProfileData {
  alias: string;
  language: Language;
  checkinFrequency: CheckinFrequency;
  proactiveCheckins: boolean;
  memoryEnabled: boolean;
}

function ProfileContent() {
  const [profile, setProfile] = useState<ProfileData>({
    alias: 'Friend',
    language: 'hinglish',
    checkinFrequency: 'daily',
    proactiveCheckins: true,
    memoryEnabled: true,
  });
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('profile');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAlias = localStorage.getItem('dhira-alias');
      const storedLang = localStorage.getItem('dhira-language') as Language | null;
      if (storedAlias) setProfile((p) => ({ ...p, alias: storedAlias }));
      if (storedLang) setProfile((p) => ({ ...p, language: storedLang }));
    }
  }, []);

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dhira-alias', profile.alias);
      localStorage.setItem('dhira-language', profile.language);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'checkins', label: 'Check-ins', icon: Bell },
    { id: 'account', label: 'Account', icon: Shield },
  ];

  const frequencyOptions: { value: CheckinFrequency; label: string; sub: string }[] = [
    { value: 'daily', label: 'Daily', sub: 'Dhira checks in every day' },
    { value: 'every-other-day', label: 'Every other day', sub: 'A gentle rhythm, every 2 days' },
    { value: 'weekly', label: 'Weekly', sub: 'Once a week, your pace' },
  ];

  return (
    <div className="max-w-screen-lg mx-auto px-6 lg:px-10 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px, 3vw, 32px)',
            fontWeight: 500,
            color: 'var(--color-text)',
          }}
        >
          Profile &amp; Settings
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
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
                {saved ? 'Saved!' : 'Save preference'}
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

              {/* Toggles */}
              <div className="flex flex-col gap-4 mb-6 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                {[
                  { key: 'proactiveCheckins', label: 'Proactive check-ins', sub: 'Dhira reaches out first within your chosen window' },
                  { key: 'memoryEnabled', label: 'Memory', sub: 'Dhira remembers what you shared last time' },
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
                {saved ? 'Saved!' : 'Save preferences'}
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
                  { label: 'Change email address', sub: 'Update your login email' },
                  { label: 'Change password', sub: 'Keep your account secure' },
                  { label: 'Export my data', sub: 'Download everything Dhira knows about you' },
                  { label: 'Privacy settings', sub: 'Control what Dhira stores' },
                ].map((item) => (
                  <button
                    key={item.label}
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
