'use client';

import { useEffect, useState } from 'react';

/** Hex colors for Recharts — reads live CSS vars so day/night themes both stay on-brand. */
export interface ChartBrand {
  primary: string;
  accent: string;
  sage: string;
  lavender: string;
  border: string;
  text: string;
}

const FALLBACK: ChartBrand = {
  primary: '#5A67B8',
  accent: '#EFA94A',
  sage: '#63A183',
  lavender: '#AEA1DA',
  border: '#E7DFD1',
  text: '#5E5C6E',
};

function readChartBrand(): ChartBrand {
  if (typeof window === 'undefined') return FALLBACK;
  const s = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) => {
    const v = s.getPropertyValue(name).trim();
    return v || fallback;
  };
  return {
    primary: get('--color-primary', FALLBACK.primary),
    accent: get('--color-accent', FALLBACK.accent),
    sage: get('--color-sage', FALLBACK.sage),
    lavender: get('--color-lavender', FALLBACK.lavender),
    border: get('--color-border', FALLBACK.border),
    text: get('--color-text-muted', FALLBACK.text),
  };
}

/** React hook: brand chart colors that update when the theme attribute changes. */
export function useChartBrand(): ChartBrand {
  const [brand, setBrand] = useState<ChartBrand>(FALLBACK);

  useEffect(() => {
    const refresh = () => setBrand(readChartBrand());
    refresh();
    const obs = new MutationObserver(refresh);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  return brand;
}

/** Static mood palette — same 10 colors in day and night (intentional product choice). */
export const MOOD_PALETTE: Record<string, string> = {
  happy: '#F0C46B',
  calm: '#8FBCA4',
  hopeful: '#79C2C4',
  neutral: '#B9B2A4',
  stressed: '#E0A94F',
  anxious: '#8794DA',
  lonely: '#A99BC9',
  overwhelmed: '#9C6B8E',
  sad: '#7089B0',
  angry: '#C56B5C',
};
