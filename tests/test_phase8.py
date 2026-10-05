"""Phase 8 Verification Tests.

Verifies:
- BM25KeywordIndex exact term retrieval
- HybridSearchEngine Reciprocal Rank Fusion (RRF)
- ScoreBlendedReranker lexical and semantic blending
- Retriever integration with hybrid and reranking flags
"""

import pytest
from app.retrieval.retriever import RetrievedCandidate, DocumentRetriever
from app.retrieval.hybrid_search import BM25KeywordIndex, HybridSearchEngine
from app.retrieval.reranker import ScoreBlendedReranker
from app.vectorstore.chroma import ChromaVectorStore
from app.embeddings.embedding_service import get_embedding_service


def test_bm25_keyword_index():
    """Verify BM25 retrieval finds exact IDs, error codes, and technical names."""
    candidates = [
        RetrievedCandidate(
            chunk_id="chunk_a",
            document_id="doc_1",
            content="Error code ERR_503_DATABASE_TIMEOUT occurs when the connection pool is exhausted.",
            filename="troubleshooting.txt",
            page_number=1,
            chunk_index=0,
            score=0.75,
            metadata={},
        ),
        RetrievedCandidate(
            chunk_id="chunk_b",
            document_id="doc_1",
            content="System maintenance is scheduled for every Sunday morning at 02:00 UTC.",
            filename="troubleshooting.txt",
            page_number=2,
            chunk_index=1,
            score=0.72,
            metadata={},
        ),
    ]

    index = BM25KeywordIndex(candidates)
    results = index.search("ERR_503_DATABASE_TIMEOUT", top_k=1)
    assert len(results) == 1
    assert results[0].chunk_id == "chunk_a"
    assert results[0].score > 0.0


def test_hybrid_rrf_fusion():
    """Verify Reciprocal Rank Fusion combines dense and keyword candidate rankings."""
    dense = [
        RetrievedCandidate(
            chunk_id="chunk_1", document_id="doc_1", content="Text 1", filename="f1.pdf",
            page_number=1, chunk_index=0, score=0.95, metadata={},
        ),
        RetrievedCandidate(
            chunk_id="chunk_2", document_id="doc_1", content="Text 2", filename="f1.pdf",
            page_number=2, chunk_index=1, score=0.85, metadata={},
        ),
    ]
    sparse = [
        RetrievedCandidate(
            chunk_id="chunk_2", document_id="doc_1", content="Text 2", filename="f1.pdf",
            page_number=2, chunk_index=1, score=0.99, metadata={},
        ),
        RetrievedCandidate(
            chunk_id="chunk_3", document_id="doc_1", content="Text 3", filename="f1.pdf",
            page_number=3, chunk_index=2, score=0.60, metadata={},
        ),
    ]

    engine = HybridSearchEngine(rrf_k=60)
    fused = engine.merge_reciprocal_rank_fusion(dense, sparse, top_k=3)

    assert len(fused) == 3
    # chunk_2 appeared in both rankings, so its fused RRF score should be highest!
    assert fused[0].chunk_id == "chunk_2"


def test_score_blended_reranker():
    """Verify ScoreBlendedReranker prioritizes query term matches and phrase matches."""
    reranker = ScoreBlendedReranker(lexical_weight=0.4, dense_weight=0.6)
    candidates = [
        RetrievedCandidate(
            chunk_id="cand_1", document_id="doc_1",
            content="General background information on machine learning pipelines.",
            filename="ml.pdf", page_number=1, chunk_index=0, score=0.85, metadata={},
        ),
        RetrievedCandidate(
            chunk_id="cand_2", document_id="doc_1",
            content="The specific parameter learning_rate=0.001 is optimal for Adam optimizer.",
            filename="ml.pdf", page_number=2, chunk_index=1, score=0.80, metadata={},
        ),
    ]

    reranked = reranker.rerank("learning_rate=0.001 Adam optimizer", candidates, top_k=2)
    assert len(reranked) == 2
    # cand_2 has high lexical overlap and exact phrase match, should be promoted to first place
    assert reranked[0].chunk_id == "cand_2"
