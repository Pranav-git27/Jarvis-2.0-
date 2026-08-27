# JARVIS 2.0 — Implementation Plan for Remaining Core Features

This plan outlines the architecture and step-by-step roadmap to complete all remaining system features for JARVIS 2.0:
1. **Gemini AI Integration** (Real-time intelligence & streaming response)
2. **Web Speech API STT** (Native voice input & live transcription)
3. **Python FastAPI Backend & TTS** (Voice synthesis API & audio streaming)
4. **Web Audio Sci-Fi Sound Effects Engine** (State switch hums, UI clicks, audio feedback)
5. **Session & History Persistence** (Local storage for messages & system telemetry settings)

---

## User Review Required

- **Gemini API Key**: Requires a free Gemini API key set as `GEMINI_API_KEY` inside `d:\JARVIS 2.0\jarvis-backend\.env` only. Never in the frontend.
- **Python FastAPI Backend**: Will be initialized in `d:\JARVIS 2.0\jarvis-backend` with FastAPI, Uvicorn, and Pocket TTS / Edge TTS engine for zero-latency speech generation.
- **Audio Synthesizer Engine**: Sound effects will be built using browser Web Audio API oscillator synthesis so no large MP3 files are required.

---

## Proposed Changes

---

### Phase 1: Gemini AI Integration (Streaming Intelligence) — Backend-First

#### Architecture (confirmed)
- **Data flow**: React Frontend → FastAPI Backend → Gemini API.
- The frontend **never** communicates directly with Gemini. It talks only to FastAPI.
- The backend owns all AI interactions and all AI configuration.

#### Decisions (confirmed)
- **Approach**: Latest `google-genai` Python SDK on the backend (typed, built-in streaming).
- **API key location**: Only inside `d:\JARVIS 2.0\jarvis-backend\.env` as `GEMINI_API_KEY`. Never in the frontend, never hardcoded.
- **Model**: `gemini-2.0-flash` with true token-by-token streaming.

#### [NEW] Backend — Provider Abstraction (`d:\JARVIS 2.0\jarvis-backend\app\ai\provider.py`)
- Define an abstract `Provider` interface (e.g. `stream_response`, `build_history`) so the app depends on an abstraction rather than Gemini directly.
- Keeps future providers (Groq, OpenAI, Ollama, local models) swappable with minimal application changes.

#### [NEW] Backend — `d:\JARVIS 2.0\jarvis-backend\app\ai\gemini_service.py`
- Implement `GeminiService(Provider)` using the `google-genai` SDK.
- System prompt persona: *"You are JARVIS 2.0, an advanced artificial intelligence system..."* — concise, technical, sci-fi tone, markdown formatting.
- `stream_response(messages)` — forward each token delta to the caller; strip leading whitespace of the first chunk; accumulate full text for persistence.
- `build_history(messages)` — map chat messages to Gemini role format, prepend system instruction.

#### [NEW] Backend — Chat Models (`d:\JARVIS 2.0\jarvis-backend\app\models\chat.py`)
- Pydantic models: `ChatRequest` (message history) and `ChatResponse` (reply text).

#### [NEW] Backend — Chat API (`d:\JARVIS 2.0\jarvis-backend\app\api\chat.py`)
- `POST /api/chat` — non-streaming: accepts `ChatRequest`, returns `ChatResponse`.
- `POST /api/chat/stream` — streaming: returns `text/event-stream` token deltas via `StreamingResponse`.

#### [MODIFY] Backend — `d:\JARVIS 2.0\jarvis-backend\app\main.py`
- Initialize FastAPI, mount the chat router, add CORS allowing the frontend origin, expose `/api/health`.

#### [NEW] Backend — `d:\JARVIS 2.0\jarvis-backend\app\config.py`
- Load `GEMINI_API_KEY` from `jarvis-backend/.env`; raise a friendly error at startup if missing.

#### [NEW] Backend — `d:\JARVIS 2.0\jarvis-backend\.env` + `.env.example`
- `GEMINI_API_KEY=...` (gitignored).

#### [NEW] Backend — `d:\JARVIS 2.0\jarvis-backend\requirements.txt`
- Add: `fastapi`, `uvicorn`, `google-genai`, `pydantic`, `python-dotenv`.

#### [NEW] [COMPLETED CHUNK 7] Frontend — API Client (`d:\JARVIS 2.0\jarvis-frontend\src\services\api.ts` & `src/services/api.validation.ts`)
- Talks only to FastAPI (base URL via `VITE_API_BASE_URL`, default `http://localhost:8000`). No API key, no AI SDK in the frontend.
- `sendChatMessage(request)` → `POST /api/chat`.
- `sendChatStream(request)` → `POST /api/chat/stream`, parse SSE event stream with AsyncGenerator.
- `streamChatMessage(request, onChunk)` → callback wrapper forwarding tokens to `onChunk`.

#### [MODIFY] [COMPLETED CHUNK 8] Frontend — `d:\JARVIS 2.0\jarvis-frontend\src\App.tsx`
- Wired `handleSendMessage` to `sendChatMessage` from `api.ts` for non-streaming `POST /api/chat`.
- Removed mock `setTimeout` response generation.
- Drove orb states: `thinking` while awaiting backend API response → `speaking` on response receipt → `completed` → `idle` after ~2s.
- Added loading state guard (`isLoading`) to prevent accidental duplicate submissions.
- Added graceful error display handling in the conversation drawer.

#### [REMOVE] Frontend — Gemini key & `gemini.ts`
- Delete `src/services/gemini.ts` if present; the frontend must not hold an API key.
- No `VITE_GEMINI_API_KEY` anywhere; the frontend `.env` (if any) must contain no secrets.

#### [VERIFY] Backend `.gitignore`
- Ensure `jarvis-backend/.env` is ignored so the API key is never committed.

#### Dependency
- `pip install -r d:\JARVIS 2.0\jarvis-backend\requirements.txt`

---

### Phase 2: Native Web Speech API STT (Voice Input)

#### [NEW] [d:\JARVIS 2.0\jarvis-frontend\src\hooks\useSpeechRecognition.ts](file:///d:/JARVIS%202.0/jarvis-frontend/src/hooks/useSpeechRecognition.ts)
- React hook wrapping browser `webkitSpeechRecognition` / `SpeechRecognition`.
- Continuous voice listening toggle, speech silence detection, and auto-submit on pause.
- Automatically transitions orb state to `listening` while user speaks.

#### [MODIFY] [d:\JARVIS 2.0\jarvis-frontend\src\components\CommandBar.tsx](file:///d:/JARVIS%202.0/jarvis-frontend/src/components/CommandBar.tsx)
- Bind microphone toggle button to `useSpeechRecognition` hook.
- Render live audio transcript into input bar in real time.

---

### Phase 3: Python FastAPI Backend & Text-to-Speech (TTS)

#### [NEW] [d:\JARVIS 2.0\jarvis-backend\main.py](file:///d:/JARVIS%202.0/jarvis-backend/main.py)
- Initialize FastAPI server with CORS middleware allowing frontend requests.
- Health check route `/api/health` and TTS endpoint `/api/tts`.

#### [NEW] [d:\JARVIS 2.0\jarvis-backend\tts_engine.py](file:///d:/JARVIS%202.0/jarvis-backend/tts_engine.py)
- Pocket TTS / Edge TTS integration generating audio bytes (MP3/WAV).

#### [NEW] [d:\JARVIS 2.0\jarvis-backend\requirements.txt](file:///d:/JARVIS%202.0/jarvis-backend/requirements.txt)
- Dependencies: `fastapi`, `uvicorn`, `edge-tts`, `pyttsx3`, `pydantic`.

#### [NEW] [d:\JARVIS 2.0\jarvis-frontend\src\services\audioPlayer.ts](file:///d:/JARVIS%202.0/jarvis-frontend/src/services/audioPlayer.ts)
- Audio stream player connected to R3F spectrum visualizer ring.

---

### Phase 4: Web Audio Sci-Fi SFX Engine

#### [NEW] [d:\JARVIS 2.0\jarvis-frontend\src\services\sfx.ts](file:///d:/JARVIS%202.0/jarvis-frontend/src/services/sfx.ts)
- Pure Web Audio API procedural sound synthesizer.
- Sound effects:
  - `playStateChange(state)` — Unique futuristic frequency hum for state transitions.
  - `playClick()` — Sharp glass UI click.
  - `playChime()` — Listening trigger chime.
  - `playMessageSent()` / `playMessageReceived()`.

---

### Phase 5: Persistence & History Management

#### [NEW] [d:\JARVIS 2.0\jarvis-frontend\src\services\storage.ts](file:///d:/JARVIS%202.0/jarvis-frontend/src/services/storage.ts)
- `localStorage` helper to store:
  - Chat history session transcripts
  - Mute/Volume settings
  - Last active orb state preferences

---

## Execution Roadmap

> The frontend UI is complete. Implementation order is now: backend Gemini brain first (self-contained, defines the data/TTS contract), then STT + SFX (free, browser-native), then backend/TTS, then persistence.

1. **Phase 1**: Backend Gemini API Service (`app/ai/gemini_service.py` + chat endpoints) & Frontend API client (`api.ts`) — brain first
2. **Phase 2**: STT Hook & Voice Command integration (`useSpeechRecognition.ts`)
3. **Phase 4**: Web Audio SFX Engine (`sfx.ts`)
4. **Phase 3**: FastAPI Backend setup & TTS API (`jarvis-backend/`) + `audioPlayer.ts`
5. **Phase 5**: Local Storage Persistence (`storage.ts`)

---

## Verification Plan

### Automated Tests
- Run `npm run build` in `jarvis-frontend` to verify zero TypeScript build errors.
- Test Python backend server startup via `uvicorn app.main:app --reload`.

### Manual Verification
- Test real-time Gemini streaming responses via the FastAPI chat endpoints in `ChatDrawer` — orb passes through `thinking → speaking → completed`.
- Test voice microphone input using browser Web Speech API.
- Verify procedural Web Audio SFX on state changes and clicks.
- Recommend deciding model & integration approach with the user before Phase 1 implementation (`gemini-2.0-flash` streaming + `google-genai` Python SDK + `GEMINI_API_KEY` in backend `.env` confirmed).
