"""PostgreSQL + pgvector vector store implementation with resilient SQLite fallback."""

import json
import logging
from typing import Any, Dict, List, Optional
from sqlalchemy import text
from app.core.config import get_settings
from app.database.postgres import engine
from app.vectorstore.base import BaseVectorStore, VectorSearchResult

logger = logging.getLogger("document_intelligence.vectorstore.pgvector")


class PgVectorStore(BaseVectorStore):
    """PostgreSQL pgvector implementation with universal fallback for SQLite."""

    # nomic-embed-text embedding dimension
    EMBEDDING_DIM = 768

    def __init__(self) -> None:
        self.settings = get_settings()
        self._initialize_extension()

    def _initialize_extension(self) -> None:
        """Ensures vector extension exists in PostgreSQL."""
        if engine.dialect.name == "sqlite":
            return
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
        """Inserts or updates chunks with embeddings in document_chunks table."""
        if not chunks:
            return []

        ids: List[str] = []
        is_sqlite = engine.dialect.name == "sqlite"

        if is_sqlite:
            query = text("""
                INSERT INTO document_chunks (id, document_id, chunk_index, page_number, content, metadata, embedding, created_at)
                VALUES (:id, :document_id, :chunk_index, :page_number, :content, :metadata, :embedding, CURRENT_TIMESTAMP)
                ON CONFLICT (id) DO UPDATE SET
                    content = EXCLUDED.content,
                    metadata = EXCLUDED.metadata,
                    embedding = EXCLUDED.embedding
            """)
        else:
            query = text("""
                INSERT INTO document_chunks (id, document_id, chunk_index, page_number, content, metadata, embedding, embedding_vec, created_at)
                VALUES (:id, :document_id, :chunk_index, :page_number, :content, :metadata, :embedding, CAST(:embedding_vec AS vector), CURRENT_TIMESTAMP)
                ON CONFLICT (id) DO UPDATE SET
                    content = EXCLUDED.content,
                    metadata = EXCLUDED.metadata,
                    embedding = EXCLUDED.embedding,
                    embedding_vec = EXCLUDED.embedding_vec
            """)

        with engine.begin() as conn:
            for chunk, emb in zip(chunks, embeddings):
                chunk_id = chunk["chunk_id"]
                doc_id = chunk["document_id"]
                c_idx = chunk.get("chunk_index", 0)
                p_num = chunk.get("page_number")
                content = chunk["content"]
                meta = chunk.get("metadata", {})
                emb_str = f"[{','.join(str(x) for x in emb)}]"

                params_chunk = {
                    "id": chunk_id,
                    "document_id": doc_id,
                    "chunk_index": c_idx,
                    "page_number": p_num,
                    "content": content,
                    "metadata": json.dumps(meta),
                    "embedding": emb_str,
                }
                if not is_sqlite:
                    params_chunk["embedding_vec"] = emb_str

                conn.execute(query, params_chunk)
                ids.append(chunk_id)

        logger.info(f"Indexed {len(ids)} chunks in vector store ({engine.dialect.name}).")
        return ids

    def search_by_vector(
        self,
        query_embedding: List[float],
        k: int = 5,
        filter_metadata: Optional[Dict[str, Any]] = None,
    ) -> List[VectorSearchResult]:
        """Searches document_chunks using pgvector cosine distance operator (<=>) or SQLite cosine fallback."""
        where_clauses = ["embedding IS NOT NULL"]
        params: Dict[str, Any] = {}

        if filter_metadata:
            if "user_id" in filter_metadata and filter_metadata["user_id"]:
                where_clauses.append("document_id IN (SELECT id FROM documents WHERE user_id = :user_id)")
                params["user_id"] = str(filter_metadata["user_id"])

            if "document_id" in filter_metadata:
                doc_id = filter_metadata["document_id"]
                if isinstance(doc_id, list):
                    if not doc_id:
                        where_clauses.append("1=0")
                    else:
                        id_keys = [f"doc_id_{i}" for i in range(len(doc_id))]
                        where_clauses.append(f"document_id IN ({', '.join(':' + key for key in id_keys)})")
                        for key, val in zip(id_keys, doc_id):
                            params[key] = str(val)
                else:
                    where_clauses.append("document_id = :doc_id")
                    params["doc_id"] = str(doc_id)

        where_sql = " AND ".join(where_clauses)
        results: List[VectorSearchResult] = []

        if engine.dialect.name == "sqlite":
            import numpy as np

            sql = f"""
                SELECT id, document_id, content, metadata, embedding
                FROM document_chunks
                WHERE {where_sql}
            """
            try:
                with engine.connect() as conn:
                    rows = conn.execute(text(sql), params).fetchall()
                    if not rows:
                        return []

                    q_vec = np.array(query_embedding, dtype=np.float32)
                    q_norm = np.linalg.norm(q_vec)
                    scored = []
                    for row in rows:
                        try:
                            raw_emb = row.embedding
                            if isinstance(raw_emb, str):
                                emb_list = json.loads(raw_emb)
                            else:
                                emb_list = raw_emb
                            c_vec = np.array(emb_list, dtype=np.float32)
                            denom = q_norm * np.linalg.norm(c_vec)
                            sim = float(np.dot(q_vec, c_vec) / denom) if denom > 1e-9 else 0.0
                        except Exception:
                            sim = 0.0
                        meta = json.loads(row.metadata) if isinstance(row.metadata, str) else (row.metadata or {})
                        scored.append((row, meta, sim))

                    scored.sort(key=lambda x: x[2], reverse=True)
                    for row, meta, score in scored[:k]:
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
                logger.error(f"Error during SQLite vector search: {e}", exc_info=True)
        else:
            emb_str = f"[{','.join(str(x) for x in query_embedding)}]"
            params["query_emb"] = emb_str
            params["k"] = k
            # Hardware-accelerated HNSW index query using native vector(768)
            sql = f"""
                SELECT 
                    id, 
                    document_id, 
                    content, 
                    metadata, 
                    1.0 - (embedding_vec <=> CAST(:query_emb AS vector)) AS similarity_score
                FROM document_chunks
                WHERE {where_sql} AND embedding_vec IS NOT NULL
                ORDER BY embedding_vec <=> CAST(:query_emb AS vector) ASC
                LIMIT :k
            """
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
        """Deletes chunks for a document from storage."""
        try:
            with engine.begin() as conn:
                conn.execute(
                    text("DELETE FROM document_chunks WHERE document_id = :doc_id"),
                    {"doc_id": document_id}
                )
            logger.info(f"Purged vector chunks for document '{document_id}'.")
        except Exception as e:
            logger.error(f"Error purging vector chunks: {e}")

    def check_health(self) -> bool:
        """Checks if vector store backend is accessible and functional."""
        try:
            with engine.connect() as conn:
                if engine.dialect.name == "sqlite":
                    conn.execute(text("SELECT 1"))
                    return True
                else:
                    result = conn.execute(text("SELECT '[1,2,3]'::vector <=> '[1,2,3]'::vector")).scalar()
                    return result == 0.0
        except Exception as e:
            logger.warning(f"Vector store health check failed: {e}")
            return False

    def count(self) -> int:
        """Counts total indexed chunks with embeddings."""
        try:
            with engine.connect() as conn:
                count = conn.execute(text("SELECT count(*) FROM document_chunks WHERE embedding IS NOT NULL")).scalar()
                return count or 0
        except Exception:
            return 0

