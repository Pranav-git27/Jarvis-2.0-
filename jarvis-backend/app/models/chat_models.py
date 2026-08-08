"""Pydantic models defining the data contract for JARVIS chat communication.

These models are provider-agnostic. They must not expose implementation
details of the underlying AI provider (Gemini or otherwise).
"""

from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field
from pydantic.types import StringConstraints

# User messages are trimmed so a whitespace-only prompt cannot pass validation.
Message = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1),
]


class ChatRequest(BaseModel):
    """A chat request sent from the frontend to the backend."""

    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={
            "example": {
                "message": "What is the current status of the reactor cores?",
            },
        },
    )

    message: Message = Field(
        ...,
        description="The user's message or prompt to be answered by JARVIS.",
    )


class ChatResponse(BaseModel):
    """A complete non-streaming response returned by the backend."""

    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={
            "example": {
                "response": "All reactor cores are operating at nominal capacity, sir.",
            },
        },
    )

    response: str = Field(
        ...,
        description="The assistant's generated response text.",
    )