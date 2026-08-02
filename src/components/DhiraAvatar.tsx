import React from 'react';

interface DhiraAvatarProps {
  size?: number;
  variant?: 'softer' | 'steadier';
  pulse?: boolean;
}

/**
 * Small round DHIRA avatar — uses the designer bot_avatar cutout (ASSETS.md).
 * `variant` kept for call-site compatibility; the PNG is the same either way.
 */
export default function DhiraAvatar({ size = 40, variant = 'softer', pulse = false }: DhiraAvatarProps) {
  return (
    <div
      className={`relative flex-shrink-0 rounded-full overflow-hidden ${pulse ? 'pulse-amber' : ''}`}
      style={{
        width: size,
        height: size,
        boxShadow: pulse
          ? '0 0 20px rgba(239, 169, 74, 0.3)'
          : variant === 'steadier'
            ? '0 0 0 2px rgba(174,161,218,0.45)'
            : '0 0 0 2px rgba(174,161,218,0.35)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/illustrations/bot_avatar.png"
        alt="DHIRA"
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          objectFit: 'cover',
          display: 'block',
          borderRadius: '50%',
        }}
      />
    </div>
  );
}
