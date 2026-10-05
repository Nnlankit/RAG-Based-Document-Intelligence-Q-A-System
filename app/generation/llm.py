"""LLM Service abstraction and Ollama implementation with latency tracking."""

from abc import ABC, abstractmethod
import json
import logging
import time
from typing import AsyncGenerator, Generator, Optional, Tuple
import httpx

from app.core.config import get_settings
from app.core.exceptions import LLMTimeoutError, ServiceUnavailableError

logger = logging.getLogger("document_intelligence.generation.llm")


class BaseLLMService(ABC):
    """Abstract interface for LLM text generation."""

    @abstractmethod
    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
    ) -> Tuple[str, float]:
        """Generates completion text and returns (response_text, latency_ms)."""
        pass

    @abstractmethod
    def generate_stream(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
    ) -> Generator[str, None, None]:
        """Streams generation tokens incrementally."""
        pass


class OllamaLLMService(BaseLLMService):
    """Local Ollama LLM provider (default: Llama 3.2)."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        model_name: Optional[str] = None,
        timeout: Optional[float] = None,
    ) -> None:
        self.settings = get_settings()
        self.base_url = (base_url or self.settings.OLLAMA_BASE_URL).rstrip("/")
        self.model_name = model_name or self.settings.LLM_MODEL
        self.timeout = timeout or self.settings.LLM_REQUEST_TIMEOUT
        self.default_temperature = self.settings.LLM_TEMPERATURE
        # Persistent HTTP client with connection pooling to eliminate TCP handshake latency
        self._client = httpx.Client(
            timeout=self.timeout,
            limits=httpx.Limits(max_keepalive_connections=20, max_connections=50),
        )
        logger.info(f"Initialized OllamaLLMService with model '{self.model_name}' at '{self.base_url}'")

    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> Tuple[str, float]:
        """Calls Ollama generate API synchronously with performance-optimized options."""
        start_time = time.perf_counter()
        temp = temperature if temperature is not None else self.default_temperature
        num_predict = max_tokens if max_tokens is not None else self.settings.LLM_MAX_TOKENS

        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temp,
                "num_predict": num_predict,
                "num_ctx": self.settings.LLM_NUM_CTX,
                "top_p": 0.9,
                "repeat_penalty": 1.1,
                "stop": ["\n\n\n", "User:", "Question:"],
            },
        }
        if system_prompt:
            payload["system"] = system_prompt

        try:
            resp = self._client.post(f"{self.base_url}/api/generate", json=payload)
            if resp.status_code != 200:
                raise ServiceUnavailableError(f"Ollama generation returned HTTP {resp.status_code}: {resp.text}")

            data = resp.json()
            answer = data.get("response", "").strip()
            latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
            return answer, latency_ms
        except httpx.TimeoutException:
            logger.error(f"Ollama generation timed out after {self.timeout}s")
            raise LLMTimeoutError(f"LLM request timed out after {self.timeout} seconds")
        except httpx.RequestError as e:
            logger.error(f"Failed to connect to Ollama at {self.base_url}: {e}")
            raise ServiceUnavailableError(f"Cannot connect to Ollama at {self.base_url}: {e}")

    def generate_stream(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> Generator[str, None, None]:
        """Streams generation tokens incrementally from Ollama."""
        temp = temperature if temperature is not None else self.default_temperature
        num_predict = max_tokens if max_tokens is not None else self.settings.LLM_MAX_TOKENS

        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": True,
            "options": {
                "temperature": temp,
                "num_predict": num_predict,
                "num_ctx": self.settings.LLM_NUM_CTX,
                "top_p": 0.9,
                "repeat_penalty": 1.1,
                "stop": ["\n\n\n", "User:", "Question:"],
            },
        }
        if system_prompt:
            payload["system"] = system_prompt

        try:
            with self._client.stream("POST", f"{self.base_url}/api/generate", json=payload) as response:
                if response.status_code != 200:
                    raise ServiceUnavailableError(f"Ollama streaming returned HTTP {response.status_code}")
                for line in response.iter_lines():
                    if line:
                        data = json.loads(line)
                        chunk = data.get("response", "")
                        if chunk:
                            yield chunk
                        if data.get("done", False):
                            break
        except httpx.TimeoutException:
            raise LLMTimeoutError("Streaming request timed out")
        except httpx.RequestError as e:
            raise ServiceUnavailableError(f"Streaming error connecting to Ollama: {e}")


_llm_service_instance: Optional[BaseLLMService] = None


def get_llm_service() -> BaseLLMService:
    """Returns singleton instance of configured LLM service."""
    global _llm_service_instance
    if _llm_service_instance is None:
        _llm_service_instance = OllamaLLMService()
    return _llm_service_instance
