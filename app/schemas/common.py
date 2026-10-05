"""Common schemas for health checks and standard responses."""

from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class HealthCheckResponse(BaseModel):
    """Health check status response."""
    status: str = Field(..., description="Overall system health status: healthy, degraded, or unhealthy")
    database: str = Field(..., description="Database connectivity status")
    vector_store: str = Field(..., description="Vector store connectivity status")
    ollama: str = Field(..., description="Ollama API connectivity status")
    models: Dict[str, bool] = Field(default_factory=dict, description="Availability of configured models")
    details: Optional[Dict[str, Any]] = Field(default=None, description="Optional diagnostic details")


class ErrorResponse(BaseModel):
    """Standard error response structure."""
    detail: Any = Field(..., description="Error message or structured error details")
