"""Context builder module formatting retrieved evidence chunks for LLM ingestion."""

from dataclasses import dataclass, field
import logging
from typing import Any, Dict, List, Optional
from app.retrieval.models import RetrievedCandidate
from app.schemas.chat import SourceAttribution

logger = logging.getLogger("document_intelligence.rag.context_builder")


@dataclass
class FormattedContext:
    """Encapsulates formatted context string and attached source citations."""
    context_text: str
    sources: List[SourceAttribution]
    total_chunks_used: int
    total_characters: int


from app.core.config import get_settings

class ContextBuilder:
    """Deduplicates, sorts, limits, and formats retrieved candidate chunks."""

    def __init__(self, max_context_chars: Optional[int] = None) -> None:
        settings = get_settings()
        self.max_context_chars = max_context_chars or getattr(settings, "MAX_CONTEXT_CHARS", 3000)

    def build(self, candidates: List[RetrievedCandidate]) -> FormattedContext:
        """Constructs standardized context block from retrieved candidates."""
        if not candidates:
            return FormattedContext(
                context_text="",
                sources=[],
                total_chunks_used=0,
                total_characters=0,
            )

        # 1. Deduplicate by chunk_id and exact content
        seen_ids = set()
        seen_content_hashes = set()
        deduped: List[RetrievedCandidate] = []

        for cand in candidates:
            content_hash = hash(cand.content.strip())
            if cand.chunk_id in seen_ids or content_hash in seen_content_hashes:
                continue
            seen_ids.add(cand.chunk_id)
            seen_content_hashes.add(content_hash)
            deduped.append(cand)

        # 2. Build formatted blocks while respecting max_context_chars
        context_blocks: List[str] = []
        sources: List[SourceAttribution] = []
        current_length = 0

        for i, cand in enumerate(deduped, start=1):
            page_info = f"Page: {cand.page_number}" if cand.page_number is not None else "Page: N/A"
            section_info = f"Section: {cand.metadata.get('section')}\n" if cand.metadata.get("section") else ""

            block = (
                f"SOURCE {i}\n"
                f"Document: {cand.filename}\n"
                f"{page_info}\n"
                f"{section_info}"
                f"\n"
                f"{cand.content}\n"
            )

            block_len = len(block)
            if current_length + block_len > self.max_context_chars and context_blocks:
                logger.info(
                    f"ContextBuilder reached max_context_chars ({self.max_context_chars}); stopping at {len(context_blocks)} chunks"
                )
                break

            context_blocks.append(block)
            current_length += block_len

            snippet = cand.content[:150] + "..." if len(cand.content) > 150 else cand.content
            sources.append(
                SourceAttribution(
                    document_id=cand.document_id,
                    filename=cand.filename,
                    page_number=cand.page_number,
                    chunk_id=cand.chunk_id,
                    chunk_index=cand.chunk_index,
                    score=cand.score,
                    content_snippet=snippet,
                )
            )

        full_context_text = "\n---\n\n".join(context_blocks)
        return FormattedContext(
            context_text=full_context_text,
            sources=sources,
            total_chunks_used=len(context_blocks),
            total_characters=len(full_context_text),
        )
