"""Main entry point for JARVIS 2.0 FastAPI Backend Server."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.chat import router as chat_router

# Initialize FastAPI application
app = FastAPI(
    title="JARVIS 2.0 API",
    description="Backend service for JARVIS 2.0 AI Assistant platform",
    version="2.0.0",
)

# Enable CORS middleware to allow cross-origin requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)


@app.get("/")
def read_root() -> dict[str, str]:
    """Root endpoint returning service identity."""
    return {
        "status": "online",
        "service": "JARVIS 2.0 Backend",
        "version": "2.0.0",
    }


@app.get("/health")
def health_check() -> dict[str, str]:
    """Health check endpoint for operational monitoring."""
    return {
        "status": "healthy",
    }
