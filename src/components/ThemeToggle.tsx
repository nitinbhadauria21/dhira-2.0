'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  compact?: boolean;
}

export default function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center rounded-control transition-all duration-200"
        style={{
          width: 36,
          height: 36,
          backgroundColor: 'var(--color-surface-alt)',
          color: 'var(--color-text-muted)',
          border: '1px solid var(--color-border)',
        }}
        aria-label={`Switch to ${theme === 'night' ? 'day' : 'night'} mode`}
      >
        {theme === 'night' ? <Sun size={15} /> : <Moon size={15} />}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 px-4 py-3 rounded-control transition-all duration-200 w-full"
      style={{
        backgroundColor: 'var(--color-surface-alt)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-ui)',
        fontSize: '15px',
      }}
    >
      <span className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
        {theme === 'night' ? <Sun size={16} /> : <Moon size={16} />}
      </span>
      <div className="flex flex-col items-start">
        <span className="font-medium" style={{ fontSize: '15px' }}>
          {theme === 'night' ? 'Night mode' : 'Day mode'}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--color-text-subtle)' }}>
          {theme === 'night' ? 'Switch to day' : 'Switch to night'}
        </span>
      </div>
    </button>
  );
}