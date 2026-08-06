import { useState } from 'react';
import ParticleBlob from './components/ParticleBlob';
import type { OrbState } from './components/ParticleBlob';
import BackgroundDepth from './components/BackgroundDepth';
import SciFiOverlay from './components/SciFiOverlay';
import HUDHeader from './components/HUDHeader';
import StateSelector from './components/StateSelector';
import CommandBar from './components/CommandBar';
import ChatDrawer, { type ChatMessage } from './components/ChatDrawer';
import WorkflowIndicator from './components/WorkflowIndicator';
import ActivityPanel from './components/ActivityPanel';
import './App.css';

function App() {
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'jarvis',
      text: 'JARVIS 2.0 operational. All subsystems nominal. How may I assist you?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSendMessage = (text: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsChatOpen(true);

    // Transition through states for realistic feel
    setOrbState('thinking');

    setTimeout(() => {
      let responseText = `Processing request: "${text}". Analyzing input parameters and generating optimal response.`;

      if (orbState === 'searching') {
        responseText = `Knowledge base query initiated. Cross-referencing data points for: "${text}". Results synthesized from multiple authoritative sources.`;
      } else if (orbState === 'listening') {
        responseText = `Voice input captured and transcribed: "${text}". Awaiting further instructions.`;
      } else if (orbState === 'completed') {
        responseText = `Task completed successfully for: "${text}". All operations executed within expected parameters.`;
      }

      setOrbState('speaking');

      const jarvisMsg: ChatMessage = {
        id: `jarvis-${Date.now()}`,
        sender: 'jarvis',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, jarvisMsg]);

      // Simulate streaming completion
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === jarvisMsg.id ? { ...m, isStreaming: false } : m
          )
        );
        setOrbState('completed');

        // Return to idle after completed
        setTimeout(() => setOrbState('idle'), 2000);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="jarvis-app">
      {/* Background Depth Layer */}
      <BackgroundDepth />

      {/* 3D Particle Visualizer */}
      <ParticleBlob state={orbState} />

      {/* Futuristic Sci-Fi HUD Background Elements */}
      <SciFiOverlay state={orbState} />

      {/* Top Header Deck & Telemetry */}
      <HUDHeader
        state={orbState}
        isChatOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
      />

      {/* Workflow Progress Indicator */}
      <WorkflowIndicator state={orbState} />

      {/* Live Activity Panel */}
      <ActivityPanel state={orbState} />

      {/* Right Collapsible Command Log / Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages}
      />

      {/* Central Input Command Deck */}
      <CommandBar
        onSendMessage={handleSendMessage}
        currentState={orbState}
        onStateChange={setOrbState}
      />

      {/* Bottom Orb State Selector Nav */}
      <StateSelector
        currentState={orbState}
        onStateChange={setOrbState}
      />
    </div>
  );
}

export default App;
