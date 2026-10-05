"""Streamlit Frontend for RAG-Based Document Intelligence & Q&A System.

Features:
- Document upload (.pdf, .docx, .txt, .md) with progress feedback
- Active document library with chunk count and cascading deletion
- Multi-turn grounded chat interface
- Source attribution with document names, page numbers, and similarity scores
- Configurable similarity threshold and document selection filters
- System diagnostics and health status indicators
"""

import os
import requests
import streamlit as st
from typing import Any, Dict, List, Optional

# Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000/api/v1")

# Page Configuration
st.set_page_config(
    page_title="Document Intelligence & Q&A",
    page_icon="📄",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS for polished interface
st.markdown(
    """
    <style>
    .main-header {
        font-size: 2.1rem;
        font-weight: 700;
        color: #1E293B;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1.0rem;
        color: #64748B;
        margin-bottom: 1.5rem;
    }
    .source-card {
        background-color: #F8FAFC;
        border-left: 4px solid #3B82F6;
        padding: 0.75rem 1rem;
        border-radius: 4px;
        margin-bottom: 0.5rem;
        font-size: 0.88rem;
    }
    .source-meta {
        font-weight: 600;
        color: #1E40AF;
    }
    .source-score {
        color: #059669;
        font-weight: 600;
    }
    .status-badge {
        display: inline-block;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 600;
    }
    .badge-healthy { background-color: #DCFCE7; color: #166534; }
    .badge-degraded { background-color: #FEF9C3; color: #854D0E; }
    .badge-unhealthy { background-color: #FEE2E2; color: #991B1B; }
    </style>
    """,
    unsafe_allow_html=True,
)


def get_health() -> Dict[str, Any]:
    """Queries backend health check endpoint."""
    try:
        resp = requests.get(f"{API_BASE_URL}/health", timeout=3.0)
        if resp.status_code == 200:
            return resp.json()
    except Exception:
        pass
    return {"status": "unhealthy", "database": "unreachable", "vector_store": "unreachable", "ollama": "unreachable"}


def fetch_documents() -> List[Dict[str, Any]]:
    """Retrieves document library from backend."""
    try:
        resp = requests.get(f"{API_BASE_URL}/documents", timeout=5.0)
        if resp.status_code == 200:
            return resp.json().get("documents", [])
    except Exception as e:
        st.sidebar.error(f"Failed to load documents: {e}")
    return []


def upload_file(uploaded_file) -> Optional[Dict[str, Any]]:
    """Uploads file to backend document ingestion endpoint."""
    try:
        files = {"file": (uploaded_file.name, uploaded_file.getvalue(), uploaded_file.type or "application/octet-stream")}
        resp = requests.post(f"{API_BASE_URL}/documents/upload", files=files, timeout=120.0)
        if resp.status_code == 201:
            return resp.json()
        elif resp.status_code == 409:
            st.error("Duplicate document detected: This exact file has already been indexed.")
        elif resp.status_code == 413:
            st.error("File is too large. Maximum size is 50MB.")
        else:
            detail = resp.json().get("detail", resp.text)
            st.error(f"Upload failed: {detail}")
    except Exception as e:
        st.error(f"Error during upload: {e}")
    return None


def delete_document(document_id: str) -> bool:
    """Sends deletion request to backend."""
    try:
        resp = requests.delete(f"{API_BASE_URL}/documents/{document_id}", timeout=10.0)
        return resp.status_code == 200
    except Exception as e:
        st.error(f"Failed to delete document: {e}")
        return False


def send_chat_query(
    question: str,
    conversation_id: Optional[str] = None,
    document_ids: Optional[List[str]] = None,
    similarity_threshold: float = 0.70,
    top_k: int = 5,
) -> Optional[Dict[str, Any]]:
    """Sends user question to RAG chat endpoint."""
    payload = {
        "question": question,
        "conversation_id": conversation_id,
        "document_ids": document_ids or [],
        "similarity_threshold": similarity_threshold,
        "top_k": top_k,
    }
    try:
        resp = requests.post(f"{API_BASE_URL}/chat", json=payload, timeout=90.0)
        if resp.status_code == 200:
            return resp.json()
        else:
            st.error(f"Chat error: {resp.json().get('detail', resp.text)}")
    except Exception as e:
        st.error(f"Failed to contact chat API: {e}")
    return None


# Initialize Streamlit Session State
if "messages" not in st.session_state:
    st.session_state.messages = []
if "conversation_id" not in st.session_state:
    st.session_state.conversation_id = None
if "selected_doc_ids" not in st.session_state:
    st.session_state.selected_doc_ids = []


# ---------------- SIDEBAR ----------------
with st.sidebar:
    st.title("📚 Document Manager")

    # System Health Badge
    health = get_health()
    status_str = health.get("status", "unknown")
    badge_class = f"badge-{status_str}" if status_str in ["healthy", "degraded", "unhealthy"] else "badge-unhealthy"
    st.markdown(
        f"**System Status**: <span class='status-badge {badge_class}'>{status_str.upper()}</span>",
        unsafe_allow_html=True,
    )

    with st.expander("Diagnostic Details", expanded=False):
        st.write(f"- Database: `{health.get('database')}`")
        st.write(f"- Vector Store: `{health.get('vector_store')}`")
        st.write(f"- Ollama API: `{health.get('ollama')}`")
        models = health.get("models", {})
        for m, avail in models.items():
            st.write(f"- Model `{m}`: {'✅ Available' if avail else '❌ Missing'}")

    st.markdown("---")

    # Document Upload Section
    st.subheader("Upload Document")
    uploaded_file = st.file_uploader(
        "Choose PDF, DOCX, TXT, or MD",
        type=["pdf", "docx", "txt", "md"],
        help="Max file size: 50MB. Text will be chunked, embedded locally, and stored in vector database.",
    )

    if uploaded_file is not None:
        if st.button("Index Document", type="primary", use_container_width=True):
            with st.spinner("Extracting, chunking, and embedding document locally..."):
                result = upload_file(uploaded_file)
                if result:
                    st.success(f"Indexed {result.get('filename')} ({result.get('chunk_count')} chunks)")
                    st.rerun()

    st.markdown("---")

    # Document Library Section
    st.subheader("Indexed Documents")
    documents = fetch_documents()

    if not documents:
        st.info("No documents uploaded yet.")
    else:
        doc_options = {d["id"]: d["filename"] for d in documents}
        selected_filter = st.multiselect(
            "Filter chat by document(s):",
            options=list(doc_options.keys()),
            format_func=lambda x: doc_options.get(x, x),
            help="Leave empty to retrieve context from all documents.",
        )
        st.session_state.selected_doc_ids = selected_filter

        st.caption(f"Total documents: {len(documents)}")
        for doc in documents:
            cols = st.columns([0.7, 0.3])
            with cols[0]:
                st.markdown(f"**📄 {doc['filename']}**")
                st.caption(f"{doc.get('chunk_count', 0)} chunks | {doc['file_size'] / 1024:.1f} KB")
            with cols[1]:
                if st.button("🗑️", key=f"del_{doc['id']}", help="Delete document"):
                    if delete_document(doc["id"]):
                        st.toast(f"Deleted {doc['filename']}", icon="🗑️")
                        st.rerun()

    st.markdown("---")

    # RAG Settings Controls
    st.subheader("Retrieval Controls")
    sim_threshold = st.slider(
        "Similarity Threshold",
        min_value=0.0,
        max_value=1.0,
        value=0.35,
        step=0.05,
        help="Chunks below this cosine similarity threshold will be rejected to prevent hallucination.",
    )
    top_k_val = st.slider(
        "Top-K Chunks",
        min_value=1,
        max_value=10,
        value=5,
        help="Maximum number of context chunks supplied to Llama 3.2.",
    )

    if st.button("New Conversation", use_container_width=True):
        st.session_state.messages = []
        st.session_state.conversation_id = None
        st.rerun()


# ---------------- MAIN CHAT AREA ----------------
st.markdown("<div class='main-header'>RAG-Based Document Intelligence & Q&A System</div>", unsafe_allow_html=True)
st.markdown(
    "<div class='sub-header'>Private AI-powered document analysis with grounded answers and source attribution</div>",
    unsafe_allow_html=True,
)

# Display existing conversation history
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])
        if "sources" in msg and msg["sources"]:
            with st.expander(f"Sources & Citations ({len(msg['sources'])})", expanded=False):
                for s in msg["sources"]:
                    page_label = f"Page {s['page_number']}" if s.get("page_number") is not None else "Page N/A"
                    st.markdown(
                        f"""
                        <div class='source-card'>
                            <span class='source-meta'>📄 {s['filename']}</span> — {page_label} 
                            &nbsp;|&nbsp; Relevance: <span class='source-score'>{s['score']:.2f}</span>
                            <br><small style='color: #475569;'>{s.get('content_snippet', '')}</small>
                        </div>
                        """,
                        unsafe_allow_html=True,
                    )
        if "latency" in msg and msg["latency"]:
            lat = msg["latency"]
            st.caption(
                f"⏱️ Retrieval: {lat.get('retrieval', 0)}ms | Generation: {lat.get('generation', 0)}ms | Total: {lat.get('total', 0)}ms"
            )

# Chat Input Box
user_query = st.chat_input("Ask a question about your uploaded documents...")

if user_query:
    # 1. Append and render user message immediately
    st.session_state.messages.append({"role": "user", "content": user_query})
    with st.chat_message("user"):
        st.markdown(user_query)

    # 2. Query RAG backend with spinner
    with st.chat_message("assistant"):
        with st.spinner("Analyzing document context and synthesizing grounded answer..."):
            chat_response = send_chat_query(
                question=user_query,
                conversation_id=st.session_state.conversation_id,
                document_ids=st.session_state.selected_doc_ids,
                similarity_threshold=sim_threshold,
                top_k=top_k_val,
            )

        if chat_response:
            answer = chat_response.get("answer", "")
            sources = chat_response.get("sources", [])
            st.session_state.conversation_id = chat_response.get("conversation_id")

            st.markdown(answer)

            # Display source citations
            if sources:
                with st.expander(f"Sources & Citations ({len(sources)})", expanded=True):
                    for s in sources:
                        page_label = f"Page {s['page_number']}" if s.get("page_number") is not None else "Page N/A"
                        st.markdown(
                            f"""
                            <div class='source-card'>
                                <span class='source-meta'>📄 {s['filename']}</span> — {page_label} 
                                &nbsp;|&nbsp; Relevance: <span class='source-score'>{s['score']:.2f}</span>
                                <br><small style='color: #475569;'>{s.get('content_snippet', '')}</small>
                            </div>
                            """,
                            unsafe_allow_html=True,
                        )

            # Display latency breakdown
            retrieval_ms = chat_response.get("retrieval_latency_ms", 0)
            generation_ms = chat_response.get("generation_latency_ms", 0)
            total_ms = chat_response.get("total_latency_ms", 0)
            st.caption(
                f"⏱️ Retrieval: {retrieval_ms}ms | Generation: {generation_ms}ms | Total: {total_ms}ms"
            )

            # Append to session state
            st.session_state.messages.append(
                {
                    "role": "assistant",
                    "content": answer,
                    "sources": sources,
                    "latency": {
                        "retrieval": retrieval_ms,
                        "generation": generation_ms,
                        "total": total_ms,
                    },
                }
            )
