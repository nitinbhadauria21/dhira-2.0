'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  getVoiceSessionSnapshot,
  subscribeVoiceSession,
  type VoiceSessionSnapshot,
} from '@/lib/voiceSessionBridge';

const EMPTY: VoiceSessionSnapshot = {
  toggleCall: () => {},
  isActive: false,
  isStarting: false,
  isConnecting: false,
};

export function useVoiceSession(): VoiceSessionSnapshot {
  const session = useSyncExternalStore(
    subscribeVoiceSession,
    () => getVoiceSessionSnapshot() ?? EMPTY,
    () => EMPTY,
  );

  const toggleCall = useCallback(() => {
    void getVoiceSessionSnapshot()?.toggleCall();
  }, []);

  return { ...session, toggleCall };
}
