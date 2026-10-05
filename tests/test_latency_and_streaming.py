"""Tests for LatencyProfiler, structured telemetry, metadata responses, and streaming endpoint."""

import json
import time
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient

from app.core.latency import LatencyProfiler
from app.main import app
from app.schemas.chat import ChatRequest, ChatResponse, SourceAttribution


def test_latency_profiler_unit():
    """Verifies LatencyProfiler records stage timings and produces structured metrics."""
    profiler = LatencyProfiler(request_id="test-req-123")

    with profiler.measure("query_processing_ms"):
        time.sleep(0.01)

    with profiler.measure("embedding_ms"):
        time.sleep(0.02)

    profiler.record("vector_search_ms", 12.34)
    profiler.record_first_token()
    profiler.set_metric("generated_tokens", 42)

    metrics = profiler.finalize()

    assert "total_latency_ms" in metrics
    assert "query_processing_ms" in metrics
    assert metrics["query_processing_ms"] >= 9.0
    assert "embedding_ms" in metrics
    assert metrics["embedding_ms"] >= 18.0
    assert metrics["vector_search_ms"] == 12.34
    assert "llm_ttft_ms" in metrics
    assert metrics["generated_tokens"] == 42
    assert profiler.request_id == "test-req-123"


def test_chat_response_schema_metadata():
    """Verifies ChatResponse schema correctly serializes metadata and latency breakdowns."""
    resp = ChatResponse(
        answer="Sample grounded response",
        conversation_id="conv-123",
        sources=[
            SourceAttribution(
                document_id="doc-1",
                filename="spec.pdf",
                chunk_id="doc-1_chunk_0000",
                score=0.88,
                content_snippet="Snippet text",
            )
        ],
        retrieval_latency_ms=120.5,
        generation_latency_ms=450.2,
        total_latency_ms=570.7,
        abstention=False,
        metadata={
            "embedding_ms": 100.0,
            "vector_search_ms": 20.5,
            "llm_ttft_ms": 110.0,
            "generated_tokens": 30,
        },
    )

    data = resp.model_dump()
    assert data["answer"] == "Sample grounded response"
    assert data["total_latency_ms"] == 570.7
    assert data["metadata"]["embedding_ms"] == 100.0
    assert data["metadata"]["generated_tokens"] == 30


def test_streaming_chat_endpoint():
    """Verifies SSE streaming endpoint /api/v1/chat/stream returns valid Server-Sent Events."""
    client = TestClient(app)

    payload = {
        "question": "What is neuromorphic computing?",
        "similarity_threshold": 0.2,
        "top_k": 3,
    }

    response = client.post("/api/v1/chat/stream", json=payload)
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]

    lines = [line.strip() for line in response.text.split("\n") if line.strip().startswith("data: ")]
    assert len(lines) >= 3  # at least conversation, sources/token, done

    events = [json.loads(line[6:]) for line in lines]
    event_types = [e["type"] for e in events]

    assert "conversation" in event_types
    assert "done" in event_types

    done_event = next(e for e in events if e["type"] == "done")
    assert "full_answer" in done_event
    assert "total_latency_ms" in done_event
    assert "metadata" in done_event
