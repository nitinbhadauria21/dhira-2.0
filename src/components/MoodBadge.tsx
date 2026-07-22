import React from 'react';
import { MOOD_COLORS } from '@/lib/artifactDesign';

interface MoodBadgeProps {
  mood: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export default function MoodBadge({ mood, size = 'md', showDot = false }: MoodBadgeProps) {
  const config = MOOD_COLORS[mood as keyof typeof MOOD_COLORS] ?? MOOD_COLORS.neutral;

  const sizeStyles = {
    sm: { fontSize: '12px', padding: '2px 8px', borderRadius: '10px' },
    md: { fontSize: '14px', padding: '4px 12px', borderRadius: '12px' },
    lg: { fontSize: '16px', padding: '6px 16px', borderRadius: '14px' },
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 font-medium"
      style={{
        backgroundColor: config.bg,
        color: config.text,
        fontFamily: 'var(--font-ui)',
        ...sizeStyles[size],
      }}
    >
      {showDot && (
        <span
          className="inline-block rounded-full flex-shrink-0"
          style={{ width: '7px', height: '7px', backgroundColor: config.text, opacity: 0.6 }}
        />
      )}
      {config.label}
    </span>
  );
}

export { MOOD_COLORS };
