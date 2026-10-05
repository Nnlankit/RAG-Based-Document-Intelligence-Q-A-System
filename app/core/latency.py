"""Reusable high-resolution latency profiler and structured telemetry logger."""

from contextlib import contextmanager
import json
import logging
import time
from typing import Any, Dict, Optional

logger = logging.getLogger("document_intelligence.core.latency")


class LatencyProfiler:
    """High-resolution RAG latency profiler using time.perf_counter()."""

    def __init__(self, request_id: Optional[str] = None) -> None:
        self.request_id = request_id or ""
        self._start_time = time.perf_counter()
        self.timings: Dict[str, float] = {}
        self.extra_metrics: Dict[str, Any] = {}
        self._first_token_time: Optional[float] = None

    @contextmanager
    def measure(self, stage_name: str):
        """Context manager to measure execution time of a specific stage in milliseconds."""
        start = time.perf_counter()
        try:
            yield
        finally:
            elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
            self.timings[stage_name] = elapsed_ms

    def record(self, stage_name: str, duration_ms: float) -> None:
        """Explicitly records duration for a stage in milliseconds."""
        self.timings[stage_name] = round(duration_ms, 2)

    def record_first_token(self) -> None:
        """Records time to first token (TTFT) from request start."""
        if self._first_token_time is None:
            self._first_token_time = time.perf_counter()
            self.timings["llm_ttft_ms"] = round(
                (self._first_token_time - self._start_time) * 1000, 2
            )

    def set_metric(self, key: str, value: Any) -> None:
        """Sets non-timing metric metadata (e.g. token counts, model name)."""
        self.extra_metrics[key] = value

    def finalize(self) -> Dict[str, Any]:
        """Finalizes profiling and records total end-to-end latency."""
        total_ms = round((time.perf_counter() - self._start_time) * 1000, 2)
        self.timings["total_latency_ms"] = total_ms
        self.log_structured()
        return self.to_dict()

    def to_dict(self) -> Dict[str, Any]:
        """Returns consolidated metrics dictionary."""
        return {**self.timings, **self.extra_metrics}

    def log_structured(self) -> None:
        """Emits structured RAG_LATENCY log."""
        metrics_kv = " ".join([f"{k}={v}" for k, v in self.timings.items()])
        logger.info(f"RAG_LATENCY request_id={self.request_id} {metrics_kv}")
