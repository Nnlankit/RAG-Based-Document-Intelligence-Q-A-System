"""Base vector store interface definition.

Defines the contract for vector database backends (ChromaDB, PgVector).
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple


@dataclass
class VectorSearchResult:
    """Standardized vector search result object."""
    chunk_id: str
    document_id: str
    content: str
    metadata: Dict[str, Any]
    score: float  # Normalized cosine similarity: 0.0 (unrelated) to 1.0 (identical)


class BaseVectorStore(ABC):
    """Abstract interface for document vector storage and retrieval."""

    @abstractmethod
    def add_chunks(
        self,
        chunks: List[Dict[str, Any]],
        embeddings: List[List[float]],
    ) -> List[str]:
        """Indexes text chunks with their associated pre-computed embeddings and metadata.
        
        Args:
            chunks: List of dictionaries containing 'chunk_id', 'document_id',
                    'content', and 'metadata'.
            embeddings: List of embedding vectors matching chunks 1:1.
            
        Returns:
            List of indexed chunk IDs.
        """
        pass

    @abstractmethod
    def search_by_vector(
        self,
        query_embedding: List[float],
        k: int = 5,
        filter_metadata: Optional[Dict[str, Any]] = None,
    ) -> List[VectorSearchResult]:
        """Executes similarity search using a query embedding vector.
        
        Args:
            query_embedding: The dense query embedding.
            k: Maximum number of candidates to return.
            filter_metadata: Optional filtering criteria (e.g. {'user_id': '...'}).
            
        Returns:
            List of VectorSearchResult objects ranked by similarity score descending.
        """
        pass

    @abstractmethod
    def delete_document(self, document_id: str) -> None:
        """Removes all indexed chunks and vector entries associated with a document_id.
        
        Args:
            document_id: Unique document identifier to purge.
        """
        pass

    @abstractmethod
    def check_health(self) -> bool:
        """Verifies vector store service availability and connectivity.
        
        Returns:
            True if healthy, False otherwise.
        """
        pass

    @abstractmethod
    def count(self) -> int:
        """Returns total number of indexed vectors in current collection."""
        pass
