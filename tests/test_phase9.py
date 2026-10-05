"""Phase 9 Verification Tests.

Verifies:
- Benchmark evaluation suite execution
- Context Recall metric meets >= 0.80 target
- Negative Testing & Abstention Accuracy meets >= 0.80 target
- Evaluation report generation
"""

import json
from pathlib import Path
import pytest
from evaluation.evaluate import run_evaluation


def test_evaluation_benchmark_run():
    """Executes benchmark evaluation dataset and validates grounding & abstention metrics."""
    report = run_evaluation(
        dataset_path="evaluation/dataset.json",
        output_dir="evaluation/results",
    )

    assert report is not None
    assert report["total_test_cases"] == 5
    metrics = report["metrics"]

    # Retrieval Grounding Target
    assert metrics["context_recall"] >= 0.80

    # Negative Testing Target (Abstention on unsupported questions)
    assert metrics["abstention_accuracy"] >= 0.80

    # Verify report file exists on disk
    report_file = Path("evaluation/results/evaluation_report.json")
    assert report_file.exists()
    saved_data = json.loads(report_file.read_text(encoding="utf-8"))
    assert "metrics" in saved_data
