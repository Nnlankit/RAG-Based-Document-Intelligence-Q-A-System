"""Analytics and operational metrics endpoints."""

import logging
from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from pathlib import Path

from app.database.postgres import get_db
from app.database.models import Document, DocumentChunk, Conversation, Message, RetrievalLog
from app.database.repositories import RetrievalLogRepository

router = APIRouter(prefix="/analytics")
logger = logging.getLogger("document_intelligence.api.analytics")


@router.get("/stats", summary="Get comprehensive system and RAG analytics")
def get_analytics_stats(
    db: Session = Depends(get_db),
    user_id: str = "default_user",
) -> Dict[str, Any]:
    """Computes real-time analytics across documents, chunks, chat queries, and latency."""
    # 1. Documents stats
    docs = db.query(Document).filter(Document.status != "deleted", Document.user_id == user_id).all()
    total_docs = len(docs)
    total_file_size = sum(d.file_size for d in docs)

    # Breakdown by file type
    doc_types: Dict[str, int] = {}
    for d in docs:
        ext = Path(d.filename).suffix.lower().lstrip(".") or "unknown"
        doc_types[ext] = doc_types.get(ext, 0) + 1

    # 2. Chunks count
    total_chunks = (
        db.query(DocumentChunk)
        .join(Document, Document.id == DocumentChunk.document_id)
        .filter(Document.user_id == user_id)
        .count()
    )

    # 3. Conversations and messages
    total_conversations = db.query(Conversation).filter(Conversation.user_id == user_id).count()
    total_messages = (
        db.query(Message)
        .join(Conversation, Conversation.id == Message.conversation_id)
        .filter(Conversation.user_id == user_id)
        .count()
    )

    # 4. Retrieval & query stats
    stats = RetrievalLogRepository.get_stats(db)

    # 5. Recent queries (last 15)
    recent_logs = RetrievalLogRepository.list_logs(db, limit=15)
    recent_queries = [
        {
            "id": log.id,
            "query": log.query,
            "rewritten_query": log.rewritten_query,
            "chunks_retrieved": len(log.retrieved_chunk_ids) if log.retrieved_chunk_ids else 0,
            "retrieval_latency_ms": log.retrieval_latency_ms,
            "generation_latency_ms": log.generation_latency_ms,
            "total_latency_ms": log.total_latency_ms,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in recent_logs
    ]

    # 6. Top documents by chunk count
    top_docs = []
    for d in sorted(docs, key=lambda x: x.created_at, reverse=True)[:5]:
        c_count = db.query(DocumentChunk).filter(DocumentChunk.document_id == d.id).count()
        top_docs.append({
            "id": d.id,
            "filename": d.filename,
            "file_size": d.file_size,
            "chunk_count": c_count,
            "status": d.status,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        })

    return {
        "overview": {
            "total_documents": total_docs,
            "total_chunks": total_chunks,
            "total_conversations": total_conversations,
            "total_messages": total_messages,
            "total_queries": stats["total_queries"],
            "total_storage_bytes": total_file_size,
            "success_rate": stats["success_rate"],
        },
        "performance": {
            "avg_retrieval_ms": stats["avg_retrieval_ms"],
            "avg_generation_ms": stats["avg_generation_ms"],
            "avg_total_ms": stats["avg_total_ms"],
        },
        "document_types": doc_types,
        "recent_queries": recent_queries,
        "top_documents": top_docs,
    }
