"""Embeddings package."""
from app.embeddings.embedding_service import BaseEmbeddingService, OllamaEmbeddingService, get_embedding_service

__all__ = [
    "BaseEmbeddingService",
    "OllamaEmbeddingService",
    "get_embedding_service",
]
