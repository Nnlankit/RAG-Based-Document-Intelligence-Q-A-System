import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database.postgres import engine
from sqlalchemy import text
import time

dummy_vec = "[" + ",".join(["0.01"] * 768) + "]"

with engine.connect() as conn:
    print("--- EXPLAIN with COALESCE ---")
    plan1 = conn.execute(text("""
        EXPLAIN (ANALYZE, BUFFERS)
        SELECT id, 1.0 - (COALESCE(embedding_vec, CAST(embedding AS vector)) <=> CAST(:q AS vector))
        FROM document_chunks
        ORDER BY COALESCE(embedding_vec, CAST(embedding AS vector)) <=> CAST(:q AS vector) ASC
        LIMIT 5
    """), {"q": dummy_vec}).fetchall()
    for row in plan1:
        print(row[0])

    print("\n--- EXPLAIN with direct embedding_vec (HNSW) ---")
    plan2 = conn.execute(text("""
        EXPLAIN (ANALYZE, BUFFERS)
        SELECT id, 1.0 - (embedding_vec <=> CAST(:q AS vector))
        FROM document_chunks
        ORDER BY embedding_vec <=> CAST(:q AS vector) ASC
        LIMIT 5
    """), {"q": dummy_vec}).fetchall()
    for row in plan2:
        print(row[0])
