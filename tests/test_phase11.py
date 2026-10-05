"""Phase 11 Verification Tests.

Verifies:
- Document summarization (short, detailed, key_points)
- Key information and entity extraction
- Document comparison
- Question generation
"""

import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_advanced_document_intelligence():
    """Verify Phase 11 advanced intelligence capabilities."""
    doc_text_a = (
        "Policy Version 1.0 (Authored by Dr. Jane Doe at Acme Cyber, March 2024).\n"
        "All employee passwords must be a minimum of 8 characters. Two-factor authentication is optional.\n"
        "Security audits are conducted semi-annually using Splunk and Wireshark."
    )
    doc_text_b = (
        "Policy Version 2.0 (Authored by Dr. Jane Doe at Acme Cyber, October 2024).\n"
        "All employee passwords must be a minimum of 16 characters. Two-factor authentication is strictly mandatory.\n"
        "Security audits are conducted quarterly using Splunk, CrowdStrike, and Sentinel."
    )

    # 1. Upload Document A
    res_a = client.post(
        "/api/v1/documents/upload",
        files={"file": ("policy_v1.txt", io.BytesIO(doc_text_a.encode("utf-8")), "text/plain")},
    )
    assert res_a.status_code == 201
    doc_id_a = res_a.json()["document_id"]

    # 2. Upload Document B
    res_b = client.post(
        "/api/v1/documents/upload",
        files={"file": ("policy_v2.txt", io.BytesIO(doc_text_b.encode("utf-8")), "text/plain")},
    )
    assert res_b.status_code == 201
    doc_id_b = res_b.json()["document_id"]

    # 3. Test Summarization
    sum_resp = client.post(f"/api/v1/documents/{doc_id_a}/summarize?summary_type=short")
    assert sum_resp.status_code == 200
    sum_data = sum_resp.json()
    assert "summary" in sum_data
    assert len(sum_data["summary"]) > 20

    # 4. Test Entity Extraction
    ext_resp = client.post(f"/api/v1/documents/{doc_id_a}/extract-info")
    assert ext_resp.status_code == 200
    ext_data = ext_resp.json()
    assert "extracted_data" in ext_data

    # 5. Test Question Generation
    q_resp = client.post(f"/api/v1/documents/{doc_id_a}/generate-questions?num_questions=5")
    assert q_resp.status_code == 200
    q_data = q_resp.json()
    assert "questions" in q_data
    assert len(q_data["questions"]) >= 1

    # 6. Test Document Comparison
    comp_resp = client.post(
        "/api/v1/documents/compare",
        json={"document_id_a": doc_id_a, "document_id_b": doc_id_b},
    )
    assert comp_resp.status_code == 200
    comp_data = comp_resp.json()
    assert "comparison" in comp_data
    assert len(comp_data["comparison"]) > 20

    # Cleanup
    client.delete(f"/api/v1/documents/{doc_id_a}")
    client.delete(f"/api/v1/documents/{doc_id_b}")
