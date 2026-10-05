"""Application Configuration Module.

Loads strongly typed configuration from environment variables and .env files.
"""

from functools import lru_cache
from pathlib import Path
from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, computed_field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Application
    APP_NAME: str = "RAG-Based Document Intelligence & Q&A System"
    APP_ENV: Literal["development", "production", "testing"] = "development"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = False

    # Ollama LLM & Embeddings
    LLM_MODEL: str = Field(default="llama3.2", description="Ollama LLM model identifier")
    EMBEDDING_MODEL: str = Field(default="nomic-embed-text", description="Ollama embedding model identifier")
    OLLAMA_BASE_URL: str = Field(default="http://localhost:11434", description="Base URL for Ollama API")
    LLM_TEMPERATURE: float = Field(default=0.1, description="Sampling temperature for grounded generation")
    LLM_REQUEST_TIMEOUT: float = Field(default=120.0, description="Timeout in seconds for LLM calls")
    LLM_MAX_TOKENS: int = Field(default=256, description="Maximum tokens to generate for fast, concise responses")
    LLM_NUM_CTX: int = Field(default=2048, description="Context window size to optimize prompt evaluation latency")
    OLLAMA_KEEP_ALIVE: str = Field(default="5m", description="Ollama model keep_alive duration (e.g. '5m', '30m')")
    ENABLE_STREAMING: bool = Field(default=True, description="Enable streaming responses")
    ENABLE_LATENCY_METRICS: bool = Field(default=True, description="Enable detailed latency metrics in responses")

    # Vector Store Strategy
    VECTOR_STORE: Literal["chroma", "pgvector"] = Field(
        default="chroma",
        description="Vector store backend: 'chroma' (MVP) or 'pgvector' (production)"
    )
    CHROMA_PERSIST_DIRECTORY: str = Field(default="./data/chroma", description="ChromaDB persistence directory")
    COLLECTION_NAME: str = Field(
        default="documents_v1_nomic_embed_text",
        description="Vector collection name including embedding model/version identifier"
    )

    # Relational Database
    DATABASE_URL: str = Field(
        default="sqlite:///./data/document_ai.db",
        description="Database connection URL (PostgreSQL or SQLite fallback for local development)"
    )

    # Ingestion & Chunking
    CHUNK_SIZE: int = Field(default=1000, description="Chunk size in characters")
    CHUNK_OVERLAP: int = Field(default=150, description="Chunk overlap in characters")
    MAX_UPLOAD_MB: int = Field(default=50, description="Maximum allowed file upload size in megabytes")
    UPLOAD_DIR: str = Field(default="./data/uploads", description="Directory to store raw uploaded files")
    PROCESSED_DIR: str = Field(default="./data/processed", description="Directory to store processed outputs")

    # Retrieval & Grounding
    TOP_K: int = Field(default=5, description="Final number of retrieved context chunks passed to LLM")
    RETRIEVAL_CANDIDATES: int = Field(default=10, description="Initial candidates retrieved before filtering/reranking")
    SIMILARITY_THRESHOLD: float = Field(default=0.35, description="Cosine relevance similarity cutoff threshold")
    MAX_CONTEXT_CHARS: int = Field(default=3000, description="Maximum characters in formatted context prompt")
    ENABLE_RERANKER: bool = Field(default=True, description="Enable reranker model if True")
    ENABLE_QUERY_REWRITING: bool = Field(default=True, description="Enable query rewriting for conversational follow-ups")
    USE_FAST_QUERY_EXPANSION: bool = Field(default=True, description="Use sub-millisecond lexical expansion instead of slow LLM rewriting")
    ENABLE_HYBRID_SEARCH: bool = Field(default=True, description="Enable hybrid semantic + keyword BM25 search")

    # Security & Auth
    SECRET_KEY: str = Field(
        default="insecure-dev-secret-key-rag-system-at-least-32-chars-long",
        description="Secret key for JWT generation"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=1440, description="JWT token validity in minutes")

    # Logging
    LOG_LEVEL: str = Field(default="INFO", description="Log level: DEBUG, INFO, WARNING, ERROR, CRITICAL")

    @computed_field
    @property
    def max_upload_bytes(self) -> int:
        """Computed maximum upload size in bytes."""
        return self.MAX_UPLOAD_MB * 1024 * 1024

    def ensure_directories(self) -> None:
        """Ensures all necessary local runtime directories exist."""
        for path_str in [self.UPLOAD_DIR, self.PROCESSED_DIR, self.CHROMA_PERSIST_DIRECTORY]:
            path = Path(path_str)
            path.mkdir(parents=True, exist_ok=True)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Returns singleton cached instance of application settings."""
    settings = Settings()
    settings.ensure_directories()
    return settings
