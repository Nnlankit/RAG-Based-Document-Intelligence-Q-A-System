"""Phase 3 Verification Tests.

Verifies:
- OllamaEmbeddingService generation (nomic-embed-text)
- ChromaDB indexing with embeddings and similarity search
- OllamaLLMService text generation (llama3.2)
"""

import pytest
from app.embeddings.embedding_service import OllamaEmbeddingService
from app.generation.llm import OllamaLLMService
from app.vectorstore.chroma import ChromaVectorStore


def test_ollama_embedding_service():
    """Verify OllamaEmbeddingService generates valid embeddings with nomic-embed-text."""
    service = OllamaEmbeddingService()
    query_vector = service.embed_query("What is document intelligence?")
    assert isinstance(query_vector, list)
    assert len(query_vector) == 768  # Standard nomic-embed-text dimension

    doc_vectors = service.embed_documents(["First document chunk.", "Second document chunk."])
    assert len(doc_vectors) == 2
    assert len(doc_vectors[0]) == 768
    assert len(doc_vectors[1]) == 768


def test_chroma_indexing_and_search(tmp_path):
    """Verify ChromaDB stores and retrieves embeddings accurately."""
    embedding_service = OllamaEmbeddingService()
    vs = ChromaVectorStore()

    chunks = [
        {
            "chunk_id": "test_chunk_001",
            "document_id": "doc_test_100",
            "chunk_index": 0,
            "content": "Deep learning uses neural networks with many layers to model complex representations.",
            "metadata": {"filename": "ai_book.pdf", "page_number": 5, "user_id": "test_user"},
        },
        {
            "chunk_id": "test_chunk_002",
            "document_id": "doc_test_100",
            "chunk_index": 1,
            "content": "Photosynthesis is the biological process by which green plants convert light energy into chemical energy.",
            "metadata": {"filename": "ai_book.pdf", "page_number": 6, "user_id": "test_user"},
        }
    ]

    contents = [c["content"] for c in chunks]
    embeddings = embedding_service.embed_documents(contents)

    added_ids = vs.add_chunks(chunks, embeddings)
    assert len(added_ids) == 2

    # Query about neural networks
    query_emb = embedding_service.embed_query("How do neural networks work in deep learning?")
    results = vs.search_by_vector(query_emb, k=2)

    assert len(results) >= 1
    # First result should be the deep learning chunk
    assert results[0].chunk_id == "test_chunk_001"
    assert results[0].score > 0.60
    assert results[0].metadata["page_number"] == 5

    # Cleanup
    vs.delete_document("doc_test_100")


def test_ollama_llm_generation():
    """Verify OllamaLLMService generates text with Llama 3.2."""
    llm = OllamaLLMService()
    response, latency_ms = llm.generate(
        prompt="Respond with only the single word 'CONFIRMED'.",
        temperature=0.0,
    )
    assert "CONFIRMED" in response.upper()
    assert latency_ms > 0
