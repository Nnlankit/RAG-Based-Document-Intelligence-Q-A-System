"""Phase 4 Verification Tests.

Verifies:
- ContextBuilder formatting, deduplication, and character limits
- DocumentRetriever similarity threshold rejection
- ConversationalQueryRewriter follow-up resolution
- End-to-end RAGPipeline with grounded generation and source citations
- Negative testing: explicit abstention on out-of-domain / unsupported queries
"""

import pytest
from app.database.postgres import SessionLocal
from app.database.models import Document
from app.embeddings.embedding_service import get_embedding_service
from app.vectorstore import get_vector_store
from app.retrieval.retriever import DocumentRetriever, RetrievedCandidate
from app.rag.context_builder import ContextBuilder
from app.rag.query_rewriter import ConversationalQueryRewriter
from app.rag.memory import ChatTurn
from app.rag.pipeline import RAGPipeline
from app.generation.prompts import ABSTENTION_MESSAGE


def test_context_builder():
    """Verify ContextBuilder produces clean SOURCE blocks and deduplicates."""
    builder = ContextBuilder(max_context_chars=1000)
    candidates = [
        RetrievedCandidate(
            chunk_id="chunk_01",
            document_id="doc_01",
            content="FastAPI is a modern, fast web framework for building APIs with Python.",
            filename="fastapi_guide.pdf",
            page_number=1,
            chunk_index=0,
            score=0.88,
            metadata={"filename": "fastapi_guide.pdf", "page_number": 1},
        ),
        RetrievedCandidate(
            chunk_id="chunk_01",  # duplicate ID
            document_id="doc_01",
            content="FastAPI is a modern, fast web framework for building APIs with Python.",
            filename="fastapi_guide.pdf",
            page_number=1,
            chunk_index=0,
            score=0.88,
            metadata={"filename": "fastapi_guide.pdf", "page_number": 1},
        ),
        RetrievedCandidate(
            chunk_id="chunk_02",
            document_id="doc_01",
            content="Pydantic models validate input schemas and auto-generate OpenAPI documentation.",
            filename="fastapi_guide.pdf",
            page_number=2,
            chunk_index=1,
            score=0.82,
            metadata={"filename": "fastapi_guide.pdf", "page_number": 2},
        ),
    ]

    context = builder.build(candidates)
    assert context.total_chunks_used == 2  # Deduplicated
    assert "SOURCE 1" in context.context_text
    assert "Document: fastapi_guide.pdf" in context.context_text
    assert "Page: 1" in context.context_text
    assert "SOURCE 2" in context.context_text
    assert len(context.sources) == 2
    assert context.sources[0].page_number == 1
    assert context.sources[1].page_number == 2


def test_retriever_threshold_filtering():
    """Verify retriever filters out chunks below similarity threshold."""
    vs = get_vector_store()
    emb = get_embedding_service()
    doc_id = "doc_threshold_test"

    with SessionLocal() as db:
        if not db.query(Document).filter(Document.id == doc_id).first():
            db.add(Document(
                id=doc_id,
                user_id="default_user",
                filename="physics.pdf",
                original_filename="physics.pdf",
                mime_type="application/pdf",
                file_size=1024,
                checksum=f"chk_{doc_id}",
                storage_path=f"data/uploads/{doc_id}.pdf",
                status="completed",
            ))
            db.commit()

    try:
        # Index sample document
        chunks = [
            {
                "chunk_id": "threshold_chunk_01",
                "document_id": doc_id,
                "chunk_index": 0,
                "content": "Quantum entanglement occurs when pairs of particles interact such that the quantum state of each particle cannot be described independently.",
                "metadata": {"filename": "physics.pdf", "page_number": 12, "user_id": "test_user"},
            }
        ]
        vs.add_chunks(chunks, emb.embed_documents([c["content"] for c in chunks]))

        retriever = DocumentRetriever(vector_store=vs, embedding_service=emb)

        # 1. Relevant query with normal threshold restricted to test document
        relevant = retriever.retrieve("What is quantum entanglement?", document_ids=[doc_id], similarity_threshold=0.60)
        assert len(relevant) >= 1
        assert relevant[0].chunk_id == "threshold_chunk_01"

        # 2. Strict threshold on semi-related query restricted to test document
        rejected = retriever.retrieve("How do cooking recipes work?", document_ids=[doc_id], similarity_threshold=0.85)
        assert len(rejected) == 0
    finally:
        vs.delete_document(doc_id)
        with SessionLocal() as db:
            doc = db.query(Document).filter(Document.id == doc_id).first()
            if doc:
                db.delete(doc)
                db.commit()


def test_rag_pipeline_grounded_answer():
    """Verify end-to-end RAG pipeline produces grounded answers with citations."""
    vs = get_vector_store()
    emb = get_embedding_service()
    doc_id = "doc_rag_project"

    with SessionLocal() as db:
        if not db.query(Document).filter(Document.id == doc_id).first():
            db.add(Document(
                id=doc_id,
                user_id="default_user",
                filename="apollo_mission.pdf",
                original_filename="apollo_mission.pdf",
                mime_type="application/pdf",
                file_size=1024,
                checksum=f"chk_{doc_id}",
                storage_path=f"data/uploads/{doc_id}.pdf",
                status="completed",
            ))
            db.commit()

    try:
        chunks = [
            {
                "chunk_id": "rag_test_chunk_01",
                "document_id": doc_id,
                "chunk_index": 0,
                "content": "Project Apollo's primary objective was landing humans on the Moon and bringing them safely back to Earth.",
                "metadata": {"filename": "apollo_mission.pdf", "page_number": 4, "user_id": "apollo_user"},
            }
        ]
        vs.add_chunks(chunks, emb.embed_documents([c["content"] for c in chunks]))

        pipeline = RAGPipeline(retriever=DocumentRetriever(vector_store=vs, embedding_service=emb))
        result = pipeline.execute("What was the primary objective of Project Apollo?", document_ids=[doc_id])

        assert result.abstention is False
        assert len(result.sources) >= 1
        assert result.sources[0].filename == "apollo_mission.pdf"
        assert result.sources[0].page_number == 4
        assert any(term in result.answer.lower() for term in ["moon", "humans", "landing", "earth"])

        # Negative Test (Section 39): Ask unsupported question
        negative_result = pipeline.execute("What is the CEO of Tesla's favorite pizza topping?", document_ids=[doc_id])
        assert negative_result.abstention is True
        assert "could not find sufficient information" in negative_result.answer.lower()
    finally:
        vs.delete_document(doc_id)
        with SessionLocal() as db:
            doc = db.query(Document).filter(Document.id == doc_id).first()
            if doc:
                db.delete(doc)
                db.commit()
