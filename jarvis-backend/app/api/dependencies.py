"""FastAPI dependencies for backend service abstractions."""

from functools import lru_cache

from app.ai.gemini_service import GeminiService
from app.ai.provider import AIProvider


@lru_cache(maxsize=1)
def get_ai_provider() -> AIProvider:
    """Return the configured application AI provider."""
    return GeminiService()
