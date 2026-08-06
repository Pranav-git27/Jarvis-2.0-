import { Brain, Cpu, Globe, Sparkles, Mic, CheckCircle } from 'lucide-react';
import type { OrbState } from './ParticleBlob';
import './StateSelector.css';

export type { OrbState };

interface StateSelectorProps {
  currentState: OrbState;
  onStateChange: (state: OrbState) => void;
}

const STATES: { value: OrbState; label: string; icon: typeof Brain }[] = [
  { value: 'idle', label: 'Idle', icon: Brain },
  { value: 'listening', label: 'Listen', icon: Mic },
  { value: 'thinking', label: 'Think', icon: Cpu },
  { value: 'speaking', label: 'Speak', icon: Sparkles },
  { value: 'searching', label: 'Search', icon: Globe },
  { value: 'completed', label: 'Done', icon: CheckCircle },
];

export default function StateSelector({ currentState, onStateChange }: StateSelectorProps) {
  return (
    <nav className="state-selector" aria-label="Orb State Selector">
      {STATES.map((st) => {
        const IconComponent = st.icon;
        const isActive = currentState === st.value;
        return (
          <button
            key={st.value}
            className={`state-button ${isActive ? 'active' : ''}`}
            onClick={() => onStateChange(st.value)}
            title={`Switch to ${st.label}`}
          >
            <div className="state-icon-wrapper">
              <IconComponent size={14} />
            </div>
            <span className="state-label">{st.label}</span>
            {isActive && <div className="state-active-bar" />}
          </button>
        );
      })}
    </nav>
  );
}
