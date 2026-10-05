"""API routes package."""

from fastapi import APIRouter
from app.api.health import router as health_router
from app.api.documents import router as documents_router
from app.api.chat import router as chat_router
from app.api.analytics import router as analytics_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health_router, tags=["Health"])
api_router.include_router(documents_router, tags=["Documents"])
api_router.include_router(chat_router, tags=["Chat"])
api_router.include_router(analytics_router, tags=["Analytics"])

__all__ = ["api_router"]
