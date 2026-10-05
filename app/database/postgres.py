"""Database session management, connection pooling, and health checks."""

import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import get_settings
from app.database.models import Base, User

logger = logging.getLogger("document_intelligence.database")
settings = get_settings()

# Engine creation with dialect-specific options
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args=connect_args,
        echo=settings.DEBUG,
    )
else:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        echo=settings.DEBUG,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    """Initializes the database schema and seeds a default local user if none exists."""
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/created successfully.")

        # Ensure a default user exists for local single-user or unauthenticated MVP mode
        with SessionLocal() as db:
            default_user = db.query(User).filter(User.id == "default_user").first()
            if not default_user:
                default_user = User(
                    id="default_user",
                    email="admin@example.com",
                    password_hash="placeholder_hash_for_mvp",
                )
                db.add(default_user)
                db.commit()
                logger.info("Default local user seeded: default_user (admin@example.com)")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}", exc_info=True)
        raise


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a database session and closes it cleanly."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_health() -> bool:
    """Checks database connectivity with a lightweight ping query."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.warning(f"Database health check failed: {e}")
        return False
