"""Chat and conversation management endpoints."""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.postgres import get_db
from app.database.repositories import ConversationRepository, RetrievalLogRepository
from app.rag.memory import ConversationMemory
from app.rag.pipeline import RAGPipeline
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ConversationResponse,
    MessageResponse,
)

router = APIRouter()
logger = logging.getLogger("document_intelligence.api.chat")

# Global singleton RAG pipeline instance
_rag_pipeline = RAGPipeline()


@router.post("/chat", response_model=ChatResponse, summary="Submit natural-language query to RAG system")
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    user_id: str = "default_user",
) -> ChatResponse:
    """Answers document queries using grounded vector retrieval, query rewriting, and Llama 3.2."""
    # 1. Fetch or initialize conversation
    conv = ConversationRepository.get_or_create(
        db=db,
        conversation_id=request.conversation_id,
        user_id=user_id,
        initial_title=request.question,
    )

    # 2. Retrieve recent message history for conversational query rewriting
    history = ConversationMemory.get_recent_history(db, conv.id, max_turns=4)

    # 3. Execute RAG pipeline
    result = _rag_pipeline.execute(
        question=request.question,
        history=history,
        user_id=user_id,
        document_ids=request.document_ids if request.document_ids else None,
        similarity_threshold=request.similarity_threshold,
        top_k=request.top_k,
    )

    # 4. Persist user message and assistant answer
    ConversationRepository.add_message(db, conv.id, role="user", content=request.question)
    ConversationRepository.add_message(db, conv.id, role="assistant", content=result.answer)

    # 5. Record observability log
    chunk_scores = [s.score for s in result.sources]
    RetrievalLogRepository.log(
        db=db,
        conversation_id=conv.id,
        query=result.query,
        rewritten_query=result.rewritten_query,
        retrieved_chunk_ids=result.retrieved_chunk_ids,
        scores=chunk_scores,
        retrieval_latency_ms=result.retrieval_latency_ms,
        generation_latency_ms=result.generation_latency_ms,
        total_latency_ms=result.total_latency_ms,
    )

    return ChatResponse(
        answer=result.answer,
        conversation_id=conv.id,
        sources=result.sources,
        retrieval_latency_ms=result.retrieval_latency_ms,
        generation_latency_ms=result.generation_latency_ms,
        total_latency_ms=result.total_latency_ms,
        abstention=result.abstention,
    )


@router.get("/conversations", response_model=List[ConversationResponse], summary="List all user conversations")
def list_conversations(
    db: Session = Depends(get_db),
    user_id: str = "default_user",
) -> List[ConversationResponse]:
    """Lists conversations for current user."""
    convs = ConversationRepository.list_conversations(db, user_id=user_id)
    return [
        ConversationResponse(
            id=c.id,
            user_id=c.user_id,
            title=c.title,
            messages=[MessageResponse.model_validate(m) for m in c.messages],
            created_at=c.created_at,
            updated_at=c.updated_at,
        )
        for c in convs
    ]


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse, summary="Get conversation messages")
def get_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
) -> ConversationResponse:
    """Retrieves full conversation history and message stream."""
    conv = ConversationRepository.get_by_id(db, conversation_id)
    return ConversationResponse(
        id=conv.id,
        user_id=conv.user_id,
        title=conv.title,
        messages=[MessageResponse.model_validate(m) for m in conv.messages],
        created_at=conv.created_at,
        updated_at=conv.updated_at,
    )


class RenameConversationRequest(BaseModel):
    title: str


@router.patch("/conversations/{conversation_id}", response_model=ConversationResponse, summary="Rename a conversation")
def rename_conversation(
    conversation_id: str,
    body: RenameConversationRequest,
    db: Session = Depends(get_db),
) -> ConversationResponse:
    """Renames an existing conversation."""
    conv = ConversationRepository.rename(db, conversation_id, body.title)
    return ConversationResponse(
        id=conv.id,
        user_id=conv.user_id,
        title=conv.title,
        messages=[MessageResponse.model_validate(m) for m in conv.messages],
        created_at=conv.created_at,
        updated_at=conv.updated_at,
    )


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_200_OK, summary="Delete a conversation")
def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
):
    """Deletes a conversation and its messages."""
    ConversationRepository.delete(db, conversation_id)
    return {"message": f"Conversation '{conversation_id}' deleted successfully."}
