"""Generation and LLM package."""
from app.generation.prompts import SYSTEM_PROMPT_TEMPLATE, USER_PROMPT_TEMPLATE, ABSTENTION_MESSAGE, QUERY_REWRITE_SYSTEM_PROMPT
from app.generation.llm import BaseLLMService, OllamaLLMService, get_llm_service

__all__ = [
    "SYSTEM_PROMPT_TEMPLATE",
    "USER_PROMPT_TEMPLATE",
    "ABSTENTION_MESSAGE",
    "QUERY_REWRITE_SYSTEM_PROMPT",
    "BaseLLMService",
    "OllamaLLMService",
    "get_llm_service",
]
