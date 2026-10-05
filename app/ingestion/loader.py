"""Unified Document Loader and extractor interface."""

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional
import os
import mimetypes

from app.core.exceptions import InvalidFileTypeError, DocumentCorruptedError, EmptyDocumentError


@dataclass
class ExtractedPage:
    """Represents a discrete extracted page or logical section from a document."""
    text: str
    document_id: str
    filename: str
    page_number: Optional[int]
    source_type: str
    section: Optional[str] = None
    extra_metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert page to standardized dictionary format."""
        meta = {
            "document_id": self.document_id,
            "filename": self.filename,
            "page_number": self.page_number,
            "source_type": self.source_type,
            **self.extra_metadata,
        }
        if self.section:
            meta["section"] = self.section
        return {
            "text": self.text,
            "metadata": meta,
        }


class DocumentLoader:
    """Dispatches document extraction based on file extension and MIME type."""

    SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}

    @classmethod
    def load(
        cls,
        file_path: str | Path,
        document_id: str,
        original_filename: str,
    ) -> List[ExtractedPage]:
        """Extracts text and metadata page-by-page or section-by-section.
        
        Args:
            file_path: Local filesystem path to the saved file.
            document_id: Unique system identifier for this document.
            original_filename: Original filename uploaded by the user.
            
        Returns:
            List of non-empty ExtractedPage objects.
        """
        path = Path(file_path)
        if not path.exists():
            raise DocumentCorruptedError(f"Document file not found on disk: {path}")

        ext = path.suffix.lower()
        if ext not in cls.SUPPORTED_EXTENSIONS:
            raise InvalidFileTypeError(
                f"Unsupported file extension '{ext}'. Supported formats: {', '.join(cls.SUPPORTED_EXTENSIONS)}"
            )

        # Lazy import loaders to keep startup quick
        if ext == ".pdf":
            from app.ingestion.pdf_loader import PDFLoader
            pages = PDFLoader.extract(path, document_id, original_filename)
        elif ext == ".docx":
            from app.ingestion.docx_loader import DocxLoader
            pages = DocxLoader.extract(path, document_id, original_filename)
        elif ext in [".txt", ".md"]:
            from app.ingestion.text_loader import TextLoader
            pages = TextLoader.extract(path, document_id, original_filename)
        else:
            raise InvalidFileTypeError(f"Parser not registered for extension {ext}")

        if not pages or all(not page.text.strip() for page in pages):
            raise EmptyDocumentError(f"Document '{original_filename}' contains no readable text.")

        return pages
