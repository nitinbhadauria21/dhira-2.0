'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ThemeProvider } from '@/components/ThemeProvider';

const sections = [
  { id: 'terms', label: 'Terms of Use' },
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'safety', label: 'Safety Guidelines' },
];

function TermsContent() {
  const [active, setActive] = useState('terms');

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Background blobs */}
      <div
        className="absolute top-0 right-1/4 pointer-events-none"
        style={{
          width: '700px',
          height: '600px',
          background: 'radial-gradient(ellipse 55% 60% at 55% 40%, rgba(174, 161, 218, 0.12) 0%, rgba(90, 103, 184, 0.05) 50%, transparent 70%)',
          filter: 'blur(45px)',
          borderRadius: '50% 50% 45% 55% / 55% 45% 50% 50%',
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{
          width: '500px',
          height: '450px',
          background: 'radial-gradient(ellipse 60% 55% at 40% 60%, rgba(239, 169, 74, 0.09) 0%, transparent 65%)',
          filter: 'blur(55px)',
          borderRadius: '55% 45% 40% 60% / 45% 55% 50% 50%',
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      {/* SVG decorations */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
        style={{ zIndex: 0, opacity: 0.10 }}
      >
        <defs>
          <pattern id="terms-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#terms-grid)" />
        <path
          d="M 0 120 Q 400 60 800 120 Q 1100 170 1440 110"
          fill="none"
          stroke="var(--color-lavender)"
          strokeWidth="1.2"
          opacity="0.25"
          strokeDasharray="7 16"
        />
        <ellipse cx="80" cy="200" rx="22" ry="14" fill="var(--color-lavender)" opacity="0.10" transform="rotate(-20, 80, 200)" />
        <ellipse cx="1360" cy="180" rx="18" ry="11" fill="var(--color-accent)" opacity="0.10" transform="rotate(15, 1360, 180)" />
      </svg>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '22px',
              letterSpacing: '-0.03em',
              color: 'var(--color-text)',
              textDecoration: 'none',
            }}
          >
            Dhira
          </Link>
          <h1
            className="mt-6 mb-3"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '36px',
              fontWeight: 600,
              color: 'var(--color-text)',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            Legal & Safety
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '16px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            Last updated: July 2026 · Effective immediately upon account creation
          </p>
        </div>

        {/* Tab nav */}
        <div
          className="flex gap-2 mb-8 p-1 rounded-control"
          style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', display: 'inline-flex' }}
        >
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '14px',
                fontWeight: active === s.id ? 600 : 400,
                padding: '8px 18px',
                borderRadius: 'calc(var(--radius-control) - 4px)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: active === s.id ? 'var(--color-surface)' : 'transparent',
                color: active === s.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                boxShadow: active === s.id ? 'var(--shadow-card)' : 'none',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Content card */}
        <div className="dhira-card p-8 md:p-10">
          {active === 'terms' && <TermsSection />}
          {active === 'privacy' && <PrivacySection />}
          {active === 'safety' && <SafetySection />}
        </div>

        {/* Back to sign-up */}
        <div className="mt-8 text-center">
          <Link
            href="/sign-up"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '14px',
              color: 'var(--color-primary)',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            ← Back to sign-up
          </Link>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: '22px',
        fontWeight: 600,
        color: 'var(--color-text)',
        marginBottom: '10px',
        marginTop: '32px',
        lineHeight: 1.25,
      }}
    >
      {children}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '15px',
        fontWeight: 600,
        color: 'var(--color-text)',
        marginBottom: '6px',
        marginTop: '20px',
      }}
    >
      {children}
    </h3>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '15px',
        color: 'var(--color-text-muted)',
        lineHeight: 1.7,
        marginBottom: '12px',
      }}
    >
      {children}
    </p>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '15px',
            color: 'var(--color-text-muted)',
            lineHeight: 1.7,
            marginBottom: '6px',
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function Divider() {
  return <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '28px 0' }} />;
}

function TermsSection() {
  return (
    <div>
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-control mb-6"
        style={{ backgroundColor: 'var(--color-primary-soft)', border: '1px solid var(--color-primary)', opacity: 0.9 }}
      >
        <span style={{ fontSize: '13px', fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--color-primary)' }}>
          Terms of Use
        </span>
      </div>

      <Para>
        Welcome to Dhira. By creating an account or using any part of the Dhira platform ("Service"), you agree to be bound by these Terms of Use. Please read them carefully before proceeding.
      </Para>

      <SectionHeading>1. Who We Are</SectionHeading>
      <Para>
        Dhira is a private, anonymous mental-wellness companion designed for users in India. We provide a conversational AI experience to help you reflect, process emotions, and build healthy habits. Dhira is <strong>not</strong> a licensed mental-health service, therapist, or crisis intervention platform.
      </Para>

      <SectionHeading>2. Eligibility</SectionHeading>
      <Para>You must be at least 13 years old to use Dhira. By creating an account, you confirm that:</Para>
      <BulletList items={[
        'You are 13 years of age or older.',
        'If you are under 18, you have obtained parental or guardian consent.',
        'You are not prohibited from using the Service under applicable law.',
      ]} />

      <SectionHeading>3. Your Account</SectionHeading>
      <SubHeading>3.1 Alias, Not Identity</SubHeading>
      <Para>
        Dhira is designed for anonymity. You create an alias — not your real name. We do not require, and strongly discourage, sharing personally identifiable information within your conversations.
      </Para>
      <SubHeading>3.2 Account Security</SubHeading>
      <Para>
        You are responsible for maintaining the confidentiality of your login credentials. Notify us immediately at support@dhira.app if you suspect unauthorized access to your account.
      </Para>

      <SectionHeading>4. Acceptable Use</SectionHeading>
      <Para>You agree not to use Dhira to:</Para>
      <BulletList items={[
        'Harass, threaten, or harm any person.',
        'Share content that is illegal, defamatory, or violates third-party rights.',
        'Attempt to reverse-engineer, scrape, or exploit the platform.',
        'Impersonate Dhira staff or other users.',
        'Use the Service for commercial purposes without written consent.',
      ]} />

      <SectionHeading>5. Nature of the Service</SectionHeading>
      <Para>
        Dhira is a <strong>listening companion</strong>, not a substitute for professional mental-health care. Conversations with Dhira are AI-generated and should not be treated as medical advice, diagnosis, or therapy. If you are experiencing a mental-health crisis, please contact a licensed professional or call Tele-MANAS at <strong>14416</strong> (free, 24×7, India).
      </Para>

      <SectionHeading>6. Intellectual Property</SectionHeading>
      <Para>
        All content, design, and technology within Dhira is owned by or licensed to Dhira and protected by applicable intellectual property laws. You retain ownership of content you create; by submitting it, you grant Dhira a limited, non-exclusive licence to use it to provide and improve the Service.
      </Para>

      <SectionHeading>7. Limitation of Liability</SectionHeading>
      <Para>
        To the maximum extent permitted by law, Dhira and its team shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. The Service is provided "as is" without warranties of any kind.
      </Para>

      <SectionHeading>8. Changes to These Terms</SectionHeading>
      <Para>
        We may update these Terms from time to time. We will notify you via in-app notice or email. Continued use of Dhira after changes constitutes acceptance of the revised Terms.
      </Para>

      <SectionHeading>9. Governing Law</SectionHeading>
      <Para>
        These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India.
      </Para>

      <Divider />
      <Para>
        Questions? Write to us at <span style={{ color: 'var(--color-primary)' }}>legal@dhira.app</span>
      </Para>
    </div>
  );
}

function PrivacySection() {
  return (
    <div>
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-control mb-6"
        style={{ backgroundColor: 'rgba(99, 161, 131, 0.12)', border: '1px solid var(--color-sage)' }}
      >
        <span style={{ fontSize: '13px', fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--color-sage)' }}>
          Privacy Policy
        </span>
      </div>

      <Para>
        Your privacy is the foundation of Dhira. This policy explains what data we collect, why we collect it, and how we protect it. We believe in radical transparency — no hidden clauses, no data brokering.
      </Para>

      <SectionHeading>1. Our Privacy Promise</SectionHeading>
      <Para>
        Dhira is built on three non-negotiable principles:
      </Para>
      <BulletList items={[
        '🔒 No real name required — your alias is your identity on Dhira.',
        '🚫 We never sell your data to third parties, advertisers, or data brokers.',
        '🎚️ You control your data — delete it anytime, instantly and permanently.',
      ]} />

      <SectionHeading>2. Information We Collect</SectionHeading>
      <SubHeading>2.1 Information You Provide</SubHeading>
      <BulletList items={[
        'Your alias (chosen by you, not your real name).',
        'Email address (used only for account recovery and critical notifications).',
        'Conversation content with Dhira (stored encrypted, accessible only to you).',
        'Mood check-ins and journal entries you choose to save.',
      ]} />
      <SubHeading>2.2 Information Collected Automatically</SubHeading>
      <BulletList items={[
        'Device type and operating system (for compatibility).',
        'App usage patterns (e.g., session frequency) — anonymised and aggregated.',
        'Crash reports and error logs (no conversation content included).',
      ]} />
      <SubHeading>2.3 Information We Do NOT Collect</SubHeading>
      <BulletList items={[
        'Your real name, phone number, or government ID.',
        'Location data.',
        'Contacts, camera, or microphone access.',
        'Browsing history outside Dhira.',
      ]} />

      <SectionHeading>3. How We Use Your Data</SectionHeading>
      <Para>We use your data solely to:</Para>
      <BulletList items={[
        'Provide and personalise the Dhira experience.',
        'Improve AI response quality (using anonymised, aggregated patterns only).',
        'Send you critical service notifications (never marketing without consent).',
        'Comply with legal obligations under Indian law.',
      ]} />

      <SectionHeading>4. Data Storage & Security</SectionHeading>
      <Para>
        All conversation data is encrypted at rest and in transit using AES-256 and TLS 1.3. Our servers are hosted in India. We conduct regular security audits and follow responsible disclosure practices.
      </Para>

      <SectionHeading>5. Data Retention & Deletion</SectionHeading>
      <Para>
        You can delete your account and all associated data at any time from your Profile settings. Deletion is permanent and irreversible within 30 days. Anonymised, aggregated usage statistics may be retained for service improvement.
      </Para>

      <SectionHeading>6. Cookies & Tracking</SectionHeading>
      <Para>
        Dhira uses only essential cookies required for authentication and session management. We do not use advertising cookies, tracking pixels, or third-party analytics that identify you personally.
      </Para>

      <SectionHeading>7. Third-Party Services</SectionHeading>
      <Para>
        We use a limited set of trusted third-party services (e.g., cloud infrastructure, AI model providers). These providers are contractually bound to process your data only as directed by Dhira and never for their own purposes.
      </Para>

      <SectionHeading>8. Your Rights</SectionHeading>
      <Para>Under applicable Indian data protection law, you have the right to:</Para>
      <BulletList items={[
        'Access the personal data we hold about you.',
        'Correct inaccurate data.',
        'Request deletion of your data.',
        'Object to or restrict certain processing.',
        'Data portability (export your conversations).',
      ]} />
      <Para>
        To exercise these rights, contact us at <span style={{ color: 'var(--color-primary)' }}>privacy@dhira.app</span>
      </Para>

      <SectionHeading>9. Children's Privacy</SectionHeading>
      <Para>
        Dhira is not directed at children under 13. If we become aware that a child under 13 has provided personal data without parental consent, we will delete it promptly.
      </Para>

      <SectionHeading>10. Changes to This Policy</SectionHeading>
      <Para>
        We will notify you of material changes via in-app notice at least 14 days before they take effect.
      </Para>

      <Divider />
      <Para>
        Privacy questions? Write to <span style={{ color: 'var(--color-primary)' }}>privacy@dhira.app</span>
      </Para>
    </div>
  );
}

function SafetySection() {
  return (
    <div>
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-control mb-6"
        style={{ backgroundColor: 'var(--color-crisis-surface)', border: '1px solid var(--color-crisis)' }}
      >
        <span style={{ fontSize: '13px', fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--color-crisis)' }}>
          Safety Guidelines
        </span>
      </div>

      {/* Crisis banner */}
      <div
        className="p-5 rounded-card mb-8"
        style={{ backgroundColor: 'var(--color-crisis-surface)', border: '1.5px solid var(--color-crisis)' }}
      >
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', fontWeight: 600, color: 'var(--color-crisis)', marginBottom: '6px' }}>
          🕊️ In immediate danger or crisis?
        </p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 600, color: 'var(--color-crisis)' }}>
          Call Tele-MANAS: 14416
        </p>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-crisis)', opacity: 0.85, marginTop: '4px' }}>
          Free · 24×7 · Available across India · Multilingual support
        </p>
      </div>

      <Para>
        Dhira is a safe space — but it is not a crisis service. These guidelines explain how we keep you safe, what Dhira can and cannot do, and what to do if you or someone you know needs urgent help.
      </Para>

      <SectionHeading>1. What Dhira Is</SectionHeading>
      <Para>
        Dhira is an AI-powered emotional companion designed to help you reflect, process feelings, and build mental wellness habits. It is available any time, speaks Hinglish, and is completely private.
      </Para>

      <SectionHeading>2. What Dhira Is Not</SectionHeading>
      <BulletList items={[
        '❌ Not a licensed therapist or psychiatrist.',
        '❌ Not a crisis hotline or emergency service.',
        '❌ Not a substitute for professional mental-health treatment.',
        '❌ Not able to diagnose mental-health conditions.',
        '❌ Not able to prescribe or recommend medication.',
      ]} />

      <SectionHeading>3. Crisis Detection & Escalation</SectionHeading>
      <Para>
        Dhira monitors conversations for signals of acute distress, self-harm ideation, or suicidal thoughts. When detected:
      </Para>
      <BulletList items={[
        'Dhira will pause the conversation and surface crisis resources immediately.',
        'You will be prompted to contact Tele-MANAS (14416) or iCall (9152987821).',
        'No conversation content is shared with third parties without your explicit consent, except where required by law to prevent imminent harm.',
      ]} />

      <SectionHeading>4. Emergency Contacts in India</SectionHeading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        {[
          { name: 'Tele-MANAS', number: '14416', desc: 'National mental health helpline · Free · 24×7' },
          { name: 'iCall', number: '9152987821', desc: 'TISS counselling · Mon–Sat, 8am–10pm' },
          { name: 'Vandrevala Foundation', number: '1860-2662-345', desc: 'Crisis support · 24×7' },
          { name: 'AASRA', number: '9820466627', desc: 'Suicide prevention · 24×7' },
        ].map((c) => (
          <div
            key={c.name}
            className="p-4 rounded-control"
            style={{ backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}
          >
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '2px' }}>{c.name}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: 'var(--color-crisis)' }}>{c.number}</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '2px' }}>{c.desc}</p>
          </div>
        ))}
      </div>

      <SectionHeading>5. Community Standards</SectionHeading>
      <Para>To keep Dhira safe for everyone, users must not:</Para>
      <BulletList items={[
        'Share content that glorifies self-harm, suicide, or violence.',
        'Attempt to manipulate Dhira into providing harmful advice.',
        'Use Dhira to harass or target other individuals.',
        'Share content involving minors in any harmful context.',
      ]} />
      <Para>
        Violations may result in immediate account suspension and, where legally required, reporting to relevant authorities.
      </Para>

      <SectionHeading>6. Reporting a Safety Concern</SectionHeading>
      <Para>
        If you encounter content or behaviour that feels unsafe, please contact us immediately at <span style={{ color: 'var(--color-crisis)' }}>safety@dhira.app</span>. We take all reports seriously and respond within 24 hours.
      </Para>

      <SectionHeading>7. Self-Care Reminders</SectionHeading>
      <Para>
        Dhira encourages healthy boundaries with technology too. We recommend:
      </Para>
      <BulletList items={[
        'Taking breaks from the app when you feel overwhelmed.',
        'Supplementing Dhira with real-world support — friends, family, or a counsellor.',
        'Using the mood tracker to notice patterns over time, not just in the moment.',
        'Reaching out to a professional if you feel your needs exceed what Dhira can offer.',
      ]} />

      <Divider />
      <Para>
        Safety concerns? Contact <span style={{ color: 'var(--color-crisis)' }}>safety@dhira.app</span> · We respond within 24 hours.
      </Para>
    </div>
  );
}

export default function TermsPage() {
  return (
    <ThemeProvider>
      <TermsContent />
    </ThemeProvider>
  );
}
