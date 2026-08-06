"""Configuration module for JARVIS 2.0 backend.

Handles loading and validating application configuration from environment variables.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory of the backend repository (jarvis-backend/)
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

# Load environment variables from .env file
load_dotenv(dotenv_path=ENV_PATH)


class Settings:
    """Application configuration and environment variable loader."""

    def __init__(self) -> None:
        self._env_path: Path = ENV_PATH

    @property
    def gemini_api_key(self) -> str:
        """Get the Gemini API key from environment variables.

        Returns:
            str: The validated Gemini API key.

        Raises:
            ValueError: If GEMINI_API_KEY is missing or unconfigured in .env.
        """
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key or api_key == "YOUR_GEMINI_API_KEY":
            raise ValueError(
                f"Missing or invalid required environment variable 'GEMINI_API_KEY'. "
                f"Please set a valid key in '{self._env_path}'."
            )
        return api_key


# Shared singleton instance for app configuration
settings = Settings()
