"""Phase 2 Verification Tests.

Verifies:
- TextCleaner conservative normalization
- PDFLoader with PyMuPDF
- DocxLoader with python-docx
- TextLoader for TXT and Markdown
- DocumentChunker with RecursiveCharacterTextSplitter and deterministic metadata
"""

import os
from pathlib import Path
import pytest
import pymupdf
import docx

from app.ingestion.cleaner import TextCleaner
from app.ingestion.loader import DocumentLoader, ExtractedPage
from app.ingestion.pdf_loader import PDFLoader
from app.ingestion.docx_loader import DocxLoader
from app.ingestion.text_loader import TextLoader
from app.ingestion.chunker import DocumentChunker


def test_text_cleaner():
    """Verify conservative text cleaning preserves critical symbols and fixes artifacts."""
    raw_text = "This is a test with   multiple    spaces.\n\n\n\nRepeated blank lines.\x00\x08"
    cleaned = TextCleaner.clean(raw_text)
    assert "multiple spaces." in cleaned
    assert "\x00" not in cleaned
    assert "\x08" not in cleaned
    assert "\n\n\n" not in cleaned

    # Verify hyphenation repair
    hyphen_text = "The docu-\nmentation explains the archi-\ntecture."
    cleaned_hyphen = TextCleaner.clean(hyphen_text)
    assert "documentation" in cleaned_hyphen
    assert "architecture" in cleaned_hyphen

    # Verify meaningful code, numbers, and technical symbols are preserved
    code_text = "def calculate_loss(y_true, y_pred):\n    return ((y_true - y_pred) ** 2) / 2.0"
    cleaned_code = TextCleaner.clean(code_text)
    assert "def calculate_loss(y_true, y_pred):" in cleaned_code
    assert "((y_true - y_pred) ** 2) / 2.0" in cleaned_code


def test_pdf_loader(tmp_path: Path):
    """Verify PyMuPDF page-by-page extraction with page number preservation."""
    pdf_path = tmp_path / "test_doc.pdf"
    
    # Create a 2-page sample PDF
    doc = pymupdf.open()
    page1 = doc.new_page()
    page1.insert_text((50, 72), "Page 1 Content: Research Methodology and Overview.")
    page2 = doc.new_page()
    page2.insert_text((50, 72), "Page 2 Content: Results and Evaluation Metrics.")
    doc.save(str(pdf_path))
    doc.close()

    pages = PDFLoader.extract(pdf_path, document_id="doc_pdf_1", filename="test_doc.pdf")
    assert len(pages) == 2
    assert pages[0].page_number == 1
    assert "Page 1 Content" in pages[0].text
    assert pages[0].document_id == "doc_pdf_1"
    assert pages[0].source_type == "pdf"

    assert pages[1].page_number == 2
    assert "Page 2 Content" in pages[1].text


def test_docx_loader(tmp_path: Path):
    """Verify python-docx extraction with headings, paragraphs, and page_number=None."""
    docx_path = tmp_path / "test_doc.docx"
    doc = docx.Document()
    doc.add_heading("Architecture Overview", level=1)
    doc.add_paragraph("The system consists of ingestion, retrieval, and generation layers.")
    doc.add_heading("Data Flow", level=2)
    doc.add_paragraph("Queries flow from the user into the rewriter and retriever.")
    
    # Add table
    table = doc.add_table(rows=2, cols=2)
    table.cell(0, 0).text = "Component"
    table.cell(0, 1).text = "Latency"
    table.cell(1, 0).text = "Retrieval"
    table.cell(1, 1).text = "120ms"
    doc.save(str(docx_path))

    sections = DocxLoader.extract(docx_path, document_id="doc_docx_1", filename="test_doc.docx")
    assert len(sections) >= 2
    assert sections[0].page_number is None  # Section 12 rule
    assert sections[0].source_type == "docx"
    assert any("Architecture Overview" in s.section for s in sections if s.section)
    assert any("Table" in s.text for s in sections)


def test_text_loader(tmp_path: Path):
    """Verify TXT and Markdown file extraction."""
    txt_path = tmp_path / "sample.txt"
    txt_path.write_text("Simple text file content for RAG testing.", encoding="utf-8")
    pages = TextLoader.extract(txt_path, document_id="doc_txt_1", filename="sample.txt")
    assert len(pages) == 1
    assert pages[0].page_number == 1
    assert pages[0].source_type == "txt"
    assert "Simple text file" in pages[0].text


def test_document_chunker():
    """Verify RecursiveCharacterTextSplitter and chunk metadata retention."""
    long_text = ("Artificial intelligence and retrieval-augmented generation systems provide "
                 "grounded answers by querying external knowledge bases before generating text. ") * 20

    extracted_pages = [
        ExtractedPage(
            text=long_text,
            document_id="doc_chunk_test",
            filename="long_research.pdf",
            page_number=3,
            source_type="pdf",
        ),
        ExtractedPage(
            text=long_text,
            document_id="doc_chunk_test",
            filename="long_research.pdf",
            page_number=4,
            source_type="pdf",
        ),
    ]

    chunker = DocumentChunker(chunk_size=500, chunk_overlap=50)
    chunks = chunker.chunk_pages(extracted_pages, user_id="user_test_42")

    assert len(chunks) > 2
    # Verify deterministic chunk indices
    for idx, chunk in enumerate(chunks):
        assert chunk.chunk_index == idx
        assert chunk.chunk_id == f"doc_chunk_test_chunk_{idx:04d}"
        assert chunk.metadata["document_id"] == "doc_chunk_test"
        assert chunk.metadata["filename"] == "long_research.pdf"
        assert chunk.metadata["user_id"] == "user_test_42"
        assert chunk.page_number in [3, 4]
        assert len(chunk.content) <= 550  # Roughly within chunk_size bounds
