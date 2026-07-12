import React from 'react';

interface DhiraAvatarProps {
  size?: number;
  variant?: 'softer' | 'steadier';
  pulse?: boolean;
}

export default function DhiraAvatar({ size = 40, variant = 'softer', pulse = false }: DhiraAvatarProps) {
  const innerSize = size * 0.55;

  return (
    <div
      className={`relative flex-shrink-0 flex items-center justify-center rounded-full ${pulse ? 'pulse-amber' : ''}`}
      style={{
        width: size,
        height: size,
        background: variant === 'softer' ?'linear-gradient(135deg, var(--color-lavender), var(--color-primary))' :'linear-gradient(135deg, var(--color-primary), #3d4a9e)',
        boxShadow: pulse ? '0 0 20px rgba(239, 169, 74, 0.3)' : 'none',
      }}
      aria-label="Dhira avatar"
    >
      {/* Abstract face — gentle non-human */}
      <svg
        width={innerSize}
        height={innerSize}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        {/* Outer arc — listening shape */}
        <path
          d="M4 12 C4 7.6 7.6 4 12 4 C16.4 4 20 7.6 20 12"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Two gentle eye dots */}
        <circle cx="9" cy="13" r="1.2" fill="rgba(255,255,255,0.85)" />
        <circle cx="15" cy="13" r="1.2" fill="rgba(255,255,255,0.85)" />
        {/* Amber accent dot — lamp glow */}
        <circle cx="12" cy="18" r="1.5" fill="var(--color-accent)" opacity="0.9" />
      </svg>
    </div>
  );
}