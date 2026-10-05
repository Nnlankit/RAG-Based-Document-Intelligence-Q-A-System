"""FastAPI application entrypoint for RAG-Based Document Intelligence & Q&A System."""

import time
import uuid
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.logging import setup_logging
from app.core.exceptions import DocumentAIException, map_exception_to_http_exception
from app.database.postgres import init_db
from app.api import api_router

settings = get_settings()
logger = setup_logging(log_level=settings.LOG_LEVEL)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan context manager for startup and shutdown procedures."""
    logger.info(f"Starting {settings.APP_NAME} in '{settings.APP_ENV}' mode...")
    settings.ensure_directories()
    try:
        init_db()
        logger.info("Application database initialization completed.")
    except Exception as e:
        logger.error(f"Database startup warning: {e}. Ensure DATABASE_URL is configured.")
    yield
    logger.info("Shutting down application...")


app = FastAPI(
    title=settings.APP_NAME,
    description="Private AI-powered document analysis with grounded answers and source attribution",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware for Streamlit and external clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def logging_and_timing_middleware(request: Request, call_next):
    """Logs incoming requests with timing and request IDs."""
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    start_time = time.perf_counter()

    try:
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time-Ms"] = str(duration_ms)

        logger.info(
            f"Handled {request.method} {request.url.path} -> {response.status_code} ({duration_ms}ms)",
            extra={
                "request_id": request_id,
                "endpoint": request.url.path,
                "status_code": response.status_code,
                "latency_ms": duration_ms,
            },
        )
        return response
    except Exception as exc:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.error(
            f"Unhandled exception during {request.method} {request.url.path} ({duration_ms}ms): {exc}",
            exc_info=True,
            extra={
                "request_id": request_id,
                "endpoint": request.url.path,
                "latency_ms": duration_ms,
            },
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An internal server error occurred. Please consult server logs."},
            headers={"X-Request-ID": request_id},
        )


@app.exception_handler(DocumentAIException)
async def domain_exception_handler(request: Request, exc: DocumentAIException):
    """Centralized exception handler for custom domain exceptions."""
    http_exc = map_exception_to_http_exception(exc)
    return JSONResponse(
        status_code=http_exc.status_code,
        content={"detail": http_exc.detail},
    )


# Mount main API routes
app.include_router(api_router)


@app.get("/", summary="Root landing endpoint")
async def root():
    """Returns basic system information and links to interactive documentation."""
    return {
        "name": settings.APP_NAME,
        "description": "Private AI-powered document analysis with grounded answers and source attribution",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_check": "/api/v1/health",
        "vector_store": settings.VECTOR_STORE,
        "llm_model": settings.LLM_MODEL,
        "embedding_model": settings.EMBEDDING_MODEL,
    }
