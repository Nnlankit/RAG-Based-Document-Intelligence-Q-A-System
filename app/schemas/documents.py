"""Document and chunk schemas."""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DocumentStatus(str, Enum):
    """Document lifecycle processing statuses."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    DELETED = "deleted"


class DocumentBase(BaseModel):
    """Base fields for a document."""
    filename: str
    original_filename: str
    mime_type: str
    file_size: int
    checksum: str


class DocumentResponse(DocumentBase):
    """Full document representation returned by the API."""
    id: str
    user_id: str
    storage_path: str
    status: DocumentStatus
    error_message: Optional[str] = None
    chunk_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DocumentUploadResponse(BaseModel):
    """Response returned immediately after document upload."""
    document_id: str
    filename: str
    status: DocumentStatus
    message: str
    chunk_count: Optional[int] = None


class DocumentListResponse(BaseModel):
    """List of documents response."""
    documents: List[DocumentResponse]
    total: int


class DocumentChunkResponse(BaseModel):
    """Representation of an individual document chunk."""
    id: str
    document_id: str
    chunk_index: int
    page_number: Optional[int] = None
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime

    model_config = {"from_attributes": True}
