"""Provider-agnostic contract for AI text generation."""

from abc import ABC, abstractmethod
from collections.abc import AsyncIterator


class AIProvider(ABC):
    """Define the text-generation capabilities required from an AI provider."""

    @abstractmethod
    async def generate_response(self, prompt: str) -> str:
        """Generate and return a complete response for a prompt."""

    @abstractmethod
    def stream_response(self, prompt: str) -> AsyncIterator[str]:
        """Generate a response as an asynchronous stream of text chunks."""
