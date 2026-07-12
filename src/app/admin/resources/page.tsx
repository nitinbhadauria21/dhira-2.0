'use client';

import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Phone, User, Globe, Edit3, Plus, Check, X, Heart,  } from 'lucide-react';

interface HelplineCard {
  id: string;
  name: string;
  number: string;
  description: string;
  available: string;
  type: 'national' | 'counsellor' | 'ngo';
  active: boolean;
  language: string;
}

const initialCards: HelplineCard[] = [
  {
    id: 'card-001',
    name: 'Tele-MANAS',
    number: '14416',
    description: 'National mental health helpline by the Government of India. Free, confidential, 24/7.',
    available: '24 / 7',
    type: 'national',
    active: true,
    language: 'Hindi, English + 20 regional languages',
  },
  {
    id: 'card-002',
    name: 'iCall',
    number: '9152987821',
    description: 'Psychosocial helpline by TISS. Counselling for emotional distress, relationships, and mental health.',
    available: 'Mon–Sat, 8am–10pm',
    type: 'counsellor',
    active: true,
    language: 'English, Hindi',
  },
  {
    id: 'card-003',
    name: 'Vandrevala Foundation',
    number: '1860-2662-345',
    description: 'Free 24/7 mental health support and crisis intervention.',
    available: '24 / 7',
    type: 'ngo',
    active: true,
    language: 'English, Hindi',
  },
  {
    id: 'card-004',
    name: 'Snehi',
    number: '044-24640050',
    description: 'Emotional support and suicide prevention helpline based in Chennai.',
    available: 'Daily, 8am–10pm',
    type: 'ngo',
    active: false,
    language: 'Tamil, English',
  },
];

const typeColors = {
  national: { bg: 'rgba(90,103,184,0.12)', text: 'var(--color-primary)', label: 'National' },
  counsellor: { bg: 'rgba(99,161,131,0.12)', text: 'var(--color-sage)', label: 'Counsellor' },
  ngo: { bg: 'rgba(174,161,218,0.15)', text: 'var(--color-lavender)', label: 'NGO' },
};

export default function AdminResourcesPage() {
  const [cards, setCards] = useState(initialCards);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<HelplineCard>>({});

  const startEdit = (card: HelplineCard) => {
    setEditingId(card.id);
    setEditDraft({ ...card });
  };

  const saveEdit = () => {
    setCards((prev) =>
      prev.map((c) => (c.id === editingId ? { ...c, ...editDraft } : c))
    );
    setEditingId(null);
    setEditDraft({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };

  const toggleActive = (id: string) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
  };

  const activeCount = cards.filter((c) => c.active).length;

  return (
    <AdminLayout title="Counsellor & Helpline Cards" subtitle="Manage crisis resources shown to users during hand-off">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="dhira-card p-5" style={{ borderLeft: '3px solid var(--color-primary)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 600, color: 'var(--color-primary)', lineHeight: 1 }}>
            {cards.length}
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Total resources
          </p>
        </div>
        <div className="dhira-card p-5" style={{ borderLeft: '3px solid var(--color-sage)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 600, color: 'var(--color-sage)', lineHeight: 1 }}>
            {activeCount}
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Active (shown to users)
          </p>
        </div>
        <div className="dhira-card p-5" style={{ borderLeft: '3px solid var(--color-crisis)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 600, color: 'var(--color-crisis)', lineHeight: 1 }}>
            {cards.length - activeCount}
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Inactive / hidden
          </p>
        </div>
      </div>

      {/* Tele-MANAS highlight */}
      <div
        className="flex items-center gap-4 px-5 py-4 rounded-2xl mb-6"
        style={{ backgroundColor: 'var(--color-crisis-surface)', border: '1px solid rgba(197,107,92,0.25)' }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--color-crisis)', boxShadow: '0 0 16px rgba(197,107,92,0.35)' }}
        >
          <Phone size={18} color="white" />
        </div>
        <div className="flex-1">
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
            Tele-MANAS 14416 — Primary crisis resource
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Always shown first during high-risk hand-off. Government of India · Free · 24/7 · 20+ languages.
          </p>
        </div>
        <span
          className="px-3 py-1 rounded-full text-xs font-medium flex-shrink-0"
          style={{ backgroundColor: 'rgba(99,161,131,0.15)', color: 'var(--color-sage)', fontFamily: 'var(--font-ui)' }}
        >
          Always active
        </span>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {cards.map((card) => {
          const tc = typeColors[card.type];
          const isEditing = editingId === card.id;

          return (
            <div
              key={card.id}
              className="dhira-card p-5 flex flex-col gap-4"
              style={{ opacity: card.active ? 1 : 0.6 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: tc.bg }}
                  >
                    {card.type === 'national' ? (
                      <Globe size={18} style={{ color: tc.text }} />
                    ) : card.type === 'counsellor' ? (
                      <User size={18} style={{ color: tc.text }} />
                    ) : (
                      <Heart size={18} style={{ color: tc.text }} />
                    )}
                  </div>
                  <div>
                    {isEditing ? (
                      <input
                        value={editDraft.name || ''}
                        onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                        className="px-2 py-1 rounded-lg outline-none text-sm font-semibold"
                        style={{
                          backgroundColor: 'var(--color-surface-alt)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text)',
                          fontFamily: 'var(--font-ui)',
                        }}
                      />
                    ) : (
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
                        {card.name}
                      </p>
                    )}
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: tc.bg, color: tc.text, fontFamily: 'var(--font-ui)' }}
                    >
                      {tc.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={saveEdit}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(99,161,131,0.15)', color: 'var(--color-sage)' }}
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-subtle)' }}
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => startEdit(card)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150"
                      style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-subtle)' }}
                    >
                      <Edit3 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Number */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ backgroundColor: 'var(--color-surface-alt)' }}
              >
                <Phone size={14} style={{ color: 'var(--color-text-subtle)' }} />
                {isEditing ? (
                  <input
                    value={editDraft.number || ''}
                    onChange={(e) => setEditDraft((d) => ({ ...d, number: e.target.value }))}
                    className="flex-1 outline-none bg-transparent text-sm font-mono"
                    style={{ color: 'var(--color-text)', fontFamily: 'monospace' }}
                  />
                ) : (
                  <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', letterSpacing: '0.04em' }}>
                    {card.number}
                  </span>
                )}
              </div>

              {/* Description */}
              {isEditing ? (
                <textarea
                  value={editDraft.description || ''}
                  onChange={(e) => setEditDraft((d) => ({ ...d, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl outline-none resize-none text-sm"
                  style={{
                    backgroundColor: 'var(--color-surface-alt)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-ui)',
                  }}
                />
              ) : (
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  {card.description}
                </p>
              )}

              {/* Meta row */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-subtle)' }}>
                    🕐 {card.available}
                  </p>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-subtle)' }}>
                    🌐 {card.language}
                  </p>
                </div>

                {/* Active toggle */}
                {card.id !== 'card-001' && (
                  <button
                    onClick={() => toggleActive(card.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
                    style={{
                      backgroundColor: card.active ? 'rgba(99,161,131,0.12)' : 'var(--color-surface-alt)',
                      color: card.active ? 'var(--color-sage)' : 'var(--color-text-subtle)',
                      border: '1px solid var(--color-border)',
                      fontFamily: 'var(--font-ui)',
                    }}
                  >
                    {card.active ? <Check size={12} /> : <X size={12} />}
                    {card.active ? 'Active' : 'Inactive'}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add new card placeholder */}
        <button
          className="dhira-card p-5 flex flex-col items-center justify-center gap-3 border-dashed transition-all duration-200 min-h-[200px]"
          style={{ borderStyle: 'dashed', opacity: 0.6 }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-surface-alt)' }}
          >
            <Plus size={18} style={{ color: 'var(--color-text-subtle)' }} />
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text-subtle)' }}>
            Add new resource card
          </p>
        </button>
      </div>

      <p
        className="mt-4"
        style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: 'var(--color-text-subtle)' }}
      >
        Changes take effect immediately for new sessions. Tele-MANAS 14416 cannot be deactivated — it is always shown during high-risk hand-off.
      </p>
    </AdminLayout>
  );
}
