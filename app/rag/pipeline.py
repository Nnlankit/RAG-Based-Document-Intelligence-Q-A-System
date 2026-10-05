"""End-to-end RAG Pipeline orchestrating query rewriting, retrieval, context formatting, and grounded generation."""

from dataclasses import dataclass
import logging
import time
from typing import Any, Dict, List, Optional

from app.core.config import get_settings
from app.core.latency import LatencyProfiler
from app.generation.llm import BaseLLMService, get_llm_service
from app.generation.prompts import SYSTEM_PROMPT_TEMPLATE, USER_PROMPT_TEMPLATE, ABSTENTION_MESSAGE
from app.rag.context_builder import ContextBuilder, FormattedContext
from app.rag.memory import ChatTurn
from app.rag.query_rewriter import ConversationalQueryRewriter
from app.retrieval.retriever import DocumentRetriever, RetrievedCandidate
from app.schemas.chat import SourceAttribution

logger = logging.getLogger("document_intelligence.rag.pipeline")


@dataclass
class RAGExecutionResult:
    """Output data container for end-to-end RAG execution."""
    answer: str
    sources: List[SourceAttribution]
    retrieval_latency_ms: float
    generation_latency_ms: float
    total_latency_ms: float
    abstention: bool
    query: str
    rewritten_query: Optional[str]
    retrieved_chunk_ids: List[str]
    metadata: Optional[Dict[str, Any]] = None


class RAGPipeline:
    """Orchestrates query rewriting, dense retrieval, evidence filtering, and grounded answer synthesis."""

    def __init__(
        self,
        retriever: Optional[DocumentRetriever] = None,
        context_builder: Optional[ContextBuilder] = None,
        llm_service: Optional[BaseLLMService] = None,
        query_rewriter: Optional[ConversationalQueryRewriter] = None,
    ) -> None:
        self.settings = get_settings()
        self.retriever = retriever or DocumentRetriever()
        self.context_builder = context_builder or ContextBuilder()
        self.llm_service = llm_service or get_llm_service()
        self.query_rewriter = query_rewriter or ConversationalQueryRewriter(llm_service=self.llm_service)

    def execute(
        self,
        question: str,
        history: Optional[List[ChatTurn]] = None,
        user_id: Optional[str] = None,
        document_ids: Optional[List[str]] = None,
        similarity_threshold: Optional[float] = None,
        top_k: Optional[int] = None,
        request_id: Optional[str] = None,
    ) -> RAGExecutionResult:
        """Executes full RAG workflow with latency tracking and strict grounding."""
        profiler = LatencyProfiler(request_id=request_id)
        conv_history = history or []

        # 1. Query Processing & Rewriting
        with profiler.measure("query_processing_ms"):
            has_history = bool(conv_history)
            clean_question = question.strip()

        rewritten_query = clean_question
        if self.settings.ENABLE_QUERY_REWRITING and has_history:
            with profiler.measure("query_rewrite_ms"):
                rewritten_query = self.query_rewriter.rewrite_if_needed(clean_question, conv_history)
        else:
            profiler.record("query_rewrite_ms", 0.0)

        # 2. Retrieval with timing
        with profiler.measure("retrieval_ms"):
            candidates = self.retriever.retrieve(
                query=rewritten_query,
                user_id=user_id,
                document_ids=document_ids,
                top_k=top_k,
                similarity_threshold=similarity_threshold,
                profiler=profiler,
            )
        retrieval_latency_ms = profiler.timings.get("retrieval_ms", 0.0)

        # 3. Grounding Rejection / Abstention check
        if not candidates:
            profiler.record("context_building_ms", 0.0)
            profiler.record("prompt_building_ms", 0.0)
            profiler.record("llm_generation_ms", 0.0)
            profiler.record("llm_ttft_ms", 0.0)
            metrics = profiler.finalize()
            logger.info(
                f"Abstaining: no evidence met similarity threshold for query '{rewritten_query}'."
            )
            return RAGExecutionResult(
                answer=ABSTENTION_MESSAGE,
                sources=[],
                retrieval_latency_ms=retrieval_latency_ms,
                generation_latency_ms=0.0,
                total_latency_ms=metrics.get("total_latency_ms", 0.0),
                abstention=True,
                query=question,
                rewritten_query=rewritten_query if rewritten_query != question else None,
                retrieved_chunk_ids=[],
                metadata=metrics,
            )

        # 4. Context Formatting
        with profiler.measure("context_building_ms"):
            formatted_context = self.context_builder.build(candidates)

        # 5. LLM Prompt Construction
        with profiler.measure("prompt_building_ms"):
            user_prompt = USER_PROMPT_TEMPLATE.format(
                context=formatted_context.context_text,
                question=question,
            )

        # 6. LLM Grounded Generation (speed-optimized with max_tokens cap)
        with profiler.measure("llm_generation_ms"):
            try:
                answer, _ = self.llm_service.generate(
                    prompt=user_prompt,
                    system_prompt=SYSTEM_PROMPT_TEMPLATE,
                    temperature=self.settings.LLM_TEMPERATURE,
                    max_tokens=self.settings.LLM_MAX_TOKENS,
                    profiler=profiler,
                )
            except Exception as e:
                logger.error(f"Error during LLM generation: {e}", exc_info=True)
                answer = f"Error generating answer from context: {e}"

        generation_latency_ms = profiler.timings.get("llm_generation_ms", 0.0)
        metrics = profiler.finalize()
        total_latency_ms = metrics.get("total_latency_ms", 0.0)

        # Check if the LLM self-abstained based on system prompt rules
        is_abstention = (
            ABSTENTION_MESSAGE.lower() in answer.lower()
            or "insufficient information" in answer.lower()
            or "could not find sufficient" in answer.lower()
        )

        chunk_ids = [c.chunk_id for c in candidates]
        logger.info(
            f"RAG query finished: retrieval={retrieval_latency_ms}ms, generation={generation_latency_ms}ms, total={total_latency_ms}ms"
        )

        return RAGExecutionResult(
            answer=answer,
            sources=formatted_context.sources,
            retrieval_latency_ms=retrieval_latency_ms,
            generation_latency_ms=generation_latency_ms,
            total_latency_ms=total_latency_ms,
            abstention=is_abstention,
            query=question,
            rewritten_query=rewritten_query if rewritten_query != question else None,
            retrieved_chunk_ids=chunk_ids,
            metadata=metrics,
        )

    def execute_stream(
        self,
        question: str,
        history: Optional[List[ChatTurn]] = None,
        user_id: Optional[str] = None,
        document_ids: Optional[List[str]] = None,
        similarity_threshold: Optional[float] = None,
        top_k: Optional[int] = None,
        request_id: Optional[str] = None,
    ):
        """Streams tokens from RAG pipeline with immediate perceived response."""
        profiler = LatencyProfiler(request_id=request_id)
        conv_history = history or []

        # 1. Fast Query Rewriting
        with profiler.measure("query_processing_ms"):
            has_history = bool(conv_history)
            clean_question = question.strip()

        rewritten_query = clean_question
        if self.settings.ENABLE_QUERY_REWRITING and has_history:
            with profiler.measure("query_rewrite_ms"):
                rewritten_query = self.query_rewriter.rewrite_if_needed(clean_question, conv_history)
        else:
            profiler.record("query_rewrite_ms", 0.0)

        # 2. Retrieval
        with profiler.measure("retrieval_ms"):
            candidates = self.retriever.retrieve(
                query=rewritten_query,
                user_id=user_id,
                document_ids=document_ids,
                top_k=top_k,
                similarity_threshold=similarity_threshold,
                profiler=profiler,
            )
        retrieval_latency_ms = profiler.timings.get("retrieval_ms", 0.0)

        # 3. Grounding check
        if not candidates:
            profiler.record("context_building_ms", 0.0)
            profiler.record("prompt_building_ms", 0.0)
            profiler.record("llm_generation_ms", 0.0)
            profiler.record("llm_ttft_ms", 0.0)
            metrics = profiler.finalize()
            yield {
                "type": "abstention",
                "content": ABSTENTION_MESSAGE,
                "sources": [],
                "retrieval_latency_ms": retrieval_latency_ms,
                "generation_latency_ms": 0.0,
                "total_latency_ms": metrics.get("total_latency_ms", 0.0),
                "metadata": metrics,
            }
            return

        # 4. Context formatting
        with profiler.measure("context_building_ms"):
            formatted_context = self.context_builder.build(candidates)

        yield {
            "type": "sources",
            "sources": [s.model_dump() for s in formatted_context.sources],
            "retrieval_latency_ms": retrieval_latency_ms,
            "metadata": profiler.to_dict(),
        }

        # 5. LLM Prompt Construction
        with profiler.measure("prompt_building_ms"):
            user_prompt = USER_PROMPT_TEMPLATE.format(
                context=formatted_context.context_text,
                question=question,
            )

        # 6. Stream generation
        accumulated_text = []
        with profiler.measure("llm_generation_ms"):
            try:
                for token in self.llm_service.generate_stream(
                    prompt=user_prompt,
                    system_prompt=SYSTEM_PROMPT_TEMPLATE,
                    temperature=self.settings.LLM_TEMPERATURE,
                    max_tokens=self.settings.LLM_MAX_TOKENS,
                    profiler=profiler,
                ):
                    accumulated_text.append(token)
                    yield {"type": "token", "content": token}
            except Exception as e:
                logger.error(f"Error during streaming generation: {e}")
                yield {"type": "token", "content": f"\n\n[Generation error: {e}]"}

        generation_latency_ms = profiler.timings.get("llm_generation_ms", 0.0)
        metrics = profiler.finalize()
        total_latency_ms = metrics.get("total_latency_ms", 0.0)

        yield {
            "type": "done",
            "full_answer": "".join(accumulated_text),
            "generation_latency_ms": generation_latency_ms,
            "total_latency_ms": total_latency_ms,
            "metadata": metrics,
        }
