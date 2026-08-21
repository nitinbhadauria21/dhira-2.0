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

type BaseProps = {
  id: string;
  label?: string;
  hint?: string;
  required?: boolean;
  /** Hide this language from the list (e.g. main language in second dropdown). */
  excludeValue?: Language | null;
};

type RequiredLanguageProps = BaseProps & {
  allowNone?: false;
  value: Language;
  onChange: (value: Language) => void;
};

type OptionalLanguageProps = BaseProps & {
  allowNone: true;
  value: Language | null;
  onChange: (value: Language | null) => void;
  noneLabel?: string;
};

type Props = RequiredLanguageProps | OptionalLanguageProps;

export default function LanguageSelect(props: Props) {
  const { id, label = 'Preferred language', hint, required, excludeValue } = props;

  const allowNone = props.allowNone === true;
  const noneLabel = allowNone ? (props.noneLabel ?? 'None') : 'None';
  const value = props.value;
  const onChange = props.onChange;

  const selectValue =
    allowNone && (value === null || value === undefined)
      ? ''
      : value === 'hinglish'
        ? 'hinglish'
        : normalizeLanguage(value ?? 'english');

  const options = PREFERRED_LANGUAGE_OPTIONS.filter((opt) => opt.value !== excludeValue);

  return (
    <div>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontFamily: 'var(--font-ui)',
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--color-text-muted)',
          marginBottom: 6,
        }}
      >
        {label}
        {required ? <span style={{ color: 'var(--color-crisis)' }}> *</span> : null}
      </label>
      <select
        id={id}
        value={selectValue}
        onChange={(e) => {
          const raw = e.target.value;
          if (allowNone && raw === '') {
            (onChange as (v: Language | null) => void)(null);
            return;
          }
          (onChange as (v: Language) => void)(normalizeLanguage(raw));
        }}
        style={fieldStyle}
      >
        {allowNone ? <option value="">{noneLabel}</option> : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {!allowNone && value === 'hinglish' ? (
          <option value="hinglish">Hinglish (legacy)</option>
        ) : null}
        {allowNone && value === 'hinglish' && value !== excludeValue ? (
          <option value="hinglish">Hinglish (legacy)</option>
        ) : null}
      </select>
      {hint ? (
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            color: 'var(--color-text-subtle)',
            marginTop: 6,
          }}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
