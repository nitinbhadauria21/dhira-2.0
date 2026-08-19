export type VoiceSessionSnapshot = {
  toggleCall: () => void | Promise<void>;
  isActive: boolean;
  isStarting: boolean;
  isConnecting: boolean;
};

type Listener = () => void;

let snapshot: VoiceSessionSnapshot | null = null;
const listeners = new Set<Listener>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function registerVoiceSession(next: VoiceSessionSnapshot | null): void {
  snapshot = next;
  notify();
}

export function getVoiceSessionSnapshot(): VoiceSessionSnapshot | null {
  return snapshot;
}

export function subscribeVoiceSession(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
