"""Non-streaming chat API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.ai.provider import AIProvider
from app.api.dependencies import get_ai_provider
from app.models.chat_models import ChatRequest, ChatResponse

router = APIRouter(prefix="/api", tags=["chat"])

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
