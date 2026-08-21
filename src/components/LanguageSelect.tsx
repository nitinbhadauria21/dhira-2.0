'use client';

import React from 'react';
import { PREFERRED_LANGUAGE_OPTIONS, type Language, normalizeLanguage } from '@/lib/languages';

const fieldStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  height: 44,
  padding: '0 14px',
  borderRadius: 'var(--radius-control)',
  border: '1.5px solid var(--color-border)',
  backgroundColor: 'var(--color-surface-alt)',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-ui)',
  fontSize: 15,
  outline: 'none',
};

type Props = {
  id: string;
  value: Language;
  onChange: (value: Language) => void;
  label?: string;
  hint?: string;
  required?: boolean;
};

export default function LanguageSelect({
  id,
  value,
  onChange,
  label = 'Preferred language',
  hint,
  required,
}: Props) {
  const selectValue = value === 'hinglish' ? 'hinglish' : normalizeLanguage(value);

  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 6 }}>
        {label}
        {required ? <span style={{ color: 'var(--color-crisis)' }}> *</span> : null}
      </label>
      <select
        id={id}
        value={selectValue}
        onChange={(e) => onChange(normalizeLanguage(e.target.value))}
        style={fieldStyle}
      >
        {PREFERRED_LANGUAGE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {value === 'hinglish' ? (
          <option value="hinglish">Hinglish (legacy)</option>
        ) : null}
      </select>
      {hint ? (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--color-text-subtle)', marginTop: 6 }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
