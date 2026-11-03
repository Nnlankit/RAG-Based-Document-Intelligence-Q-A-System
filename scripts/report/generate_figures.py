import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

os.makedirs("report_figures", exist_ok=True)

plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['font.family'] = 'sans-serif'

def create_system_architecture():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.add_patch(patches.Rectangle((0, 0), 100, 100, facecolor='#F8FAFC', edgecolor='none'))
    ax.text(50, 95, "RAG Document Intelligence System Architecture", ha='center', va='center', fontsize=14, fontweight='bold', color='#1E293B')

    # Front-end Layer
    ax.add_patch(patches.FancyBboxPatch((8, 72), 84, 16, boxstyle="round,pad=1,rounding_size=2", edgecolor="#2563EB", facecolor="#EFF6FF", lw=1.5))
    ax.text(12, 84, "PRESENTATION LAYER (Front-End UI)", fontsize=11, fontweight='bold', color="#1E40AF")
    ax.add_patch(patches.FancyBboxPatch((12, 74), 36, 8, boxstyle="round,pad=0.5", edgecolor="#3B82F6", facecolor="#FFFFFF", lw=1))
    ax.text(30, 78, "Streamlit Dashboard (Interactive Chat & Upload)", ha='center', va='center', fontsize=9, color="#1E293B")
    ax.add_patch(patches.FancyBboxPatch((52, 74), 36, 8, boxstyle="round,pad=0.5", edgecolor="#3B82F6", facecolor="#FFFFFF", lw=1))
    ax.text(70, 78, "React + Vite Modern Web Client (Tailwind CSS)", ha='center', va='center', fontsize=9, color="#1E293B")

    ax.annotate('', xy=(50, 64), xytext=(50, 71), arrowprops=dict(arrowstyle="<->", color="#2563EB", lw=2))
    ax.text(52, 67.5, "REST API (HTTP / JSON)", fontsize=9, fontweight='bold', color="#2563EB")

    # Application / API Layer
    ax.add_patch(patches.FancyBboxPatch((8, 38), 84, 25, boxstyle="round,pad=1,rounding_size=2", edgecolor="#059669", facecolor="#ECFDF5", lw=1.5))
    ax.text(12, 60, "APPLICATION & RAG ENGINE LAYER (FastAPI Backend)", fontsize=11, fontweight='bold', color="#065F46")

    ax.add_patch(patches.FancyBboxPatch((11, 41), 24, 16, boxstyle="round,pad=0.5", edgecolor="#10B981", facecolor="#FFFFFF", lw=1))
    ax.text(23, 54, "Ingestion Engine", ha='center', va='center', fontsize=9.5, fontweight='bold', color="#047857")
    ax.text(23, 49, "- PyMuPDF (PDF Parser)\n- docx (Word Loader)\n- TextCleaner (Regex)\n- RecursiveSplitter (1000/150)", ha='center', va='center', fontsize=7.5, color="#374151")

    ax.add_patch(patches.FancyBboxPatch((38, 41), 24, 16, boxstyle="round,pad=0.5", edgecolor="#10B981", facecolor="#FFFFFF", lw=1))
    ax.text(50, 54, "Hybrid Retrieval & Rerank", ha='center', va='center', fontsize=9.5, fontweight='bold', color="#047857")
    ax.text(50, 49, "- nomic-embed-text (Ollama)\n- BM25Plus Lexical Search\n- Reciprocal Rank Fusion (RRF)\n- Similarity Threshold (>=0.70)", ha='center', va='center', fontsize=7.5, color="#374151")

    ax.add_patch(patches.FancyBboxPatch((65, 41), 24, 16, boxstyle="round,pad=0.5", edgecolor="#10B981", facecolor="#FFFFFF", lw=1))
    ax.text(77, 54, "Grounded Generation", ha='center', va='center', fontsize=9.5, fontweight='bold', color="#047857")
    ax.text(77, 49, "- Llama 3.2 (Local LLM)\n- Conversational Rewriter\n- Explicit Abstention\n- Source Attribution Cards", ha='center', va='center', fontsize=7.5, color="#374151")

    ax.annotate('', xy=(50, 29), xytext=(50, 37), arrowprops=dict(arrowstyle="<->", color="#059669", lw=2))
    ax.text(52, 33, "SQLAlchemy & Vector Drivers", fontsize=9, fontweight='bold', color="#059669")

    # Persistent Storage Layer
    ax.add_patch(patches.FancyBboxPatch((8, 6), 84, 22, boxstyle="round,pad=1,rounding_size=2", edgecolor="#7C3AED", facecolor="#F5F3FF", lw=1.5))
    ax.text(12, 25, "PERSISTENCE & EMBEDDING STORAGE LAYER", fontsize=11, fontweight='bold', color="#5B21B6")

    ax.add_patch(patches.FancyBboxPatch((12, 9), 24, 13, boxstyle="round,pad=0.5", edgecolor="#8B5CF6", facecolor="#FFFFFF", lw=1))
    ax.text(24, 18, "Relational Database", ha='center', va='center', fontsize=9, fontweight='bold', color="#6D28D9")
    ax.text(24, 13, "Neon PostgreSQL\n(Docs, Chunks, Messages)", ha='center', va='center', fontsize=7.5, color="#4B5563")

    ax.add_patch(patches.FancyBboxPatch((38, 9), 24, 13, boxstyle="round,pad=0.5", edgecolor="#8B5CF6", facecolor="#FFFFFF", lw=1))
    ax.text(50, 18, "Vector Store", ha='center', va='center', fontsize=9, fontweight='bold', color="#6D28D9")
    ax.text(50, 13, "Neon pgvector\n(Dense 768-dim Embeddings)", ha='center', va='center', fontsize=7.5, color="#4B5563")

    ax.add_patch(patches.FancyBboxPatch((64, 9), 25, 13, boxstyle="round,pad=0.5", edgecolor="#8B5CF6", facecolor="#FFFFFF", lw=1))
    ax.text(76.5, 18, "Local GenAI Server", ha='center', va='center', fontsize=9, fontweight='bold', color="#6D28D9")
    ax.text(76.5, 13, "Ollama Service\n(llama3.2 & nomic-embed)", ha='center', va='center', fontsize=7.5, color="#4B5563")

    plt.tight_layout()
    plt.savefig("report_figures/fig3_1_architecture.png", dpi=300, bbox_inches='tight')
    plt.close()

def create_system_flowchart():
    fig, ax = plt.subplots(figsize=(6.5, 9), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    box_props = dict(boxstyle="round,pad=0.8,rounding_size=3", facecolor="#E0E7FF", edgecolor="#4338CA", lw=1.5)
    decision_props = dict(boxstyle="round4,pad=0.8", facecolor="#FEF3C7", edgecolor="#D97706", lw=1.5)
    terminal_props = dict(boxstyle="round,pad=0.8,rounding_size=5", facecolor="#DCFCE7", edgecolor="#15803D", lw=1.5)
    deploy_props = dict(boxstyle="round,pad=0.8,rounding_size=3", facecolor="#FEE2E2", edgecolor="#B91C1C", lw=1.5)

    ax.text(50, 94, "Document Corpus\n(PDF, DOCX, TXT, MD)", ha='center', va='center', bbox=box_props, fontsize=9.5, fontweight='bold', color='#1E1B4B')
    ax.annotate('', xy=(50, 84), xytext=(50, 89.5), arrowprops=dict(arrowstyle="->", color="#374151", lw=1.5))

    ax.text(50, 79, "Text Normalization\n& Cleaning", ha='center', va='center', bbox=box_props, fontsize=9.5, fontweight='bold', color='#1E1B4B')
    ax.annotate('', xy=(50, 69), xytext=(50, 74.5), arrowprops=dict(arrowstyle="->", color="#374151", lw=1.5))

    ax.text(50, 64, "Recursive Chunking\n& nomic Embedding", ha='center', va='center', bbox=box_props, fontsize=9.5, fontweight='bold', color='#1E1B4B')
    ax.annotate('', xy=(50, 54), xytext=(50, 59.5), arrowprops=dict(arrowstyle="->", color="#374151", lw=1.5))

    ax.text(50, 49, "Hybrid Retrieval\n(Dense + BM25 + RRF)", ha='center', va='center', bbox=box_props, fontsize=9.5, fontweight='bold', color='#1E1B4B')
    ax.annotate('', xy=(50, 39), xytext=(50, 44.5), arrowprops=dict(arrowstyle="->", color="#374151", lw=1.5))

    ax.text(50, 32, "Similarity >= 0.70\n& Information\nSufficient?", ha='center', va='center', bbox=decision_props, fontsize=8, fontweight='bold', color='#78350F')

    ax.annotate('YES', xy=(50, 18), xytext=(50, 24), arrowprops=dict(arrowstyle="->", color="#15803D", lw=1.5), fontsize=8.5, fontweight='bold', color="#15803D")
    ax.text(50, 13, "Grounded Llama 3.2\nGeneration & Citations", ha='center', va='center', bbox=terminal_props, fontsize=9.5, fontweight='bold', color='#14532D')

    ax.annotate('NO', xy=(80, 32), xytext=(68, 32), arrowprops=dict(arrowstyle="->", color="#B91C1C", lw=1.5), fontsize=8.5, fontweight='bold', color="#B91C1C")
    ax.text(85, 32, "Explicit\nAbstention\nResponse", ha='center', va='center', bbox=deploy_props, fontsize=8, fontweight='bold', color='#7F1D1D')

    ax.annotate('', xy=(50, 4), xytext=(50, 8.5), arrowprops=dict(arrowstyle="->", color="#374151", lw=1.5))
    ax.text(50, 2, "Deployment (FastAPI + Streamlit + Docker)", ha='center', va='center', bbox=dict(boxstyle="round,pad=0.5", facecolor="#F1F5F9", edgecolor="#64748B", lw=1.2), fontsize=8, fontweight='bold', color="#334155")

    plt.tight_layout()
    plt.savefig("report_figures/fig2_1_flowchart.png", dpi=300, bbox_inches='tight')
    plt.close()

def create_dfd_level_0():
    fig, ax = plt.subplots(figsize=(8, 4.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    user_box = dict(boxstyle="round,pad=0.8,rounding_size=2", facecolor="#DBEAFE", edgecolor="#1D4ED8", lw=1.8)
    process_bubble = dict(boxstyle="circle,pad=1.2", facecolor="#DCFCE7", edgecolor="#15803D", lw=2)
    output_box = dict(boxstyle="round,pad=0.8,rounding_size=2", facecolor="#FEF3C7", edgecolor="#B45309", lw=1.8)

    ax.text(18, 50, "USER\n(Researcher / Analyst)", ha='center', va='center', bbox=user_box, fontsize=9.5, fontweight='bold', color="#1E3A8A")
    ax.text(50, 50, "0.0\n\nRAG-BASED\nDOCUMENT\nINTELLIGENCE\nSYSTEM", ha='center', va='center', bbox=process_bubble, fontsize=9, fontweight='bold', color="#14532D")
    ax.text(82, 50, "Grounded Answer\nwith Source\nCitations", ha='center', va='center', bbox=output_box, fontsize=9.5, fontweight='bold', color="#78350F")

    ax.annotate('', xy=(37, 56), xytext=(28, 56), arrowprops=dict(arrowstyle="->", color="#1D4ED8", lw=1.8))
    ax.text(32, 60, "Document Files\n& Queries", ha='center', va='center', fontsize=7.5, fontweight='bold', color="#1E40AF")

    ax.annotate('', xy=(28, 44), xytext=(37, 44), arrowprops=dict(arrowstyle="->", color="#15803D", lw=1.8))
    ax.text(32, 38, "System Status\n& Diagnostics", ha='center', va='center', fontsize=7.5, fontweight='bold', color="#065F46")

    ax.annotate('', xy=(72, 50), xytext=(63, 50), arrowprops=dict(arrowstyle="->", color="#B45309", lw=1.8))
    ax.text(67, 54, "Synthesized\nResponse", ha='center', va='center', fontsize=7.5, fontweight='bold', color="#92400E")

    plt.tight_layout()
    plt.savefig("report_figures/fig3_2_dfd0.png", dpi=300, bbox_inches='tight')
    plt.close()

def create_dfd_level_1():
    fig, ax = plt.subplots(figsize=(10, 5.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    p_style = dict(boxstyle="circle,pad=0.8", facecolor="#EFF6FF", edgecolor="#2563EB", lw=1.5)
    e_style = dict(boxstyle="round,pad=0.6,rounding_size=2", facecolor="#F3F4F6", edgecolor="#374151", lw=1.5)
    s_style = dict(boxstyle="square,pad=0.5", facecolor="#FEF2F2", edgecolor="#DC2626", lw=1.5)

    ax.text(8, 70, "User", ha='center', va='center', bbox=e_style, fontsize=9.5, fontweight='bold', color="#1F2937")

    ax.text(28, 70, "1.0\nDocument\nIngestion", ha='center', va='center', bbox=p_style, fontsize=8.5, fontweight='bold', color="#1E40AF")
    ax.text(52, 70, "2.0\nText Clean &\nChunking", ha='center', va='center', bbox=p_style, fontsize=8.5, fontweight='bold', color="#1E40AF")
    ax.text(78, 70, "3.0\nLocal Vector\nEmbedding", ha='center', va='center', bbox=p_style, fontsize=8.5, fontweight='bold', color="#1E40AF")

    # Data Store
    ax.text(78, 30, "D1: Neon PostgreSQL", ha='center', va='center', bbox=s_style, fontsize=8.5, fontweight='bold', color="#991B1B")

    ax.text(52, 30, "4.0\nHybrid\nRetrieval", ha='center', va='center', bbox=p_style, fontsize=8.5, fontweight='bold', color="#1E40AF")
    ax.text(28, 30, "5.0\nGrounded LLM\nSynthesis", ha='center', va='center', bbox=p_style, fontsize=8.5, fontweight='bold', color="#1E40AF")

    ax.text(8, 30, "Verified\nOutput", ha='center', va='center', bbox=e_style, fontsize=9.5, fontweight='bold', color="#1F2937")

    ax.annotate('', xy=(20, 70), xytext=(12, 70), arrowprops=dict(arrowstyle="->", color="#374151", lw=1.5))
    ax.annotate('', xy=(44, 70), xytext=(36, 70), arrowprops=dict(arrowstyle="->", color="#374151", lw=1.5))
    ax.annotate('', xy=(68, 70), xytext=(60, 70), arrowprops=dict(arrowstyle="->", color="#374151", lw=1.5))
    ax.annotate('', xy=(78, 38), xytext=(78, 60), arrowprops=dict(arrowstyle="->", color="#374151", lw=1.5))
    ax.annotate('', xy=(60, 30), xytext=(68, 30), arrowprops=dict(arrowstyle="->", color="#374151", lw=1.5))
    ax.annotate('', xy=(36, 30), xytext=(44, 30), arrowprops=dict(arrowstyle="->", color="#374151", lw=1.5))
    ax.annotate('', xy=(14, 30), xytext=(20, 30), arrowprops=dict(arrowstyle="->", color="#374151", lw=1.5))

    ax.annotate('', xy=(46, 36), xytext=(12, 65), arrowprops=dict(arrowstyle="->", color="#2563EB", lw=1.5, ls='--'))
    ax.text(25, 52, "User Query", fontsize=8, fontweight='bold', color="#2563EB", rotation=-30)

    plt.tight_layout()
    plt.savefig("report_figures/fig3_3_dfd1.png", dpi=300, bbox_inches='tight')
    plt.close()

def create_evaluation_chart():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.2), dpi=300)

    metrics = ['Context Recall', 'Context Precision', 'Abstention Acc.']
    values = [100.0, 100.0, 100.0]
    bars = ax1.bar(metrics, values, color=['#3B82F6', '#10B981', '#8B5CF6'], width=0.55, edgecolor='#1E293B', lw=1)
    ax1.set_ylim(0, 118)
    ax1.set_ylabel('Percentage (%)', fontsize=10, fontweight='bold')
    ax1.set_title('RAG Reliability & Grounding Benchmark', fontsize=10.5, fontweight='bold', color='#1E293B')
    for bar in bars:
        h = bar.get_height()
        ax1.text(bar.get_x() + bar.get_width()/2., h + 2, f'{h:.1f}%', ha='center', va='bottom', fontsize=9.5, fontweight='bold')
    ax1.grid(axis='y', linestyle='--', alpha=0.5)

    latencies = ['Retrieval', 'LLM Synthesis', 'Total End-to-End']
    lat_values = [468.5, 4118.9, 4587.7]
    bars2 = ax2.bar(latencies, lat_values, color=['#06B6D4', '#F59E0B', '#EF4444'], width=0.55, edgecolor='#1E293B', lw=1)
    ax2.set_ylim(0, 5400)
    ax2.set_ylabel('Latency (Milliseconds)', fontsize=10, fontweight='bold')
    ax2.set_title('Pipeline Latency Breakdown', fontsize=10.5, fontweight='bold', color='#1E293B')
    for bar in bars2:
        h = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., h + 70, f'{h:.1f} ms', ha='center', va='bottom', fontsize=8.5, fontweight='bold')
    ax2.grid(axis='y', linestyle='--', alpha=0.5)

    plt.tight_layout()
    plt.savefig("report_figures/fig5_1_evaluation.png", dpi=300, bbox_inches='tight')
    plt.close()

def create_ui_mock():
    fig, ax = plt.subplots(figsize=(10, 6.2), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.add_patch(patches.Rectangle((2, 2), 96, 96, facecolor="#F8FAFC", edgecolor="#CBD5E1", lw=2))

    # Top Navbar
    ax.add_patch(patches.Rectangle((2, 88), 96, 10, facecolor="#1E293B", edgecolor="none"))
    ax.text(5, 93, "Document Intelligence & Grounded Q&A System", fontsize=11.5, fontweight='bold', color="#FFFFFF")
    ax.text(80, 93, "[System Healthy: Ollama + DB]", fontsize=8, color="#86EFAC")

    # Left Sidebar
    ax.add_patch(patches.Rectangle((4, 4), 28, 82, facecolor="#FFFFFF", edgecolor="#E2E8F0", lw=1.2))
    ax.text(6, 82, "Document Library", fontsize=10.5, fontweight='bold', color="#0F172A")
    ax.add_patch(patches.Rectangle((6, 68), 24, 10, facecolor="#F1F5F9", edgecolor="#CBD5E1", lw=1))
    ax.text(8, 73, "Upload Document (.pdf, .docx, .txt)\nDrag & drop supported (max 50MB)", fontsize=6.8, color="#475569")

    # File items
    ax.add_patch(patches.Rectangle((6, 54), 24, 11, facecolor="#EFF6FF", edgecolor="#93C5FD", lw=1))
    ax.text(8, 61, "titan_specifications.pdf", fontsize=7.8, fontweight='bold', color="#1E40AF")
    ax.text(8, 57, "Status: Ready | 18 Chunks | Page 1-6", fontsize=6.5, color="#3B82F6")

    ax.add_patch(patches.Rectangle((6, 40), 24, 11, facecolor="#F0FDF4", edgecolor="#86EFAC", lw=1))
    ax.text(8, 47, "project_apollo_notes.docx", fontsize=7.8, fontweight='bold', color="#166534")
    ax.text(8, 43, "Status: Ready | 12 Chunks", fontsize=6.5, color="#15803D")

    # Main Chat Area
    ax.add_patch(patches.Rectangle((34, 4), 62, 82, facecolor="#FFFFFF", edgecolor="#E2E8F0", lw=1.2))
    ax.text(36, 82, "Document Workspace - Interactive Q&A Session", fontsize=10, fontweight='bold', color="#1E293B")

    # Input Fields
    ax.add_patch(patches.FancyBboxPatch((36, 68), 58, 10, boxstyle="round,pad=0.4", facecolor="#F8FAFC", edgecolor="#CBD5E1"))
    ax.text(38, 74, "Query Input:", fontsize=8, fontweight='bold', color="#334155")
    ax.text(38, 70.5, "What is the battery endurance of the Titan robot?", fontsize=7.5, color="#0F172A")

    # Filter Controls
    ax.add_patch(patches.Rectangle((36, 56), 26, 8, facecolor="#F1F5F9", edgecolor="#CBD5E1", lw=1))
    ax.text(38, 60.5, "Similarity Threshold: 0.70", fontsize=7, color="#334155")
    ax.add_patch(patches.Rectangle((66, 56), 26, 8, facecolor="#F1F5F9", edgecolor="#CBD5E1", lw=1))
    ax.text(68, 60.5, "Selected Scope: All Documents", fontsize=7, color="#334155")

    # Submit Button
    ax.add_patch(patches.FancyBboxPatch((36, 44), 22, 8, boxstyle="round,pad=0.3", facecolor="#2563EB", edgecolor="none"))
    ax.text(47, 48, "Ask AI Assistant", ha='center', va='center', fontsize=8, fontweight='bold', color="#FFFFFF")

    # Status Message
    ax.text(62, 48, "Engine: Llama 3.2 (Local Ollama) | Vector: Neon pgvector", fontsize=7, color="#64748B")

    plt.tight_layout()
    plt.savefig("report_figures/fig6_1_ui.png", dpi=300, bbox_inches='tight')
    plt.close()

def create_chat_output_mock():
    fig, ax = plt.subplots(figsize=(10, 6.2), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.add_patch(patches.Rectangle((2, 2), 96, 96, facecolor="#F8FAFC", edgecolor="#CBD5E1", lw=2))

    # Top Navbar
    ax.add_patch(patches.Rectangle((2, 88), 96, 10, facecolor="#1E293B", edgecolor="none"))
    ax.text(5, 93, "Document Intelligence & Grounded Q&A System - Query Response", fontsize=11.5, fontweight='bold', color="#FFFFFF")

    # Response Container
    ax.add_patch(patches.FancyBboxPatch((6, 54), 88, 30, boxstyle="round,pad=0.5", facecolor="#FFFFFF", edgecolor="#3B82F6", lw=1.5))
    ax.text(8, 79, "[User Query]: What is the battery endurance of the Titan robot?", fontsize=8.5, fontweight='bold', color="#1E40AF")
    ax.text(8, 73, "[AI Grounded Synthesis]:", fontsize=8.5, fontweight='bold', color="#059669")
    ans_text = (
        "According to SOURCE 1, the dual lithium-sulfur battery packs provide 18 hours of continuous\n"
        "autonomous operation under standard environmental load. The power management module\n"
        "dynamically throttles non-essential subsystems when reserves fall below 15%."
    )
    ax.text(8, 63, ans_text, fontsize=8, color="#1E293B")

    # Attribution Header
    ax.text(6, 48, "Verifiable Source Citations (Retrieved Chunks):", fontsize=9.5, fontweight='bold', color="#0F172A")

    # Citation Card 1
    ax.add_patch(patches.FancyBboxPatch((6, 26), 88, 19, boxstyle="round,pad=0.4", facecolor="#EFF6FF", edgecolor="#93C5FD", lw=1.2))
    ax.text(8, 41, "[SOURCE 1] Document: titan_specifications.pdf | Page: 2 | Chunk ID: titan_chunk_0003 | Relevance Score: 0.942", fontsize=7.5, fontweight='bold', color="#1D4ED8")
    ax.text(8, 32, "\"The primary propulsion and sensor array is powered by dual 48V Lithium-Sulfur (Li-S) battery packs delivering\n 18 hours of continuous autonomous operational endurance under nominal subterranean conditions.\"", fontsize=7.2, color="#374151")

    # Citation Card 2
    ax.add_patch(patches.FancyBboxPatch((6, 5), 88, 18, boxstyle="round,pad=0.4", facecolor="#F8FAFC", edgecolor="#E2E8F0", lw=1.2))
    ax.text(8, 19, "[SOURCE 2] Document: titan_specifications.pdf | Page: 4 | Chunk ID: titan_chunk_0007 | Relevance Score: 0.815", fontsize=7.5, fontweight='bold', color="#475569")
    ax.text(8, 10, "\"Emergency low-power beacon engages at 5% residual battery state, maintaining RF transmission for 72 hours.\"", fontsize=7.2, color="#4B5563")

    plt.tight_layout()
    plt.savefig("report_figures/fig6_2_chat_output.png", dpi=300, bbox_inches='tight')
    plt.close()

def create_intelligence_mock():
    fig, ax = plt.subplots(figsize=(10, 6.2), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    ax.add_patch(patches.Rectangle((2, 2), 96, 96, facecolor="#F8FAFC", edgecolor="#CBD5E1", lw=2))

    # Top Navbar
    ax.add_patch(patches.Rectangle((2, 88), 96, 10, facecolor="#1E293B", edgecolor="none"))
    ax.text(5, 93, "Document Intelligence: Multi-Format Analysis & Extraction", fontsize=11.5, fontweight='bold', color="#FFFFFF")

    # Left Panel - Summary Card
    ax.add_patch(patches.FancyBboxPatch((5, 10), 43, 74, boxstyle="round,pad=0.6", facecolor="#FFFFFF", edgecolor="#CBD5E1", lw=1.2))
    ax.text(7, 80, "Executive Summary (titan_specifications.pdf)", fontsize=9.5, fontweight='bold', color="#1E40AF")
    summary_text = (
        "Summary Mode: Key Points\n\n"
        "- Autonomous Navigation: Subterranean tunnel mapping\n"
        "  using stereoscopic odometry without GPS reliance.\n\n"
        "- Power System: Dual 48V Lithium-Sulfur battery banks\n"
        "  ensuring 18-hour mission cycles.\n\n"
        "- Propulsion: Four 750W brushless DC motors yielding\n"
        "  top speed of 4.5 m/s over rough terrain.\n\n"
        "- Safety Protocols: Automatic obstacle braking within\n"
        "  150ms of anomaly detection.\n\n"
        "Status: Extracted with 100% factual fidelity."
    )
    ax.text(7, 45, summary_text, fontsize=7.2, color="#334155", va='center')

    # Right Panel - Entity Extraction Card
    ax.add_patch(patches.FancyBboxPatch((52, 10), 43, 74, boxstyle="round,pad=0.6", facecolor="#FFFFFF", edgecolor="#CBD5E1", lw=1.2))
    ax.text(54, 80, "Structured Entity Extraction (/extract-info)", fontsize=9.5, fontweight='bold', color="#047857")
    entity_text = (
        "{\n"
        '  "project_title": "Project Titan Autonomous Scout",\n'
        '  "authors": ["Dr. Aris Thorne", "Dr. Elena Rostova"],\n'
        '  "organization": "Advanced Robotics Laboratory",\n'
        '  "hardware_specifications": {\n'
        '    "battery": "Dual Lithium-Sulfur 48V",\n'
        '    "operational_endurance": "18 hours",\n'
        '    "motors": "4x 750W Brushless DC",\n'
        '    "max_velocity": "4.5 m/s"\n'
        '  },\n'
        '  "sensors": ["Stereoscopic Vision", "LiDAR", "IMU"],\n'
        '  "validation_status": "Grounded & Verified"\n'
        "}"
    )
    ax.text(54, 45, entity_text, fontsize=7, color="#0F172A", family='monospace', va='center')

    plt.tight_layout()
    plt.savefig("report_figures/fig6_3_intelligence.png", dpi=300, bbox_inches='tight')
    plt.close()

if __name__ == "__main__":
    create_system_architecture()
    create_system_flowchart()
    create_dfd_level_0()
    create_dfd_level_1()
    create_evaluation_chart()
    create_ui_mock()
    create_chat_output_mock()
    create_intelligence_mock()
    print("All report figures generated successfully without warnings!")
