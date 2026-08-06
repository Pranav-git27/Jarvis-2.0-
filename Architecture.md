# JARVIS 2.0 — Architecture Guide

Version: 1.0

---

# Purpose

This document defines the architecture, engineering principles, and coding standards for JARVIS 2.0.

Every contributor, whether human or AI coding agent, must follow these guidelines.

The objectives are:

- Maintain a clean architecture.
- Keep the code modular.
- Make features easy to extend.
- Minimize technical debt.
- Keep the project production-ready.

---

# Project Philosophy

JARVIS is not just a chatbot.

It is being designed as a modular AI Assistant platform capable of supporting future features such as:

- AI conversations
- Memory
- Voice interaction
- Browser automation
- Desktop automation
- Vision
- File understanding
- Multi-agent workflows
- Plugin support

Every feature should be implemented as an independent module.

---

# Project Structure

```
JARVIS 2.0/
│
├── README.md
├── ARCHITECTURE.md
├── implementation_plan.md
├── agent_memory.md
├── .gitignore
│
├── jarvis-backend/
│   ├── .env
│   ├── .gitignore
│   ├── requirements.txt
│   │
│   └── app/
│       ├── __init__.py
│       ├── api/
│       ├── ai/
│       ├── services/
│       ├── models/
│       ├── utils/
│       ├── config.py
│       └── main.py
│
└── jarvis-frontend/
    ├── .gitignore
    ├── package.json
    ├── src/
    ├── public/
    └── ...
```

---

# Documentation Responsibilities

Each project document has a specific responsibility.

## README.md

Contains:

- Project overview
- Features
- Installation
- Usage
- Screenshots
- Contribution guide

---

## ARCHITECTURE.md

Contains:

- Architecture
- Engineering principles
- Coding rules
- Folder responsibilities

This document changes rarely.

---

## implementation_plan.md

Contains:

- Planned features
- Milestones
- Roadmap
- Future ideas

This document evolves throughout development.

---

## agent_memory.md

Contains:

- Current implementation status
- Decisions already made
- Important project context
- Temporary notes useful for AI coding agents

This acts as the project's memory.

---

# AI Agent Instructions

Before making any code changes:

1. Read this document completely.
2. Read `agent_memory.md`.
3. Read `implementation_plan.md`.
4. Understand the existing architecture.
5. Reuse existing code whenever possible.
6. Avoid unnecessary architectural changes.

Never reorganize the project unless explicitly instructed.

---

# Folder Responsibilities

## app/api

Contains FastAPI endpoints.

Responsibilities:

- Receive requests
- Validate requests
- Call services
- Return responses

Do NOT place business logic here.

---

## app/ai

Contains AI provider implementations.

Examples:

- gemini_service.py
- provider.py
- prompts.py

Responsibilities:

- AI communication
- Prompt handling
- Response parsing

Should remain independent of the frontend.

---

## app/services

Contains application services.

Examples:

- tts.py
- memory.py
- browser.py
- search.py
- automation.py

Each service should have one clear responsibility.

---

## app/models

Contains Pydantic models.

Examples:

- ChatRequest
- ChatResponse
- Settings
- MemoryRecord

No business logic belongs here.

---

## app/utils

Contains helper utilities.

Examples:

- logger.py
- validators.py
- helpers.py

Avoid putting application logic here.

---

## config.py

Responsible for:

- Environment variables
- Constants
- Configuration

No business logic.

---

# Backend Responsibilities

The backend owns:

- AI providers
- Business logic
- Memory
- Tool execution
- File handling
- Voice processing
- Automation
- Configuration

The frontend should never communicate directly with AI providers.

---

# Frontend Responsibilities

The frontend owns:

- User interface
- User interaction
- State management
- API communication

The frontend must never contain:

- API keys
- AI logic
- Business logic

---

# Environment Variables

All secrets belong inside:

```
jarvis-backend/.env
```

Never hardcode:

- API keys
- Tokens
- Credentials
- Secrets

Never commit `.env`.

---

# Dependency Management

Install only dependencies that are required.

Avoid unnecessary packages.

Keep `requirements.txt` minimal and maintainable.

---

# Coding Standards

Follow:

- SOLID
- DRY
- KISS
- Clean Code
- Single Responsibility Principle

Write:

- modular code
- readable code
- reusable code

Avoid:

- giant files
- duplicated logic
- unnecessary abstractions
- tightly coupled modules

---

# Error Handling

Every external integration should gracefully handle:

- Invalid API keys
- Rate limits
- Network failures
- Timeouts
- Unexpected exceptions

Never silently ignore errors.

Provide useful logs.

---

# Logging

Use Rich for logging.

Logs should clearly identify:

- Startup
- Requests
- Responses
- Warnings
- Errors

Avoid excessive logging.

---

# AI Provider Architecture

The application should depend on an abstraction rather than a specific AI provider.

Current provider:

- Gemini

Future providers may include:

- Groq
- OpenAI
- Ollama
- Local Models

Changing providers should require minimal changes to the application.

---

# Future Modules

Future features should exist as independent modules.

Examples:

- Memory
- RAG
- Voice Input
- Voice Output
- Browser Automation
- Vision
- OCR
- Desktop Automation
- Tool Calling
- Multi-Agent System
- Plugin System

Adding a new feature should not require modifying unrelated modules.

---

# Git Rules

Never commit:

- .env
- node_modules
- __pycache__
- virtual environments
- build artifacts
- cache directories

Keep commits focused.

Prefer one feature per commit.

---

# Before Writing Code

Always ask:

1. Which module owns this feature?
2. Does this functionality already exist?
3. Can existing code be reused?
4. Does this violate the current architecture?

If unsure, prefer extending existing modules over creating new ones.

---

# Engineering Principles

Prefer maintainability over shortcuts.

Prefer readability over cleverness.

Prefer modularity over convenience.

Prefer composition over inheritance.

Build every feature as if the project will continue to grow for years.

The goal is to make JARVIS scalable, maintainable, and easy for both humans and AI coding agents to understand.