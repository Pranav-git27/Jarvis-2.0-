import { useMemo } from 'react';
import './BackgroundDepth.css';

function StarField() {
  const stars = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      delay: Math.random() * 6,
      duration: Math.random() * 3 + 2,
    }));
  }, []);

  return (
    <div className="star-field">
      {stars.map((s) => (
        <div
          key={s.id}
          className="star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function FloatingDust() {
  const particles = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 10,
      duration: Math.random() * 12 + 8,
    }));
  }, []);

  return (
    <div className="floating-dust">
      {particles.map((p) => (
        <div
          key={p.id}
          className="dust-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function BackgroundDepth() {
  return (
    <div className="bg-depth">
      <StarField />
      <FloatingDust />
      <div className="ambient-fog fog-1" />
      <div className="ambient-fog fog-2" />
      <div className="scan-line" />
      <div className="ambient-orange-glow" />
    </div>
  );
}
