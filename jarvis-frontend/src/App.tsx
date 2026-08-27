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
import { sendChatMessage } from './services/api';
import './App.css';

function App() {
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'jarvis',
      text: 'JARVIS 2.0 operational. All subsystems nominal. How may I assist you?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSendMessage = async (text: string) => {
    if (isLoading || orbState === 'thinking' || !text.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsChatOpen(true);
    setIsLoading(true);

    // Transition through states: thinking while API request is in-flight
    setOrbState('thinking');

    try {
      const responseData = await sendChatMessage({ message: text });
      setOrbState('speaking');

      const jarvisMsg: ChatMessage = {
        id: `jarvis-${Date.now()}`,
        sender: 'jarvis',
        text: responseData.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isStreaming: false,
      };

      setMessages((prev) => [...prev, jarvisMsg]);
      setOrbState('completed');

      setTimeout(() => {
        setOrbState('idle');
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Communication error with JARVIS backend.';

      const jarvisErrorMsg: ChatMessage = {
        id: `jarvis-err-${Date.now()}`,
        sender: 'jarvis',
        text: `[SYSTEM ALERT] ${errorMessage}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isStreaming: false,
      };

      setMessages((prev) => [...prev, jarvisErrorMsg]);
      setOrbState('idle');
    } finally {
      setIsLoading(false);
    }
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
