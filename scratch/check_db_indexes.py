import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database.postgres import engine
from sqlalchemy import text

with engine.connect() as conn:
    counts = conn.execute(text("SELECT count(*), count(embedding_vec), count(embedding) FROM document_chunks")).fetchone()
    print("Counts (total, vec, text):", counts)
    indexes = conn.execute(text("SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'document_chunks'")).fetchall()
    print("Indexes:")
    for idx in indexes:
        print(" ", idx)
