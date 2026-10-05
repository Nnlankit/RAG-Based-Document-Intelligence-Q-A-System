"""Vector store abstraction package."""
from app.vectorstore.base import BaseVectorStore, VectorSearchResult
from app.vectorstore.chroma import ChromaVectorStore
from app.vectorstore.pgvector import PgVectorStore
from app.core.config import get_settings

__all__ = [
    "BaseVectorStore",
    "VectorSearchResult",
    "ChromaVectorStore",
    "PgVectorStore",
    "get_vector_store",
]


def get_vector_store() -> BaseVectorStore:
    """Factory function returning the configured vector store instance."""
    settings = get_settings()
    if settings.VECTOR_STORE == "pgvector":
        return PgVectorStore()
    return ChromaVectorStore()
