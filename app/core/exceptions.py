"""Custom exception hierarchy and centralized error definitions for the application."""

from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class DocumentAIException(Exception):
    """Base exception for all application errors."""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class InvalidFileTypeError(DocumentAIException):
    """Raised when an uploaded file extension or MIME type is unsupported."""
    pass


class FileTooLargeError(DocumentAIException):
    """Raised when an uploaded file exceeds the configured size limit."""
    pass


class DuplicateDocumentError(DocumentAIException):
    """Raised when an uploaded file is identical to an existing document."""
    def __init__(self, message: str, existing_document_id: str, checksum: str):
        super().__init__(message, {"existing_document_id": existing_document_id, "checksum": checksum})
        self.existing_document_id = existing_document_id
        self.checksum = checksum


class DocumentCorruptedError(DocumentAIException):
    """Raised when a document cannot be parsed due to corruption."""
    pass


class EmptyDocumentError(DocumentAIException):
    """Raised when an uploaded document has no extractable text."""
    pass


class ExtractionFailureError(DocumentAIException):
    """Raised when parsing/extraction fails during document ingestion."""
    pass


class EmbeddingFailureError(DocumentAIException):
    """Raised when embedding generation fails via Ollama or the embedding service."""
    pass


class VectorStoreError(DocumentAIException):
    """Raised when an error occurs during vector storage, indexing, or retrieval."""
    pass


class DatabaseError(DocumentAIException):
    """Raised when a relational database query or transaction fails."""
    pass


class ServiceUnavailableError(DocumentAIException):
    """Raised when an external service such as Ollama or PostgreSQL is unreachable."""
    pass


class LLMTimeoutError(DocumentAIException):
    """Raised when LLM generation exceeds the timeout window."""
    pass


class InsufficientContextError(DocumentAIException):
    """Raised when retrieved chunks do not meet the minimum similarity threshold."""
    pass


class ConversationNotFoundError(DocumentAIException):
    """Raised when a requested conversation ID does not exist."""
    pass


class DocumentNotFoundError(DocumentAIException):
    """Raised when a requested document ID is not found."""
    pass


class UnauthorizedAccessError(DocumentAIException):
    """Raised when a user attempts to access a resource belonging to another user."""
    pass


def map_exception_to_http_exception(exc: Exception) -> HTTPException:
    """Maps internal domain exceptions to safe, client-facing HTTP exceptions."""
    if isinstance(exc, InvalidFileTypeError):
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=exc.message)
    elif isinstance(exc, FileTooLargeError):
        return HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=exc.message)
    elif isinstance(exc, DuplicateDocumentError):
        return HTTPException(status_code=status.HTTP_409_CONFLICT, detail={
            "message": exc.message,
            "existing_document_id": exc.existing_document_id,
            "checksum": exc.checksum
        })
    elif isinstance(exc, (DocumentCorruptedError, EmptyDocumentError, ExtractionFailureError)):
        return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=exc.message)
    elif isinstance(exc, DocumentNotFoundError):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=exc.message)
    elif isinstance(exc, ConversationNotFoundError):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=exc.message)
    elif isinstance(exc, UnauthorizedAccessError):
        return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=exc.message)
    elif isinstance(exc, (EmbeddingFailureError, VectorStoreError, DatabaseError)):
        return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="A backend processing error occurred.")
    elif isinstance(exc, ServiceUnavailableError):
        return HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=exc.message)
    elif isinstance(exc, LLMTimeoutError):
        return HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail=exc.message)
    else:
        return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected internal error occurred.")
