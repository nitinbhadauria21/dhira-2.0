import React from 'react';

const MOOD_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  happy:       { bg: '#F0C46B', text: '#241F16', label: 'Happy' },
  calm:        { bg: '#8FBCA4', text: '#241F16', label: 'Calm' },
  hopeful:     { bg: '#79C2C4', text: '#241F16', label: 'Hopeful' },
  neutral:     { bg: '#B9B2A4', text: '#241F16', label: 'Neutral' },
  stressed:    { bg: '#E0A94F', text: '#241F16', label: 'Stressed' },
  anxious:     { bg: '#8794DA', text: '#ffffff', label: 'Anxious' },
  lonely:      { bg: '#A99BC9', text: '#ffffff', label: 'Lonely' },
  overwhelmed: { bg: '#9C6B8E', text: '#ffffff', label: 'Overwhelmed' },
  sad:         { bg: '#7089B0', text: '#ffffff', label: 'Sad' },
  angry:       { bg: '#C56B5C', text: '#ffffff', label: 'Angry' },
};

interface MoodBadgeProps {
  mood: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export default function MoodBadge({ mood, size = 'md', showDot = false }: MoodBadgeProps) {
  const config = MOOD_COLORS[mood] ?? MOOD_COLORS.neutral;

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