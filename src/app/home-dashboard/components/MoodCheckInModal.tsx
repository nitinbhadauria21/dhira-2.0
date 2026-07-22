'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { MOODS_GRID } from '@/lib/artifactDesign';

interface MoodCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const MOODS = MOODS_GRID.map((m) => ({
  key: `mood-${m.id}`,
  id: m.id,
  label: m.label,
  emoji: m.emoji,
  color: m.color,
}));

export default function MoodCheckInModal({ isOpen, onClose, onSaved }: MoodCheckInModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(50);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const selectedMood = MOODS.find((m) => m.id === selected);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: selected, intensity: intensity / 100 }),
      });
      if (!res.ok) throw new Error('save failed');
      toast.success(`${selectedMood?.emoji} ${selectedMood?.label} mood saved`);
      onSaved?.();
    } catch {
      toast.error('Could not save your mood — please try again.');
    } finally {
      setSaving(false);
      onClose();
      setSelected(null);
      setIntensity(50);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="dhira-card w-full max-w-md slide-up"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 500, color: 'var(--color-text)' }}>
              How are you right now?
            </h2>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              No right or wrong answer.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150"
            style={{ backgroundColor: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Mood grid */}
        <div className="p-6">
          <div className="grid grid-cols-5 gap-3 mb-6">
            {MOODS.map((mood) => {
              const isSelected = selected === mood.id;
              return (
                <button
                  key={mood.key}
                  onClick={() => setSelected(mood.id)}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-control transition-all duration-200"
                  style={{
                    backgroundColor: isSelected ? mood.color + '33' : 'var(--color-surface-alt)',
                    border: `2px solid ${isSelected ? mood.color : 'transparent'}`,
                    transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                  }}
                  aria-label={mood.label}
                  aria-pressed={isSelected}
                >
                  <span style={{ fontSize: '22px' }}>{mood.emoji}</span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: isSelected ? 600 : 400, textAlign: 'center', lineHeight: 1.2 }}>
                    {mood.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Intensity slider */}
          {selected && (
            <div className="mb-6 fade-in">
              <div className="flex items-center justify-between mb-3">
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text-muted)' }}>
                  How intense does it feel?
                </p>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text)', fontWeight: 500 }}>
                  {intensity}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: selectedMood?.color ?? 'var(--color-primary)' }}
                aria-label="Mood intensity"
              />
              <div className="flex justify-between mt-1">
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--color-text-subtle)' }}>Gentle</span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--color-text-subtle)' }}>Overwhelming</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="btn-ghost flex-1"
              style={{ fontSize: '15px' }}
            >
              Not now
            </button>
            <button
              onClick={handleSave}
              disabled={!selected || saving}
              className="btn-primary flex-1 justify-center"
              style={{
                fontSize: '15px',
                opacity: !selected ? 0.5 : 1,
                cursor: !selected ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" style={{ animation: 'spin 0.7s linear infinite' }} />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Check size={15} />
                  Save mood
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}