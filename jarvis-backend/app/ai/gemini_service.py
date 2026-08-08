"""Gemini implementation of the provider-agnostic AI contract."""

from collections.abc import AsyncIterator
from typing import Any

from google import genai

from app.ai.provider import AIProvider
from app.config import settings


class GeminiService(AIProvider):
    """Generate text with Google's Gemini API through the modern GenAI SDK."""

    DEFAULT_MODEL = "gemini-2.5-flash-lite"

    def __init__(self, model: str = DEFAULT_MODEL) -> None:
        """Create a Gemini client using the backend-configured API key."""
        self._model = model
        self._client = genai.Client(api_key=settings.gemini_api_key)

    async def generate_response(self, prompt: str) -> str:
        """Generate and return the complete text response for ``prompt``."""
        try:
            response = await self._client.aio.models.generate_content(
                model=self._model,
                contents=prompt,
            )
            return self._response_text(response)
        except Exception as exc:
            raise RuntimeError("Gemini response generation failed.") from exc

    async def stream_response(self, prompt: str) -> AsyncIterator[str]:
        """Yield non-empty text chunks from Gemini's asynchronous stream."""
        try:
            stream = await self._client.aio.models.generate_content_stream(
                model=self._model,
                contents=prompt,
            )
            async for response in stream:
                text = self._response_text(response)
                if text:
                    yield text
        except Exception as exc:
            raise RuntimeError("Gemini response streaming failed.") from exc

    @staticmethod
    def _response_text(response: Any) -> str:
        """Extract provider response text while tolerating empty SDK chunks."""
        text = getattr(response, "text", None)
        return text if isinstance(text, str) else ""
