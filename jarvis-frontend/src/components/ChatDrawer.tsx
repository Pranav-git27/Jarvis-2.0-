import { useRef, useEffect } from 'react';
import { X, Bot, Terminal, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import './ChatDrawer.css';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'jarvis';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
}

function renderMessageContent(text: string) {
  // Parse code blocks
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, i) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const code = part.slice(3, -3);
      const firstNewline = code.indexOf('\n');
      const lang = firstNewline > 0 ? code.substring(0, firstNewline).trim() : '';
      const codeContent = firstNewline > 0 ? code.substring(firstNewline + 1) : code;

      return (
        <div key={i} className="code-block">
          {lang && <div className="code-lang">{lang}</div>}
          <pre>
            <code>{codeContent}</code>
          </pre>
        </div>
      );
    }

    // Parse inline formatting
    const formatted = part
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>');

    return (
      <span
        key={i}
        className="message-text"
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    );
  });
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`message-card ${msg.sender}`}>
      <div className="message-sender">
        <span className="sender-icon">
          {msg.sender === 'jarvis' ? <Bot size={10} /> : <Terminal size={10} />}
        </span>
        <span>{msg.sender === 'user' ? 'YOU' : 'JARVIS'}</span>
        <span className="message-dot">·</span>
        <span className="message-time">{msg.timestamp}</span>
        {msg.sender === 'jarvis' && (
          <button className="copy-btn" onClick={handleCopy} title="Copy response">
            {copied ? <Check size={10} /> : <Copy size={10} />}
          </button>
        )}
      </div>
      <div className={`message-bubble ${msg.isStreaming ? 'streaming' : ''}`}>
        {renderMessageContent(msg.text)}
        {msg.isStreaming && <span className="stream-cursor" />}
      </div>
    </div>
  );
}

export default function ChatDrawer({ isOpen, onClose, messages }: ChatDrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <aside className={`chat-drawer ${isOpen ? 'open' : ''}`}>
      <div className="chat-drawer-header">
        <div className="drawer-title">
          <Terminal size={12} />
          <span>TRANSCRIPT</span>
        </div>
        <button className="drawer-close-btn" onClick={onClose} title="Close">
          <X size={14} />
        </button>
      </div>

      <div className="chat-messages-container" ref={containerRef}>
        {messages.length === 0 ? (
          <div className="chat-empty">
            <Bot size={24} />
            <span>No messages yet</span>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))
        )}
      </div>
    </aside>
  );
}
