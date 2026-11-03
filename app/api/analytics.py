"""Analytics and operational metrics endpoints."""

from datetime import datetime, timezone, timedelta
import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pathlib import Path

from app.database.postgres import get_db
from app.database.models import Document, DocumentChunk, Conversation, Message
from app.database.repositories import RetrievalLogRepository

router = APIRouter(prefix="/analytics")
logger = logging.getLogger("document_intelligence.api.analytics")


def normalize_doc_type(filename: str, mime_type: Optional[str] = None) -> str:
    """Classifies document file types using filename extension and MIME type fallback."""
    ext = Path(filename).suffix.lower().lstrip(".")
    if ext == "pdf":
        return "PDF"
    elif ext in ("docx", "doc"):
        return "DOCX"
    elif ext in ("txt", "text"):
        return "TXT"
    elif ext in ("md", "markdown"):
        return "MD"

    # Fallback inspection of MIME type
    if mime_type:
        mime = mime_type.lower()
        if "pdf" in mime:
            return "PDF"
        elif "word" in mime or "officedocument.wordprocessingml" in mime:
            return "DOCX"
        elif "text/plain" in mime:
            return "TXT"
        elif "markdown" in mime:
            return "MD"

    if ext:
        return ext.upper()
    return "Other"


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

    # Dynamic document type classification & breakdown
    standard_types = ["PDF", "DOCX", "TXT", "MD"]
    type_counts: Dict[str, int] = {cat: 0 for cat in standard_types}
    doc_types: Dict[str, int] = {}

    for d in docs:
        ext = Path(d.filename).suffix.lower().lstrip(".") or "unknown"
        doc_types[ext] = doc_types.get(ext, 0) + 1

        norm = normalize_doc_type(d.filename, d.mime_type)
        if norm in type_counts:
            type_counts[norm] += 1
        else:
            type_counts[norm] = type_counts.get(norm, 0) + 1

    document_distribution = []
    for name, val in type_counts.items():
        pct = round((val / total_docs) * 100, 2) if total_docs > 0 else 0.0
        document_distribution.append({
            "name": name,
            "value": val,
            "percentage": pct,
        })

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
    min_dt = datetime.min.replace(tzinfo=timezone.utc)
    for d in sorted(docs, key=lambda x: x.created_at if x.created_at is not None else min_dt, reverse=True)[:5]:
        c_count = db.query(DocumentChunk).filter(DocumentChunk.document_id == d.id).count()
        top_docs.append({
            "id": d.id,
            "filename": d.filename,
            "file_size": d.file_size,
            "chunk_count": c_count,
            "status": d.status,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        })

    # 7. Real Knowledge Activity Timeline (past 30 days)
    now_utc = datetime.now(timezone.utc)
    dates_map: Dict[str, Dict[str, Any]] = {}
    for i in range(29, -1, -1):
        day_str = (now_utc - timedelta(days=i)).strftime("%Y-%m-%d")
        dates_map[day_str] = {
            "date": day_str,
            "documents": 0,
            "questions": 0,
            "answers": 0,
        }

    for d in docs:
        if d.created_at:
            d_str = d.created_at.strftime("%Y-%m-%d")
            if d_str in dates_map:
                dates_map[d_str]["documents"] += 1

    user_convs = db.query(Conversation.id).filter(Conversation.user_id == user_id).all()
    user_conv_ids = [c[0] for c in user_convs]
    if user_conv_ids:
        msgs = db.query(Message.role, Message.created_at).filter(Message.conversation_id.in_(user_conv_ids)).all()
        for role, created_at in msgs:
            if created_at:
                m_str = created_at.strftime("%Y-%m-%d")
                if m_str in dates_map:
                    if role == "user":
                        dates_map[m_str]["questions"] += 1
                    elif role == "assistant":
                        dates_map[m_str]["answers"] += 1

    activity_timeline = sorted(dates_map.values(), key=lambda x: x["date"])

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
        "document_distribution": document_distribution,
        "activity_timeline": activity_timeline,
        "recent_queries": recent_queries,
        "top_documents": top_docs,
    }
