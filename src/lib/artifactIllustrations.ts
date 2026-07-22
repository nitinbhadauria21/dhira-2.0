/**
 * Illustrated blob icons from the Claude Standalone landing HTML.
 * Used on Features + How-it-works cards.
 */

export const ILL_BLOBS = [
  'M10 18C14 6 30 2 42 8C54 14 55 32 46 42C37 52 18 54 9 44C0 34 6 30 10 18Z',
  'M8 28C6 14 22 2 36 4C50 6 54 24 48 38C42 52 22 54 12 46C2 38 10 42 8 28Z',
  'M12 8C26 0 46 4 50 18C54 32 44 50 28 50C12 50 2 36 4 24C6 14 8 12 12 8Z',
  'M6 24C4 10 20 0 34 4C48 8 52 26 46 40C40 54 20 54 10 44C0 34 8 38 6 24Z',
];

export const ILL_COLORS: [string, string][] = [
  ['#5A67B8', '#8B93D9'],
  ['#AEA1DA', '#7C6FC4'],
  ['#EFA94A', '#F6C88A'],
  ['#63A183', '#8FBCA4'],
];

export const ILL_GLYPHS: Record<string, string> = {
  ear: '<path d="M22 18c-5 2-8 6-8 11s3 8 7 9"></path><path d="M30 16c6 2 9 7 9 13 0 5-3 9-7 10"></path><circle cx="28" cy="28" r="2.4" fill="#ffffff" stroke="none"></circle>',
  moon: '<path d="M34 18a10 10 0 1 0 0 20 8 8 0 0 1 0-20Z"></path><circle cx="38" cy="18" r="1.6" fill="#ffffff" stroke="none"></circle>',
  chat: '<path d="M18 20h20a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H26l-6 5v-5h-2a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3Z"></path>',
  shield:
    '<path d="M28 16l9 4v7c0 6-4 10-9 12-5-2-9-6-9-12v-7l9-4Z"></path><path d="M24 28l3 3 6-6"></path>',
  person:
    '<circle cx="28" cy="23" r="5"></circle><path d="M18 40c0-5.5 4.5-9 10-9s10 3.5 10 9"></path>',
  clock: '<circle cx="28" cy="28" r="11"></circle><path d="M28 21v7l5 3"></path>',
  chatDots:
    '<path d="M18 20h20a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H26l-6 5v-5h-2a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3Z"></path><circle cx="24" cy="27" r="1.2" fill="#ffffff" stroke="none"></circle><circle cx="28" cy="27" r="1.2" fill="#ffffff" stroke="none"></circle><circle cx="32" cy="27" r="1.2" fill="#ffffff" stroke="none"></circle>',
  pulse: '<path d="M16 28h6l3-8 4 16 3-8h8"></path>',
  incognito:
    '<path d="M16 26c3-4 8-6 12-6s9 2 12 6"></path><circle cx="21" cy="28" r="3"></circle><circle cx="35" cy="28" r="3"></circle><path d="M24 28h8"></path>',
  lock: '<rect x="19" y="26" width="18" height="14" rx="3"></rect><path d="M23 26v-4a5 5 0 0 1 10 0v4"></path>',
  sliders:
    '<line x1="18" y1="20" x2="38" y2="20"></line><circle cx="26" cy="20" r="2.2" fill="#ffffff" stroke="none"></circle><line x1="18" y1="28" x2="38" y2="28"></line><circle cx="32" cy="28" r="2.2" fill="#ffffff" stroke="none"></circle><line x1="18" y1="36" x2="38" y2="36"></line><circle cx="22" cy="36" r="2.2" fill="#ffffff" stroke="none"></circle>',
  heart:
    '<path d="M28 38s-10-6-10-14a6 6 0 0 1 10-4 6 6 0 0 1 10 4c0 8-10 14-10 14Z"></path>',
};

/** Returns an SVG markup string for a 56×56 blob icon. */
export function illIconSvg(uid: string, glyphKey: string, variant: number): string {
  const glyphSvg = ILL_GLYPHS[glyphKey] ?? ILL_GLYPHS.chat;
  const blob = ILL_BLOBS[variant % ILL_BLOBS.length];
  const [c1, c2] = ILL_COLORS[variant % ILL_COLORS.length];
  return `<svg width="100%" height="100%" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="ill-${uid}" x1="0" y1="0" x2="56" y2="56"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><path d="${blob}" fill="url(#ill-${uid})"/><g stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.95">${glyphSvg}</g></svg>`;
}
