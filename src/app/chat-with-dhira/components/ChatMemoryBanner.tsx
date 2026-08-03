'use client';

import React, { useEffect, useState } from 'react';

interface Memory {
  summary: string;
  carryForward: string;
}

export default function ChatMemoryBanner() {
  const [memory, setMemory] = useState<Memory | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/memory');
        const data = await res.json();
        if (!cancelled && data?.memory?.summary) {
          setMemory({ summary: data.memory.summary, carryForward: data.memory.carryForward });
        } else if (!cancelled) {
          setMemory(null);
        }
      } catch {
        if (!cancelled) setMemory(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!memory) return null;

  return (
    <div
      className="memory-banner mx-4 my-3 flex-shrink-0"
      role="note"
      aria-label="Memory from last session"
    >
      <div className="flex items-start gap-2">
        <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>🌙</span>
        <div>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-text-subtle)',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              marginBottom: '3px',
            }}
          >
            DHIRA remembers · Yesterday
          </p>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '14px',
              color: 'var(--color-text)',
              lineHeight: 1.55,
            }}
          >
            &ldquo;{memory.summary}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
