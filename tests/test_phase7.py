"""Phase 7 Verification Tests.

Verifies:
- PostgreSQL / Relational persistent conversations & message tracking
- RetrievalLogRepository audit trail recording
- Vector store factory dynamic backend resolution (ChromaDB vs PgVector)
"""

import pytest
from app.database.postgres import SessionLocal, init_db
from app.database.repositories import ConversationRepository, RetrievalLogRepository
from app.database.models import User, Conversation, Message, RetrievalLog
from app.vectorstore import get_vector_store, ChromaVectorStore, PgVectorStore
from app.core.config import get_settings


def test_conversation_persistence():
    """Verify conversations and chronological messages persist in relational database."""
    init_db()
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == "default_user").first()
        assert user is not None

        # 1. Create conversation
        conv = ConversationRepository.get_or_create(
            db=db,
            conversation_id=None,
            user_id="default_user",
            initial_title="Initial Conversation Title",
        )
        conv_id = conv.id
        assert conv_id is not None
        assert conv.title == "Initial Conversation Title"

        # 2. Add User Message
        msg1 = ConversationRepository.add_message(
            db=db,
            conversation_id=conv_id,
            role="user",
            content="What are the key findings of section 4?",
        )
        assert msg1.id is not None
        assert msg1.role == "user"

        # 3. Add Assistant Message
        msg2 = ConversationRepository.add_message(
            db=db,
            conversation_id=conv_id,
            role="assistant",
            content="Section 4 details the empirical results showing 94% accuracy.",
        )
        assert msg2.id is not None
        assert msg2.role == "assistant"

        # 4. Fetch by ID and verify order
        fetched = ConversationRepository.get_by_id(db, conv_id)
        assert len(fetched.messages) >= 2
        assert fetched.messages[0].role == "user"
        assert fetched.messages[1].role == "assistant"


def test_retrieval_log_persistence():
    """Verify audit logs for RAG latency and chunk scores persist."""
    with SessionLocal() as db:
        conv = ConversationRepository.get_or_create(
            db=db, conversation_id=None, user_id="default_user"
        )

        log = RetrievalLogRepository.log(
            db=db,
            conversation_id=conv.id,
            query="Original user query",
            rewritten_query="Standalone rewritten query",
            retrieved_chunk_ids=["chunk_1", "chunk_2"],
            scores=[0.89, 0.74],
            retrieval_latency_ms=45.2,
            generation_latency_ms=850.5,
            total_latency_ms=895.7,
        )
        assert log.id is not None
        assert log.query == "Original user query"
        assert log.rewritten_query == "Standalone rewritten query"
        assert log.retrieval_latency_ms == 45.2
        assert log.generation_latency_ms == 850.5
        assert len(log.retrieved_chunk_ids) == 2


def test_vector_store_factory_switching(monkeypatch):
    """Verify get_vector_store respects VECTOR_STORE configuration."""
    settings = get_settings()

    monkeypatch.setattr(settings, "VECTOR_STORE", "chroma")
    vs_chroma = get_vector_store()
    assert isinstance(vs_chroma, ChromaVectorStore)

    monkeypatch.setattr(settings, "VECTOR_STORE", "pgvector")
    vs_pg = get_vector_store()
    assert isinstance(vs_pg, PgVectorStore)
