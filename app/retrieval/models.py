"""Data models for candidate retrieval, ranking, and hybrid merging."""

from dataclasses import dataclass
from typing import Any, Dict, Optional


@dataclass
class RetrievedCandidate:
    """Represents a validated candidate chunk returned from the retrieval pipeline."""
    chunk_id: str
    document_id: str
    content: str
    filename: str
    page_number: Optional[int]
    chunk_index: Optional[int]
    score: float
    metadata: Dict[str, Any]
