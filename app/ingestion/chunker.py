"""Chunking engine using RecursiveCharacterTextSplitter preserving page/section metadata."""

from dataclasses import dataclass, field
import logging
from typing import Any, Dict, List, Optional
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.config import get_settings
from app.ingestion.loader import ExtractedPage

logger = logging.getLogger("document_intelligence.ingestion.chunker")


@dataclass
class ProcessedChunk:
    """Represents a discrete text chunk ready for vectorization and persistence."""
    chunk_id: str
    document_id: str
    chunk_index: int
    page_number: Optional[int]
    content: str
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert chunk into a dictionary format compatible with VectorStore."""
        return {
            "chunk_id": self.chunk_id,
            "document_id": self.document_id,
            "chunk_index": self.chunk_index,
            "page_number": self.page_number,
            "content": self.content,
            "metadata": {
                **self.metadata,
                "document_id": self.document_id,
                "chunk_id": self.chunk_id,
                "chunk_index": self.chunk_index,
                "page_number": self.page_number,
            },
        }


class DocumentChunker:
    """Splits extracted document pages into semantically cohesive, overlapping text chunks."""

    def __init__(
        self,
        chunk_size: Optional[int] = None,
        chunk_overlap: Optional[int] = None,
    ) -> None:
        settings = get_settings()
        self.chunk_size = chunk_size or settings.CHUNK_SIZE
        self.chunk_overlap = chunk_overlap or settings.CHUNK_OVERLAP

        # Standard semantic hierarchy of chunk split characters
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", "; ", ", ", " ", ""],
            is_separator_regex=False,
        )
        logger.info(
            f"Initialized DocumentChunker (chunk_size={self.chunk_size}, chunk_overlap={self.chunk_overlap})"
        )

    def chunk_pages(
        self,
        pages: List[ExtractedPage],
        user_id: Optional[str] = None,
    ) -> List[ProcessedChunk]:
        """Splits extracted pages sequentially, retaining strict page and section attribution.
        
        Args:
            pages: List of extracted pages from DocumentLoader.
            user_id: User identifier for metadata access-control tagging.
            
        Returns:
            List of deterministic ProcessedChunk instances.
        """
        all_chunks: List[ProcessedChunk] = []
        global_chunk_index = 0

        for page in pages:
            if not page.text or not page.text.strip():
                continue

            sub_texts = self.splitter.split_text(page.text)
            for sub_text in sub_texts:
                clean_sub = sub_text.strip()
                if not clean_sub:
                    continue

                chunk_id = f"{page.document_id}_chunk_{global_chunk_index:04d}"

                chunk_meta: Dict[str, Any] = {
                    "document_id": page.document_id,
                    "filename": page.filename,
                    "page_number": page.page_number,
                    "source_type": page.source_type,
                    "chunk_index": global_chunk_index,
                }
                if user_id:
                    chunk_meta["user_id"] = user_id
                if page.section:
                    chunk_meta["section"] = page.section
                if page.extra_metadata:
                    chunk_meta.update(page.extra_metadata)

                all_chunks.append(
                    ProcessedChunk(
                        chunk_id=chunk_id,
                        document_id=page.document_id,
                        chunk_index=global_chunk_index,
                        page_number=page.page_number,
                        content=clean_sub,
                        metadata=chunk_meta,
                    )
                )
                global_chunk_index += 1

        logger.info(
            f"Generated {len(all_chunks)} chunks for document '{pages[0].filename if pages else 'unknown'}' "
            f"(Document ID: {pages[0].document_id if pages else 'unknown'})"
        )
        return all_chunks
