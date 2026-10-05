"""ChromaDB vector store implementation for local development and MVP."""

import logging
from typing import Any, Dict, List, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.core.config import get_settings
from app.vectorstore.base import BaseVectorStore, VectorSearchResult

logger = logging.getLogger("document_intelligence.vectorstore.chroma")


class ChromaVectorStore(BaseVectorStore):
    """ChromaDB-backed vector store implementing BaseVectorStore."""

    def __init__(self) -> None:
        self.settings = get_settings()
        self.persist_directory = self.settings.CHROMA_PERSIST_DIRECTORY
        self.collection_name = self.settings.COLLECTION_NAME

        try:
            self.client = chromadb.PersistentClient(
                path=self.persist_directory,
                settings=ChromaSettings(anonymized_telemetry=False),
            )
            # Use cosine distance metric for normalized semantic similarity
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"},
            )
            logger.info(f"Initialized ChromaDB collection '{self.collection_name}' at {self.persist_directory}")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}", exc_info=True)
            raise

    def add_chunks(
        self,
        chunks: List[Dict[str, Any]],
        embeddings: List[List[float]],
    ) -> List[str]:
        """Adds text chunks with embeddings and metadata to ChromaDB."""
        if not chunks:
            return []

        ids: List[str] = []
        documents: List[str] = []
        metadatas: List[Dict[str, Any]] = []

        for chunk in chunks:
            chunk_id = chunk["chunk_id"]
            ids.append(chunk_id)
            documents.append(chunk["content"])

            # Clean and sanitize metadata: Chroma requires string, int, float, or bool values
            meta = chunk.get("metadata", {}).copy()
            meta["document_id"] = str(chunk["document_id"])
            meta["chunk_id"] = str(chunk_id)
            meta["chunk_index"] = int(chunk.get("chunk_index", 0))

            # Sanitize null page numbers for chroma metadata
            if meta.get("page_number") is None:
                meta["page_number"] = -1  # Sentinel for unknown page in non-paged formats

            # Remove non-primitive types if any
            clean_meta = {}
            for k, v in meta.items():
                if isinstance(v, (str, int, float, bool)):
                    clean_meta[k] = v
                elif v is not None:
                    clean_meta[k] = str(v)

            metadatas.append(clean_meta)

        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
        )
        logger.info(f"Indexed {len(ids)} chunks in ChromaDB collection '{self.collection_name}'.")
        return ids

    def search_by_vector(
        self,
        query_embedding: List[float],
        k: int = 5,
        filter_metadata: Optional[Dict[str, Any]] = None,
    ) -> List[VectorSearchResult]:
        """Searches ChromaDB using cosine distance and converts distance to similarity score."""
        where_filter = None
        if filter_metadata:
            # If multiple filter keys exist, format Chroma $and query
            clean_filters = []
            for k_filt, v_filt in filter_metadata.items():
                if v_filt is not None:
                    if isinstance(v_filt, list) and len(v_filt) == 1:
                        clean_filters.append({k_filt: {"$eq": v_filt[0]}})
                    elif isinstance(v_filt, list) and len(v_filt) > 1:
                        clean_filters.append({k_filt: {"$in": v_filt}})
                    else:
                        clean_filters.append({k_filt: {"$eq": v_filt}})

            if len(clean_filters) == 1:
                where_filter = clean_filters[0]
            elif len(clean_filters) > 1:
                where_filter = {"$and": clean_filters}

        total_in_collection = self.collection.count()
        if total_in_collection == 0:
            return []

        effective_k = min(k, total_in_collection)

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=effective_k,
            where=where_filter,
            include=["documents", "metadatas", "distances"],
        )

        search_results: List[VectorSearchResult] = []
        if not results or not results["ids"] or not results["ids"][0]:
            return search_results

        ids = results["ids"][0]
        docs = results["documents"][0] if results.get("documents") else [""] * len(ids)
        metas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(ids)
        distances = results["distances"][0] if results.get("distances") else [0.0] * len(ids)

        for chunk_id, content, metadata, distance in zip(ids, docs, metas, distances):
            # Chroma with cosine metric returns distance = 1 - cosine_similarity
            # Similarity score = 1.0 - distance
            # Bound score between 0.0 and 1.0
            score = max(0.0, min(1.0, 1.0 - distance))

            meta_copy = dict(metadata) if metadata else {}
            if meta_copy.get("page_number") == -1:
                meta_copy["page_number"] = None

            search_results.append(
                VectorSearchResult(
                    chunk_id=chunk_id,
                    document_id=str(meta_copy.get("document_id", "")),
                    content=content,
                    metadata=meta_copy,
                    score=round(score, 4),
                )
            )

        return search_results

    def delete_document(self, document_id: str) -> None:
        """Deletes all chunks belonging to the specified document_id."""
        try:
            self.collection.delete(where={"document_id": str(document_id)})
            logger.info(f"Purged all vectors for document_id '{document_id}' from ChromaDB.")
        except Exception as e:
            logger.warning(f"Error purging document '{document_id}' from ChromaDB (might have had 0 chunks): {e}")

    def check_health(self) -> bool:
        """Checks if ChromaDB client and collection are operational."""
        try:
            _ = self.collection.count()
            return True
        except Exception as e:
            logger.warning(f"ChromaDB health check failed: {e}")
            return False

    def count(self) -> int:
        """Returns total vector count in the collection."""
        try:
            return self.collection.count()
        except Exception:
            return 0
