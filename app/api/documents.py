"""Document management, ingestion, and advanced document intelligence endpoints."""

import logging
from pathlib import Path
import re
import uuid
from typing import Any, Dict, List, Literal, Optional
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import (
    DocumentAIException,
    FileTooLargeError,
    InvalidFileTypeError,
    DuplicateDocumentError,
    DocumentNotFoundError,
)
from app.database.postgres import get_db
from app.database.repositories import DocumentRepository, calculate_sha256
from app.embeddings.embedding_service import get_embedding_service
from app.ingestion.loader import DocumentLoader
from app.ingestion.chunker import DocumentChunker
from app.rag.intelligence import DocumentIntelligenceService
from app.schemas.documents import (
    DocumentResponse,
    DocumentListResponse,
    DocumentUploadResponse,
    DocumentStatus,
)
from app.vectorstore import get_vector_store

router = APIRouter(prefix="/documents")
logger = logging.getLogger("document_intelligence.api.documents")
settings = get_settings()

_doc_intelligence_service = DocumentIntelligenceService()

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/markdown",
    "application/octet-stream",
}


def sanitize_filename(filename: str) -> str:
    """Sanitizes filename against path traversal and illegal characters."""
    base_name = Path(filename).name
    sanitized = re.sub(r"[^\w\s\.-]", "_", base_name).strip()
    return sanitized or "document"


class CompareRequest(BaseModel):
    document_id_a: str = Field(..., description="First document ID")
    document_id_b: str = Field(..., description="Second document ID")


@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: str = "default_user",
) -> DocumentUploadResponse:
    """Uploads, validates, extracts, chunks, embeds, and indexes a document."""
    original_filename = file.filename or "unknown_file"
    file_ext = Path(original_filename).suffix.lower()

    # 1. Validate file extension
    if file_ext not in DocumentLoader.SUPPORTED_EXTENSIONS:
        raise InvalidFileTypeError(
            f"Unsupported file extension '{file_ext}'. Allowed formats: {', '.join(sorted(DocumentLoader.SUPPORTED_EXTENSIONS))}"
        )

    # 2. Validate MIME type
    if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
        logger.warning(f"Uncommon MIME type '{file.content_type}' for file '{original_filename}'")

    # 3. Read content into memory and validate size limit
    content = await file.read()
    file_size = len(content)

    if file_size > settings.max_upload_bytes:
        raise FileTooLargeError(
            f"File size ({file_size / (1024 * 1024):.1f}MB) exceeds limit of {settings.MAX_UPLOAD_MB}MB."
        )

    if file_size == 0:
        raise InvalidFileTypeError("The uploaded file is empty.")

    # 4. Compute SHA-256 and detect duplicate documents
    checksum = calculate_sha256(content)
    existing_duplicate = DocumentRepository.find_duplicate(db, checksum, user_id)
    if existing_duplicate:
        raise DuplicateDocumentError(
            message=f"Document '{original_filename}' is identical to existing document '{existing_duplicate.filename}' (ID: {existing_duplicate.id}).",
            existing_document_id=existing_duplicate.id,
            checksum=checksum,
        )

    # 5. Generate unique document ID and safe storage path
    document_id = f"doc_{uuid.uuid4().hex[:12]}"
    clean_name = sanitize_filename(original_filename)
    safe_storage_filename = f"{document_id}_{clean_name}"
    storage_path = Path(settings.UPLOAD_DIR) / safe_storage_filename

    # Save to disk
    with open(storage_path, "wb") as f:
        f.write(content)

    # 6. Create database record in 'processing' status
    doc = DocumentRepository.create(
        db=db,
        document_id=document_id,
        user_id=user_id,
        filename=clean_name,
        original_filename=original_filename,
        mime_type=file.content_type or "application/octet-stream",
        file_size=file_size,
        checksum=checksum,
        storage_path=str(storage_path),
        status="processing",
    )

    try:
        # 7. Extract text page-by-page / section-by-section
        logger.info(f"Extracting document {document_id} ({clean_name})...")
        extracted_pages = DocumentLoader.load(storage_path, document_id, clean_name)

        # 8. Split into deterministic chunks
        chunker = DocumentChunker()
        processed_chunks = chunker.chunk_pages(extracted_pages, user_id=user_id)

        if not processed_chunks:
            raise DocumentAIException("No text chunks could be produced from document.")

        # 9. Generate dense embeddings locally
        embedding_service = get_embedding_service()
        chunk_texts = [c.content for c in processed_chunks]
        logger.info(f"Generating embeddings for {len(chunk_texts)} chunks...")
        embeddings = embedding_service.embed_documents(chunk_texts)

        # 10. Store in vector database
        vector_store = get_vector_store()
        chunk_dicts = [c.to_dict() for c in processed_chunks]
        vector_store.add_chunks(chunk_dicts, embeddings)

        # 11. Persist chunk records in relational database
        DocumentRepository.add_chunks(db, document_id, chunk_dicts, embeddings)

        # 12. Update document status to completed
        DocumentRepository.update_status(db, document_id, status="completed")
        logger.info(f"Document {document_id} ingestion completed successfully with {len(processed_chunks)} chunks.")

        return DocumentUploadResponse(
            document_id=document_id,
            filename=clean_name,
            status=DocumentStatus.COMPLETED,
            message="Document successfully processed and indexed.",
            chunk_count=len(processed_chunks),
        )

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Ingestion failed for document {document_id}: {error_msg}", exc_info=True)
        DocumentRepository.update_status(db, document_id, status="failed", error_message=error_msg)
        raise DocumentAIException(f"Failed to process and index document: {error_msg}")


@router.get("", response_model=DocumentListResponse)
def list_documents(
    db: Session = Depends(get_db),
    user_id: str = "default_user",
    skip: int = 0,
    limit: int = 100,
) -> DocumentListResponse:
    """Lists all active indexed documents for the current user."""
    docs = DocumentRepository.list_documents(db, user_id=user_id, skip=skip, limit=limit)
    response_items = []
    for d in docs:
        chunk_count = DocumentRepository.get_chunk_count(db, d.id)
        response_items.append(
            DocumentResponse(
                id=d.id,
                user_id=d.user_id,
                filename=d.filename,
                original_filename=d.original_filename,
                mime_type=d.mime_type,
                file_size=d.file_size,
                checksum=d.checksum,
                storage_path=d.storage_path,
                status=DocumentStatus(d.status),
                error_message=d.error_message,
                chunk_count=chunk_count,
                created_at=d.created_at,
                updated_at=d.updated_at,
            )
        )
    return DocumentListResponse(documents=response_items, total=len(response_items))


@router.post("/compare", summary="Compare two documents and highlight differences")
def compare_documents(
    request: CompareRequest,
    db: Session = Depends(get_db),
):
    """Compares two documents and highlights differences, changes, or revisions."""
    return _doc_intelligence_service.compare_documents(
        db=db,
        document_id_a=request.document_id_a,
        document_id_b=request.document_id_b,
    )


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: str,
    db: Session = Depends(get_db),
    user_id: str = "default_user",
) -> DocumentResponse:
    """Retrieves document metadata by ID."""
    doc = DocumentRepository.get_by_id(db, document_id, user_id=user_id)
    chunk_count = DocumentRepository.get_chunk_count(db, doc.id)
    return DocumentResponse(
        id=doc.id,
        user_id=doc.user_id,
        filename=doc.filename,
        original_filename=doc.original_filename,
        mime_type=doc.mime_type,
        file_size=doc.file_size,
        checksum=doc.checksum,
        storage_path=doc.storage_path,
        status=DocumentStatus(doc.status),
        error_message=doc.error_message,
        chunk_count=chunk_count,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
    )


@router.get("/{document_id}/file", summary="Stream original document file for in-app viewing")
def get_document_file(
    document_id: str,
    db: Session = Depends(get_db),
    user_id: str = "default_user",
):
    """Streams original document file inline for previewing in PDF/document viewer without triggering browser download."""
    doc = DocumentRepository.get_by_id(db, document_id, user_id=user_id)
    file_path = Path(doc.storage_path)
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Physical file for document '{document_id}' not found on server.",
        )

    # Determine accurate inline preview media type
    media_type = doc.mime_type or "application/octet-stream"
    fname_lower = (doc.original_filename or "").lower()
    if fname_lower.endswith(".pdf"):
        media_type = "application/pdf"
    elif fname_lower.endswith(".txt"):
        media_type = "text/plain; charset=utf-8"
    elif fname_lower.endswith(".md"):
        media_type = "text/markdown; charset=utf-8"

    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        filename=doc.original_filename,
        content_disposition_type="inline",
        headers={
            "Content-Disposition": f'inline; filename="{doc.original_filename}"',
            "X-Content-Type-Options": "nosniff",
        },
    )


@router.get("/{document_id}/download", summary="Explicitly download original document file")
def download_document_file(
    document_id: str,
    db: Session = Depends(get_db),
    user_id: str = "default_user",
):
    """Downloads original document file as an attachment only upon explicit user download request."""
    doc = DocumentRepository.get_by_id(db, document_id, user_id=user_id)
    file_path = Path(doc.storage_path)
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Physical file for document '{document_id}' not found on server.",
        )

    media_type = doc.mime_type or "application/octet-stream"
    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        filename=doc.original_filename,
        content_disposition_type="attachment",
        headers={
            "Content-Disposition": f'attachment; filename="{doc.original_filename}"',
        },
    )


@router.get("/{document_id}/chunks", summary="Get all indexed chunks for document")
def get_document_chunks(
    document_id: str,
    db: Session = Depends(get_db),
    user_id: str = "default_user",
):
    """Retrieves all indexed text chunks and metadata for a document."""
    # Ensure document exists and belongs to user
    doc = DocumentRepository.get_by_id(db, document_id, user_id=user_id)
    chunks = DocumentRepository.get_chunks(db, document_id)
    return {
        "document_id": document_id,
        "filename": doc.filename,
        "total_chunks": len(chunks),
        "chunks": [
            {
                "id": c.id,
                "chunk_index": c.chunk_index,
                "page_number": c.page_number,
                "content": c.content,
                "metadata": c.chunk_metadata,
            }
            for c in chunks
        ],
    }


@router.delete("/{document_id}", status_code=status.HTTP_200_OK)
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    user_id: str = "default_user",
):
    """Deletes a document: removes disk file, database records, chunks, and vector store entries."""
    doc = DocumentRepository.get_by_id(db, document_id, user_id=user_id)

    try:
        path = Path(doc.storage_path)
        if path.exists():
            path.unlink()
    except Exception as e:
        logger.warning(f"Could not delete physical file for document {document_id}: {e}")

    try:
        vs = get_vector_store()
        vs.delete_document(document_id)
    except Exception as e:
        logger.warning(f"Error purging vectors for document {document_id}: {e}")

    DocumentRepository.delete(db, document_id)
    return {"message": f"Document '{document_id}' and all associated chunks/vectors deleted successfully."}


@router.post("/{document_id}/summarize", summary="Summarize document")
def summarize_document(
    document_id: str,
    summary_type: Literal["short", "detailed", "key_points"] = Query(default="short"),
    db: Session = Depends(get_db),
):
    """Generates a short, detailed, or key points summary of a document."""
    return _doc_intelligence_service.summarize(
        db=db,
        document_id=document_id,
        summary_type=summary_type,
    )


@router.post("/{document_id}/extract-info", summary="Extract entities and metadata from document")
def extract_document_information(
    document_id: str,
    db: Session = Depends(get_db),
):
    """Extracts author, organization, technologies, date, and key findings."""
    return _doc_intelligence_service.extract_information(
        db=db,
        document_id=document_id,
    )


@router.post("/{document_id}/generate-questions", summary="Generate key questions from document")
def generate_questions(
    document_id: str,
    num_questions: int = Query(default=10, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """Generates insightful questions answerable by the document content."""
    return _doc_intelligence_service.generate_questions(
        db=db,
        document_id=document_id,
        num_questions=num_questions,
    )
