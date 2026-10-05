"""High-fidelity PDF document extractor using PyMuPDF."""

import logging
from pathlib import Path
from typing import List
import pymupdf

from app.core.exceptions import DocumentCorruptedError
from app.ingestion.cleaner import TextCleaner
from app.ingestion.loader import ExtractedPage

logger = logging.getLogger("document_intelligence.ingestion.pdf")


class PDFLoader:
    """Extracts text page-by-page from PDF files using PyMuPDF."""

    @classmethod
    def extract(
        cls,
        file_path: Path,
        document_id: str,
        filename: str,
    ) -> List[ExtractedPage]:
        """Extracts text and page metadata page-by-page.
        
        Args:
            file_path: Path to the PDF file.
            document_id: Unique document ID.
            filename: Original file name.
            
        Returns:
            List of ExtractedPage objects with 1-indexed page numbers.
        """
        extracted_pages: List[ExtractedPage] = []

        try:
            doc = pymupdf.open(str(file_path))
        except Exception as e:
            logger.error(f"Failed to open PDF '{filename}': {e}", exc_info=True)
            raise DocumentCorruptedError(f"Failed to open or parse corrupted PDF file: {filename}")

        try:
            total_pages = len(doc)
            logger.info(f"Extracting {total_pages} pages from PDF '{filename}' (ID: {document_id})")

            for page_index in range(total_pages):
                page_num = page_index + 1  # 1-indexed page number
                page = doc.load_page(page_index)
                raw_text = page.get_text("text") or ""
                cleaned_text = TextCleaner.clean(raw_text)

                # Skip completely blank pages to avoid noise in vector store
                if not cleaned_text:
                    logger.debug(f"Skipping empty page {page_num} in '{filename}'")
                    continue

                extracted_pages.append(
                    ExtractedPage(
                        text=cleaned_text,
                        document_id=document_id,
                        filename=filename,
                        page_number=page_num,
                        source_type="pdf",
                        extra_metadata={
                            "total_pages": total_pages,
                        },
                    )
                )
        finally:
            doc.close()

        logger.info(f"Successfully extracted {len(extracted_pages)} non-empty pages from '{filename}'")
        return extracted_pages
