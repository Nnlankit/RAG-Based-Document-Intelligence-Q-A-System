"""Vector store abstraction package for Neon PostgreSQL."""

from app.vectorstore.base import BaseVectorStore, VectorSearchResult
from app.vectorstore.pgvector import PgVectorStore

__all__ = [
    "BaseVectorStore",
    "VectorSearchResult",
    "PgVectorStore",
    "get_vector_store",
]


def get_vector_store() -> BaseVectorStore:
    """Factory function returning the active Neon PgVector store instance."""
    return PgVectorStore()
