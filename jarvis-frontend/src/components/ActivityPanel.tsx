import { useState, useEffect } from 'react';
import type { OrbState } from './ParticleBlob';
import './ActivityPanel.css';

interface ActivityPanelProps {
  state: OrbState;
}

interface ActivityItem {
  id: number;
  text: string;
  icon: string;
  timestamp: string;
}

const STATE_ACTIVITIES: Record<OrbState, { text: string; icon: string }[]> = {
  idle: [],
  listening: [
    { text: 'Listening to voice input...', icon: '🎙️' },
    { text: 'Processing audio stream...', icon: '📡' },
  ],
  thinking: [
    { text: 'Analyzing request...', icon: '🧠' },
    { text: 'Generating response...', icon: '⚡' },
    { text: 'Processing context...', icon: '📊' },
  ],
  speaking: [
    { text: 'Synthesizing voice output...', icon: '🔊' },
    { text: 'Rendering response...', icon: '✨' },
  ],
  searching: [
    { text: 'Searching internet...', icon: '🌐' },
    { text: 'Querying knowledge base...', icon: '📚' },
    { text: 'Fetching data points...', icon: '📡' },
  ],
  completed: [
    { text: 'Task completed successfully', icon: '✅' },
  ],
};

export default function ActivityPanel({ state }: ActivityPanelProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    if (state === 'idle') {
      setActivities([]);
      return;
    }

    const stateActivities = STATE_ACTIVITIES[state];
    if (!stateActivities.length) return;

    const newItem: ActivityItem = {
      id: Date.now(),
      text: stateActivities[Math.floor(Math.random() * stateActivities.length)].text,
      icon: stateActivities[Math.floor(Math.random() * stateActivities.length)].icon,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setActivities((prev) => [newItem, ...prev].slice(0, 4));
  }, [state]);

  if (activities.length === 0) return null;

  return (
    <div className="activity-panel">
      <div className="activity-header">
        <div className="activity-dot" />
        <span>ACTIVITY</span>
      </div>
      <div className="activity-list">
        {activities.map((item) => (
          <div key={item.id} className="activity-item">
            <span className="activity-icon">{item.icon}</span>
            <span className="activity-text">{item.text}</span>
            <span className="activity-time">{item.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
