"""SQLAlchemy Database Models.

Defines schemas for users, documents, document chunks, conversations, messages,
and retrieval observability logs.
"""

from datetime import datetime, timezone
import json
import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Text,
    DateTime,
    ForeignKey,
    Index,
    JSON,
    Boolean,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


def generate_uuid() -> str:
    """Generate a clean UUID string."""
    return str(uuid.uuid4())


def utc_now() -> datetime:
    """Return timezone-aware current UTC datetime."""
    return datetime.now(timezone.utc)


class User(Base):
    """User account model."""
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")


class Document(Base):
    """Document metadata model."""
    __tablename__ = "documents"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)
    checksum = Column(String(64), nullable=False, index=True)
    storage_path = Column(String(512), nullable=False)
    status = Column(String(50), default="pending", nullable=False)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    user = relationship("User", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_documents_user_checksum", "user_id", "checksum"),
    )


class DocumentChunk(Base):
    """Document text chunk and vector metadata model."""
    __tablename__ = "document_chunks"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    document_id = Column(String(64), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, nullable=True)
    content = Column(Text, nullable=False)
    chunk_metadata = Column("metadata", JSON, default=dict)
    # Embedding can be stored as JSON / Text in SQLite, or pgvector Vector(768) in PostgreSQL
    embedding = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    document = relationship("Document", back_populates="chunks")

    __table_args__ = (
        Index("ix_chunks_doc_index", "document_id", "chunk_index"),
    )


class Conversation(Base):
    """Conversation session model."""
    __tablename__ = "conversations"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), default="New Conversation", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")
    retrieval_logs = relationship("RetrievalLog", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    """Individual conversational message model."""
    __tablename__ = "messages"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(64), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")


class RetrievalLog(Base):
    """Observability and audit log for RAG queries and latency."""
    __tablename__ = "retrieval_logs"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(64), ForeignKey("conversations.id", ondelete="SET NULL"), nullable=True, index=True)
    query = Column(Text, nullable=False)
    rewritten_query = Column(Text, nullable=True)
    retrieved_chunk_ids = Column(JSON, default=list)
    scores = Column(JSON, default=list)
    retrieval_latency_ms = Column(Float, nullable=False)
    generation_latency_ms = Column(Float, nullable=False)
    total_latency_ms = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    conversation = relationship("Conversation", back_populates="retrieval_logs")
