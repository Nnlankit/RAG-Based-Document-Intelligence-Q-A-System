"""End-to-end RAG Pipeline orchestrating query rewriting, retrieval, context formatting, and grounded generation."""

from dataclasses import dataclass
import logging
import time
from typing import List, Optional

from app.core.config import get_settings
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
    ) -> RAGExecutionResult:
        """Executes full RAG workflow with latency tracking and strict grounding.
        
        Args:
            question: Raw user question.
            history: Preceding conversational messages.
            user_id: User identifier for authorization filtering.
            document_ids: Optional list of documents to search within.
            similarity_threshold: Override for minimum similarity score.
            top_k: Override for number of chunks.
            
        Returns:
            RAGExecutionResult containing answer, sources, and metrics.
        """
        pipeline_start = time.perf_counter()
        conv_history = history or []

        # 1. Query Rewriting (if enabled and history present)
        rewritten_query = question
        if self.settings.ENABLE_QUERY_REWRITING and conv_history:
            rewritten_query = self.query_rewriter.rewrite_if_needed(question, conv_history)

        # 2. Retrieval with timing
        retrieval_start = time.perf_counter()
        candidates = self.retriever.retrieve(
            query=rewritten_query,
            user_id=user_id,
            document_ids=document_ids,
            top_k=top_k,
            similarity_threshold=similarity_threshold,
        )
        retrieval_latency_ms = round((time.perf_counter() - retrieval_start) * 1000, 2)

        # 3. Grounding Rejection / Abstention check
        if not candidates:
            total_latency_ms = round((time.perf_counter() - pipeline_start) * 1000, 2)
            logger.info(
                f"Abstaining: no evidence met similarity threshold for query '{rewritten_query}'."
            )
            return RAGExecutionResult(
                answer=ABSTENTION_MESSAGE,
                sources=[],
                retrieval_latency_ms=retrieval_latency_ms,
                generation_latency_ms=0.0,
                total_latency_ms=total_latency_ms,
                abstention=True,
                query=question,
                rewritten_query=rewritten_query if rewritten_query != question else None,
                retrieved_chunk_ids=[],
            )

        # 4. Context Formatting
        formatted_context = self.context_builder.build(candidates)

        # 5. LLM Prompt Construction
        user_prompt = USER_PROMPT_TEMPLATE.format(
            context=formatted_context.context_text,
            question=question,
        )

        # 6. LLM Grounded Generation (speed-optimized with max_tokens cap)
        generation_start = time.perf_counter()
        try:
            answer, _ = self.llm_service.generate(
                prompt=user_prompt,
                system_prompt=SYSTEM_PROMPT_TEMPLATE,
                temperature=self.settings.LLM_TEMPERATURE,
                max_tokens=self.settings.LLM_MAX_TOKENS,
            )
        except Exception as e:
            logger.error(f"Error during LLM generation: {e}", exc_info=True)
            answer = f"Error generating answer from context: {e}"

        generation_latency_ms = round((time.perf_counter() - generation_start) * 1000, 2)
        total_latency_ms = round((time.perf_counter() - pipeline_start) * 1000, 2)

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
        )

    def execute_stream(
        self,
        question: str,
        history: Optional[List[ChatTurn]] = None,
        user_id: Optional[str] = None,
        document_ids: Optional[List[str]] = None,
        similarity_threshold: Optional[float] = None,
        top_k: Optional[int] = None,
    ):
        """Streams tokens from RAG pipeline with immediate perceived response."""
        pipeline_start = time.perf_counter()
        conv_history = history or []

        # 1. Fast Query Rewriting
        rewritten_query = question
        if self.settings.ENABLE_QUERY_REWRITING and conv_history:
            rewritten_query = self.query_rewriter.rewrite_if_needed(question, conv_history)

        # 2. Retrieval
        retrieval_start = time.perf_counter()
        candidates = self.retriever.retrieve(
            query=rewritten_query,
            user_id=user_id,
            document_ids=document_ids,
            top_k=top_k,
            similarity_threshold=similarity_threshold,
        )
        retrieval_latency_ms = round((time.perf_counter() - retrieval_start) * 1000, 2)

        # 3. Grounding check
        if not candidates:
            total_latency_ms = round((time.perf_counter() - pipeline_start) * 1000, 2)
            yield {
                "type": "abstention",
                "content": ABSTENTION_MESSAGE,
                "sources": [],
                "retrieval_latency_ms": retrieval_latency_ms,
                "generation_latency_ms": 0.0,
                "total_latency_ms": total_latency_ms,
            }
            return

        # 4. Context formatting
        formatted_context = self.context_builder.build(candidates)
        yield {
            "type": "sources",
            "sources": [s.model_dump() for s in formatted_context.sources],
            "retrieval_latency_ms": retrieval_latency_ms,
        }

        # 5. LLM Prompt Construction
        user_prompt = USER_PROMPT_TEMPLATE.format(
            context=formatted_context.context_text,
            question=question,
        )

        # 6. Stream generation
        generation_start = time.perf_counter()
        accumulated_text = []
        try:
            for token in self.llm_service.generate_stream(
                prompt=user_prompt,
                system_prompt=SYSTEM_PROMPT_TEMPLATE,
                temperature=self.settings.LLM_TEMPERATURE,
                max_tokens=self.settings.LLM_MAX_TOKENS,
            ):
                accumulated_text.append(token)
                yield {"type": "token", "content": token}
        except Exception as e:
            logger.error(f"Error during streaming generation: {e}")
            yield {"type": "token", "content": f"\n\n[Generation error: {e}]"}

        generation_latency_ms = round((time.perf_counter() - generation_start) * 1000, 2)
        total_latency_ms = round((time.perf_counter() - pipeline_start) * 1000, 2)

        yield {
            "type": "done",
            "full_answer": "".join(accumulated_text),
            "generation_latency_ms": generation_latency_ms,
            "total_latency_ms": total_latency_ms,
        }
