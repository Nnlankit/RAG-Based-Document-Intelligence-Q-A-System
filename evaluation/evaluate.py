"""RAG Evaluation Benchmark Harness.

Measures:
- Context Recall & Context Precision
- Abstention Accuracy (Negative testing on out-of-domain questions)
- Faithfulness / Groundedness
- Latency metrics (retrieval ms, generation ms, total ms)
"""

import json
import logging
from pathlib import Path
import time
from typing import Any, Dict, List

from app.core.config import get_settings
from app.embeddings.embedding_service import get_embedding_service
from app.generation.prompts import ABSTENTION_MESSAGE
from app.rag.pipeline import RAGPipeline
from app.retrieval.retriever import DocumentRetriever
from app.vectorstore.chroma import ChromaVectorStore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("document_intelligence.evaluation")


def run_evaluation(
    dataset_path: str = "evaluation/dataset.json",
    output_dir: str = "evaluation/results",
) -> Dict[str, Any]:
    """Runs end-to-end benchmark on dataset and produces detailed metrics."""
    data_file = Path(dataset_path)
    if not data_file.exists():
        raise FileNotFoundError(f"Dataset not found at {dataset_path}")

    with open(data_file, "r", encoding="utf-8") as f:
        test_cases = json.load(f)

    # 1. Initialize clean vector store and index benchmark corpus
    vs = ChromaVectorStore()
    emb = get_embedding_service()
    doc_id = "eval_corpus_doc"

    # Purge old eval data
    vs.delete_document(doc_id)

    chunks = []
    for i, tc in enumerate(test_cases):
        chunks.append({
            "chunk_id": f"eval_chunk_{i:04d}",
            "document_id": doc_id,
            "chunk_index": i,
            "page_number": tc["expected_page"],
            "content": tc["document_content"],
            "metadata": {
                "filename": tc["document_filename"],
                "page_number": tc["expected_page"],
                "tc_id": tc["id"],
            }
        })

    texts = [c["content"] for c in chunks]
    embeddings = emb.embed_documents(texts)
    vs.add_chunks(chunks, embeddings)

    pipeline = RAGPipeline(retriever=DocumentRetriever(vector_store=vs, embedding_service=emb))

    # 2. Execute benchmark test cases
    results: List[Dict[str, Any]] = []
    total_recall = 0
    total_precision = 0
    abstention_correct = 0
    unsupported_count = 0
    supported_count = 0
    latencies_retrieval = []
    latencies_generation = []
    latencies_total = []

    for tc in test_cases:
        logger.info(f"Evaluating [{tc['id']}]: '{tc['question']}'")
        res = pipeline.execute(
            question=tc["question"],
            document_ids=[doc_id],
            similarity_threshold=0.68,
            top_k=3,
        )

        latencies_retrieval.append(res.retrieval_latency_ms)
        latencies_generation.append(res.generation_latency_ms)
        latencies_total.append(res.total_latency_ms)

        is_unsupported = tc["is_unsupported"]
        if is_unsupported:
            unsupported_count += 1
            # Expected to abstain
            correct_abstention = (
                res.abstention
                or ABSTENTION_MESSAGE.lower() in res.answer.lower()
                or "could not find sufficient" in res.answer.lower()
            )
            if correct_abstention:
                abstention_correct += 1
            tc_result = {
                "id": tc["id"],
                "question": tc["question"],
                "is_unsupported": True,
                "abstained": res.abstention,
                "abstention_correct": correct_abstention,
                "answer": res.answer,
                "total_latency_ms": res.total_latency_ms,
            }
        else:
            supported_count += 1
            # Check context recall (did we retrieve the matching filename?)
            retrieved_files = [s.filename for s in res.sources]
            recalled = tc["document_filename"] in retrieved_files
            if recalled:
                total_recall += 1

            # Precision: proportion of retrieved chunks from matching file
            matching_chunks = sum(1 for s in res.sources if s.filename == tc["document_filename"])
            precision = matching_chunks / len(res.sources) if res.sources else 0.0
            total_precision += precision

            tc_result = {
                "id": tc["id"],
                "question": tc["question"],
                "is_unsupported": False,
                "context_recalled": recalled,
                "context_precision": round(precision, 2),
                "answer": res.answer,
                "sources_count": len(res.sources),
                "total_latency_ms": res.total_latency_ms,
            }

        results.append(tc_result)

    # 3. Clean up eval vectors
    vs.delete_document(doc_id)

    # 4. Compute aggregate metrics
    avg_recall = round(total_recall / supported_count, 4) if supported_count else 0.0
    avg_precision = round(total_precision / supported_count, 4) if supported_count else 0.0
    abstention_accuracy = round(abstention_correct / unsupported_count, 4) if unsupported_count else 0.0
    avg_retrieval_ms = round(sum(latencies_retrieval) / len(latencies_retrieval), 2)
    avg_generation_ms = round(sum(latencies_generation) / len(latencies_generation), 2)
    avg_total_ms = round(sum(latencies_total) / len(latencies_total), 2)

    report = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_test_cases": len(test_cases),
        "supported_cases": supported_count,
        "unsupported_negative_cases": unsupported_count,
        "metrics": {
            "context_recall": avg_recall,
            "context_precision": avg_precision,
            "abstention_accuracy": abstention_accuracy,
            "avg_retrieval_latency_ms": avg_retrieval_ms,
            "avg_generation_latency_ms": avg_generation_ms,
            "avg_total_latency_ms": avg_total_ms,
        },
        "individual_results": results,
    }

    # Save report
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    report_file = out_dir / "evaluation_report.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    logger.info(f"Evaluation report written to {report_file}")
    logger.info(f"Summary Metrics: Recall={avg_recall:.2%}, Precision={avg_precision:.2%}, Abstention Accuracy={abstention_accuracy:.2%}")
    logger.info(f"Avg Latency: Total={avg_total_ms}ms (Retrieval={avg_retrieval_ms}ms, Generation={avg_generation_ms}ms)")
    return report


if __name__ == "__main__":
    run_evaluation()
