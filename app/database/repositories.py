"""Database repositories providing clean data access and persistence operations."""

from datetime import datetime, timezone
import hashlib
import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.models import User, Document, DocumentChunk, Conversation, Message, RetrievalLog
from app.core.exceptions import (
    DocumentNotFoundError,
    ConversationNotFoundError,
    DuplicateDocumentError,
)

logger = logging.getLogger("document_intelligence.database.repositories")


def calculate_sha256(file_bytes: bytes) -> str:
    """Computes SHA-256 hex digest of file bytes."""
    return hashlib.sha256(file_bytes).hexdigest()


class DocumentRepository:
    """Manages persistence, retrieval, status updates, and cascading deletion for documents."""

    @classmethod
    def get_by_id(cls, db: Session, document_id: str, user_id: Optional[str] = None) -> Document:
        """Finds document by ID, optionally verifying ownership."""
        query = db.query(Document).filter(Document.id == document_id)
        if user_id:
            query = query.filter(Document.user_id == user_id)
        doc = query.first()
        if not doc:
            raise DocumentNotFoundError(f"Document with ID '{document_id}' was not found.")
        return doc

    @classmethod
    def find_duplicate(cls, db: Session, checksum: str, user_id: str) -> Optional[Document]:
        """Detects if a file with the same SHA-256 checksum exists for this user."""
        return (
            db.query(Document)
            .filter(
                Document.user_id == user_id,
                Document.checksum == checksum,
                Document.status.in_(["completed", "processing"]),
            )
            .first()
        )

    @classmethod
    def list_documents(
        cls,
        db: Session,
        user_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Document]:
        """Lists active documents, excluding deleted ones."""
        query = db.query(Document).filter(Document.status != "deleted")
        if user_id:
            query = query.filter(Document.user_id == user_id)
        return query.order_by(desc(Document.created_at)).offset(skip).limit(limit).all()

    @classmethod
    def create(
        cls,
        db: Session,
        document_id: str,
        user_id: str,
        filename: str,
        original_filename: str,
        mime_type: str,
        file_size: int,
        checksum: str,
        storage_path: str,
        status: str = "pending",
    ) -> Document:
        """Creates a new document record."""
        doc = Document(
            id=document_id,
            user_id=user_id,
            filename=filename,
            original_filename=original_filename,
            mime_type=mime_type,
            file_size=file_size,
            checksum=checksum,
            storage_path=storage_path,
            status=status,
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc

    @classmethod
    def update_status(
        cls,
        db: Session,
        document_id: str,
        status: str,
        error_message: Optional[str] = None,
    ) -> Document:
        """Updates document processing status and optional error message."""
        doc = db.query(Document).filter(Document.id == document_id).first()
        if doc:
            doc.status = status
            doc.error_message = error_message
            doc.updated_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(doc)
        return doc

    @classmethod
    def add_chunks(
        cls,
        db: Session,
        document_id: str,
        chunks: List[Dict[str, Any]],
        embeddings: Optional[List[List[float]]] = None,
    ) -> None:
        """Persists chunk text, metadata, and optional embeddings to document_chunks table."""
        chunk_objects = []
        for i, chunk in enumerate(chunks):
            emb_str = json.dumps(embeddings[i]) if embeddings and i < len(embeddings) else None
            chunk_objects.append(
                DocumentChunk(
                    id=chunk["chunk_id"],
                    document_id=document_id,
                    chunk_index=chunk.get("chunk_index", i),
                    page_number=chunk.get("page_number"),
                    content=chunk["content"],
                    chunk_metadata=chunk.get("metadata", {}),
                    embedding=emb_str,
                )
            )
        db.bulk_save_objects(chunk_objects)
        db.commit()

    @classmethod
    def get_chunk_count(cls, db: Session, document_id: str) -> int:
        """Returns the number of indexed chunks for a document."""
        return db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).count()

    @classmethod
    def get_chunks(cls, db: Session, document_id: str) -> List[DocumentChunk]:
        """Returns all chunks for a document ordered by chunk_index."""
        return (
            db.query(DocumentChunk)
            .filter(DocumentChunk.document_id == document_id)
            .order_by(DocumentChunk.chunk_index)
            .all()
        )

    @classmethod
    def delete(cls, db: Session, document_id: str) -> None:
        """Deletes database record and associated chunks."""
        doc = db.query(Document).filter(Document.id == document_id).first()
        if doc:
            db.delete(doc)  # cascade deletes DocumentChunks
            db.commit()


class ConversationRepository:
    """Manages conversation sessions and chronological message logs."""

    @classmethod
    def get_or_create(
        cls,
        db: Session,
        conversation_id: Optional[str],
        user_id: str,
        initial_title: Optional[str] = None,
    ) -> Conversation:
        """Fetches existing conversation or creates a new one."""
        if conversation_id:
            conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
            if conv:
                return conv

        title = initial_title or "New Conversation"
        new_conv = Conversation(
            user_id=user_id,
            title=title[:100],
        )
        db.add(new_conv)
        db.commit()
        db.refresh(new_conv)
        return new_conv

    @classmethod
    def get_by_id(cls, db: Session, conversation_id: str) -> Conversation:
        """Fetches conversation by ID with messages."""
        conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conv:
            raise ConversationNotFoundError(f"Conversation '{conversation_id}' was not found.")
        return conv

    @classmethod
    def list_conversations(
        cls,
        db: Session,
        user_id: Optional[str] = None,
        limit: int = 50,
    ) -> List[Conversation]:
        """Lists conversations for user."""
        query = db.query(Conversation)
        if user_id:
            query = query.filter(Conversation.user_id == user_id)
        return query.order_by(desc(Conversation.updated_at)).limit(limit).all()

    @classmethod
    def add_message(
        cls,
        db: Session,
        conversation_id: str,
        role: str,
        content: str,
    ) -> Message:
        """Adds a message to a conversation."""
        msg = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
        )
        db.add(msg)
        # Update conversation timestamp
        conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if conv:
            conv.updated_at = datetime.now(timezone.utc)
            if conv.title == "New Conversation" and role == "user":
                conv.title = content[:40] + ("..." if len(content) > 40 else "")

        db.commit()
        db.refresh(msg)
        return msg

    @classmethod
    def rename(cls, db: Session, conversation_id: str, new_title: str) -> Conversation:
        """Renames a conversation."""
        conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conv:
            raise ConversationNotFoundError(f"Conversation '{conversation_id}' was not found.")
        conv.title = new_title.strip()[:100]
        conv.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(conv)
        return conv

    @classmethod
    def delete(cls, db: Session, conversation_id: str) -> None:
        """Deletes a conversation and its messages."""
        conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if conv:
            db.delete(conv)
            db.commit()


class RetrievalLogRepository:
    """Logs RAG retrieval query metrics and chunk scores for observability."""

    @classmethod
    def log(
        cls,
        db: Session,
        conversation_id: Optional[str],
        query: str,
        rewritten_query: Optional[str],
        retrieved_chunk_ids: List[str],
        scores: List[float],
        retrieval_latency_ms: float,
        generation_latency_ms: float,
        total_latency_ms: float,
    ) -> RetrievalLog:
        """Creates an audit log entry for a RAG execution turn."""
        log_entry = RetrievalLog(
            conversation_id=conversation_id,
            query=query,
            rewritten_query=rewritten_query,
            retrieved_chunk_ids=retrieved_chunk_ids,
            scores=scores,
            retrieval_latency_ms=retrieval_latency_ms,
            generation_latency_ms=generation_latency_ms,
            total_latency_ms=total_latency_ms,
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry

    @classmethod
    def list_logs(cls, db: Session, limit: int = 50) -> List[RetrievalLog]:
        """Returns recent retrieval logs ordered by latest first."""
        return db.query(RetrievalLog).order_by(desc(RetrievalLog.created_at)).limit(limit).all()

    @classmethod
    def get_stats(cls, db: Session) -> Dict[str, Any]:
        """Aggregates metrics for the analytics dashboard."""
        logs = db.query(RetrievalLog).all()
        total_queries = len(logs)
        avg_retrieval_ms = round(sum(l.retrieval_latency_ms for l in logs) / total_queries, 2) if total_queries else 0.0
        avg_generation_ms = round(sum(l.generation_latency_ms for l in logs) / total_queries, 2) if total_queries else 0.0
        avg_total_ms = round(sum(l.total_latency_ms for l in logs) / total_queries, 2) if total_queries else 0.0

        # Success rate (queries that retrieved at least one chunk)
        successful_queries = sum(1 for l in logs if l.retrieved_chunk_ids and len(l.retrieved_chunk_ids) > 0)
        success_rate = round((successful_queries / total_queries) * 100, 1) if total_queries else 100.0

        return {
            "total_queries": total_queries,
            "avg_retrieval_ms": avg_retrieval_ms,
            "avg_generation_ms": avg_generation_ms,
            "avg_total_ms": avg_total_ms,
            "success_rate": success_rate,
        }
