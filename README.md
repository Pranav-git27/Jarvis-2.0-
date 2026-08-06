# JARVIS 2.0

A modern AI assistant built with a **React** frontend and a **FastAPI** backend, designed around a modular, scalable architecture for future capabilities like voice interaction, long-term memory, browser automation, RAG, vision, and multi-agent workflows.

The project prioritizes clean architecture, maintainability, and production-quality engineering practices.

## Features

### Implemented

- **Premium 3D Sci-Fi UI** — Interactive particle orb with 6 dynamic states (idle, listening, thinking, speaking, searching, completed), star field, ambient fog, scan lines, and glassmorphic HUD decks.
- **HUD Telemetry Header** — System status, CPU/MEM/PING readouts, FPS counter, audio and chat toggles.
- **Command Bar** — Glass command input with quick-action chips and microphone toggle.
- **Chat Drawer** — Streaming-style chat with markdown, syntax-highlighted code blocks, and one-click copy.
- **Workflow & Activity Indicators** — Animated state-to-stage mapping and live activity display.
- **Backend Scaffolding** — FastAPI server with CORS, root and `/health` endpoints, an `app/` package layout, and environment-based configuration loading (`GEMINI_API_KEY` from `jarvis-backend/.env`).

### Planned

- **Gemini AI Integration** — Real-time streaming chat through the backend (backend-first: `React → FastAPI → Gemini`). [Planned]
- **Voice Input (STT)** — Browser-native Web Speech API transcription. [Planned]
- **Text-to-Speech (TTS)** — Voice synthesis API and audio streaming. [Planned]
- **Sci-Fi Sound Effects** — Procedural Web Audio SFX for state changes and UI interactions. [Planned]
- **Session & History Persistence** — Local storage for transcripts and preferences. [Planned]

> Nothing above marked *Planned* is implemented yet. See [implementation_plan.md](implementation_plan.md) for the roadmap.

## Architecture

```
React Frontend
      ↓
FastAPI Backend
      ↓
   Gemini AI
```

AI interactions occur **only** through the backend. The frontend never communicates directly with Gemini, never holds an API key, and contains no AI or business logic. The backend owns all AI providers, configuration, and business logic, and depends on an AI provider abstraction so future providers (Groq, OpenAI, Ollama, local models) can be swapped with minimal changes.

## Project Structure

```
JARVIS 2.0/
├── README.md
├── ARCHITECTURE.md
├── implementation_plan.md
├── agent_memory.md
├── .gitignore
│
├── jarvis-backend/          # FastAPI backend
│   ├── .env                # Secrets (gitignored)
│   ├── .env.example
│   ├── requirements.txt
│   └── app/
│       ├── api/            # FastAPI endpoints
│       ├── ai/             # AI provider implementations
│       ├── services/       # Application services
│       ├── models/         # Pydantic models
│       ├── utils/          # Helpers
│       ├── config.py       # Env config loader
│       └── main.py         # App entry point
│
└── jarvis-frontend/        # React + Vite UI
    ├── src/
    │   ├── components/     # Orb, HUD, chat, command bar, etc.
    │   ├── App.tsx
    │   └── main.tsx
    ├── index.html
    └── package.json
```

## Tech Stack

**Frontend**

- React
- TypeScript
- Vite
- Three.js + React Three Fiber (3D rendering)

**Backend**

- FastAPI
- Python
- google-genai

**Development**

- uv
- Git

## Getting Started

### Prerequisites

- Node.js (for the frontend)
- Python 3.11+ (for the backend)
- uv (or pip)

### Backend setup

```bash
cd jarvis-backend
uv venv
uv pip install -r requirements.txt
```

Create `jarvis-backend/.env` from the example:

```bash
cp .env.example .env   # then add your Gemini API key
```

Start the server:

```bash
uv run uvicorn app.main:app --reload
```

### Frontend setup

```bash
cd jarvis-frontend
npm install
npm run dev
```

### Running both servers

1. Start the backend: `http://localhost:8000`
2. Start the frontend: `http://localhost:5173`
3. Open `http://localhost:5173` in your browser.

## Environment Variables

All secrets belong in `jarvis-backend/.env` and are gitignored. Never commit `.env`.

Example:

```
GEMINI_API_KEY=YOUR_API_KEY
```

Frontend configuration (non-secret) is optional and lives in the frontend env:

```
VITE_API_BASE_URL=http://localhost:8000
```

## Roadmap

The current roadmap (see [implementation_plan.md](implementation_plan.md)) covers:

1. **Gemini AI Integration** — Backend chat endpoints, Gemini service, provider abstraction, streaming.
2. **Native STT** — Web Speech API voice input.
3. **FastAPI TTS** — Voice synthesis API and audio streaming.
4. **Sci-Fi SFX Engine** — Procedural Web Audio sound effects.
5. **Persistence** — Local session and history storage.

## Contributing

This project follows the engineering principles and coding standards defined in [ARCHITECTURE.md](ARCHITECTURE.md). Please read it (along with `agent_memory.md`) before making any changes. Keep changes modular, focused, and aligned with the existing architecture.

## License

MIT — placeholder, to be finalized.