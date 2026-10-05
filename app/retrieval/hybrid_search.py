"""Hybrid Search module combining Dense Vector Search and BM25 Keyword Search with Reciprocal Rank Fusion."""

from dataclasses import dataclass
import logging
import re
from typing import Any, Dict, List, Optional
from rank_bm25 import BM25Plus

from app.retrieval.models import RetrievedCandidate

logger = logging.getLogger("document_intelligence.retrieval.hybrid")


def simple_tokenize(text: Optional[str]) -> List[str]:
    """Tokenizes text into lowercase alphanumeric tokens."""
    if not text:
        return []
    return re.findall(r"\w+", text.lower())


class BM25KeywordIndex:
    """Corpus-level BM25Plus keyword index for exact terms, names, dates, and codes."""

    def __init__(self, candidates: List[RetrievedCandidate]) -> None:
        self.candidates = candidates
        self.corpus = [simple_tokenize(c.content) for c in candidates]
        self.bm25 = BM25Plus(self.corpus) if self.corpus else None

    def search(self, query: str, top_k: int = 10) -> List[RetrievedCandidate]:
        """Scores candidates using BM25Plus and returns ranked candidates."""
        if not self.bm25 or not self.candidates:
            return []

        tokens = simple_tokenize(query)
        if not tokens:
            return []

        scores = self.bm25.get_scores(tokens)
        max_score = float(max(scores)) if any(scores) else 1.0
        if max_score <= 0.0:
            max_score = 1.0

        scored_candidates = []
        for cand, score in zip(self.candidates, scores):
            if score <= 0.0:
                continue
            norm_score = round(float(min(1.0, score / max_score)), 4)
            scored_candidates.append(
                RetrievedCandidate(
                    chunk_id=cand.chunk_id,
                    document_id=cand.document_id,
                    content=cand.content,
                    filename=cand.filename,
                    page_number=cand.page_number,
                    chunk_index=cand.chunk_index,
                    score=norm_score,
                    metadata=cand.metadata,
                )
            )

        scored_candidates.sort(key=lambda x: x.score, reverse=True)
        return scored_candidates[:top_k]


class HybridSearchEngine:
    """Merges Dense Semantic Search and Sparse BM25 Keyword Search using Reciprocal Rank Fusion (RRF)."""

    def __init__(self, rrf_k: int = 60) -> None:
        self.rrf_k = rrf_k

    def merge_reciprocal_rank_fusion(
        self,
        dense_results: List[RetrievedCandidate],
        bm25_results: List[RetrievedCandidate],
        top_k: int = 5,
    ) -> List[RetrievedCandidate]:
        """Combines rankings via RRF: Score(d) = sum(1 / (k + rank))."""
        rrf_scores: Dict[str, float] = {}
        candidate_map: Dict[str, RetrievedCandidate] = {}

        # 1. Process dense ranks
        for rank, cand in enumerate(dense_results, start=1):
            cid = cand.chunk_id
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (self.rrf_k + rank))
            candidate_map[cid] = cand

        # 2. Process BM25 ranks
        for rank, cand in enumerate(bm25_results, start=1):
            cid = cand.chunk_id
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (self.rrf_k + rank))
            if cid not in candidate_map:
                candidate_map[cid] = cand

        # 3. Sort by fused RRF score
        sorted_cids = sorted(rrf_scores.keys(), key=lambda x: rrf_scores[x], reverse=True)

        final_candidates: List[RetrievedCandidate] = []
        for cid in sorted_cids[:top_k]:
            cand = candidate_map[cid]
            fused_score = round(min(1.0, rrf_scores[cid] * self.rrf_k), 4)
            final_candidates.append(
                RetrievedCandidate(
                    chunk_id=cand.chunk_id,
                    document_id=cand.document_id,
                    content=cand.content,
                    filename=cand.filename,
                    page_number=cand.page_number,
                    chunk_index=cand.chunk_index,
                    score=fused_score,
                    metadata=cand.metadata,
                )
            )

        logger.info(f"Hybrid merge fused {len(dense_results)} dense and {len(bm25_results)} BM25 results into {len(final_candidates)} candidates.")
        return final_candidates
