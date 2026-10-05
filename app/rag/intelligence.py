"""Advanced Document Intelligence: Summarization, entity extraction, comparison, and question generation."""

import json
import logging
from typing import Any, Dict, List, Literal, Optional
from sqlalchemy.orm import Session

from app.database.models import Document, DocumentChunk
from app.core.exceptions import DocumentNotFoundError
from app.generation.llm import BaseLLMService, get_llm_service

logger = logging.getLogger("document_intelligence.rag.intelligence")


class DocumentIntelligenceService:
    """Provides high-level document analysis operations on ingested chunks."""

    def __init__(self, llm_service: Optional[BaseLLMService] = None) -> None:
        self.llm = llm_service or get_llm_service()

    def _get_document_text(self, db: Session, document_id: str, max_chars: int = 12000) -> str:
        """Retrieves and concatenates chunk text for a document."""
        chunks = (
            db.query(DocumentChunk)
            .filter(DocumentChunk.document_id == document_id)
            .order_by(DocumentChunk.chunk_index.asc())
            .all()
        )
        if not chunks:
            raise DocumentNotFoundError(f"No chunks found for document '{document_id}'")

        full_text = ""
        for c in chunks:
            if len(full_text) + len(c.content) > max_chars:
                break
            full_text += c.content + "\n\n"
        return full_text.strip()

    def summarize(
        self,
        db: Session,
        document_id: str,
        summary_type: Literal["short", "detailed", "key_points"] = "short",
    ) -> Dict[str, Any]:
        """Generates short, detailed, or key points summary of a document."""
        text = self._get_document_text(db, document_id)

        instructions = {
            "short": "Provide a concise 2-3 paragraph summary focusing strictly on the core theme and findings.",
            "detailed": "Provide a comprehensive, structured section-by-section detailed summary.",
            "key_points": "Provide a numbered list of the most critical takeaways, metrics, and conclusions.",
        }

        prompt = (
            f"Document Content:\n{text}\n\n"
            f"Instruction: {instructions.get(summary_type, instructions['short'])}\n\n"
            f"Summary:"
        )

        system_prompt = "You are an expert document intelligence analyst. Summarize solely based on the provided document."
        summary, latency = self.llm.generate(prompt=prompt, system_prompt=system_prompt, temperature=0.2)
        return {
            "document_id": document_id,
            "summary_type": summary_type,
            "summary": summary,
            "latency_ms": latency,
        }

    def extract_information(self, db: Session, document_id: str) -> Dict[str, Any]:
        """Extracts key entities, metadata, authors, organizations, technologies, and dates."""
        text = self._get_document_text(db, document_id, max_chars=8000)

        prompt = (
            f"Document Content:\n{text}\n\n"
            f"Extract the following information from the document as JSON:\n"
            f"- author (or authors)\n"
            f"- date (or date of publication/revision)\n"
            f"- organization (or companies/institutions)\n"
            f"- technologies (key tools, software, algorithms, or systems mentioned)\n"
            f"- important_findings (key quantitative or qualitative conclusions)\n\n"
            f"Respond ONLY with a valid JSON object matching these keys."
        )

        system_prompt = "You are a structured data extraction engine. Return only JSON without preamble or markdown fences."
        response, latency = self.llm.generate(prompt=prompt, system_prompt=system_prompt, temperature=0.0)

        # Clean JSON fences if present
        clean_json = response.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.startswith("```"):
            clean_json = clean_json[3:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
        clean_json = clean_json.strip()

        try:
            extracted = json.loads(clean_json)
        except Exception:
            extracted = {"raw_extraction": response}

        return {
            "document_id": document_id,
            "extracted_data": extracted,
            "latency_ms": latency,
        }

    def compare_documents(
        self,
        db: Session,
        document_id_a: str,
        document_id_b: str,
    ) -> Dict[str, Any]:
        """Compares two documents and highlights differences, changes, or revisions."""
        doc_a = db.query(Document).filter(Document.id == document_id_a).first()
        doc_b = db.query(Document).filter(Document.id == document_id_b).first()
        if not doc_a or not doc_b:
            raise DocumentNotFoundError("One or both documents not found for comparison.")

        text_a = self._get_document_text(db, document_id_a, max_chars=6000)
        text_b = self._get_document_text(db, document_id_b, max_chars=6000)

        prompt = (
            f"Document A ({doc_a.filename}):\n{text_a}\n\n"
            f"---\n\n"
            f"Document B ({doc_b.filename}):\n{text_b}\n\n"
            f"Question: What changed between Document A and Document B? Compare the methodologies, parameters, findings, or policies.\n\n"
            f"Comparison Analysis:"
        )

        system_prompt = "You are an expert document comparison analyst. Contrast the two documents objectively based strictly on their contents."
        comparison, latency = self.llm.generate(prompt=prompt, system_prompt=system_prompt, temperature=0.2)

        return {
            "document_id_a": document_id_a,
            "filename_a": doc_a.filename,
            "document_id_b": document_id_b,
            "filename_b": doc_b.filename,
            "comparison": comparison,
            "latency_ms": latency,
        }

    def generate_questions(
        self,
        db: Session,
        document_id: str,
        num_questions: int = 10,
    ) -> Dict[str, Any]:
        """Generates key questions answerable by the document."""
        text = self._get_document_text(db, document_id, max_chars=8000)

        prompt = (
            f"Document Content:\n{text}\n\n"
            f"Generate exactly {num_questions} important, insightful questions whose answers can be found in the provided document content.\n\n"
            f"Questions:"
        )

        system_prompt = "You are an educator and analytical researcher formulating comprehension and evaluation questions."
        output, latency = self.llm.generate(prompt=prompt, system_prompt=system_prompt, temperature=0.3)

        questions = [q.strip() for q in output.split("\n") if q.strip() and (q[0].isdigit() or q.startswith("-"))]
        return {
            "document_id": document_id,
            "questions": questions if questions else [output],
            "latency_ms": latency,
        }
