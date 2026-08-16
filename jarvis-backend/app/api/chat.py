"""Chat API routes for complete and streaming AI responses."""

import logging
from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from app.ai.provider import AIProvider
from app.api.dependencies import get_ai_provider
from app.models.chat_models import ChatRequest, ChatResponse

router = APIRouter(prefix="/api", tags=["chat"])
logger = logging.getLogger(__name__)

AIProviderDependency = Annotated[AIProvider, Depends(get_ai_provider)]


@router.post("/chat", response_model=ChatResponse)
async def create_chat_response(
    request: ChatRequest,
    provider: AIProviderDependency,
) -> ChatResponse:
    """Generate a complete AI response for a validated chat message."""
    try:
        response = await provider.generate_response(request.message)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI provider could not generate a response.",
        ) from exc

    return ChatResponse(response=response)


@router.post("/chat/stream", response_class=StreamingResponse)
async def stream_chat_response(
    request: ChatRequest,
    provider: AIProviderDependency,
) -> StreamingResponse:
    """Stream provider-agnostic text chunks as Server-Sent Events."""
    provider_stream = provider.stream_response(request.message)

    try:
        first_chunk = await anext(provider_stream)
    except StopAsyncIteration as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI provider returned an empty response.",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI provider could not start streaming a response.",
        ) from exc

    async def event_stream() -> AsyncIterator[str]:
        yield _format_sse_data(first_chunk)

        try:
            async for chunk in provider_stream:
                yield _format_sse_data(chunk)
        except Exception:
            logger.error("The AI provider stream ended unexpectedly.")

    return StreamingResponse(event_stream(), media_type="text/event-stream")


def _format_sse_data(text: str) -> str:
    """Frame one text chunk as an SSE data event, preserving line breaks."""
    normalized_text = text.replace("\r\n", "\n").replace("\r", "\n")
    data_lines = "".join(f"data: {line}\n" for line in normalized_text.split("\n"))
    return f"{data_lines}\n"
