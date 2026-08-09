/**
 * Fail-closed vs explicit offline demo policy (definitive fix Step 3).
 */
import type { Language } from '@/lib/types';

export class LiveBrainUnavailableError extends Error {
  constructor(message = 'Live brain unavailable') {
    super(message);
    this.name = 'LiveBrainUnavailableError';
  }
}

/** Explicit demo only — default is fail-closed (production). */
export function allowOfflineDemo(): boolean {
  return process.env.DHIRA_ALLOW_OFFLINE === 'true';
}

export function offlinePolicyLabel(): 'fail_closed' | 'demo_allowed' {
  return allowOfflineDemo() ? 'demo_allowed' : 'fail_closed';
}

export function holdingReply(language: Language): string {
  if (language === 'hinglish') {
    return (
      'Abhi mujhe connect karne mein dikkat aa rahi hai, lekin main tumhe support ke bina nahi chhodna chahta. ' +
      'Agar cheezein bhari ya urgent lag rahi hain, please Tele-MANAS par 14416 par call karo (free, 24x7). ' +
      'Jaise hi main wapas aa sakunga, main yahan rahunga.'
    );
  }
  return (
    "I'm having trouble connecting right now, but I don't want to leave you without support. " +
    'If things feel heavy or urgent, please call Tele-MANAS at 14416 (free, 24x7). ' +
    "I'll be back as soon as I can."
  );
}

/** True when offline demo templates may run (local safety suite / explicit demo). */
export function mayUseOfflineDemoTemplates(): boolean {
  return allowOfflineDemo();
}
