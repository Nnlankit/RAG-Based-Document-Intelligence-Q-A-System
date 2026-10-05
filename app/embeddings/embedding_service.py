"""Embedding service abstraction and Ollama implementation."""

from abc import ABC, abstractmethod
import logging
from typing import List, Optional
import httpx

from app.core.config import get_settings
from app.core.exceptions import EmbeddingFailureError

logger = logging.getLogger("document_intelligence.embeddings")


class BaseEmbeddingService(ABC):
    """Abstract interface for dense text embedding generation."""

    @abstractmethod
    def embed_query(self, text: str) -> List[float]:
        """Embeds a single query string into a vector."""
        pass

    @abstractmethod
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embeds a batch of document chunk strings into vectors."""
        pass

    @abstractmethod
    def get_dimension(self) -> int:
        """Returns the vector dimensionality for this embedding model."""
        pass


from collections import OrderedDict

class OllamaEmbeddingService(BaseEmbeddingService):
    """Generates embeddings using a local Ollama instance (default: nomic-embed-text)."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        model_name: Optional[str] = None,
        timeout: float = 60.0,
    ) -> None:
        settings = get_settings()
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model_name = model_name or settings.EMBEDDING_MODEL
        self.timeout = timeout
        self._dimension: Optional[int] = None
        # Persistent HTTP client to avoid TCP handshake overhead on every call
        self._client = httpx.Client(
            timeout=self.timeout,
            limits=httpx.Limits(max_keepalive_connections=20, max_connections=50),
        )
        # Fast in-memory LRU cache for query embeddings (capacity: 512 queries)
        self._query_cache: OrderedDict[str, List[float]] = OrderedDict()
        logger.info(f"Initialized OllamaEmbeddingService with model '{self.model_name}' at '{self.base_url}'")

    def embed_query(self, text: str) -> List[float]:
        """Embeds a search query with caching for sub-millisecond repeated queries."""
        clean_text = text.strip()
        if not clean_text:
            clean_text = "empty query"

        cache_key = f"{self.model_name}:{clean_text}"
        if cache_key in self._query_cache:
            self._query_cache.move_to_end(cache_key)
            return self._query_cache[cache_key]

        # nomic-embed-text performs best when query is prefixed with "search_query: "
        if "nomic" in self.model_name.lower() and not clean_text.startswith("search_query:"):
            prefixed = f"search_query: {clean_text}"
        else:
            prefixed = clean_text

        results = self._embed_batch([prefixed])
        embedding = results[0]

        # Save to cache
        self._query_cache[cache_key] = embedding
        if len(self._query_cache) > 512:
            self._query_cache.popitem(last=False)

        return embedding

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embeds a list of document chunk strings in batches."""
        if not texts:
            return []

        # nomic-embed-text recommends "search_document: " prefix for indexing
        formatted_texts: List[str] = []
        is_nomic = "nomic" in self.model_name.lower()
        for t in texts:
            clean = t.strip() or "empty chunk"
            if is_nomic and not clean.startswith("search_document:"):
                formatted_texts.append(f"search_document: {clean}")
            else:
                formatted_texts.append(clean)

        # Batch in chunks of 32 to avoid HTTP timeouts or memory pressure
        batch_size = 32
        all_embeddings: List[List[float]] = []

        for i in range(0, len(formatted_texts), batch_size):
            batch = formatted_texts[i : i + batch_size]
            batch_embeddings = self._embed_batch(batch)
            all_embeddings.extend(batch_embeddings)

        return all_embeddings

    def _embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Calls Ollama embedding API with fallback from /api/embed to /api/embeddings."""
        try:
            # 1. Try batch /api/embed endpoint (Ollama v0.1.34+)
            try:
                resp = self._client.post(
                    f"{self.base_url}/api/embed",
                    json={"model": self.model_name, "input": texts},
                )
                if resp.status_code == 200:
                    data = resp.json()
                    if "embeddings" in data and len(data["embeddings"]) == len(texts):
                        if not self._dimension and data["embeddings"]:
                            self._dimension = len(data["embeddings"][0])
                        return data["embeddings"]
            except Exception as e:
                logger.debug(f"Ollama /api/embed failed, falling back to /api/embeddings: {e}")

            # 2. Fallback to /api/embeddings endpoint called sequentially
            embeddings: List[List[float]] = []
            for text in texts:
                resp = self._client.post(
                    f"{self.base_url}/api/embeddings",
                    json={"model": self.model_name, "prompt": text},
                )
                if resp.status_code != 200:
                    raise EmbeddingFailureError(
                        f"Ollama embedding API error ({resp.status_code}): {resp.text}"
                    )
                data = resp.json()
                emb = data.get("embedding")
                if not emb:
                    raise EmbeddingFailureError(f"Ollama returned empty embedding for model {self.model_name}")
                embeddings.append(emb)
                if not self._dimension:
                    self._dimension = len(emb)

            return embeddings
        except httpx.RequestError as e:
            logger.error(f"Cannot connect to Ollama at {self.base_url}: {e}")
            raise EmbeddingFailureError(f"Ollama service unavailable at {self.base_url}: {e}")

    def get_dimension(self) -> int:
        """Returns the embedding vector dimension."""
        if self._dimension is None:
            # Query a test probe vector
            sample = self.embed_query("test probe")
            self._dimension = len(sample)
        return self._dimension


_embedding_service_instance: Optional[BaseEmbeddingService] = None


def get_embedding_service() -> BaseEmbeddingService:
    """Returns singleton instance of configured embedding service."""
    global _embedding_service_instance
    if _embedding_service_instance is None:
        _embedding_service_instance = OllamaEmbeddingService()
    return _embedding_service_instance
