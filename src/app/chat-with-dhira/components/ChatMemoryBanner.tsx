import React from 'react';

// Mock data — backend: getLatestMemory({ profile_id }) → memory_notes table
const memoryNote = {
  summary: 'Work has been feeling heavy — feeling invisible in meetings, disconnected from the team.',
  carryForward: 'Check in on whether the invisibility feeling has shifted.',
  sessionAgo: 'Yesterday',
};

export default function ChatMemoryBanner() {
  return (
    <div
      className="memory-banner mx-4 my-3 flex-shrink-0"
      role="note"
      aria-label="Memory from last session"
    >
      <div className="flex items-start gap-2">
        <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>🌙</span>
        <div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-subtle)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '3px' }}>
            Dhira remembers · {memoryNote?.sessionAgo}
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '14px', color: 'var(--color-text)', lineHeight: 1.55 }}>
            {memoryNote?.summary}
          </p>
        </div>
      </div>
    </div>
  );
}