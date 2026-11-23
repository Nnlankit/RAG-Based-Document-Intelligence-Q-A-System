import time
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.rag.pipeline import RAGPipeline
from app.rag.memory import ChatTurn
from app.core.config import get_settings

pipeline = RAGPipeline()
settings = get_settings()

test_cases = [
    {
        "index": 1,
        "query": "What are the password requirements and is two-factor authentication mandatory?",
        "history": None,
    },
    {
        "index": 2,
        "query": "Who supervised the pharmaceutical regulatory science report and what institute is it for?",
        "history": None,
    },
    {
        "index": 3,
        "query": "What are the key responsibilities of a Regulatory Affairs professional regarding SOPs and BMR?",
        "history": None,
    },
    {
        "index": 4,
        "query": "Who was the student?",
        "history": [
            ChatTurn(role="user", content="Tell me about the pharmaceutical regulatory science project."),
            ChatTurn(role="assistant", content="The project was supervised by Assit. Prof. HEMANT at Manav Institute of Pharmacy."),
        ],
    },
    {
        "index": 5,
        "query": "What is the recipe for chocolate chip cookies?",
        "history": None,
    },
]

print("=== POST-OPTIMIZATION BENCHMARK AUDIT ===")
results = []
for case in test_cases:
    idx = case["index"]
    q = case["query"]
    hist = case["history"]
    
    t0 = time.perf_counter()
    res = pipeline.execute(question=q, history=hist)
    total_time = round((time.perf_counter() - t0) * 1000, 2)
    meta = res.metadata or {}
    tps = 0.0
    if meta.get("generated_tokens") and meta.get("llm_eval_ms") and meta["llm_eval_ms"] > 0:
        tps = round(meta["generated_tokens"] / (meta["llm_eval_ms"] / 1000), 2)

    item = {
        "index": idx,
        "query": q,
        "abstention": res.abstention,
        "sources_count": len(res.sources),
        "query_processing_ms": meta.get("query_processing_ms", 0.0),
        "query_rewrite_ms": meta.get("query_rewrite_ms", 0.0),
        "embedding_ms": meta.get("embedding_ms", 0.0),
        "vector_search_ms": meta.get("vector_search_ms", 0.0),
        "retrieval_ms": res.retrieval_latency_ms,
        "context_building_ms": meta.get("context_building_ms", 0.0),
        "prompt_building_ms": meta.get("prompt_building_ms", 0.0),
        "llm_model_load_ms": meta.get("llm_model_load_ms", 0.0),
        "llm_ttft_ms": meta.get("llm_ttft_ms", 0.0),
        "llm_eval_ms": meta.get("llm_eval_ms", 0.0),
        "prompt_tokens": meta.get("prompt_tokens", 0),
        "generated_tokens": meta.get("generated_tokens", 0),
        "generation_ms": res.generation_latency_ms,
        "total_latency_ms": total_time,
        "tokens_per_second": tps,
        "answer_snippet": res.answer[:100] + ("..." if len(res.answer) > 100 else ""),
    }
    results.append(item)
    print(f"Test {idx}: \"{q}\"")
    print(f"  - Abstention: {item['abstention']}")
    print(f"  - Retrieved Chunks: {item['sources_count']}")
    print(f"  - Embedding: {item['embedding_ms']} ms")
    print(f"  - Vector Search (DB): {item['vector_search_ms']} ms")
    print(f"  - Retrieval Total: {item['retrieval_ms']} ms")
    print(f"  - Context Prep: {item['context_building_ms']} ms")
    print(f"  - Prompt Tokens: {item['prompt_tokens']}")
    print(f"  - LLM TTFT: {item['llm_ttft_ms']} ms")
    print(f"  - LLM Model Load: {item['llm_model_load_ms']} ms")
    print(f"  - LLM Tokens Generated: {item['generated_tokens']}")
    print(f"  - LLM Generation: {item['generation_ms']} ms")
    print(f"  - Tokens/sec: {item['tokens_per_second']} t/s")
    print(f"  - Total End-to-End: {item['total_latency_ms']} ms")
    print(f"  - Answer: {item['answer_snippet']}")
    print("-" * 50)

with open("scripts/optimized_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)
print("Saved optimized results to scripts/optimized_results.json")
