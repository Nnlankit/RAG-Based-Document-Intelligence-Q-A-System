"""Structured logging configuration for the RAG system.

Provides JSON-formatted or clean console logging with contextual tracking
for requests, RAG latency, and document processing steps.
"""

import json
import logging
import sys
import time
from typing import Any, Dict, Optional


class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured observability."""

    def format(self, record: logging.LogRecord) -> str:
        log_obj: Dict[str, Any] = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Include custom structured extra attributes
        for key in ["request_id", "user_id", "endpoint", "status_code", "latency_ms",
                    "query", "rewritten_query", "retrieved_chunk_ids",
                    "retrieval_latency_ms", "generation_latency_ms", "total_latency_ms",
                    "document_id", "chunk_count"]:
            if hasattr(record, key):
                log_obj[key] = getattr(record, key)

        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_obj)


def setup_logging(log_level: str = "INFO", json_format: bool = False) -> logging.Logger:
    """Configures root and application loggers."""
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))

    # Remove existing handlers to avoid duplicates
    for handler in list(root_logger.handlers):
        root_logger.removeHandler(handler)

    handler = logging.StreamHandler(sys.stdout)
    if json_format:
        handler.setFormatter(JSONFormatter())
    else:
        standard_format = "%(asctime)s | %(levelname)-7s | %(name)s | %(message)s"
        handler.setFormatter(logging.Formatter(standard_format, datefmt="%Y-%m-%d %H:%M:%S"))

    root_logger.addHandler(handler)

    # Silence noisy 3rd-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("chromadb").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)

    logger = logging.getLogger("document_intelligence")
    return logger


logger = setup_logging()
