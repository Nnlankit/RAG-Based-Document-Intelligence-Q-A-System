"""PostgreSQL + pgvector vector store implementation for production deployments."""

import json
import logging
from typing import Any, Dict, List, Optional
from sqlalchemy import text
from app.core.config import get_settings
from app.database.postgres import engine
from app.vectorstore.base import BaseVectorStore, VectorSearchResult

logger = logging.getLogger("document_intelligence.vectorstore.pgvector")


class PgVectorStore(BaseVectorStore):
    """PostgreSQL pgvector implementation of BaseVectorStore."""

    # nomic-embed-text embedding dimension
    EMBEDDING_DIM = 768

    def __init__(self) -> None:
        self.settings = get_settings()
        self._initialize_extension()

    def _initialize_extension(self) -> None:
        """Ensures vector extension exists in PostgreSQL."""
        try:
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
                conn.commit()
            logger.info("Verified PostgreSQL 'vector' extension.")
        except Exception as e:
            logger.warning(f"Could not initialize pgvector extension: {e}. Ensure PostgreSQL has pgvector installed.")

    def add_chunks(
        self,
        chunks: List[Dict[str, Any]],
        embeddings: List[List[float]],
    ) -> List[str]:
        """Inserts or updates chunks with pgvector embeddings in document_chunks table."""
        if not chunks:
            return []

        ids: List[str] = []
        with engine.begin() as conn:
            for chunk, emb in zip(chunks, embeddings):
                chunk_id = chunk["chunk_id"]
                doc_id = chunk["document_id"]
                c_idx = chunk.get("chunk_index", 0)
                p_num = chunk.get("page_number")
                content = chunk["content"]
                meta = chunk.get("metadata", {})
                emb_str = f"[{','.join(str(x) for x in emb)}]"

                query = text("""
                    INSERT INTO document_chunks (id, document_id, chunk_index, page_number, content, metadata, embedding, created_at)
                    VALUES (:id, :document_id, :chunk_index, :page_number, :content, :metadata, :embedding, NOW())
                    ON CONFLICT (id) DO UPDATE SET
                        content = EXCLUDED.content,
                        metadata = EXCLUDED.metadata,
                        embedding = EXCLUDED.embedding
                """)
                conn.execute(query, {
                    "id": chunk_id,
                    "document_id": doc_id,
                    "chunk_index": c_idx,
                    "page_number": p_num,
                    "content": content,
                    "metadata": json.dumps(meta),
                    "embedding": emb_str,
                })
                ids.append(chunk_id)

        logger.info(f"Indexed {len(ids)} chunks in PostgreSQL pgvector.")
        return ids

    def search_by_vector(
        self,
        query_embedding: List[float],
        k: int = 5,
        filter_metadata: Optional[Dict[str, Any]] = None,
    ) -> List[VectorSearchResult]:
        """Searches document_chunks using pgvector cosine distance operator (<=>)."""
        emb_str = f"[{','.join(str(x) for x in query_embedding)}]"
        where_clauses = ["embedding IS NOT NULL"]
        params: Dict[str, Any] = {"query_emb": emb_str, "k": k}

        if filter_metadata:
            if "document_id" in filter_metadata:
                doc_id = filter_metadata["document_id"]
                if isinstance(doc_id, list):
                    where_clauses.append("document_id = ANY(:doc_ids)")
                    params["doc_ids"] = doc_id
                else:
                    where_clauses.append("document_id = :doc_id")
                    params["doc_id"] = str(doc_id)

        where_sql = " AND ".join(where_clauses)
        sql = f"""
            SELECT 
                id, 
                document_id, 
                content, 
                metadata, 
                1.0 - (embedding::vector <=> :query_emb::vector) AS similarity_score
            FROM document_chunks
            WHERE {where_sql}
            ORDER BY embedding::vector <=> :query_emb::vector ASC
            LIMIT :k
        """

        results: List[VectorSearchResult] = []
        try:
            with engine.connect() as conn:
                rows = conn.execute(text(sql), params).fetchall()
                for row in rows:
                    meta = json.loads(row.metadata) if isinstance(row.metadata, str) else (row.metadata or {})
                    score = float(row.similarity_score) if row.similarity_score is not None else 0.0
                    results.append(
                        VectorSearchResult(
                            chunk_id=str(row.id),
                            document_id=str(row.document_id),
                            content=str(row.content),
                            metadata=meta,
                            score=round(max(0.0, min(1.0, score)), 4),
                        )
                    )
        except Exception as e:
            logger.error(f"Error during pgvector search: {e}", exc_info=True)

        return results

    def delete_document(self, document_id: str) -> None:
        """Deletes chunks for a document from PostgreSQL."""
        try:
            with engine.begin() as conn:
                conn.execute(
                    text("DELETE FROM document_chunks WHERE document_id = :doc_id"),
                    {"doc_id": document_id}
                )
            logger.info(f"Purged pgvector chunks for document '{document_id}'.")
        except Exception as e:
            logger.error(f"Error purging pgvector chunks: {e}")

    def check_health(self) -> bool:
        """Checks if PostgreSQL is accessible and pgvector extension is functional."""
        try:
            with engine.connect() as conn:
                result = conn.execute(text("SELECT '[1,2,3]'::vector <=> '[1,2,3]'::vector")).scalar()
                return result == 0.0
        except Exception as e:
            logger.warning(f"PgVector health check failed: {e}")
            return False

    def count(self) -> int:
        """Counts total indexed chunks with embeddings in PostgreSQL."""
        try:
            with engine.connect() as conn:
                count = conn.execute(text("SELECT count(*) FROM document_chunks WHERE embedding IS NOT NULL")).scalar()
                return count or 0
        except Exception:
            return 0
