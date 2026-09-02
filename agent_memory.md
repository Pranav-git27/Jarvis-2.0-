# JARVIS 2.0 — Project Memory

## Project Overview
A premium 3D interactive AI Operating System UI with particle orb, sci-fi HUD glassmorphic decks, and cinematic animations. Inspired by Iron Man's JARVIS.

---

## Tech Stack (Final)

| Layer | Technology | Status |
|-------|-----------|--------|
| **Framework** | React 19 + Vite + TypeScript | ✅ Done |
| **3D Rendering** | Three.js + React Three Fiber | ✅ Done |
| **Particles** | Custom 3,000 particle Fibonacci sphere + PointsMaterial | ✅ Done |
| **Post-processing** | @react-three/postprocessing (Bloom) | ✅ Done |
| **Icons** | Lucide React | ✅ Done |
| **Typography** | Orbitron, Rajdhani, JetBrains Mono, Inter (Google Fonts) | ✅ Done |
| **Animations** | CSS Glassmorphism + R3F lerping + GPU-accelerated keyframes | ✅ Done |
| **Styling** | Custom Sci-Fi CSS Design Tokens + CSS Variables | ✅ Done |
| **AI** | Gemini API (Flash free tier) | ✅ Streaming Connected (Chunk 9) |
| **TTS** | Pocket TTS (Python FastAPI backend) | 🔲 Pending |
| **STT** | Web Speech API (browser-native) | 🔲 Pending |

---

## Repo Structure
```
D:\JARVIS 2.0\
├── jarvis-frontend/          # React + Vite (UI REFINED & PREMIUM)
│   ├── public/
│   │   └── favicon.svg       # Custom orange orb SVG
│   ├── src/
│   │   ├── components/
│   │   │   ├── ParticleBlob.tsx      # 3D particle sphere (R3F) with 6 states
│   │   │   ├── BackgroundDepth.tsx    # Stars, floating dust, fog, scan lines
│   │   │   ├── SciFiOverlay.tsx       # Grid, corners, equalizer, scan lines
│   │   │   ├── HUDHeader.tsx         # Futuristic HUD telemetry (CPU/MEM/PING)
│   │   │   ├── CommandBar.tsx        # Glass command input with mic & chips
│   │   │   ├── ChatDrawer.tsx        # Streaming chat with markdown & code blocks
│   │   │   ├── WorkflowIndicator.tsx  # Animated workflow progress
│   │   │   ├── ActivityPanel.tsx     # Live activity status display
│   │   │   └── StateSelector.tsx     # Bottom nav with premium interactions
│   │   ├── services/
│   │   │   ├── api.ts            # Frontend API client for /api/chat & /api/chat/stream
│   │   │   └── api.validation.ts # Independent validation suite for API client
│   │   ├── App.tsx               # Integrated state & message management
│   │   ├── App.css
│   │   ├── index.css             # Design tokens, animations, glassmorphism
│   │   └── main.tsx
│   ├── .env.example              # Frontend environment template (VITE_API_BASE_URL)
│   ├── index.html                # Google Fonts links (incl. JetBrains Mono)
│   └── package.json
│
└── jarvis-backend/           # Python FastAPI Backend (Gemini API & SSE Streaming operational)
```

---

## What's Built

### 1. ParticleBlob (`src/components/ParticleBlob.tsx`)
- **3,000 particles** on Fibonacci sphere with R3F
- **6 Dynamic States**: idle, listening, thinking, speaking, searching, completed
- **State-Specific Palettes**:
  - **Idle**: Amber Gold (`#D4712B` / `#F59E0B`) — slow breathing
  - **Listening**: Matrix Emerald (`#10B981` / `#06B6D4`) — responsive pulse
  - **Thinking**: Amber Gold — medium rotation, wave displacement
  - **Speaking**: Blue (`#3B82F6` / `#06B6D4`) — rhythmic pulse
  - **Searching**: Neon Cyan (`#00F0FF` / `#3B82F6`) — scanning effect
  - **Completed**: Green (`#10B981` / `#22C55E`) — calm bloom
- **Animations**: Breathing motion, ripple on state change, scanning highlight, smooth color lerping
- **Dynamic Bloom**: Per-state intensity control
- **Pointer Follow**: Smooth mouse tracking with R3F lerping

### 2. BackgroundDepth (`src/components/BackgroundDepth.tsx`)
- **Star Field**: 80 randomly positioned stars with breathing animation
- **Floating Dust**: 24 amber-tinted particles drifting with parallax
- **Ambient Fog**: Two drifting fog layers with blur
- **Scan Line**: Horizontal scan line sweeping across the screen
- **Ambient Orange Glow**: Soft bottom glow for depth

### 3. HUDHeader (`src/components/HUDHeader.tsx`)
- **Left**: System status badge (J.A.R.V.I.S 2.0), CPU%, MEM%, PING ms
- **Center**: Active mode display with state-specific colors
- **Right**: Online status, FPS counter, audio toggle, chat toggle
- **Animated**: Header border scan line, status pulse animation

### 4. SciFiOverlay (`src/components/SciFiOverlay.tsx`)
- **Cyber Grid**: Subtle background grid pattern
- **Radial Glow**: Ambient center glow
- **Corner Brackets**: 4 animated corner reticles with scan effects
- **Side Scans**: Vertical scan lines on left/right edges
- **Audio Equalizer**: 16-bar spectrum for listening/speaking states

### 5. CommandBar (`src/components/CommandBar.tsx`)
- **Glass Input**: Deep glassmorphic command bar with animated glow border
- **Quick Chips**: 4 action chips (Diagnostics, Web Search, Optimize, Voice)
- **Mic Button**: Voice recording toggle with pulse ring animation
- **Send Button**: Active state with hover glow
- **Listening Indicator**: Pulsing sparkle with ring animation

### 6. ChatDrawer (`src/components/ChatDrawer.tsx`)
- **Streaming Responses**: Cursor animation during response generation
- **Markdown Support**: Bold, italic, inline code formatting
- **Code Blocks**: Syntax-highlighted blocks with language labels
- **Copy Button**: One-click copy for JARVIS responses
- **Slide Animation**: Smooth entrance/exit transitions

### 7. WorkflowIndicator (`src/components/WorkflowIndicator.tsx`)
- **5 Stages**: Listening → Understanding → Planning → Executing → Completed
- **Visual Progress**: Dot completion, connector fill, pulse on active
- **Auto-mapping**: Maps orb states to workflow stages

### 8. ActivityPanel (`src/components/ActivityPanel.tsx`)
- **Live Actions**: Displays current AI activity (Searching, Processing, etc.)
- **State-Driven**: Shows relevant activities per orb state
- **Slide-in Animation**: New activities animate in from top

### 9. StateSelector (`src/components/StateSelector.tsx`)
- **6 States**: Idle, Listen, Think, Speak, Search, Done
- **Premium Interactions**: Hover glow, active bar indicator, scale on press
- **Glassmorphic**: Deep glass background with heavy blur

### 10. Frontend API Client (`src/services/api.ts` & `src/services/api.validation.ts`) — Completed Chunk 7
- **Base URL Resolution**: Configured via `VITE_API_BASE_URL` with development default `http://localhost:8000`.
- **Non-Streaming**: `sendChatMessage(request)` posts to `POST /api/chat`, handles JSON errors and returns `ChatResponse`.
- **Streaming**: `sendChatStream(request)` posts to `POST /api/chat/stream`, returns AsyncGenerator yielding tokens.
- **SSE Buffering**: Robust line & boundary handling for split network reads across `\n\n` delimiters.
- **Callback Wrapper**: `streamChatMessage(request, onChunk)` for callback-based stream consumption.
- **Security & Scope**: No Gemini SDK imported; zero API keys in frontend; no direct Gemini API calls.

### 11. Chat UI Non-Streaming Integration (`src/App.tsx`) — Completed Chunk 8
- **End-to-End Chat Flow**: Connected `handleSendMessage` in `App.tsx` to `sendChatMessage()` targeting `POST /api/chat`.
- **Orb State Lifecycle**: Automatically transitions `idle → thinking → speaking → completed → idle` around backend requests.
- **Submission Guard**: Prevents accidental duplicate submissions while `isLoading` / `orbState === 'thinking'`.
- **Graceful Error Alerts**: Catches API/network errors and presents user-friendly alert messages in transcript drawer without exposing raw stack traces.

### 12. Chat UI Streaming Integration (`src/App.tsx`) — Completed Chunk 9
- **Incremental Streaming**: Connected `handleSendMessage` in `App.tsx` to `sendChatStream()` yielding SSE chunks from `POST /api/chat/stream`.
- **Progressive UI Updates**: Response text is updated incrementally into a single assistant message card with active streaming cursor.
- **Dynamic State Transitions**: Drives `idle → thinking` (stream start) $\rightarrow$ `speaking` (on first chunk received) $\rightarrow$ `completed` (stream close) $\rightarrow$ `idle` (after 2s delay).
- **Error Protection**: Gracefully removes/replaces empty placeholder if connection fails early; preserves partial response with system alert if interrupted mid-stream.
- **Strict Architecture**: Zero backend modifications required; zero direct Gemini browser requests; API key remains secured on backend only.

---

## Design System

### Typography
- **Display**: Orbitron (headings, badges, labels)
- **Tech**: Rajdhani (buttons, chips)
- **Mono**: JetBrains Mono (telemetry, code, timestamps)
- **Sans**: Inter (body text)

### Color Tokens
- `--theme-amber: #D4712B` (primary identity)
- `--theme-cyan: #00F0FF` (searching)
- `--theme-emerald: #10B981` (listening/completed)
- `--theme-violet: #A855F7` (reserved)
- `--theme-red: #EF4444` (errors)

### Glass Tokens
- `--glass-bg: rgba(12, 16, 24, 0.72)`
- `--glass-bg-deep: rgba(8, 12, 20, 0.85)`
- `--glass-blur: blur(24px)`
- `--glass-blur-heavy: blur(40px)`

### Animations
- `--ease-smooth: cubic-bezier(0.16, 1, 0.3, 1)`
- `--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)`
- `--ease-decel: cubic-bezier(0, 0, 0.2, 1)`

---

## How to Run
```bash
cd D:\JARVIS 2.0\jarvis-frontend
npm install
npm run dev
# Server: http://localhost:5173
```

---

## Next Steps
1. Integrate Gemini API for real AI responses
2. Build Python FastAPI backend for TTS
3. Integrate Web Speech API for STT
4. Add sound effects for state transitions
5. Implement persistent conversation history
