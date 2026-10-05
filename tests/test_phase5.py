"""Phase 5 Verification Tests.

Verifies:
- Document upload endpoint (POST /api/v1/documents/upload)
- Duplicate document rejection (HTTP 409)
- Unsupported file extension rejection (HTTP 400)
- Document listing and details (GET /api/v1/documents)
- Chat endpoint with grounded answer and sources (POST /api/v1/chat)
- Multi-turn conversation persistence (GET /api/v1/conversations/{id})
- Document deletion and cleanup (DELETE /api/v1/documents/{id})
"""

import io
import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_document_lifecycle_and_chat():
    """End-to-end verification of upload, chat, conversation persistence, and deletion."""
    run_id = uuid.uuid4().hex[:8]
    test_content = (
        f"Project Titan-{run_id} is an autonomous robotics platform designed by Robotics Labs. "
        "It features dynamic obstacle avoidance, lidar mapping, and 14 hours of continuous battery life. "
        "The primary architect of the sensor fusion subsystem is Dr. Elena Rostova."
    )
    file_bytes = io.BytesIO(test_content.encode("utf-8"))

    # 1. Upload Document
    upload_resp = client.post(
        "/api/v1/documents/upload",
        files={"file": (f"project_titan_{run_id}.txt", file_bytes, "text/plain")},
    )
    assert upload_resp.status_code == 201
    upload_data = upload_resp.json()
    doc_id = upload_data["document_id"]
    assert upload_data["status"] == "completed"
    assert upload_data["chunk_count"] >= 1

    # 2. Duplicate Detection
    file_bytes_dup = io.BytesIO(test_content.encode("utf-8"))
    dup_resp = client.post(
        "/api/v1/documents/upload",
        files={"file": (f"project_titan_{run_id}_copy.txt", file_bytes_dup, "text/plain")},
    )
    assert dup_resp.status_code == 409
    assert "identical" in dup_resp.json()["detail"]["message"].lower()

    # 3. Invalid file type rejection
    invalid_file = io.BytesIO(b"binary executable payload")
    invalid_resp = client.post(
        "/api/v1/documents/upload",
        files={"file": ("malicious.exe", invalid_file, "application/octet-stream")},
    )
    assert invalid_resp.status_code == 400

    # 4. List Documents
    list_resp = client.get("/api/v1/documents")
    assert list_resp.status_code == 200
    docs = list_resp.json()["documents"]
    assert any(d["id"] == doc_id for d in docs)

    # 5. Get Document Details
    detail_resp = client.get(f"/api/v1/documents/{doc_id}")
    assert detail_resp.status_code == 200
    assert detail_resp.json()["id"] == doc_id
    assert detail_resp.json()["status"] == "completed"

    # 6. Chat with Grounded Question
    chat_resp = client.post(
        "/api/v1/chat",
        json={
            "question": f"Who is the primary architect of the sensor fusion subsystem in Project Titan-{run_id}?",
            "conversation_id": None,
        },
    )
    assert chat_resp.status_code == 200
    chat_data = chat_resp.json()
    conv_id = chat_data["conversation_id"]
    assert conv_id is not None
    assert len(chat_data["sources"]) >= 1
    assert "Elena" in chat_data["answer"] or "Rostova" in chat_data["answer"]
    assert chat_data["abstention"] is False

    # 7. Follow-up Chat Question in same Conversation
    followup_resp = client.post(
        "/api/v1/chat",
        json={
            "question": "What is its battery life?",
            "conversation_id": conv_id,
        },
    )
    assert followup_resp.status_code == 200
    followup_data = followup_resp.json()
    assert any(term in followup_data["answer"] for term in ["14", "fourteen", "hours"])

    # 8. Check Conversation History
    conv_resp = client.get(f"/api/v1/conversations/{conv_id}")
    assert conv_resp.status_code == 200
    messages = conv_resp.json()["messages"]
    assert len(messages) >= 4  # 2 user queries + 2 assistant answers

    # 9. Delete Document and Cleanup
    del_resp = client.delete(f"/api/v1/documents/{doc_id}")
    assert del_resp.status_code == 200

    # 10. Verify Document no longer in active list
    list_after_del = client.get("/api/v1/documents").json()["documents"]
    assert not any(d["id"] == doc_id for d in list_after_del)
