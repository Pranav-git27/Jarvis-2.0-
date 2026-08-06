import { useState, useEffect } from 'react';
import {
  MessageSquare, Volume2, VolumeX, Cpu, Wifi, HardDrive, Clock,
  Radio, CircleDot
} from 'lucide-react';
import type { OrbState } from './ParticleBlob';
import './HUDHeader.css';

interface HUDHeaderProps {
  state: OrbState;
  isChatOpen: boolean;
  onToggleChat: () => void;
}

const STATE_LABELS: Record<OrbState, string> = {
  idle: 'STANDBY',
  listening: 'VOICE INPUT',
  thinking: 'PROCESSING',
  speaking: 'OUTPUT',
  searching: 'QUERY',
  completed: 'READY',
};

const STATE_COLORS: Record<OrbState, string> = {
  idle: 'var(--theme-amber)',
  listening: 'var(--theme-emerald)',
  thinking: 'var(--theme-amber)',
  speaking: 'var(--theme-cyan)',
  searching: 'var(--theme-cyan)',
  completed: 'var(--theme-emerald)',
};

export default function HUDHeader({ state, isChatOpen, onToggleChat }: HUDHeaderProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [fps, setFps] = useState(60);
  const [latency, setLatency] = useState(42);
  const [cpu, setCpu] = useState(23);
  const [memory, setMemory] = useState(41);

  useEffect(() => {
    const interval = setInterval(() => {
      setFps(Math.floor(58 + Math.random() * 3));
      setLatency(Math.floor(35 + Math.random() * 25));
      setCpu(Math.floor(18 + Math.random() * 20));
      setMemory(Math.floor(38 + Math.random() * 8));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="hud-header">
      <div className="hud-scan-line" />

      {/* Left Section - System Status */}
      <div className="hud-left">
        <div className="status-badge">
          <span className="status-dot" />
          <span className="status-title">J.A.R.V.I.S</span>
          <span className="status-version">2.0</span>
        </div>

        <div className="hud-divider" />

        <div className="telemetry-deck">
          <div className="telemetry-item">
            <Cpu size={11} />
            <span className="telemetry-label">CPU</span>
            <span className="telemetry-val">{cpu}%</span>
          </div>
          <div className="telemetry-item">
            <HardDrive size={11} />
            <span className="telemetry-label">MEM</span>
            <span className="telemetry-val">{memory}%</span>
          </div>
          <div className="telemetry-item">
            <Clock size={11} />
            <span className="telemetry-label">PING</span>
            <span className="telemetry-val">{latency}ms</span>
          </div>
        </div>
      </div>

      {/* Center - Active Mode Badge */}
      <div className="hud-center">
        <div className="mode-display" style={{ '--mode-color': STATE_COLORS[state] } as React.CSSProperties}>
          <Radio size={12} className="mode-icon" />
          <span className="mode-label">MODE</span>
          <span className="mode-value">{STATE_LABELS[state]}</span>
        </div>
      </div>

      {/* Right Section - Controls & Status */}
      <div className="hud-right">
        <div className="hud-stat-pill">
          <Wifi size={11} />
          <span>ONLINE</span>
        </div>

        <div className="hud-stat-pill">
          <CircleDot size={11} />
          <span>FPS {fps}</span>
        </div>

        <div className="hud-divider" />

        <button
          className={`hud-icon-btn ${isMuted ? 'active' : ''}`}
          onClick={() => setIsMuted(!isMuted)}
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        <button
          className={`hud-icon-btn ${isChatOpen ? 'active' : ''}`}
          onClick={onToggleChat}
          title="Toggle Command Log"
        >
          <MessageSquare size={16} />
        </button>
      </div>
    </header>
  );
}
