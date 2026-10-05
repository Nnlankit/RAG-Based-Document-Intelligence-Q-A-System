"""Health and readiness diagnostic endpoints."""

import httpx
import logging
from fastapi import APIRouter
from app.core.config import get_settings
from app.database.postgres import check_db_health
from app.schemas.common import HealthCheckResponse
from app.vectorstore import get_vector_store

router = APIRouter()
logger = logging.getLogger("document_intelligence.api.health")


@router.get("/health", response_model=HealthCheckResponse, summary="System Health Check")
async def health_check() -> HealthCheckResponse:
    """Verifies health and connectivity of API dependencies:
    - Relational Database (PostgreSQL / SQLite)
    - Vector Store (ChromaDB / PgVector)
    - Ollama LLM and Embedding service connectivity and model availability
    """
    settings = get_settings()

    # 1. Database check
    db_ok = check_db_health()
    db_status = "healthy" if db_ok else "unhealthy"

    # 2. Vector store check
    try:
        vs = get_vector_store()
        vs_ok = vs.check_health()
        vs_status = "healthy" if vs_ok else "unhealthy"
    except Exception as e:
        logger.warning(f"Vector store health check exception: {e}")
        vs_ok = False
        vs_status = "unhealthy"

    # 3. Ollama service and models check
    ollama_ok = False
    models_status = {
        settings.LLM_MODEL: False,
        settings.EMBEDDING_MODEL: False,
    }

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            if resp.status_code == 200:
                ollama_ok = True
                data = resp.json()
                installed_names = [m.get("name", "").split(":")[0] for m in data.get("models", [])]
                installed_full = [m.get("name", "") for m in data.get("models", [])]
                all_installed = installed_names + installed_full

                if settings.LLM_MODEL in all_installed or any(settings.LLM_MODEL in name for name in all_installed):
                    models_status[settings.LLM_MODEL] = True
                if settings.EMBEDDING_MODEL in all_installed or any(settings.EMBEDDING_MODEL in name for name in all_installed):
                    models_status[settings.EMBEDDING_MODEL] = True
    except Exception as e:
        logger.warning(f"Ollama health check exception: {e}")
        ollama_ok = False

    ollama_status = "healthy" if ollama_ok else "unhealthy"

    # Overall aggregate status
    all_healthy = db_ok and vs_ok and ollama_ok and all(models_status.values())
    partially_healthy = db_ok or vs_ok or ollama_ok

    if all_healthy:
        overall_status = "healthy"
    elif partially_healthy:
        overall_status = "degraded"
    else:
        overall_status = "unhealthy"

    return HealthCheckResponse(
        status=overall_status,
        database=db_status,
        vector_store=vs_status,
        ollama=ollama_status,
        models=models_status,
        details={
            "vector_store_type": settings.VECTOR_STORE,
            "llm_model": settings.LLM_MODEL,
            "embedding_model": settings.EMBEDDING_MODEL,
            "ollama_base_url": settings.OLLAMA_BASE_URL,
            "chunk_size": settings.CHUNK_SIZE,
            "chunk_overlap": settings.CHUNK_OVERLAP,
        },
    )
