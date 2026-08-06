import { useState, useRef, type FormEvent } from 'react';
import { Sparkles, Mic, MicOff, Send, Terminal, Search, Cpu, Wrench } from 'lucide-react';
import type { OrbState } from './ParticleBlob';
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

export default function CommandBar({ onSendMessage, currentState, onStateChange }: CommandBarProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isListening = currentState === 'listening';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleChipClick = (chip: typeof ACTION_CHIPS[number]) => {
    onStateChange(chip.state);
    onSendMessage(chip.prompt);
  };

  const toggleMic = () => {
    if (isListening) {
      onStateChange('idle');
    } else {
      onStateChange('listening');
    }
  };

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
      <form className={`command-bar-form ${isFocused ? 'focused' : ''}`} onSubmit={handleSubmit}>
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
          placeholder={isListening ? "Listening..." : "Ask JARVIS anything..."}
        />

        <div className="command-actions">
          <button
            type="button"
            className={`mic-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleMic}
            title={isListening ? "Stop Voice Input" : "Start Voice Input"}
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
