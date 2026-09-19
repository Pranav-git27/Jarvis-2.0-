/**
 * JARVIS 2.0 — Procedural Sci-Fi SFX Engine (Browser-Native Web Audio)
 *
 * Reusable, UI-agnostic sound synthesizer built exclusively on the browser
 * Web Audio API. No audio assets (MP3/WAV), no third-party packages.
 *
 * Architectural Requirements:
 * - Lazily shares a single AudioContext across all sounds (no per-play
 *   context creation). Nothing is created — and nothing autoplays — on import.
 * - Tolerates browsers where AudioContext starts `suspended` until user
 *   interaction: each play call fire-and-forgets a resume attempt.
 * - All sounds are short, lightweight, and non-blocking with gain envelopes
 *   (no clicks/pops) and node cleanup after playback.
 * - No global event listeners. No persistence, volume, mute, or UI wiring
 *   (those belong to later chunks).
 * - Play functions never throw: unsupported environments or Web Audio
 *   failures degrade silently.
 */

import type { OrbState } from '../components/ParticleBlob';

/* ------------------------------------------------------------------ */
/* Shared lazy AudioContext                                            */
/* ------------------------------------------------------------------ */

let sharedContext: AudioContext | null = null;

interface WindowWithWebkitAudio {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }
  if (sharedContext) {
    return sharedContext;
  }
  try {
    const win = window as unknown as WindowWithWebkitAudio;
    const Ctor = win.AudioContext ?? win.webkitAudioContext ?? null;
    if (!Ctor) {
      return null;
    }
    sharedContext = new Ctor();
    return sharedContext;
  } catch {
    return null;
  }
}

function ensureRunning(ctx: AudioContext): void {
  try {
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {
        // Resume requires user interaction; stay silent until then.
      });
    }
  } catch {
    // Ignore resume failures; scheduled tones simply stay silent.
  }
}

/* ------------------------------------------------------------------ */
/* Core tone primitive                                                 */
/* ------------------------------------------------------------------ */

interface ToneOptions {
  /** Start frequency in Hz. */
  frequency: number;
  /** Optional end frequency in Hz for a pitch sweep. */
  frequencyEnd?: number;
  /** Oscillator waveform. */
  type: OscillatorType;
  /** Audible duration in seconds (excluding the small stop tail). */
  duration: number;
  /** Envelope peak gain (keep subtle: ~0.03–0.09). */
  peakGain: number;
  /** Delay in seconds before the tone starts. */
  delay?: number;
}

function scheduleTone(options: ToneOptions): void {
  const ctx = getAudioContext();
  if (!ctx) {
    return;
  }
  ensureRunning(ctx);

  const { frequency, frequencyEnd, type, duration, peakGain } = options;
  const delay = options.delay ?? 0;

  try {
    const t0 = ctx.currentTime + delay;
    const attack = Math.min(0.012, duration / 4);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(1, frequency), t0);
    if (frequencyEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, frequencyEnd), t0 + duration);
    }

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peakGain), t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {
        // Nodes already collected; nothing to clean up.
      }
    };
  } catch {
    // Never let SFX interrupt the app.
  }
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * Futuristic hum marking an orb state transition. Each state has a
 * distinct, subtle signature. Unknown states degrade silently.
 */
export function playStateChange(state: OrbState): void {
  try {
    switch (state) {
      case 'idle':
        scheduleTone({ frequency: 220, type: 'sine', duration: 0.18, peakGain: 0.06 });
        break;
      case 'listening':
        scheduleTone({ frequency: 740, type: 'sine', duration: 0.09, peakGain: 0.07 });
        scheduleTone({ frequency: 988, type: 'sine', duration: 0.12, peakGain: 0.07, delay: 0.07 });
        break;
      case 'thinking':
        scheduleTone({ frequency: 280, frequencyEnd: 520, type: 'triangle', duration: 0.22, peakGain: 0.05 });
        break;
      case 'speaking':
        scheduleTone({ frequency: 440, frequencyEnd: 660, type: 'sine', duration: 0.14, peakGain: 0.06 });
        break;
      case 'searching':
        scheduleTone({ frequency: 600, frequencyEnd: 1200, type: 'sine', duration: 0.18, peakGain: 0.05 });
        break;
      case 'completed':
        scheduleTone({ frequency: 523.25, type: 'sine', duration: 0.14, peakGain: 0.07 });
        scheduleTone({ frequency: 784, type: 'sine', duration: 0.2, peakGain: 0.07, delay: 0.09 });
        break;
    }
  } catch {
    // Silent fallback; SFX must never break state transitions.
  }
}

/** Sharp glass-like UI click for button presses. */
export function playClick(): void {
  try {
    scheduleTone({ frequency: 1600, frequencyEnd: 1100, type: 'sine', duration: 0.06, peakGain: 0.08 });
  } catch {
    // Silent fallback.
  }
}

/** Bright two-note trigger chime for voice listening start. */
export function playChime(): void {
  try {
    scheduleTone({ frequency: 880, type: 'sine', duration: 0.12, peakGain: 0.07 });
    scheduleTone({ frequency: 1318.5, type: 'sine', duration: 0.18, peakGain: 0.05, delay: 0.08 });
  } catch {
    // Silent fallback.
  }
}

/** Soft upward blip confirming the user message was sent. */
export function playMessageSent(): void {
  try {
    scheduleTone({ frequency: 520, frequencyEnd: 880, type: 'triangle', duration: 0.12, peakGain: 0.06 });
  } catch {
    // Silent fallback.
  }
}

/** Soft downward reply tone signalling a JARVIS response arrived. */
export function playMessageReceived(): void {
  try {
    scheduleTone({ frequency: 880, frequencyEnd: 620, type: 'sine', duration: 0.14, peakGain: 0.06 });
    scheduleTone({ frequency: 1244, type: 'sine', duration: 0.1, peakGain: 0.03, delay: 0.02 });
  } catch {
    // Silent fallback.
  }
}
