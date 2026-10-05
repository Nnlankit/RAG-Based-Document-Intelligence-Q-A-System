"""Conversational query rewriter resolving ambiguous references in multi-turn dialogues."""

import logging
import re
from typing import List, Optional
from app.core.config import get_settings
from app.generation.llm import BaseLLMService, get_llm_service
from app.generation.prompts import QUERY_REWRITE_SYSTEM_PROMPT
from app.rag.memory import ChatTurn

logger = logging.getLogger("document_intelligence.rag.query_rewriter")


class ConversationalQueryRewriter:
    """Reformulates ambiguous follow-up questions using conversation history."""

    def __init__(self, llm_service: Optional[BaseLLMService] = None) -> None:
        self.settings = get_settings()
        self.llm_service = llm_service or get_llm_service()

    def rewrite_if_needed(self, question: str, history: List[ChatTurn]) -> str:
        """Determines whether rewriting is needed and produces a self-contained query.
        
        Args:
            question: Current user question.
            history: Preceding conversational turns.
            
        Returns:
            Rewritten standalone question or original question.
        """
        # Strict Rule 1: Never rewrite if there is no conversation history
        if not history:
            return question

        # Strict Rule 2: Only rewrite if the question contains true anaphoric/elliptical references
        tokens = set(re.findall(r"\w+", question.lower()))
        anaphora_tokens = {
            "it", "they", "them", "this", "that", "these", "those",
            "its", "their", "theirs", "he", "she", "him", "her", "his",
        }
        has_anaphora = bool(tokens.intersection(anaphora_tokens))

        # Check for phrase references like "the above", "previous", "earlier", "same"
        has_reference_phrase = any(phrase in question.lower() for phrase in [
            "the above", "mentioned above", "previous", "earlier", "same", "what about", "how about", "and what"
        ])

        if not has_anaphora and not has_reference_phrase:
            logger.debug(f"Question '{question}' is self-contained; skipping rewriting.")
            return question

        # Fast path: High-efficiency lexical context expansion (< 0.1ms latency)
        if getattr(self.settings, "USE_FAST_QUERY_EXPANSION", True):
            stopwords = {
                "what", "is", "the", "a", "an", "who", "where", "when", "why", "how",
                "of", "in", "on", "at", "for", "with", "about", "are", "was", "were",
                "do", "does", "did", "can", "could", "would", "should", "it", "its",
                "they", "their", "them", "this", "that", "these", "those"
            }
            context_entities: List[str] = []
            for turn in reversed(history[-3:]):
                if turn.role.lower() == "user":
                    words = re.findall(r"[A-Za-z0-9_\-]+", turn.content)
                    key_words = [w for w in words if w.lower() not in stopwords and len(w) > 2]
                    if key_words:
                        context_entities.extend(key_words[:4])
                        break

            if context_entities:
                entity_context = " ".join(context_entities)
                expanded = f"{question} {entity_context}"
                logger.info(f"Fast expanded query in 0ms: '{question}' -> '{expanded}'")
                return expanded

        # Fallback path: Constrained LLM rewriting capped at 35 tokens
        history_text = "\n".join([f"{t.role.capitalize()}: {t.content}" for t in history[-4:]])
        prompt = (
            f"Conversation History:\n{history_text}\n\n"
            f"Follow-up Question: {question}\n\n"
            f"Standalone Query:"
        )

        try:
            rewritten, _ = self.llm_service.generate(
                prompt=prompt,
                system_prompt=QUERY_REWRITE_SYSTEM_PROMPT,
                temperature=0.0,
                max_tokens=35,
            )
            clean_rewritten = rewritten.strip().strip('"').strip("'")
            if clean_rewritten and len(clean_rewritten) > 3:
                logger.info(f"Rewrote query: '{question}' -> '{clean_rewritten}'")
                return clean_rewritten
        except Exception as e:
            logger.warning(f"Query rewriting failed with error: {e}. Falling back to original query.")

        return question
