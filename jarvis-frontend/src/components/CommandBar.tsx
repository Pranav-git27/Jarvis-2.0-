import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react';
import { Sparkles, Mic, MicOff, Send, Terminal, Search, Cpu, Wrench } from 'lucide-react';
import type { OrbState } from './ParticleBlob';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { playChime } from '../services/sfx';
import './CommandBar.css';

interface CommandBarProps {
  onSendMessage: (msg: string) => void;
  currentState: OrbState;
  onStateChange: (state: OrbState) => void;
}

const ACTION_CHIPS = [
  { label: 'Diagnostics', icon: Cpu, state: 'thinking' as OrbState, prompt: 'Run complete core diagnostic scan.' },
  { label: 'Web Search', icon: Search, state: 'searching' as OrbState, prompt: 'Search the global knowledge network.' },
  { label: 'Optimize', icon: Wrench, state: 'thinking' as OrbState, prompt: 'Optimize current system routines.' },
  { label: 'Voice', icon: Mic, state: 'listening' as OrbState, prompt: 'Initialize voice synthesis mode.' },
];

/**
 * CHUNK 12 — STT silence detection / auto-submit.
 *
 * Voice command UX: after the user stops speaking for this long, the
 * recognized command is treated as complete and auto-submitted through the
 * existing onSendMessage path. Chosen within the required ~1-2s window:
 * long enough to survive natural pauses between words, short enough to
 * feel responsive.
 */
const SILENCE_TIMEOUT_MS = 1500;

export default function CommandBar({ onSendMessage, currentState, onStateChange }: CommandBarProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wasListeningRef = useRef(false);

  // CHUNK 12 refs: silence timer + latest-value mirrors to avoid stale
  // closures inside the setTimeout callback, plus a per-session guard so a
  // voice command can only ever be submitted once.
  const silenceTimerRef = useRef<number | null>(null);
  const transcriptRef = useRef('');
  const isListeningRef = useRef(false);
  const voiceSubmittedRef = useRef(false);
  const callbackRefs = useRef({ onSendMessage, stopListening: () => {} });

  // CHUNK 16 ref: tracks whether a chime was played for the active listening session.
  const listeningChimedRef = useRef(false);

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    isSupported,
    error,
  } = useSpeechRecognition();

  // Keep callback + value mirrors current without re-arming the timer effect.
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    callbackRefs.current = { onSendMessage, stopListening };
  }, [onSendMessage, stopListening]);

  // CHUNK 16 — Voice listening chime SFX.
  // Plays once when voice listening actually starts.
  // Ignored on mount, on explicit stop, and during recognition engine restarts mid-session.
  useEffect(() => {
    if (isListening && !listeningChimedRef.current) {
      listeningChimedRef.current = true;
      playChime();
    } else if (!isListening) {
      listeningChimedRef.current = false;
    }
  }, [isListening]);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current !== null) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // Never leave the silence timer running after unmount.
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current !== null) {
        window.clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };
  }, []);

  // Populate the command input with the live transcript as speech is recognized.
  // Skipped once this voice session has been submitted/cancelled so the
  // trailing onend transcript finalization cannot repopulate an input that
  // was already cleared by a (manual or automatic) send.
  useEffect(() => {
    if (!transcript) {
      return;
    }
    if (voiceSubmittedRef.current) {
      return;
    }
    setInput(transcript);
  }, [transcript]);

  // CHUNK 12 — silence detection. Every confirmed speech update resets the
  // timer; only a full SILENCE_TIMEOUT_MS with no transcript change while
  // the logical session is still active triggers auto-submit. The timer is
  // never armed on an empty transcript, and nothing is submitted when the
  // engine merely restarts mid-session (isListening stays true, so the
  // timer simply keeps waiting for real silence).
  useEffect(() => {
    if (!isListening) {
      return;
    }
    if (!transcript.trim()) {
      return;
    }
    if (voiceSubmittedRef.current) {
      return;
    }

    clearSilenceTimer();
    silenceTimerRef.current = window.setTimeout(() => {
      silenceTimerRef.current = null;
      if (voiceSubmittedRef.current) {
        return;
      }
      if (!isListeningRef.current) {
        return;
      }
      const finalText = transcriptRef.current.trim();
      if (!finalText) {
        return;
      }
      voiceSubmittedRef.current = true;
      callbackRefs.current.stopListening();
      callbackRefs.current.onSendMessage(finalText);
      setInput('');
    }, SILENCE_TIMEOUT_MS);

    return () => {
      clearSilenceTimer();
    };
  }, [transcript, isListening, clearSilenceTimer]);

  // If active speech session ends (e.g. stopped or error), revert orb state if it was set to listening
  useEffect(() => {
    if (wasListeningRef.current && !isListening && currentState === 'listening') {
      onStateChange('idle');
    }
    wasListeningRef.current = isListening;
  }, [isListening, currentState, onStateChange]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    // Manual send wins: cancel any pending voice auto-submit and mark this
    // session consumed so the trailing recognition teardown cannot resubmit.
    clearSilenceTimer();
    voiceSubmittedRef.current = true;
    if (isListening) {
      stopListening();
    }
    onSendMessage(input.trim());
    setInput('');
  };

  const handleChipClick = (chip: typeof ACTION_CHIPS[number]) => {
    // Chip send wins over a pending voice auto-submit (same guard as Enter).
    clearSilenceTimer();
    voiceSubmittedRef.current = true;
    if (isListening) {
      stopListening();
    }
    onStateChange(chip.state);
    onSendMessage(chip.prompt);
  };

  const toggleMic = () => {
    if (!isSupported) return;

    if (isListening) {
      // Intentional manual stop: cancel the silence timer and consume the
      // session so no automatic submission follows the user's explicit stop.
      clearSilenceTimer();
      voiceSubmittedRef.current = true;
      stopListening();
      if (currentState === 'listening') {
        onStateChange('idle');
      }
    } else {
      clearSilenceTimer();
      voiceSubmittedRef.current = false;
      setInput('');
      startListening();
      onStateChange('listening');
    }
  };

  const micTitle = !isSupported
    ? 'Speech recognition is not supported in this browser'
    : error
    ? error
    : isListening
    ? 'Stop Voice Input'
    : 'Start Voice Input';

  const placeholderText = isListening
    ? 'Listening...'
    : error
    ? error
    : 'Ask JARVIS anything...';

  return (
    <div className="command-deck">
      {/* Quick Action Chips */}
      <div className="action-chips">
        {ACTION_CHIPS.map((chip, idx) => {
          const Icon = chip.icon;
          return (
            <button
              key={idx}
              className="chip-btn"
              onClick={() => handleChipClick(chip)}
            >
              <Icon size={11} />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      {/* Futuristic Command Input */}
      <form
        className={`command-bar-form ${isFocused ? 'focused' : ''}`}
        onSubmit={handleSubmit}
        title={error ?? undefined}
      >
        <div className="command-bar-glow" />

        <div className="command-icon">
          {isListening ? (
            <div className="listening-indicator">
              <Sparkles size={16} color="var(--theme-emerald)" />
              <div className="listening-pulse" />
            </div>
          ) : (
            <Terminal size={16} />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          className="command-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholderText}
        />

        <div className="command-actions">
          <button
            type="button"
            className={`mic-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleMic}
            disabled={!isSupported}
            style={!isSupported ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
            title={micTitle}
            aria-label={micTitle}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            {isListening && <div className="mic-ring" />}
          </button>

          <button
            type="submit"
            className={`send-btn ${input.trim() ? 'active' : ''}`}
            disabled={!input.trim()}
            title="Execute Command"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
