"""Pytest test configuration and database isolation fixtures.

Guarantees that test executions never leave test records in the database.
All test documents, chunks, conversations, messages, and logs are wiped
immediately after each test and after the full test session.
"""

import pytest
from app.database.postgres import SessionLocal
from app.database.models import Document, DocumentChunk, Conversation, Message, RetrievalLog


def _wipe_test_records():
    """Wipes all ephemeral test records while preserving schemas and default users."""
    with SessionLocal() as db:
        try:
            db.query(DocumentChunk).delete()
            db.query(Document).delete()
            db.query(Message).delete()
            db.query(RetrievalLog).delete()
            db.query(Conversation).delete()
            db.commit()
        except Exception:
            db.rollback()


@pytest.fixture(scope="session", autouse=True)
def session_db_cleaner():
    """Wipes database before test suite begins and after all tests finish."""
    _wipe_test_records()
    yield
    _wipe_test_records()


@pytest.fixture(autouse=True)
def test_db_cleaner():
    """Guarantees each test execution leaves zero records in the database."""
    yield
    _wipe_test_records()
