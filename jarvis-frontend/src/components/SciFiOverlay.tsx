import type { OrbState } from './ParticleBlob';
import './SciFiOverlay.css';

interface SciFiOverlayProps {
  state: OrbState;
}

export default function SciFiOverlay({ state }: SciFiOverlayProps) {
  const showEqualizer = state === 'listening' || state === 'speaking';

  return (
    <div className="scifi-overlay-container">
      {/* Sci-Fi Grid Overlay */}
      <div className="cyber-grid" />

      {/* Radial Glow */}
      <div className="radial-glow" />

      {/* Animated Corner Brackets */}
      <div className="hud-corner hud-corner-tl">
        <div className="corner-scan" />
      </div>
      <div className="hud-corner hud-corner-tr">
        <div className="corner-scan" />
      </div>
      <div className="hud-corner hud-corner-bl">
        <div className="corner-scan" />
      </div>
      <div className="hud-corner hud-corner-br">
        <div className="corner-scan" />
      </div>

      {/* Side scan lines */}
      <div className="side-scan side-scan-left" />
      <div className="side-scan side-scan-right" />

      {/* Audio Spectrum Equalizer */}
      {showEqualizer && (
        <div className="audio-spectrum-bar">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="spectrum-pillar"
              style={{
                animationDelay: `${(i % 6) * 0.1}s`,
                animationDuration: `${0.3 + (i % 5) * 0.15}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
