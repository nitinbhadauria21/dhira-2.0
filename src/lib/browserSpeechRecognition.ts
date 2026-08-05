/**
 * Browser Web Speech API helper — keeps listening until the user explicitly stops.
 * Chrome ends sessions after pauses unless we restart on `onend`; `continuous: true`
 * alone is not enough for long, thoughtful speech.
 */

export type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
};

export type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      0: { transcript: string };
    };
  };
};

type WindowWithSpeech = Window & {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
};

export function isBrowserSpeechRecognitionAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as WindowWithSpeech;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function createSpeechRecognition(): SpeechRecognitionInstance | null {
  if (typeof window === 'undefined') return null;
  const w = window as WindowWithSpeech;
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Ctor) return null;
  const recognition = new Ctor();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-IN';
  return recognition;
}

export type ContinuousSpeechSession = {
  stop: () => void;
};

/**
 * Start open-ended dictation. Call `stop()` when the user taps Stop / Speak again.
 */
export function startContinuousSpeechRecognition(options: {
  onUpdate: (text: string, interim: string) => void;
  onFatalError?: (message: string) => void;
}): ContinuousSpeechSession | null {
  const recognition = createSpeechRecognition();
  if (!recognition) return null;

  let manualStop = false;
  let restartTimer: ReturnType<typeof setTimeout> | null = null;
  const finalParts: string[] = [];

  const clearRestartTimer = () => {
    if (restartTimer) {
      clearTimeout(restartTimer);
      restartTimer = null;
    }
  };

  const emit = (interim: string) => {
    const committed = finalParts.join(' ').trim();
    const combined = [committed, interim.trim()].filter(Boolean).join(' ').trim();
    options.onUpdate(combined, interim);
  };

  const scheduleRestart = () => {
    if (manualStop) return;
    clearRestartTimer();
    restartTimer = setTimeout(() => {
      if (manualStop) return;
      try {
        recognition.start();
      } catch {
        /* already started — ignore */
      }
    }, 120);
  };

  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const piece = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalParts.push(piece.trim());
      } else {
        interim += piece;
      }
    }
    emit(interim);
  };

  recognition.onerror = (event) => {
    const code = event.error;
    if (manualStop || code === 'aborted') return;
    if (code === 'no-speech' || code === 'audio-capture') {
      scheduleRestart();
      return;
    }
    if (code === 'not-allowed') {
      manualStop = true;
      options.onFatalError?.('Microphone permission is needed for Speak.');
      return;
    }
    if (code === 'network') {
      scheduleRestart();
      return;
    }
    options.onFatalError?.('Speech input hit a snag. You can keep typing instead.');
  };

  recognition.onend = () => {
    if (manualStop) return;
    scheduleRestart();
  };

  try {
    recognition.start();
  } catch {
    return null;
  }

  return {
    stop: () => {
      manualStop = true;
      clearRestartTimer();
      try {
        recognition.stop();
      } catch {
        try {
          recognition.abort();
        } catch {
          /* ignore */
        }
      }
    },
  };
}
