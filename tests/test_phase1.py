"""Phase 1 Verification Tests.

Verifies:
- Settings load from environment
- Database initialization and connectivity
- ChromaDB vector store initialization
- Ollama connectivity and model detection
- FastAPI health check endpoint via TestClient
"""

import pytest
from fastapi.testclient import TestClient
from app.core.config import get_settings
from app.database.postgres import init_db, check_db_health, SessionLocal
from app.database.models import User
from app.vectorstore.chroma import ChromaVectorStore
from app.main import app


def test_settings_loaded():
    """Verify strongly-typed settings load accurately."""
    settings = get_settings()
    assert settings.APP_NAME == "RAG-Based Document Intelligence & Q&A System"
    assert settings.LLM_MODEL == "llama3.2"
    assert settings.EMBEDDING_MODEL == "nomic-embed-text"
    assert settings.VECTOR_STORE in ["chroma", "pgvector"]
    assert settings.CHUNK_SIZE == 1000
    assert settings.CHUNK_OVERLAP == 150
    assert settings.TOP_K == 5


def test_database_initialization():
    """Verify database tables and default user creation."""
    init_db()
    assert check_db_health() is True

    with SessionLocal() as db:
        user = db.query(User).filter(User.id == "default_user").first()
        assert user is not None
        assert user.email == "admin@example.com"


def test_chroma_vector_store():
    """Verify ChromaDB initialization and basic health."""
    vs = ChromaVectorStore()
    assert vs.check_health() is True
    # Count should be an int >= 0
    assert isinstance(vs.count(), int)


def test_health_endpoint():
    """Verify FastAPI GET /api/v1/health endpoint."""
    client = TestClient(app)
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] in ["healthy", "degraded"]
    assert data["database"] == "healthy"
    assert data["vector_store"] == "healthy"
    assert data["ollama"] == "healthy"
    assert data["models"].get("llama3.2") is True
    assert data["models"].get("nomic-embed-text") is True


def test_root_endpoint():
    """Verify root information endpoint."""
    client = TestClient(app)
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "RAG-Based Document Intelligence & Q&A System"
    assert data["docs_url"] == "/docs"
