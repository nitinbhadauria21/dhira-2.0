'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
  requiredMark?: boolean;
  className?: string;
  autoComplete?: string;
  labelRight?: React.ReactNode;
};

/** Password field with accessible show/hide toggle (CalmLink pack). */
export default function PasswordRevealInput({
  id,
  value,
  onChange,
  placeholder = '••••••••',
  label,
  requiredMark = false,
  className = '',
  autoComplete = 'current-password',
  labelRight,
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className={className}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
        <label
          htmlFor={id}
          style={{
            display: 'block',
            fontFamily: 'var(--font-ui)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--color-text-muted)',
          }}
        >
          {label}
          {requiredMark ? <span style={{ color: 'var(--color-crisis)' }}> *</span> : null}
        </label>
        {labelRight}
      </div>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            height: 44,
            padding: '0 46px 0 14px',
            borderRadius: 'var(--radius-control)',
            border: '1.5px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-alt)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-ui)',
            fontSize: '15px',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Hide password' : 'Show password'}
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: show ? 'var(--color-primary)' : 'var(--color-text-subtle)',
            padding: 4,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
