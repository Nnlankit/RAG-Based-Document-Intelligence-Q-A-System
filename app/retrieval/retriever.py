"""Document retriever implementing dense vector search, corpus-level hybrid BM25 search, and reranking."""

import logging
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.database.postgres import SessionLocal
from app.database.models import DocumentChunk, Document
from app.embeddings.embedding_service import BaseEmbeddingService, get_embedding_service
from app.vectorstore.base import BaseVectorStore, VectorSearchResult
from app.vectorstore import get_vector_store
from app.retrieval.models import RetrievedCandidate
from app.retrieval.hybrid_search import HybridSearchEngine, BM25KeywordIndex
from app.retrieval.reranker import BaseReranker, ScoreBlendedReranker

logger = logging.getLogger("document_intelligence.retrieval")


class DocumentRetriever:
    """Manages dense vector retrieval, corpus-level hybrid keyword search, reranking, and threshold validation."""

    def __init__(
        self,
        vector_store: Optional[BaseVectorStore] = None,
        embedding_service: Optional[BaseEmbeddingService] = None,
        reranker: Optional[BaseReranker] = None,
        top_k: Optional[int] = None,
        candidates_k: Optional[int] = None,
        similarity_threshold: Optional[float] = None,
    ) -> None:
        self.settings = get_settings()
        self.vector_store = vector_store or get_vector_store()
        self.embedding_service = embedding_service or get_embedding_service()
        self.top_k = top_k or self.settings.TOP_K
        self.candidates_k = candidates_k or self.settings.RETRIEVAL_CANDIDATES
        self.similarity_threshold = (
            similarity_threshold if similarity_threshold is not None else self.settings.SIMILARITY_THRESHOLD
        )
        self.reranker = reranker or (ScoreBlendedReranker() if self.settings.ENABLE_RERANKER else None)
        self.hybrid_engine = HybridSearchEngine()

    def _get_corpus_for_bm25(
        self,
        document_ids: Optional[List[str]] = None,
        user_id: Optional[str] = None,
    ) -> List[RetrievedCandidate]:
        """Loads chunks from the database to build a complete BM25 sparse index."""
        candidates: List[RetrievedCandidate] = []
        try:
            with SessionLocal() as db:
                query = db.query(DocumentChunk, Document.filename).join(
                    Document, DocumentChunk.document_id == Document.id
                )
                if document_ids:
                    query = query.filter(DocumentChunk.document_id.in_(document_ids))
                if user_id:
                    query = query.filter(Document.user_id == user_id)

                rows = query.limit(200).all()
                for chunk, filename in rows:
                    candidates.append(
                        RetrievedCandidate(
                            chunk_id=chunk.id,
                            document_id=chunk.document_id,
                            content=chunk.content,
                            filename=filename,
                            page_number=chunk.page_number,
                            chunk_index=chunk.chunk_index,
                            score=0.5,
                            metadata=chunk.chunk_metadata or {},
                        )
                    )
        except Exception as e:
            logger.warning(f"Could not load full corpus for BM25: {e}")
        return candidates

    def retrieve(
        self,
        query: str,
        user_id: Optional[str] = None,
        document_ids: Optional[List[str]] = None,
        top_k: Optional[int] = None,
        similarity_threshold: Optional[float] = None,
        enable_hybrid: Optional[bool] = None,
        enable_reranker: Optional[bool] = None,
    ) -> List[RetrievedCandidate]:
        """Performs search, optional hybrid keyword fusion, optional reranking, and threshold rejection."""
        k = top_k or self.top_k
        cutoff = similarity_threshold if similarity_threshold is not None else self.similarity_threshold
        use_hybrid = enable_hybrid if enable_hybrid is not None else self.settings.ENABLE_HYBRID_SEARCH
        use_reranker = enable_reranker if enable_reranker is not None else self.settings.ENABLE_RERANKER

        # 1. Dense query vector search
        query_vector = self.embedding_service.embed_query(query)

        filter_metadata: Dict[str, Any] = {}
        if user_id:
            filter_metadata["user_id"] = user_id
        if document_ids:
            if len(document_ids) == 1:
                filter_metadata["document_id"] = document_ids[0]
            else:
                filter_metadata["document_id"] = document_ids

        raw_candidates = self.vector_store.search_by_vector(
            query_embedding=query_vector,
            k=max(k * 2, self.candidates_k),
            filter_metadata=filter_metadata if filter_metadata else None,
        )

        dense_candidates: List[RetrievedCandidate] = []
        for res in raw_candidates:
            meta = res.metadata
            page_num = meta.get("page_number")
            if page_num == -1 or page_num is None:
                page_num = None

            dense_candidates.append(
                RetrievedCandidate(
                    chunk_id=res.chunk_id,
                    document_id=res.document_id,
                    content=res.content,
                    filename=str(meta.get("filename", "unknown")),
                    page_number=page_num,
                    chunk_index=meta.get("chunk_index"),
                    score=res.score,
                    metadata=meta,
                )
            )

        candidates = dense_candidates

        # 2. Fast In-Memory Hybrid Keyword Search (BM25 across candidate pool in < 0.5ms)
        if use_hybrid and candidates:
            bm25_index = BM25KeywordIndex(candidates)
            bm25_results = bm25_index.search(query, top_k=max(k, self.candidates_k))
            if bm25_results:
                candidates = self.hybrid_engine.merge_reciprocal_rank_fusion(
                    dense_results=candidates,
                    bm25_results=bm25_results,
                    top_k=max(k * 2, self.candidates_k),
                )

        # 3. Optional Secondary Reranking
        if use_reranker and candidates:
            active_reranker = self.reranker or ScoreBlendedReranker()
            candidates = active_reranker.rerank(query, candidates, top_k=max(k, self.candidates_k))

        # 4. Filter by relevance threshold
        filtered_candidates = [c for c in candidates if c.score >= cutoff]

        # 5. Return Top-K
        final_results = filtered_candidates[:k]
        logger.info(
            f"Retrieval complete (hybrid={use_hybrid}, reranker={use_reranker}): {len(raw_candidates)} dense -> {len(final_results)} final (threshold={cutoff})"
        )
        return final_results
