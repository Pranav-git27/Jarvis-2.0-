/**
 * JARVIS 2.0 — Speech Recognition Hook (Browser-Native STT)
 *
 * Reusable React hook wrapping the browser-native Web Speech API
 * (`SpeechRecognition` with `webkitSpeechRecognition` fallback) to provide
 * voice-to-text transcription for the current recognition session.
 *
 * Architectural Requirements:
 * - Uses ONLY the browser-native Web Speech API. No third-party packages.
 * - No backend, API, or Gemini interaction. No secrets. No AI logic.
 * - UI-agnostic by design: component integration (CommandBar, orb states,
 *   auto-submit) is intentionally out of scope for this module.
 *
 * Session & Transcript Semantics:
 * - A logical session spans from `startListening()` to `stopListening()`.
 * - `transcript` contains all confirmed final results of the session plus
 *   the current interim (unconfirmed) result; it settles to finals only
 *   once listening ends, and resets on each new `startListening()` call.
 * - The browser engine may end on its own (e.g. silence timeout). While the
 *   user's session is active the engine is restarted automatically, carrying
 *   over already-confirmed results, so `isListening` reflects the session.
 *
 * Implementation Notes:
 * - The project's DOM typings do not include the Web Speech API, so minimal
 *   module-scoped type declarations are defined below (not exported).
 * - All event handlers read/write through refs and state setters only, so no
 *   stale closures can occur across re-renders.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/* Minimal internal Web Speech API type declarations                   */
/* ------------------------------------------------------------------ */

interface SpeechRecognitionAlternative {
  readonly transcript: string;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  readonly [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  readonly [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  readonly error: string;
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  onstart: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognition;

/* ------------------------------------------------------------------ */
/* Constructor resolution: SpeechRecognition + webkitSpeechRecognition */
/* ------------------------------------------------------------------ */

let resolvedConstructor: SpeechRecognitionConstructor | null | undefined;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (resolvedConstructor === undefined) {
    if (typeof window === 'undefined') {
      resolvedConstructor = null;
    } else {
      const win = window as Window & {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      };
      resolvedConstructor = win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
    }
  }
  return resolvedConstructor;
}

/* ------------------------------------------------------------------ */
/* User-friendly messages for known recognition error codes            */
/* ------------------------------------------------------------------ */

const SPEECH_ERROR_MESSAGES: Record<string, string> = {
  'no-speech': 'No speech was detected.',
  'aborted': 'Speech recognition was aborted.',
  'audio-capture': 'No microphone was found. Please connect a microphone.',
  'not-allowed': 'Microphone access was denied. Allow microphone permission to use voice input.',
  'service-not-allowed': 'The speech recognition service is not allowed in this browser.',
  'bad-grammar': 'The speech recognition service reported a grammar error.',
  'language-not-supported': 'The speech recognition language is not supported.',
  'network': 'A network error occurred during speech recognition.',
};

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

export interface UseSpeechRecognitionReturn {
  /** Confirmed final results plus the current interim result for the active session; finals only once listening ends. */
  transcript: string;
  /** Whether a recognition session started via `startListening()` is active. */
  isListening: boolean;
  /**
   * Starts a new recognition session: resets the transcript and any previous
   * error. Safely no-ops when a session is already active. Sets a
   * user-friendly error when the Web Speech API is unavailable.
   */
  startListening: () => void;
  /**
   * Stops the active recognition session and finalizes the transcript.
   * Safely no-ops when no session is active.
   */
  stopListening: () => void;
  /** Whether the browser exposes `SpeechRecognition` or `webkitSpeechRecognition`. */
  isSupported: boolean;
  /** Last user-friendly recognition error message, or null when none occurred. */
  error: string | null;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Active recognition engine instance (null when unsupported or unmounted). */
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  /** User intent: true between startListening() and stopListening(). */
  const shouldListenRef = useRef(false);
  /** Confirmed final results accumulated across the whole logical session. */
  const finalTranscriptRef = useRef('');
  /** Finals confirmed before the current engine (re)start; carried across restarts. */
  const carriedFinalsRef = useRef('');

  const isSupported = getSpeechRecognitionConstructor() !== null;

  useEffect(() => {
    const RecognitionCtor = getSpeechRecognitionConstructor();
    if (!RecognitionCtor) {
      return;
    }

    const recognition = new RecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      // A fresh engine start invalidates any previous transient error.
      setError(null);
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      // Rebuild the engine's own finals from its full results list (robust
      // against resultIndex quirks), then carry over finals confirmed by
      // previous engine runs of the same logical session.
      let engineFinals = '';
      let interimText = '';

      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? '';
        if (result.isFinal) {
          engineFinals += text;
        } else {
          interimText += text;
        }
      }

      finalTranscriptRef.current = carriedFinalsRef.current + engineFinals;
      setTranscript((finalTranscriptRef.current + interimText).trim());
    };

    recognition.onerror = (event) => {
      setError(
        SPEECH_ERROR_MESSAGES[event.error] ?? `Speech recognition error: ${event.error}`
      );
      // Fatal errors end the session: clear the listen intent so the end
      // handler below does not restart into an error loop. 'no-speech' is a
      // routine continuous-mode event and must not end the session.
      if (event.error !== 'no-speech') {
        shouldListenRef.current = false;
      }
    };

    recognition.onend = () => {
      // Drop any unconfirmed interim text; only finals remain.
      setTranscript(finalTranscriptRef.current.trim());

      if (shouldListenRef.current) {
        // The engine ended on its own (e.g. silence timeout) while the user's
        // session is still active: carry over confirmed finals and restart.
        carriedFinalsRef.current = finalTranscriptRef.current;
        try {
          recognition.start();
          return; // onstart re-confirms the listening state.
        } catch {
          // Restart rejected (engine not fully stopped): end the session so
          // a later startListening() is not blocked by a stale intent.
          shouldListenRef.current = false;
        }
      }

      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      // Detach handlers first so teardown never dispatches state updates.
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.abort();
      } catch {
        // Engine already stopped; nothing to tear down.
      }
      recognitionRef.current = null;
      shouldListenRef.current = false;
      setIsListening(false);
    };
  }, []);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    if (shouldListenRef.current) {
      return; // Session already active.
    }

    // Begin a fresh logical session.
    shouldListenRef.current = true;
    setError(null);
    finalTranscriptRef.current = '';
    carriedFinalsRef.current = '';
    setTranscript('');

    try {
      recognition.start();
    } catch {
      // Engine is still winding down from a previous stop; the end handler
      // will restart it because the listen intent is already set.
    }

    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || !shouldListenRef.current) {
      return; // No active session.
    }

    shouldListenRef.current = false;

    try {
      recognition.stop();
    } catch {
      // Engine not running; the end state is reconciled by onend.
    }

    setIsListening(false);
  }, []);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    isSupported,
    error,
  };
}
