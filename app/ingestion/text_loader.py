"""Plain text and Markdown document extractor."""

import logging
from pathlib import Path
from typing import List

from app.core.exceptions import DocumentCorruptedError
from app.ingestion.cleaner import TextCleaner
from app.ingestion.loader import ExtractedPage

logger = logging.getLogger("document_intelligence.ingestion.text")


class TextLoader:
    """Extracts text from UTF-8/encoded plain text and markdown documents."""

    @classmethod
    def extract(
        cls,
        file_path: Path,
        document_id: str,
        filename: str,
    ) -> List[ExtractedPage]:
        """Reads text file with robust encoding detection.
        
        Args:
            file_path: Path to the text/markdown file.
            document_id: Unique document ID.
            filename: Original file name.
            
        Returns:
            List containing one or more ExtractedPage instances.
        """
        content = None
        for encoding in ["utf-8", "utf-8-sig", "latin-1", "cp1252"]:
            try:
                content = file_path.read_text(encoding=encoding)
                break
            except (UnicodeDecodeError, LookupError):
                continue

        if content is None:
            raise DocumentCorruptedError(f"Unable to decode text file '{filename}' with supported encodings.")

        cleaned = TextCleaner.clean(content)
        ext = file_path.suffix.lower().lstrip(".")
        source_type = ext if ext in ["txt", "md"] else "txt"

        logger.info(f"Successfully extracted {len(cleaned)} characters from {source_type.upper()} '{filename}'")
        return [
            ExtractedPage(
                text=cleaned,
                document_id=document_id,
                filename=filename,
                page_number=1,  # Single virtual page for flat text documents
                source_type=source_type,
            )
        ]
