"""Reranking interface and implementations for secondary stage ranking."""

from abc import ABC, abstractmethod
import logging
import re
from typing import List, Optional
from app.retrieval.models import RetrievedCandidate

logger = logging.getLogger("document_intelligence.retrieval.reranker")


class BaseReranker(ABC):
    """Abstract interface for candidate rerankers."""

    @abstractmethod
    def rerank(
        self,
        query: str,
        candidates: List[RetrievedCandidate],
        top_k: int = 5,
    ) -> List[RetrievedCandidate]:
        """Reranks initial candidate chunks and returns top_k highest-relevance items."""
        pass


class ScoreBlendedReranker(BaseReranker):
    """Fine-grained secondary reranker scoring lexical term overlap, phrase proximity, and vector score."""

    def __init__(self, lexical_weight: float = 0.35, dense_weight: float = 0.65) -> None:
        self.lexical_weight = lexical_weight
        self.dense_weight = dense_weight

    def rerank(
        self,
        query: str,
        candidates: List[RetrievedCandidate],
        top_k: int = 5,
    ) -> List[RetrievedCandidate]:
        """Calculates blended score: dense_score * dense_weight + term_overlap * lexical_weight."""
        if not candidates:
            return []

        query_terms = set(re.findall(r"\w+", query.lower()))
        reranked: List[RetrievedCandidate] = []

        for cand in candidates:
            cand_content = (cand.content or "").lower()
            cand_tokens = set(re.findall(r"\w+", cand_content))
            overlap_ratio = (
                len(query_terms.intersection(cand_tokens)) / len(query_terms)
                if query_terms
                else 0.0
            )

            phrase_boost = 0.15 if (query.lower().strip() in cand_content and query.strip()) else 0.0

            blended_score = round(
                (cand.score * self.dense_weight)
                + (overlap_ratio * self.lexical_weight)
                + phrase_boost,
                4,
            )
            final_score = max(0.0, min(1.0, blended_score))

            reranked.append(
                RetrievedCandidate(
                    chunk_id=cand.chunk_id,
                    document_id=cand.document_id,
                    content=cand.content,
                    filename=cand.filename,
                    page_number=cand.page_number,
                    chunk_index=cand.chunk_index,
                    score=final_score,
                    metadata=cand.metadata,
                )
            )

        reranked.sort(key=lambda x: x.score, reverse=True)
        logger.info(f"Reranked {len(candidates)} candidates down to top {top_k}.")
        return reranked[:top_k]
