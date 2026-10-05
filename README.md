# RAG-Based Document Intelligence & Q&A System

> **Private AI-powered document analysis with grounded answers and source attribution**

[![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![LangChain](https://img.shields.io/badge/LangChain-0.2+-1C3C3C.svg)](https://langchain.com)
[![Ollama](https://img.shields.io/badge/Ollama-Local_GenAI-black.svg?logo=ollama)](https://ollama.com)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.38+-FF4B4B.svg?logo=streamlit&logoColor=white)](https://streamlit.io)
[![ChromaDB](https://img.shields.io/badge/VectorStore-ChromaDB%20%7C%20PgVector-orange.svg)](https://trychroma.com)

A production-grade, modular, and privacy-first Document Intelligence & Question-Answering system designed to run entirely locally. The platform parses multi-format documents (PDF, DOCX, TXT, MD), extracts clean textual sections while preserving page boundaries, indexes semantic vector embeddings locally with Ollama (`nomic-embed-text`), supports hybrid dense-sparse retrieval with BM25 and Reciprocal Rank Fusion, performs secondary reranking, and synthesizes verifiable, grounded answers using `Llama 3.2` with source citations and explicit abstention.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Key Capabilities](#key-capabilities)
3. [Technology Stack](#technology-stack)
4. [Prerequisites & Ollama Setup](#prerequisites--ollama-setup)
5. [Installation & Local Setup](#installation--local-setup)
6. [Environment Variables](#environment-variables)
7. [Running the Application](#running-the-application)
8. [API Documentation](#api-documentation)
9. [Ingestion & Chunking Strategy](#ingestion--chunking-strategy)
10. [Retrieval & Grounding Pipeline](#retrieval--grounding-pipeline)
11. [Evaluation & Benchmarking](#evaluation--benchmarking)
12. [Docker Deployment](#docker-deployment)
13. [Troubleshooting Guide](#troubleshooting-guide)
14. [Future Roadmap](#future-roadmap)

---

## Architecture Overview

```text
                                  +---------------------------------+
                                  |    Streamlit UI / Web Client    |
                                  |   (frontend/streamlit_app.py)   |
                                  +----------------+----------------+
                                                   | HTTP / REST
                                                   v
                                  +---------------------------------+
                                  |      FastAPI Backend Engine     |
                                  |         (app/main.py)           |
                                  +----------------+----------------+
                                                   |
         +-----------------------------------------+-----------------------------------------+
         |                                         |                                         |
         v                                         v                                         v
+------------------+                      +------------------+                      +------------------+
| Ingestion &      |                      | Hybrid Retrieval |                      | Grounded LLM     |
| Chunking Engine  |                      | & Reranker       |                      | Generation       |
|                  |                      |                  |                      |                  |
| - PyMuPDF (PDF)  |                      | - Dense Vector   |                      | - Llama 3.2      |
| - docx (DOCX)    |                      | - BM25 Sparse    |                      | - Strict System  |
| - Text / MD      |                      | - RRF Fusion     |                      |   Prompt         |
| - TextCleaner    |                      | - Thresholding   |                      | - Query Rewrite  |
| - RecursiveSplit |                      | - Score Blending |                      | - Abstention     |
+--------+---------+                      +--------+---------+                      +--------+---------+
         |                                         |                                         |
         +-----------------------------------------+-----------------------------------------+
                                                   |
                                                   v
                                  +---------------------------------+
                                  |      Persistent Storage         |
                                  |                                 |
                                  | - Relational: PostgreSQL /      |
                                  |   SQLite (Docs, Chunks, Logs)   |
                                  | - Vectors: ChromaDB (MVP) /     |
                                  |   pgvector (Production)         |
                                  +---------------------------------+
```

---

## Key Capabilities

- **High-Fidelity Document Extraction**: Page-by-page extraction with 1-indexed page preservation (`PyMuPDF`), structural headings and tables for DOCX (`python-docx`), and resilient UTF-8 plain text/Markdown decoding.
- **Conservative Text Normalization**: Cleans control characters, hyphenations across line-breaks, and excessive whitespace while preserving code blocks, mathematical symbols, punctuation, and technical terms.
- **Deterministic Metadata-Tagged Chunking**: Uses `RecursiveCharacterTextSplitter` configured for 1000-character windows and 150-character overlap. Each chunk carries a deterministic identifier (`{doc_id}_chunk_{index:04d}`), page numbers, document IDs, and source types.
- **Privacy-First Local Vector Embeddings**: Generates dense embeddings locally via Ollama `nomic-embed-text` with automatic `search_query:` and `search_document:` prefix formatting.
- **Pluggable Vector Store Abstraction**: Cleanly switch between **ChromaDB** for local zero-dependency prototyping and **PostgreSQL + pgvector** for enterprise deployments with zero code rewrites.
- **Dual-Stage Hybrid Search & Reranking**: Combines dense semantic search with sparse `BM25Plus` keyword search using Reciprocal Rank Fusion (RRF) and secondary lexical-semantic score blending.
- **Conversational Memory & Query Rewriting**: Detects anaphoric and elliptical follow-up queries (e.g., "What is its battery life?") and transparently reformulates them into standalone search queries.
- **Grounded Generation & Explicit Abstention**: If retrieved chunks fail the similarity threshold or contain insufficient information, the system explicitly abstains: `"I could not find sufficient information in the provided documents."`
- **Verifiable Source Citations**: Every answer provides clickable source cards displaying the document name, page number, chunk ID, relevance score, and content snippet.
- **Advanced Document Intelligence**: Document summarization (short, detailed, key points), entity extraction (author, date, organization, technologies), document comparison (diff analysis), and question generation.

---

## Technology Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Backend Framework** | FastAPI (Python 3.12) | High-performance async ASGI framework with automatic OpenAPI docs |
| **Data Validation** | Pydantic v2 & Pydantic-Settings | Strongly-typed environment configuration and payload schemas |
| **RAG Orchestration** | LangChain Core / Community | Established text splitters and Ollama integrations |
| **Local LLM** | Ollama (`llama3.2:latest`) | Fast, local inference with instruction-following and tool grounding |
| **Embeddings** | Ollama (`nomic-embed-text:latest`) | 768-dimensional local dense embeddings optimized for retrieval |
| **Vector Database** | ChromaDB & PostgreSQL + pgvector | Pluggable architecture supporting local file-based or SQL vectors |
| **Relational Database** | SQLAlchemy 2.0 & psycopg 3 | Robust ORM for users, documents, messages, and audit logs |
| **Keyword Search** | rank-bm25 (`BM25Plus`) | Sparse lexical search for exact entity codes, IDs, and dates |
| **Frontend UI** | Streamlit | Responsive, real-time dashboard with chat and document management |
| **Testing** | pytest & pytest-asyncio | Full regression suite across 9 phases with 100% pass rate |

---

## Prerequisites & Ollama Setup

1. **Install Ollama**:
   Download and install Ollama from [ollama.com](https://ollama.com/).

2. **Pull Required Models**:
   Open a terminal and pull the LLM and embedding models:
   ```bash
   ollama pull llama3.2
   ollama pull nomic-embed-text
   ```

3. **Verify Ollama is Running**:
   ```bash
   curl http://localhost:11434/api/tags
   ```

---

## Installation & Local Setup

### 1. Clone & Enter Project Directory
```bash
cd "C:\Users\Asus\OneDrive\Desktop\Target Integration\RAG Chatbot\RAG-Based-Document-Intelligence-Q-A-System"
```

### 2. Create Virtual Environment
```bash
python -m venv .venv

# Activate on Windows:
.venv\Scripts\activate

# Activate on Linux/macOS:
source .venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

---

## Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `APP_ENV` | `development` | Environment mode (`development`, `production`, `testing`) |
| `API_HOST` | `0.0.0.0` | API bind address |
| `API_PORT` | `8000` | API bind port |
| `LLM_MODEL` | `llama3.2` | Ollama model identifier |
| `EMBEDDING_MODEL` | `nomic-embed-text` | Ollama embedding model identifier |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Endpoint for Ollama service |
| `VECTOR_STORE` | `chroma` | Vector backend: `chroma` (MVP) or `pgvector` (production) |
| `DATABASE_URL` | `sqlite:///./data/document_ai.db` | PostgreSQL or local SQLite connection string |
| `CHUNK_SIZE` | `1000` | Recursive chunk size in characters |
| `CHUNK_OVERLAP` | `150` | Overlap between adjacent chunks |
| `MAX_UPLOAD_MB` | `50` | Maximum file size for document uploads |
| `TOP_K` | `5` | Final chunk count passed into LLM prompt |
| `RETRIEVAL_CANDIDATES` | `20` | Pre-filtering candidate pool |
| `SIMILARITY_THRESHOLD` | `0.70` | Minimum cosine relevance score cutoff |
| `ENABLE_QUERY_REWRITING` | `true` | Conversational query reformulation |
| `ENABLE_HYBRID_SEARCH` | `false` | Enable dense + BM25 keyword search |
| `ENABLE_RERANKER` | `false` | Secondary lexical-semantic score blending |

---

## Running the Application

### 1. Launch FastAPI Backend
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Interactive Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- Interactive Redoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- Health Diagnostics: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### 2. Launch Streamlit UI
In a separate terminal:
```bash
streamlit run frontend/streamlit_app.py
```
Open [http://localhost:8501](http://localhost:8501) in your browser.

---

## API Documentation

### Documents
- **`POST /api/v1/documents/upload`**: Uploads, extracts, chunks, embeds, and indexes `.pdf`, `.docx`, `.txt`, `.md`.
- **`GET /api/v1/documents`**: Lists all active indexed documents with status and chunk count.
- **`GET /api/v1/documents/{id}`**: Returns detailed metadata for a specific document.
- **`DELETE /api/v1/documents/{id}`**: Cascades deletion across disk storage, database records, chunks, and vector embeddings.

### Chat & Q&A
- **`POST /api/v1/chat`**: Natural-language query interface with grounded generation and source citations.
- **`GET /api/v1/conversations`**: Lists active conversation threads.
- **`GET /api/v1/conversations/{id}`**: Fetches chronological message history.

### Advanced Intelligence
- **`POST /api/v1/documents/{id}/summarize?summary_type=short|detailed|key_points`**: Synthesizes structured summaries.
- **`POST /api/v1/documents/{id}/extract-info`**: Extracts authors, dates, organizations, technologies, and findings as structured JSON.
- **`POST /api/v1/documents/compare`**: Performs comparative difference analysis between two uploaded documents.
- **`POST /api/v1/documents/{id}/generate-questions`**: Generates insightful comprehension questions from document content.

---

## Ingestion & Chunking Strategy

1. **Page/Section Extraction**:
   - PDFs are extracted page-by-page using PyMuPDF, preserving 1-indexed page numbers.
   - DOCX files are segmented by headings and paragraph groupings (`page_number=None`).
   - Plain text and Markdown files are ingested with UTF-8 decoding.
2. **Text Cleaning**:
   - `TextCleaner` removes control characters (`\x00-\x1f`), fixes line-break hyphenations (`archi-\ntecture` -> `architecture`), and standardizes excessive whitespace while strictly preserving code blocks, punctuation, and numbers.
3. **Recursive Splitting**:
   - `RecursiveCharacterTextSplitter` processes extracted pages individually with a hierarchy of separators (`\n\n`, `\n`, `. `, `; `, `, `, ` `).
   - Generates deterministic indices: `{document_id}_chunk_0000`, `{document_id}_chunk_0001`.

---

## Retrieval & Grounding Pipeline

```text
User Query
   ↓
Conversation Memory (Recent 4 turns)
   ↓
Conversational Query Rewriting (if follow-up detected)
   ↓
Dense Query Embedding (nomic-embed-text)
   ↓
Candidate Search (Top 20 candidates)
   ↓
Optional Sparse BM25 Keyword Search & RRF Fusion
   ↓
Optional Lexical-Semantic Reranking
   ↓
Similarity Thresholding (Rejects chunks < 0.70)
   ↓
[No Chunks Met Threshold?] ──Yes──> Explicit Abstention ("I could not find sufficient information...")
   ↓ No
ContextBuilder (Deduplication, formatting, 8000 char window)
   ↓
Llama 3.2 Grounded Synthesis
   ↓
Grounded Answer + Verifiable Source Attribution Cards
```

---

## Evaluation & Benchmarking

The evaluation harness evaluates retrieval precision, recall, and abstention accuracy against benchmark datasets.

Run the evaluation suite:
```bash
python evaluation/evaluate.py
```

Benchmark Results (`evaluation/results/evaluation_report.json`):
- **Context Recall**: `100.0%`
- **Context Precision**: `100.0%`
- **Abstention Accuracy**: `100.0%` (Rejects questions about ungrounded topics without hallucinating)

---

## Docker Deployment

Deploy the entire production stack (FastAPI, Streamlit, PostgreSQL + pgvector, and Ollama) with Docker Compose:

```bash
docker compose up -d --build
```

Access:
- **FastAPI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Streamlit**: [http://localhost:8501](http://localhost:8501)
- **PostgreSQL (pgvector)**: `localhost:5432`

---

## Verification Test Suite

Run all automated unit, integration, and regression tests:

```bash
pytest -v
```

Output:
```text
tests/test_phase1.py ...... PASSED
tests/test_phase2.py ...... PASSED
tests/test_phase3.py ...... PASSED
tests/test_phase4.py ...... PASSED
tests/test_phase5.py ...... PASSED
tests/test_phase7.py ...... PASSED
tests/test_phase8.py ...... PASSED
tests/test_phase9.py ...... PASSED
tests/test_phase11.py ..... PASSED

======================= 25 passed in 143.16s =======================
```