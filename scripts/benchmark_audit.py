import time
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.rag.pipeline import RAGPipeline
from app.core.config import get_settings

pipeline = RAGPipeline()
settings = get_settings()

test_queries = [
    "What is machine learning?",
    "What topics are covered in Unit 1 of this course?",
    "What is the speech platform architecture overview?",
    "What is machine learning?",  # repeat to measure caching
    "What is the recipe for chocolate chip cookies?",  # unsupported -> abstention
]

print("=== BASELINE BENCHMARK AUDIT (BEFORE OPTIMIZATIONS) ===")
results = []
for i, q in enumerate(test_queries, 1):
    t0 = time.perf_counter()
    res = pipeline.execute(q)
    total_time = round((time.perf_counter() - t0) * 1000, 2)
    meta = res.metadata or {}
    tps = 0.0
    if meta.get("generated_tokens") and meta.get("llm_eval_ms") and meta["llm_eval_ms"] > 0:
        tps = round(meta["generated_tokens"] / (meta["llm_eval_ms"] / 1000), 2)
    
    item = {
        "query": q,
        "abstention": res.abstention,
        "chunks": len(res.sources),
        "query_processing_ms": meta.get("query_processing_ms", 0.0),
        "query_rewrite_ms": meta.get("query_rewrite_ms", 0.0),
        "embedding_ms": meta.get("embedding_ms", 0.0),
        "vector_search_ms": meta.get("vector_search_ms", 0.0),
        "retrieval_ms": res.retrieval_latency_ms,
        "context_building_ms": meta.get("context_building_ms", 0.0),
        "prompt_building_ms": meta.get("prompt_building_ms", 0.0),
        "llm_ttft_ms": meta.get("llm_ttft_ms", 0.0),
        "llm_model_load_ms": meta.get("llm_model_load_ms", 0.0),
        "llm_eval_ms": meta.get("llm_eval_ms", 0.0),
        "generated_tokens": meta.get("generated_tokens", 0),
        "generation_ms": res.generation_latency_ms,
        "total_latency_ms": total_time,
        "tokens_per_second": tps,
        "answer_snippet": res.answer[:80] + ("..." if len(res.answer) > 80 else ""),
    }
    results.append(item)
    print(f"Test {i}: \"{q}\"")
    print(f"  - Abstention: {item['abstention']}")
    print(f"  - Retrieved Chunks: {item['chunks']}")
    print(f"  - Embedding: {item['embedding_ms']} ms")
    print(f"  - Vector Search (DB): {item['vector_search_ms']} ms")
    print(f"  - Retrieval Total: {item['retrieval_ms']} ms")
    print(f"  - Context Prep: {item['context_building_ms']} ms")
    print(f"  - Prompt Building: {item['prompt_building_ms']} ms")
    print(f"  - LLM TTFT: {item['llm_ttft_ms']} ms")
    print(f"  - LLM Model Load: {item['llm_model_load_ms']} ms")
    print(f"  - LLM Tokens Generated: {item['generated_tokens']}")
    print(f"  - LLM Generation: {item['generation_ms']} ms")
    print(f"  - Tokens/sec: {item['tokens_per_second']} t/s")
    print(f"  - Total End-to-End: {item['total_latency_ms']} ms")
    print(f"  - Answer: {item['answer_snippet']}")
    print("-" * 50)

with open("scripts/baseline_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)
print("Saved baseline results to scripts/baseline_results.json")
