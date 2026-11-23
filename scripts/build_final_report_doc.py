"""Build the complete, professionally formatted, authentic academic project report (.docx)
and export it to .pdf via Microsoft Word COM automation.
"""

import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

sys.path.append(os.path.abspath("scripts/report"))
from report_builder_helpers import (
    add_styled_table, add_heading_1, add_heading_2,
    add_body_paragraph, add_bullet_point, add_centered_image, add_code_snippet,
    set_cell_background, set_cell_margins
)

OUTPUT_DIR = "project_report_output"
DOCX_PATH = os.path.join(OUTPUT_DIR, "Final_Project_Report.docx")
PDF_PATH = os.path.join(OUTPUT_DIR, "Final_Project_Report.pdf")
DIAGRAMS_DIR = os.path.join(OUTPUT_DIR, "Architecture_Diagrams")
SCREENSHOTS_DIR = os.path.join(OUTPUT_DIR, "Screenshots")
EMBLEM_PATH = "scripts/report/report_figures/cdlu_emblem.png"


def create_report():
    doc = docx.Document()

    # Configure 1-inch margins on all sections
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
        section.different_first_page_header_footer = True

    # --------------------------------------------------------------------------
    # PRELIMINARY PAGES: 1. COVER PAGE
    # --------------------------------------------------------------------------
    p_top = doc.add_paragraph()
    p_top.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_top.paragraph_format.space_before = Pt(28)
    p_top.paragraph_format.space_after = Pt(4)
    r_top = p_top.add_run("Project Report\n(7th Semester)\nEntitled as\n")
    r_top.font.name = "Times New Roman"
    r_top.font.size = Pt(14)
    r_top.font.bold = True
    r_top.font.color.rgb = RGBColor(15, 23, 42)

    p_proj = doc.add_paragraph()
    p_proj.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_proj.paragraph_format.space_before = Pt(4)
    p_proj.paragraph_format.space_after = Pt(12)
    r_proj = p_proj.add_run("GUI-Based Document Intelligence & Q&A System\nusing Retrieval-Augmented Generation")
    r_proj.font.name = "Times New Roman"
    r_proj.font.size = Pt(17)
    r_proj.font.bold = True
    r_proj.font.color.rgb = RGBColor(30, 58, 138)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(16)
    r_sub = p_sub.add_run("Submitted in partial fulfillment of the requirement for award of the degree of\nBachelor of Technology in Computer Science & Engineering (AI & ML)\n(Batch: 2022–2026)")
    r_sub.font.name = "Times New Roman"
    r_sub.font.size = Pt(11)
    r_sub.font.color.rgb = RGBColor(51, 65, 85)

    if os.path.exists(EMBLEM_PATH):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_before = Pt(6)
        p_logo.paragraph_format.space_after = Pt(18)
        run_logo = p_logo.add_run()
        run_logo.add_picture(EMBLEM_PATH, width=Inches(1.8))

    tbl_meta = doc.add_table(rows=1, cols=2)
    tbl_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_meta.autofit = False
    tbl_meta.rows[0].cells[0].width = Inches(3.2)
    tbl_meta.rows[0].cells[1].width = Inches(3.2)

    cell_l = tbl_meta.rows[0].cells[0]
    p_l = cell_l.paragraphs[0]
    p_l.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = p_l.add_run("Under the Mentorship of:\n")
    r.font.name = "Times New Roman"; r.font.size = Pt(11); r.font.bold = True
    r = p_l.add_run("Dr. Jasjit Singh Samagh\n")
    r.font.name = "Times New Roman"; r.font.size = Pt(11.5); r.font.bold = True; r.font.color.rgb = RGBColor(30, 58, 138)
    r = p_l.add_run("Assistant Professor\nDept. of Computer Science & Engg")
    r.font.name = "Times New Roman"; r.font.size = Pt(10.5); r.font.color.rgb = RGBColor(51, 65, 85)

    cell_r = tbl_meta.rows[0].cells[1]
    p_r = cell_r.paragraphs[0]
    p_r.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_r.add_run("Submitted By:\n")
    r.font.name = "Times New Roman"; r.font.size = Pt(11); r.font.bold = True
    r = p_r.add_run("Chandan\n")
    r.font.name = "Times New Roman"; r.font.size = Pt(11.5); r.font.bold = True; r.font.color.rgb = RGBColor(30, 58, 138)
    r = p_r.add_run("B.Tech. CSE (AI&ML) - 7th Sem\nRegn. No.: 22111116840020")
    r.font.name = "Times New Roman"; r.font.size = Pt(10.5); r.font.color.rgb = RGBColor(51, 65, 85)

    p_bottom = doc.add_paragraph()
    p_bottom.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_bottom.paragraph_format.space_before = Pt(36)
    p_bottom.paragraph_format.space_after = Pt(0)
    r_bot = p_bottom.add_run("DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING\nCHAUDHARY DEVI LAL UNIVERSITY, SIRSA-125055\n(NOVEMBER 2025)")
    r_bot.font.name = "Times New Roman"
    r_bot.font.size = Pt(11)
    r_bot.font.bold = True
    r_bot.font.color.rgb = RGBColor(15, 23, 42)

    doc.add_page_break()

    # --------------------------------------------------------------------------
    # PRELIMINARY PAGES: 2. STUDENT'S DECLARATION
    # --------------------------------------------------------------------------
    p_dec_h = doc.add_paragraph()
    p_dec_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dec_h.paragraph_format.space_before = Pt(24)
    p_dec_h.paragraph_format.space_after = Pt(20)
    r_dh = p_dec_h.add_run("STUDENT'S DECLARATION")
    r_dh.font.name = "Times New Roman"; r_dh.font.size = Pt(14); r_dh.font.bold = True

    add_body_paragraph(
        doc,
        "I, Chandan, Roll No. 22111116840020, hereby declare that the project work entitled: "
        "“GUI-Based Document Intelligence & Q&A System using Retrieval-Augmented Generation” "
        "has been carried out by me during the 7th semester of the Bachelor of Technology in Computer Science & "
        "Engineering (AI & ML) under the guidance and mentorship of Dr. Jasjit Singh Samagh, Assistant Professor, "
        "Department of Computer Science and Engineering, Chaudhary Devi Lal University, Sirsa, in partial fulfillment of the "
        "degree requirements prescribed by the university.",
        space_after=14
    )

    add_body_paragraph(
        doc,
        "I further declare that this project report reflects the genuine and original software development, architectural design, "
        "and empirical validation conducted by myself. The technical content, system diagrams, algorithms, and benchmark evaluation "
        "results presented herein have not been submitted previously to any other university, institute, or examining body for the award "
        "of any degree, diploma, fellowship, or professional qualification.",
        space_after=28
    )

    tbl_sig = doc.add_table(rows=1, cols=2)
    tbl_sig.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_sig.autofit = False
    tbl_sig.rows[0].cells[0].width = Inches(3.2)
    tbl_sig.rows[0].cells[1].width = Inches(3.2)

    p_sig_l = tbl_sig.rows[0].cells[0].paragraphs[0]
    p_sig_l.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = p_sig_l.add_run("Date:  November 2025\nPlace: Sirsa, Haryana")
    r.font.name = "Times New Roman"; r.font.size = Pt(11)

    p_sig_r = tbl_sig.rows[0].cells[1].paragraphs[0]
    p_sig_r.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_sig_r.add_run("Chandan\n(Roll No. 22111116840020)\nB.Tech. CSE (AI&ML) - 7th Semester")
    r.font.name = "Times New Roman"; r.font.size = Pt(11); r.font.bold = True

    p_num = doc.add_paragraph()
    p_num.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_num.paragraph_format.space_before = Pt(140)
    r_n = p_num.add_run("i")
    r_n.font.name = "Times New Roman"; r_n.font.size = Pt(10)

    doc.add_page_break()

    # --------------------------------------------------------------------------
    # PRELIMINARY PAGES: 3. CERTIFICATE FROM MENTOR
    # --------------------------------------------------------------------------
    p_ch_uni = doc.add_paragraph()
    p_ch_uni.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ch_uni.paragraph_format.space_before = Pt(20)
    p_ch_uni.paragraph_format.space_after = Pt(2)
    r = p_ch_uni.add_run("DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING\nCHAUDHARY DEVI LAL UNIVERSITY, SIRSA")
    r.font.name = "Times New Roman"; r.font.size = Pt(12); r.font.bold = True

    p_cert_m = doc.add_paragraph()
    p_cert_m.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cert_m.paragraph_format.space_before = Pt(12)
    p_cert_m.paragraph_format.space_after = Pt(22)
    r_cm = p_cert_m.add_run("CERTIFICATE FROM MENTOR")
    r_cm.font.name = "Times New Roman"; r_cm.font.size = Pt(14); r_cm.font.bold = True

    add_body_paragraph(
        doc,
        "This is to certify that Mr. Chandan, Roll No. 22111116840020, a bona fide student of Bachelor of Technology in "
        "Computer Science and Engineering (Artificial Intelligence and Machine Learning), Semester VII, has satisfactorily "
        "completed his major project work entitled “GUI-Based Document Intelligence & Q&A System using Retrieval-Augmented Generation” "
        "under my supervision and mentorship during the academic year 2025–2026.",
        space_after=14
    )

    add_body_paragraph(
        doc,
        "The project encompasses the end-to-end design, implementation, and empirical testing of an applied artificial intelligence system "
        "incorporating deterministic document parsing, pgvector semantic vector search, reciprocal rank fusion, conversational query rewriting, "
        "and local LLM text generation with strict grounding guardrails. To the best of my knowledge, this report represents the student's "
        "independent technical effort and fulfills the curriculum requirements prescribed by Chaudhary Devi Lal University.",
        space_after=28
    )

    add_body_paragraph(
        doc,
        "I commend his technical dedication and wish him every success in his future academic and professional endeavors.",
        space_after=40
    )

    tbl_m_sig = doc.add_table(rows=1, cols=2)
    tbl_m_sig.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_m_sig.autofit = False
    tbl_m_sig.rows[0].cells[0].width = Inches(3.2)
    tbl_m_sig.rows[0].cells[1].width = Inches(3.2)

    p_ml = tbl_m_sig.rows[0].cells[0].paragraphs[0]
    p_ml.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = p_ml.add_run("Date:  November 2025\nPlace: Sirsa, Haryana")
    r.font.name = "Times New Roman"; r.font.size = Pt(11)

    p_mr = tbl_m_sig.rows[0].cells[1].paragraphs[0]
    p_mr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_mr.add_run("Dr. Jasjit Singh Samagh\n(Project Mentor)\nAssistant Professor\nDept. of Computer Science & Engg\nCDLU, Sirsa")
    r.font.name = "Times New Roman"; r.font.size = Pt(11); r.font.bold = True

    p_num2 = doc.add_paragraph()
    p_num2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_num2.paragraph_format.space_before = Pt(80)
    r_n2 = p_num2.add_run("ii")
    r_n2.font.name = "Times New Roman"; r_n2.font.size = Pt(10)

    doc.add_page_break()

    # --------------------------------------------------------------------------
    # PRELIMINARY PAGES: 4. CERTIFICATE FROM CHAIRPERSON
    # --------------------------------------------------------------------------
    p_ch_uni2 = doc.add_paragraph()
    p_ch_uni2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ch_uni2.paragraph_format.space_before = Pt(20)
    p_ch_uni2.paragraph_format.space_after = Pt(2)
    r = p_ch_uni2.add_run("DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING\nCHAUDHARY DEVI LAL UNIVERSITY, SIRSA")
    r.font.name = "Times New Roman"; r.font.size = Pt(12); r.font.bold = True

    p_cert_c = doc.add_paragraph()
    p_cert_c.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cert_c.paragraph_format.space_before = Pt(12)
    p_cert_c.paragraph_format.space_after = Pt(22)
    r_cc = p_cert_c.add_run("CERTIFICATE FROM CHAIRPERSON")
    r_cc.font.name = "Times New Roman"; r_cc.font.size = Pt(14); r_cc.font.bold = True

    add_body_paragraph(
        doc,
        "This is to certify that Mr. Chandan, Roll No. 22111116840020, a student of B.Tech. Computer Science & Engineering "
        "(Artificial Intelligence & Machine Learning), 7th Semester, has successfully completed and defended his project work "
        "entitled “GUI-Based Document Intelligence & Q&A System using Retrieval-Augmented Generation” under the mentorship "
        "of Dr. Jasjit Singh Samagh, Assistant Professor, Department of Computer Science & Engineering.",
        space_after=14
    )

    add_body_paragraph(
        doc,
        "The project demonstrates a thorough comprehension of modern natural language processing pipelines, distributed vector indexing, "
        "asynchronous application architecture, and empirical system benchmarking. The departmental review committee has evaluated "
        "the software artifacts, technical demonstrations, and this written thesis, finding them to meet the academic standards prescribed "
        "for the degree of Bachelor of Technology.",
        space_after=28
    )

    add_body_paragraph(
        doc,
        "On behalf of the Department of Computer Science & Engineering, I congratulate him on his achievement and wish him continued "
        "excellence in his technical career.",
        space_after=40
    )

    tbl_c_sig = doc.add_table(rows=1, cols=2)
    tbl_c_sig.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_c_sig.autofit = False
    tbl_c_sig.rows[0].cells[0].width = Inches(3.2)
    tbl_c_sig.rows[0].cells[1].width = Inches(3.2)

    p_cl = tbl_c_sig.rows[0].cells[0].paragraphs[0]
    p_cl.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = p_cl.add_run("Date:  November 2025\nPlace: Sirsa, Haryana")
    r.font.name = "Times New Roman"; r.font.size = Pt(11)

    p_cr = tbl_c_sig.rows[0].cells[1].paragraphs[0]
    p_cr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_cr.add_run("Prof. (Dr.) Harish Rohil\n(Chairperson)\nDepartment of Computer Science & Engineering\nChaudhary Devi Lal University, Sirsa")
    r.font.name = "Times New Roman"; r.font.size = Pt(11); r.font.bold = True

    p_num3 = doc.add_paragraph()
    p_num3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_num3.paragraph_format.space_before = Pt(80)
    r_n3 = p_num3.add_run("iii")
    r_n3.font.name = "Times New Roman"; r_n3.font.size = Pt(10)

    doc.add_page_break()

    # --------------------------------------------------------------------------
    # PRELIMINARY PAGES: 5. ACKNOWLEDGEMENT
    # --------------------------------------------------------------------------
    p_ack = doc.add_paragraph()
    p_ack.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ack.paragraph_format.space_before = Pt(24)
    p_ack.paragraph_format.space_after = Pt(20)
    r_ak = p_ack.add_run("ACKNOWLEDGEMENT")
    r_ak.font.name = "Times New Roman"; r_ak.font.size = Pt(14); r_ak.font.bold = True

    add_body_paragraph(
        doc,
        "I take immense pleasure in expressing my deep sense of gratitude and indebtedness to my Project Mentor, "
        "Dr. Jasjit Singh Samagh, Assistant Professor, Department of Computer Science & Engineering, Chaudhary Devi Lal University, "
        "for his invaluable mentorship, technical guidance, and constructive critiques throughout the lifecycle of this project. "
        "His profound expertise in artificial intelligence and machine learning pipelines inspired me to pursue architectural rigor, "
        "explore hybrid retrieval formulations, and resolve challenging asynchronous concurrency bottlenecks.",
        space_after=14
    )

    add_body_paragraph(
        doc,
        "I express my sincere thanks to Prof. (Dr.) Harish Rohil, Chairperson, Department of Computer Science & Engineering, "
        "for his constant encouragement, administrative support, and for providing state-of-the-art laboratory and computational "
        "infrastructure that facilitated the continuous training, indexing, and deployment tests of our local language models.",
        space_after=14
    )

    add_body_paragraph(
        doc,
        "I am deeply beholden to all faculty members and technical staff of the Department of Computer Science & Engineering for their direct "
        "and indirect assistance, pedagogical foundations, and critical evaluations during departmental reviews. Their pedagogical insights "
        "greatly assisted in refining the theoretical framing and validation metrics of this research.",
        space_after=14
    )

    add_body_paragraph(
        doc,
        "Words fail to express my heartfelt gratitude to my parents and family members for their unconditional love, moral support, "
        "sacrifices, and endless patience throughout my academic journey. Their steadfast faith in my abilities has been my perpetual "
        "source of motivation. Finally, I extend my appreciation to my peers and friends for their collaborative discussions, feedback, "
        "and camaraderie during long development cycles.",
        space_after=28
    )

    p_ak_sub = doc.add_paragraph()
    p_ak_sub.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_ak_sub.add_run("Chandan\nB.Tech. CSE (AI&ML) - 7th Semester\nRegistration No.: 22111116840020")
    r.font.name = "Times New Roman"; r.font.size = Pt(11); r.font.bold = True

    p_num4 = doc.add_paragraph()
    p_num4.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_num4.paragraph_format.space_before = Pt(80)
    r_n4 = p_num4.add_run("iv")
    r_n4.font.name = "Times New Roman"; r_n4.font.size = Pt(10)

    doc.add_page_break()

    # --------------------------------------------------------------------------
    # PRELIMINARY PAGES: 6. ABSTRACT
    # --------------------------------------------------------------------------
    p_abs = doc.add_paragraph()
    p_abs.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_abs.paragraph_format.space_before = Pt(24)
    p_abs.paragraph_format.space_after = Pt(20)
    r_ab = p_abs.add_run("ABSTRACT")
    r_ab.font.name = "Times New Roman"; r_ab.font.size = Pt(14); r_ab.font.bold = True

    add_body_paragraph(
        doc,
        "The exponential accumulation of unstructured textual knowledge—such as technical specifications, research monographs, "
        "legal contracts, and corporate standard operating procedures—presents a severe bottleneck for institutional decision-makers. "
        "While modern cloud-hosted Large Language Models (LLMs) exhibit remarkable conversational fluency, their practical enterprise adoption "
        "is fundamentally constrained by data confidentiality hazards, lack of proprietary context, catastrophic memory fading, and factual "
        "hallucinations lacking verifiable citations. This project addresses these critical challenges by engineering a production-grade, "
        "modular, and air-gapped GUI-Based Document Intelligence & Q&A System powered entirely by local Retrieval-Augmented Generation (RAG).",
        space_after=12
    )

    add_body_paragraph(
        doc,
        "The software architecture establishes an end-to-end data pipeline: First, heterogeneous document formats (.pdf, .docx, .txt, .md) "
        "are parsed page-by-page using high-performance extraction libraries (PyMuPDF and python-docx), capturing exact 1-indexed page boundaries. "
        "A regular expression cleaning engine strips control characters and mends hyphenated word breaks, whereupon a recursive character text "
        "splitter divides documents into 1000-character windows with 150-character overlaps, assigning deterministic chunk identifiers. "
        "Text chunks are indexed into 768-dimensional dense vector embeddings using the local nomic-embed-text model running via Ollama, "
        "stored in Neon PostgreSQL with pgvector, alongside a sparse BM25Plus lexical index. A dual-stage hybrid retrieval engine merges dense "
        "semantic cosine similarities and sparse keyword scores via Reciprocal Rank Fusion (RRF, k=60), followed by strict similarity thresholding (cutoff >= 0.70).",
        space_after=12
    )

    add_body_paragraph(
        doc,
        "To guarantee factual precision, an instruction-tuned Llama 3.2 model (3.2B parameters) is governed by an anti-hallucination prompt "
        "requiring answers to be derived exclusively from the injected context chunks. If the retrieved context is irrelevant or fails the relevance threshold, "
        "the model executes explicit abstention, returning a standardized notice rather than fabricating ungrounded assertions. A responsive single-page web "
        "application developed in React 18, Vite, and Tailwind CSS provides intuitive document upload modals, active chunk inspection, conversational dialogue "
        "memory with query rewriting, and verifiable source cards displaying document titles, page numbers, chunk identifiers, and similarity scores.",
        space_after=12
    )

    add_body_paragraph(
        doc,
        "Empirical evaluation conducted across benchmark test cases demonstrated 100.0% Context Recall, 100.0% Context Precision, and 100.0% Abstention "
        "Accuracy on out-of-domain negative queries, achieving an average vector retrieval latency of 541.54 ms and total end-to-end response latency "
        "of 3.48 seconds on standard workstation hardware without external cloud API dependencies. The project validates the viability of private, "
        "transparent, and cost-effective document intelligence for institutional applications.",
        space_after=20
    )

    p_kw = doc.add_paragraph()
    r = p_kw.add_run("Keywords: ")
    r.font.name = "Times New Roman"; r.font.size = Pt(11); r.font.bold = True
    r = p_kw.add_run("Retrieval-Augmented Generation (RAG), Local LLM, Llama 3.2, nomic-embed-text, Neon PostgreSQL, pgvector, Reciprocal Rank Fusion, BM25Plus, Document Intelligence, Source Attribution.")
    r.font.name = "Times New Roman"; r.font.size = Pt(10.5); r.font.italic = True

    p_num5 = doc.add_paragraph()
    p_num5.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_num5.paragraph_format.space_before = Pt(40)
    r_n5 = p_num5.add_run("v")
    r_n5.font.name = "Times New Roman"; r_n5.font.size = Pt(10)

    doc.add_page_break()

    # --------------------------------------------------------------------------
    # PRELIMINARY PAGES: 7. TABLE OF CONTENTS
    # --------------------------------------------------------------------------
    p_toc = doc.add_paragraph()
    p_toc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_toc.paragraph_format.space_before = Pt(20)
    p_toc.paragraph_format.space_after = Pt(16)
    r_t = p_toc.add_run("TABLE OF CONTENTS")
    r_t.font.name = "Times New Roman"; r_t.font.size = Pt(14); r_t.font.bold = True

    toc_headers = ["TOPIC / CHAPTER TITLE", "PAGE NO."]
    toc_data = [
        ["STUDENT'S DECLARATION", "i"],
        ["CERTIFICATE FROM MENTOR", "ii"],
        ["CERTIFICATE FROM CHAIRPERSON", "iii"],
        ["ACKNOWLEDGEMENT", "iv"],
        ["ABSTRACT", "v"],
        ["LIST OF FIGURES", "viii"],
        ["LIST OF TABLES", "ix"],
        ["CHAPTER 1: INTRODUCTION", "1"],
        ["    1.1 Background of the Study", "1"],
        ["    1.2 Problem Statement", "2"],
        ["    1.3 Motivation", "2"],
        ["    1.4 Objectives of the Project", "3"],
        ["    1.5 Scope of the Project", "3"],
        ["    1.6 Real-World Applications", "4"],
        ["    1.7 Organization of the Report", "4"],
        ["CHAPTER 2: SYSTEM ANALYSIS", "6"],
        ["    2.1 Existing System Overview", "6"],
        ["    2.2 Drawbacks of Existing Solutions", "6"],
        ["    2.3 Proposed System Architecture", "7"],
        ["    2.4 System Requirements (Hardware & Software)", "8"],
        ["    2.5 Feasibility Analysis (Technical, Operational, Economic)", "10"],
        ["CHAPTER 3: SYSTEM DESIGN", "11"],
        ["    3.1 Overall Multi-Tier System Architecture", "11"],
        ["    3.2 Data Flow Diagrams (DFD Level 0 & Level 1)", "12"],
        ["    3.3 Complete Operational Workflow Flowchart", "14"],
        ["    3.4 Database Design & Entity-Relationship Modeling", "15"],
        ["    3.5 Functional Modules & Architectural Subsystems", "17"],
        ["    3.6 Mathematical Formulations & Algorithmic Methodology", "18"],
        ["    3.7 RESTful API Architecture & Endpoint Specification", "20"],
        ["CHAPTER 4: IMPLEMENTATION", "22"],
        ["    4.1 Tools, Frameworks and Development Environment", "22"],
        ["    4.2 Frontend Web Client Implementation (React 18 + Vite)", "23"],
        ["    4.3 Backend Service Layer Implementation (FastAPI)", "25"],
        ["    4.4 Database & Vector Storage Implementation (pgvector)", "27"],
        ["    4.5 Ingestion, Normalization and Chunking Pipeline", "28"],
        ["    4.6 AI/ML Engineering & Grounded Generation Layer", "30"],
        ["    4.7 Security Architecture, Hashing & Deduplication", "32"],
        ["    4.8 Docker Containerization & Version Control", "33"],
        ["CHAPTER 5: RESULTS AND DISCUSSION", "35"],
        ["    5.1 Automated Testing & Verification Suite", "35"],
        ["    5.2 Functional Verification Across Core Modules", "36"],
        ["    5.3 Quantitative Performance & Latency Evaluation", "37"],
        ["    5.4 Benchmark Test Cases & Observations", "38"],
        ["    5.5 In-Depth Discussion, Comparative Analysis & Limitations", "40"],
        ["CHAPTER 6: SCREENSHOTS & USER INTERFACE WALKTHROUGH", "42"],
        ["    6.1 Authentication and Access Control Interface", "42"],
        ["    6.2 Main Telemetry & System Status Dashboard", "43"],
        ["    6.3 Document Knowledge Base & Catalog Management", "44"],
        ["    6.4 Document Ingestion & Validation Modal", "45"],
        ["    6.5 Conversational Grounded Q&A Interface", "46"],
        ["    6.6 Verifiable Source Attribution Transparency Cards", "47"],
        ["    6.7 Analytics & Observability Latency Telemetry", "48"],
        ["    6.8 Document Intelligence View (Summaries & NER)", "49"],
        ["CONCLUSION AND FUTURE SCOPE", "51"],
        ["    Project Conclusion", "51"],
        ["    Key Achievements", "52"],
        ["    Current Limitations", "52"],
        ["    Future Enhancements", "53"],
        ["BIBLIOGRAPHY", "55"],
        ["    Books & Authoritative Guides", "55"],
        ["    Academic Research Papers", "55"],
        ["    Official Technical Documentations", "56"]
    ]
    add_styled_table(doc, toc_headers, toc_data, col_widths=[5.0, 1.2])

    p_num6 = doc.add_paragraph()
    p_num6.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_num6.paragraph_format.space_before = Pt(20)
    r_n6 = p_num6.add_run("vi")
    r_n6.font.name = "Times New Roman"; r_n6.font.size = Pt(10)

    doc.add_page_break()

    # --------------------------------------------------------------------------
    # PRELIMINARY PAGES: 8. LIST OF FIGURES & LIST OF TABLES
    # --------------------------------------------------------------------------
    p_lof = doc.add_paragraph()
    p_lof.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_lof.paragraph_format.space_before = Pt(20)
    p_lof.paragraph_format.space_after = Pt(14)
    r = p_lof.add_run("LIST OF FIGURES")
    r.font.name = "Times New Roman"; r.font.size = Pt(14); r.font.bold = True

    fig_headers = ["FIGURE NO.", "CAPTION / FIGURE TITLE", "PAGE NO."]
    fig_data = [
        ["Fig 3.1", "Multi-Tier System Architecture Diagram (Presentation, Engine, Storage, LLM)", "11"],
        ["Fig 3.2", "Data Flow Diagram Level 0 (Context Level Diagram)", "13"],
        ["Fig 3.3", "Data Flow Diagram Level 1 (Functional Decomposition)", "13"],
        ["Fig 3.4", "Complete Operational System Workflow Flowchart", "14"],
        ["Fig 3.5", "Database Entity-Relationship (ER) Diagram (Neon PostgreSQL + pgvector)", "16"],
        ["Fig 3.6", "Detailed AI/ML & Grounded RAG Pipeline Architecture", "19"],
        ["Fig 3.7", "Containerized Production Deployment Architecture (Docker Compose)", "34"],
        ["Fig 6.1", "Institutional Authentication and Access Control Screen", "42"],
        ["Fig 6.2", "DocIntel AI Main Telemetry & Knowledge Base Dashboard", "43"],
        ["Fig 6.3", "Document Knowledge Base Hub & Ingestion Catalog", "44"],
        ["Fig 6.4", "Interactive Document Upload Modal with Format & Size Validation", "45"],
        ["Fig 6.5", "Grounded Conversational Q&A Interface with Active Scope", "46"],
        ["Fig 6.6", "Verifiable Source Attribution Inspector & Raw Chunk Passages", "47"],
        ["Fig 6.7", "Analytics, Latency Breakdown & Observability Telemetry Dashboard", "48"],
        ["Fig 6.8", "Document Intelligence View: Automatic Summarization and Named Entities", "49"]
    ]
    add_styled_table(doc, fig_headers, fig_data, col_widths=[1.2, 4.2, 1.0])

    p_lot = doc.add_paragraph()
    p_lot.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_lot.paragraph_format.space_before = Pt(20)
    p_lot.paragraph_format.space_after = Pt(14)
    r = p_lot.add_run("LIST OF TABLES")
    r.font.name = "Times New Roman"; r.font.size = Pt(14); r.font.bold = True

    tab_headers = ["TABLE NO.", "TABLE TITLE / DESCRIPTION", "PAGE NO."]
    tab_data = [
        ["Table 2.1", "Hardware Requirements (Minimum vs Recommended Specifications)", "8"],
        ["Table 2.2", "Software Requirements & Technology Roles", "9"],
        ["Table 3.1", "Document Schema & Relational Model Specifications", "16"],
        ["Table 3.2", "RESTful API Endpoints Specification across Routers", "20"],
        ["Table 4.1", "Comprehensive Tools, Libraries, and Framework Version Matrix", "22"],
        ["Table 4.2", "Text Preprocessing & Normalization Rule Specifications", "29"],
        ["Table 5.1", "System Regression Test Phases and Verification Status", "35"],
        ["Table 5.2", "Quantitative Evaluation Metrics and Benchmark Targets", "37"],
        ["Table 5.3", "Individual Evaluation Test Cases on Project Titan Benchmark Corpus", "39"]
    ]
    add_styled_table(doc, tab_headers, tab_data, col_widths=[1.2, 4.2, 1.0])

    p_num7 = doc.add_paragraph()
    p_num7.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_num7.paragraph_format.space_before = Pt(20)
    r_n7 = p_num7.add_run("vii")
    r_n7.font.name = "Times New Roman"; r_n7.font.size = Pt(10)

    doc.add_page_break()

    # --------------------------------------------------------------------------
    # CHAPTER 1: INTRODUCTION
    # --------------------------------------------------------------------------
    p_c1 = doc.add_paragraph()
    p_c1.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_c1.paragraph_format.space_before = Pt(16)
    p_c1.paragraph_format.space_after = Pt(6)
    r = p_c1.add_run("CHAPTER 1\nINTRODUCTION")
    r.font.name = "Times New Roman"; r.font.size = Pt(16); r.font.bold = True; r.font.color.rgb = RGBColor(15, 23, 42)

    add_body_paragraph(
        doc,
        "This chapter introduces the GUI-Based Document Intelligence & Q&A System, an applied machine learning and natural language "
        "processing software platform developed to perform private, verifiable question-answering over heterogeneous enterprise documents using "
        "Retrieval-Augmented Generation (RAG). It articulates the operational context, problem definition, project motivation, objectives, "
        "and scope, highlighting how localized vector embeddings and local LLM execution prevent confidential data exposure and factual hallucinations. "
        "The chapter is organized into seven sections: Section 1.1 covers the Background of the Study, Section 1.2 defines the Problem Statement, "
        "Section 1.3 presents the Motivation, Section 1.4 details the Objectives of the Project, Section 1.5 outlines the Scope of the Project, "
        "Section 1.6 discusses Real-World Applications, and Section 1.7 outlines the Organization of the Report."
    )

    add_heading_1(doc, "1.1 Background of the Study")
    add_body_paragraph(
        doc,
        "Modern corporate enterprises, research institutes, healthcare providers, and legal institutions handle unprecedented volumes "
        "of unstructured digital text. These knowledge assets—ranging from multi-page PDF research reports, technical architectural manuals, "
        "corporate compliance binders, and legal contracts—contain critical operational intelligence. Traditionally, extracting actionable "
        "answers from such repositories requires human specialists to manually skim hundreds of pages or rely on primitive keyword search tools "
        "(such as operating system search or Adobe Acrobat's Ctrl+F). Such conventional tools perform solely exact lexical matching, failing to comprehend "
        "semantic intent, synonyms, contextual relationships, or morphological word variations."
    )
    add_body_paragraph(
        doc,
        "The recent emergence of commercial cloud-hosted Large Language Models (LLMs), such as OpenAI ChatGPT, Anthropic Claude, and Google Gemini, "
        "demonstrated extraordinary capabilities in natural language synthesis and contextual reasoning. However, their direct deployment within "
        "sensitive institutional environments is severely constrained by two fundamental barriers: data sovereignty hazards and factual hallucination. "
        "Transmitting proprietary technical schematics, patient healthcare records, or non-disclosure legal contracts to external cloud APIs risks "
        "catastrophic data breaches and regulatory non-compliance under GDPR, HIPAA, and corporate data governance policies. Furthermore, standard "
        "autoregressive language models generate answers based entirely on probabilistic word continuation from internal parametric weights. When queried "
        "on proprietary domain data absent from their pre-training corpora, they frequently fabricate convincing yet completely fictional statements "
        "—a phenomenon termed 'hallucination'—without providing verifiable citations to underlying sources."
    )
    add_body_paragraph(
        doc,
        "Retrieval-Augmented Generation (RAG) resolves these fundamental shortcomings by decoupling external knowledge retrieval from language generation. "
        "Rather than expecting an LLM to memorize enterprise facts within its static weights, a RAG system indexes documents into high-dimensional vector "
        "embeddings, performs semantic similarity searches against an incoming user query, and injects solely the most relevant, factual text passages "
        "into the LLM's context window. By combining RAG with local model execution frameworks (specifically Ollama hosting Llama 3.2 and nomic-embed-text), "
        "organizations can establish an entirely self-contained, air-gapped, zero-leakage, and verifiable document intelligence infrastructure."
    )

    add_heading_1(doc, "1.2 Problem Statement")
    add_body_paragraph(
        doc,
        "The project entitled “GUI-Based Document Intelligence & Q&A System using Retrieval-Augmented Generation” addresses the critical problem "
        "of enabling secure, local, and verifiable question-answering across large, unstructured multi-format document archives without transmitting "
        "sensitive institutional data to external cloud third parties. Existing desktop search utilities lack semantic comprehension, while standard "
        "cloud-based generative chatbots generate unsupported assertions and violate data sovereignty mandates. "
        "The core technical challenge lies in architecting a unified system that deterministically parses multi-format documents (.pdf, .docx, .txt, .md), "
        "preserves physical page-level provenance, segments text into coherent semantic chunks, indexes 768-dimensional vector embeddings locally, "
        "combines dense semantic retrieval with sparse lexical BM25 matching, resolves conversational follow-up questions, and synthesizes grounded "
        "answers with strict anti-hallucination guardrails and clickable citation cards."
    )

    add_heading_1(doc, "1.3 Motivation")
    add_body_paragraph(
        doc,
        "The primary impetus behind this research stems from the urgent institutional demand for trustworthy artificial intelligence. In sectors "
        "such as legal audit, aerospace engineering, pharmaceutical compliance, and academic research, an unverified or hallucinated answer is not "
        "merely inconvenient—it can result in catastrophic operational failure, severe financial liabilities, or legal penalties. Analysts require "
        "instantaneous knowledge access paired with complete provenance: every assertion synthesized by an AI must point directly to an identifiable "
        "document name, physical page number, and source text excerpt."
    )
    add_body_paragraph(
        doc,
        "A secondary driving motivation is technological sovereignty and cost predictability. Commercial LLM APIs impose recurring per-token fees, "
        "rate limits, and unpredictable latency spikes. By harnessing modern open-weight language models (Meta Llama 3.2 3B) and efficient vector embeddings "
        "(nomic-embed-text) running locally on commodity workstation hardware, organizations can achieve perpetual, uncapped AI document intelligence "
        "with zero marginal cost per query and absolute control over their sensitive information."
    )

    add_heading_1(doc, "1.4 Objectives of the Project")
    add_body_paragraph(doc, "The concrete engineering and research objectives achieved in this project are:")
    add_bullet_point(doc, "Engineered polymorphic document parsers for PDF, DOCX, TXT, and Markdown files, capturing exact 1-indexed page boundaries.", "1. High-Fidelity Multi-Format Ingestion: ")
    add_bullet_point(doc, "Implemented regex cleaning routines to strip unprintable control characters, resolve newline-hyphenated words, and segment text into 1000-character windows with 150-character overlaps.", "2. Deterministic Cleaning & Chunking: ")
    add_bullet_point(doc, "Integrated Ollama's local nomic-embed-text model to generate 768-dimensional dense vectors stored within Neon PostgreSQL with pgvector.", "3. Local Dense Embedding Indexing: ")
    add_bullet_point(doc, "Constructed a corpus-level BM25Plus sparse index, fusing dense cosine similarity and sparse keyword scores via Reciprocal Rank Fusion (RRF, k=60).", "4. Hybrid Dense-Sparse Retrieval: ")
    add_bullet_point(doc, "Enforced a cosine similarity threshold (cutoff >= 0.70) that discards irrelevant candidate chunks before prompt construction.", "5. Strict Guardrail Filtering: ")
    add_bullet_point(doc, "Developed a sliding-window memory tracker that rewrites follow-up anaphora and ellipsis queries into standalone contextual questions.", "6. Conversational Memory & Query Rewriter: ")
    add_bullet_point(doc, "Orchestrated local Llama 3.2 text generation governed by strict grounding prompts and explicit abstention when information is missing.", "7. Grounded LLM Generation: ")
    add_bullet_point(doc, "Built a responsive single-page web application featuring document upload modals, active chunk inspectors, and verifiable source cards.", "8. Full-Stack User Interface: ")
    add_bullet_point(doc, "Validated the system against an automated gold-standard evaluation harness, measuring context recall, precision, abstention accuracy, and phase latencies.", "9. Quantitative Benchmarking: ")

    add_heading_1(doc, "1.5 Scope of the Project")
    add_body_paragraph(
        doc,
        "The functional scope of this system encompasses local document ingestion, deterministic recursive chunking, dense vector and sparse lexical "
        "indexing, conversational query rewriting, hybrid retrieval with reciprocal rank fusion, grounded generation, and interactive web visualization. "
        "The system is designed to operate seamlessly on commodity consumer hardware (Intel Core i5/i7 or AMD Ryzen with 16 GB RAM) as well as workstation "
        "servers equipped with NVIDIA GPUs. The scope explicitly excludes optical character recognition (OCR) of handwritten scanned forms and distributed "
        "multi-node database sharding, which are identified as future enhancements."
    )

    add_heading_1(doc, "1.6 Real-World Applications")
    add_body_paragraph(doc, "The system delivers immediate operational value across diverse knowledge-intensive domains:")
    add_bullet_point(doc, "Accelerates contract review, compliance verification, and statutory discovery without exposing non-disclosure agreements to cloud APIs.", "• Legal Case Analysis & Contract Audit: ")
    add_bullet_point(doc, "Enables hardware and software engineers to query complex equipment manuals, circuit diagrams, and API specifications instantaneously.", "• Engineering & Technical Specifications: ")
    add_bullet_point(doc, "Allows clinicians and researchers to query clinical trial records and medical literature while complying strictly with HIPAA data privacy mandates.", "• Healthcare & Medical Research: ")
    add_bullet_point(doc, "Facilitates rapid semantic search across university lecture notes, doctoral dissertations, and academic monographs with pinpoint page citations.", "• Academic Institutions & Libraries: ")

    add_heading_1(doc, "1.7 Organization of the Report")
    add_body_paragraph(
        doc,
        "The remainder of this report is organized as follows: Chapter 2 presents the System Analysis, detailing existing information retrieval "
        "mechanisms, their systemic drawbacks, the proposed architecture, hardware/software specifications, and feasibility studies. "
        "Chapter 3 articulates the System Design, including multi-tier architecture, DFD Levels 0 and 1, operational flowcharts, database schemas, "
        "algorithmic formulations, and API contracts. Chapter 4 provides the Implementation details across frontend, backend, database, AI/ML, and "
        "Docker containerization. Chapter 5 evaluates System Results and Discussion, presenting quantitative benchmark metrics, latency breakdowns, "
        "and test case evaluations. Chapter 6 illustrates the User Interface Walkthrough with genuine application screenshots. Finally, Conclusion "
        "and Future Scope summarizes the research contributions and outlines future trajectories, followed by the Bibliography."
    )

    doc.add_page_break()

    # --------------------------------------------------------------------------
    # CHAPTER 2: SYSTEM ANALYSIS
    # --------------------------------------------------------------------------
    p_c2 = doc.add_paragraph()
    p_c2.paragraph_format.space_before = Pt(16); p_c2.paragraph_format.space_after = Pt(6)
    r = p_c2.add_run("CHAPTER 2\nSYSTEM ANALYSIS")
    r.font.name = "Times New Roman"; r.font.size = Pt(16); r.font.bold = True; r.font.color.rgb = RGBColor(15, 23, 42)

    add_body_paragraph(
        doc,
        "This chapter focuses on the operational analysis of current information retrieval systems, details their systemic drawbacks, "
        "presents the proposed local RAG workflow, outlines hardware and software requirements, and evaluates multi-dimensional project feasibility. "
        "The chapter is organized into Section 2.1 Existing System Overview, Section 2.2 Drawbacks of Existing Solutions, Section 2.3 Proposed System Architecture, "
        "Section 2.4 System Requirements (Hardware and Software), and Section 2.5 Feasibility Analysis."
    )

    add_heading_1(doc, "2.1 Existing System Overview")
    add_body_paragraph(
        doc,
        "Information retrieval across organizational document repositories typically relies on two conventional operational paradigms: "
        "manual lexical inspection and public cloud-based conversational assistants."
    )
    add_body_paragraph(
        doc,
        "Manual inspection involves analysts utilizing basic substring matching tools (such as Adobe Acrobat's Ctrl+F or Windows Search) to locate "
        "exact keyword occurrences. When investigating a specific technical or regulatory question, the reader must open each candidate document individually, "
        "scroll through dozens of highlighted terms, read the surrounding paragraphs, and mentally synthesize an answer. "
        "Alternatively, organizations experiment with public cloud chatbots (e.g., standard ChatGPT, Claude, or Copilot). Analysts copy and paste "
        "document excerpts into public web browser interfaces. While these models synthesize fluent summaries, they require sending confidential institutional "
        "records over third-party cloud infrastructure, violating corporate intellectual property and data sovereignty mandates."
    )

    add_heading_1(doc, "2.2 Drawbacks of Existing Solutions")
    add_body_paragraph(doc, "The existing paradigms suffer from severe, well-documented vulnerabilities:")
    add_bullet_point(doc, "Keyword tools fail when a user's phrasing diverges from the author's vocabulary. Searching for 'operating endurance' yields zero hits if the document exclusively uses 'battery lifespan'.", "1. Absence of Semantic Comprehension: ")
    add_bullet_point(doc, "Standard autoregressive LLMs generate answers based on probabilistic next-token predictions from pre-training weights. When proprietary documents are absent, they fabricate plausible-sounding yet false assertions.", "2. Factual Hallucinations: ")
    add_bullet_point(doc, "Uploading proprietary engineering designs, non-disclosure agreements, or medical records to remote cloud servers breaches institutional confidentiality agreements, GDPR, and HIPAA.", "3. Data Sovereignty & Privacy Exposure: ")
    add_bullet_point(doc, "Traditional search highlights raw words without synthesis, while cloud chatbots generate unstructured answers without page numbers, document titles, or chunk identifiers.", "4. Lack of Verifiable Provenance: ")
    add_bullet_point(doc, "Human readers expend hundreds of hours manually cross-referencing multi-hundred-page technical binders, leading to cognitive fatigue, high overhead costs, and critical oversight errors.", "5. Inefficiency & Information Overload: ")

    add_heading_1(doc, "2.3 Proposed System Architecture")
    add_body_paragraph(
        doc,
        "The proposed GUI-Based Document Intelligence & Q&A System overcomes these systemic vulnerabilities by deploying a completely self-contained, "
        "air-gapped Retrieval-Augmented Generation pipeline. By coupling local dense vector embeddings (nomic-embed-text) and local LLM inference (Llama 3.2) "
        "with hybrid BM25 lexical ranking and strict similarity thresholding, the platform guarantees that every synthesized response is factually grounded "
        "in verified source text and fully auditable down to the physical page number."
    )
    add_body_paragraph(doc, "Key functional stages of the proposed workflow include:")
    add_bullet_point(doc, "Multi-format files (.pdf, .docx, .txt, .md) are ingested via the web interface, preserving physical page boundaries.", "1. Document Ingestion: ")
    add_bullet_point(doc, "Raw text is normalized using regex routines, stripping unprintable control bytes and repairing hyphenated line breaks.", "2. Cleaning & Normalization: ")
    add_bullet_point(doc, "Text is segmented into 1000-character windows with 150-character overlaps, tagged with deterministic identifiers.", "3. Recursive Chunking: ")
    add_bullet_point(doc, "Chunks are transformed into 768-dimensional dense vectors stored in Neon pgvector alongside a sparse BM25Plus index.", "4. Dual Indexing: ")
    add_bullet_point(doc, "Follow-up questions are analyzed in conversational context and rewritten into standalone queries before retrieval.", "5. Query Reformulation: ")
    add_bullet_point(doc, "Dense cosine similarity and sparse lexical ranks are fused via Reciprocal Rank Fusion (k=60), filtering chunks below 0.70 similarity.", "6. Hybrid Rank Fusion: ")
    add_bullet_point(doc, "If no candidate chunk meets the threshold, the system abstains. Otherwise, Llama 3.2 generates a grounded answer with clickable citations.", "7. Grounded Generation & Citations: ")

    add_heading_1(doc, "2.4 System Requirements")
    add_body_paragraph(
        doc,
        "The platform is specifically engineered for optimal performance on accessible developer workstations and commodity institutional hardware, "
        "eliminating dependencies on expensive cloud GPU clusters."
    )

    add_heading_2(doc, "2.4.1 Hardware Requirements")
    hw_headers = ["S. NO.", "HARDWARE COMPONENT", "MINIMUM SPECIFICATION", "RECOMMENDED SPECIFICATION"]
    hw_data = [
        ["1.", "Processor (CPU)", "Intel Core i5 / AMD Ryzen 5 (4 Cores, 2.5 GHz)", "Intel Core i7/i9 or AMD Ryzen 7/9 (8+ Cores, 3.8 GHz)"],
        ["2.", "System Memory (RAM)", "8 GB DDR4 (CPU-only execution)", "16 GB – 32 GB DDR4/DDR5 (High Concurrency)"],
        ["3.", "Primary Storage (Disk)", "10 GB Free Storage (Standard SSD)", "25 GB Free Storage (NVMe M.2 Solid State Drive)"],
        ["4.", "Graphics Adapter (GPU)", "Integrated Graphics (CPU execution via Ollama)", "NVIDIA GeForce RTX 3060/4060 (6GB+ VRAM, CUDA)"],
        ["5.", "Network Adapter", "Standard 100 Mbps Ethernet / Wi-Fi", "1 Gbps Full-Duplex Local Network Adapter"]
    ]
    add_styled_table(doc, hw_headers, hw_data, col_widths=[0.6, 1.8, 2.0, 2.0])

    add_heading_2(doc, "2.4.2 Software Requirements")
    sw_headers = ["S. NO.", "SOFTWARE LAYER", "TECHNOLOGY / PACKAGE", "OPERATIONAL ROLE IN SYSTEM"]
    sw_data = [
        ["1.", "Host Operating System", "Windows 10/11 64-bit / Ubuntu 22.04 LTS / macOS", "Host operating system and process management"],
        ["2.", "Runtime Language", "Python 3.10 – 3.12 (64-bit Architecture)", "Core programming language for backend and ML pipeline"],
        ["3.", "Backend Framework", "FastAPI 0.115+ (ASGI / Uvicorn Server)", "Asynchronous high-throughput REST API gateway"],
        ["4.", "Frontend Environment", "Node.js 18+ / React 18 / Vite / Tailwind CSS", "Responsive single-page web client interface"],
        ["5.", "Local LLM Runtime", "Ollama Engine (Llama 3.2 3.2B Instruct)", "Local, air-gapped natural language inference"],
        ["6.", "Embedding Model", "nomic-embed-text:latest (768 Dimensions)", "Dense semantic vector generation via Ollama API"],
        ["7.", "Vector Database", "Neon PostgreSQL 16 with pgvector Extension", "Persistent high-dimensional vector similarity store"],
        ["8.", "Relational Database", "SQLAlchemy 2.0 ORM with PostgreSQL / SQLite", "Relational metadata, message history & audit logs"],
        ["9.", "Document Parsers", "PyMuPDF (fitz) 1.24+ & python-docx 1.1+", "High-fidelity PDF and DOCX text extraction"],
        ["10.", "Lexical Search", "rank-bm25 (BM25Plus Algorithm Implementation)", "Sparse keyword indexing and scoring"],
        ["11.", "Containerization", "Docker & Docker Compose v2.20+", "Multi-service production container orchestration"],
        ["12.", "Testing Framework", "Pytest 8.2+ with pytest-asyncio", "Automated regression and unit test suite"]
    ]
    add_styled_table(doc, sw_headers, sw_data, col_widths=[0.5, 1.5, 2.0, 2.4])

    add_heading_1(doc, "2.5 Feasibility Analysis")
    add_body_paragraph(
        doc,
        "A rigorous three-dimensional feasibility analysis was conducted to evaluate the technical, economic, and operational viability of the system:"
    )
    add_bullet_point(
        doc,
        "Technical Feasibility: Evaluated the computational practicality of hosting 768-dimensional vector embeddings and 3.2B parameter LLMs locally. "
        "With 4-bit quantized GGUF weights, Llama 3.2 requires under 2.2 GB of system memory, allowing smooth CPU and GPU execution on standard 16 GB workstations. "
        "Vector search across thousands of chunks executes in under 600 ms, confirming high technical viability.",
        bold_prefix="• Technical Feasibility: "
    )
    add_bullet_point(
        doc,
        "Economic Feasibility: Eliminates recurring commercial API token fees (e.g., $10–$30 per million tokens on proprietary cloud platforms). "
        "Operating on existing institutional hardware with zero cloud API costs renders the project completely self-sustaining, yielding infinite return on investment.",
        bold_prefix="• Economic Feasibility: "
    )
    add_bullet_point(
        doc,
        "Operational Feasibility: The web user interface is designed with familiar conversational paradigms, drag-and-drop document uploaders, "
        "and clear citation cards, requiring zero specialized technical training for institutional analysts, faculty, or students.",
        bold_prefix="• Operational Feasibility: "
    )

    doc.add_page_break()

    # --------------------------------------------------------------------------
    # CHAPTER 3: SYSTEM DESIGN
    # --------------------------------------------------------------------------
    p_c3 = doc.add_paragraph()
    p_c3.paragraph_format.space_before = Pt(16); p_c3.paragraph_format.space_after = Pt(6)
    r = p_c3.add_run("CHAPTER 3\nSYSTEM DESIGN")
    r.font.name = "Times New Roman"; r.font.size = Pt(16); r.font.bold = True; r.font.color.rgb = RGBColor(15, 23, 42)

    add_body_paragraph(
        doc,
        "This chapter articulates the comprehensive architectural blueprint, data flow diagrams, procedural flowcharts, database entity models, "
        "functional modules, mathematical algorithms, and API contract specifications governing the Document Intelligence & Q&A System. "
        "The chapter is organized into Section 3.1 Overall System Architecture, Section 3.2 Data Flow Diagrams (DFD Level 0 & Level 1), "
        "Section 3.3 System Workflow Flowchart, Section 3.4 Database Design & Entity-Relationship Modeling, Section 3.5 Functional Modules, "
        "Section 3.6 Mathematical Formulations & Algorithmic Methodology, and Section 3.7 RESTful API Architecture."
    )

    add_heading_1(doc, "3.1 Overall Multi-Tier System Architecture")
    add_body_paragraph(
        doc,
        "The system follows a modular, four-tier decoupled architecture: (1) Presentation Layer, (2) Application & RAG Engine Layer, "
        "(3) Persistent Storage Layer, and (4) Local AI Inference Layer. This decoupled design ensures that vector database backends, "
        "embedding models, or generative LLMs can be updated or upgraded without altering frontend client logic."
    )

    add_centered_image(doc, os.path.join(DIAGRAMS_DIR, "1_Overall_System_Architecture.png"), 6.2, 
                       "Fig 3.1 – Multi-Tier System Architecture Diagram (Presentation, Engine, Storage, LLM)")

    add_body_paragraph(
        doc,
        "As depicted in Fig 3.1, the Presentation Layer interacts asynchronously with the Application Layer via RESTful JSON endpoints. "
        "The FastAPI backend coordinates ingestion, regex normalization, recursive chunking, query rewriting, hybrid retrieval, and grounded synthesis, "
        "delegating vector indexing to Neon PostgreSQL pgvector and token inference to the local Ollama engine."
    )

    add_heading_1(doc, "3.2 Data Flow Diagrams")
    add_body_paragraph(
        doc,
        "Data Flow Diagrams (DFDs) trace the trajectory of unstructured document streams and conversational queries through internal transformations "
        "to final grounded answer rendering."
    )

    add_heading_2(doc, "3.2.1 DFD Level 0 (Context Level Diagram)")
    add_body_paragraph(
        doc,
        "At Level 0, the external entity (User / Analyst) interacts with the central RAG Document Intelligence System by uploading multi-format "
        "documents and submitting natural-language queries. The system communicates bidirectionally with the local Ollama engine and PostgreSQL database, "
        "returning strictly grounded factual answers with verifiable source attribution cards."
    )
    add_centered_image(doc, os.path.join(DIAGRAMS_DIR, "2_Data_Flow_Diagram_Level_0.png"), 6.0, 
                       "Fig 3.2 – Data Flow Diagram Level 0 (Context Level Diagram)")

    add_heading_2(doc, "3.2.2 DFD Level 1 (Functional Decomposition)")
    add_body_paragraph(
        doc,
        "Level 1 decomposes the central system into six distinct functional processes: Process 1.0 (Document Ingestion & Validation), "
        "Process 2.0 (Text Cleaning & Recursive Chunking), Process 3.0 (Local Dense Vector Indexing), Process 4.0 (Conversational Memory & Query Rewriting), "
        "Process 5.0 (Dual-Stage Hybrid Retrieval & RRF), and Process 6.0 (Grounded Llama 3.2 Synthesis with Abstention Guardrails), interacting with "
        "Data Store D1 (Neon PostgreSQL pgvector)."
    )
    add_centered_image(doc, os.path.join(DIAGRAMS_DIR, "3_Data_Flow_Diagram_Level_1.png"), 6.2, 
                       "Fig 3.3 – Data Flow Diagram Level 1 (Functional Decomposition)")

    add_heading_1(doc, "3.3 Complete Operational Workflow Flowchart")
    add_body_paragraph(
        doc,
        "The operational flowchart delineates the procedural execution logic of both the Ingestion Pipeline and the Retrieval & Generation Pipeline:"
    )
    add_centered_image(doc, os.path.join(DIAGRAMS_DIR, "4_Complete_System_Workflow.png"), 5.6, 
                       "Fig 3.4 – Complete Operational System Workflow Flowchart")

    add_heading_1(doc, "3.4 Database Design & Entity-Relationship Modeling")
    add_body_paragraph(
        doc,
        "The relational data model is implemented in PostgreSQL using SQLAlchemy 2.0 ORM, featuring foreign key constraints, cascading deletes, "
        "and composite indexes for high-throughput lookup. High-dimensional vector embeddings are stored using the pgvector `vector(768)` type."
    )
    add_centered_image(doc, os.path.join(DIAGRAMS_DIR, "5_Database_ER_Diagram.png"), 6.2, 
                       "Fig 3.5 – Database Entity-Relationship (ER) Diagram (Neon PostgreSQL + pgvector)")

    db_headers = ["TABLE NAME", "PRIMARY KEY", "FOREIGN KEYS", "KEY ATTRIBUTES & CONSTRAINTS", "PURPOSE"]
    db_data = [
        ["users", "id (String 64)", "None", "email (Unique, Indexed), password_hash, is_active", "User account and auth scoping"],
        ["documents", "id (String 64)", "user_id -> users.id", "checksum (SHA-256), filename, mime_type, file_size, status", "Uploaded document catalog"],
        ["document_chunks", "id (String 64)", "document_id -> documents.id", "chunk_index, page_number, content, embedding (Vector 768)", "Text chunks and dense vectors"],
        ["conversations", "id (String 64)", "user_id -> users.id", "title, created_at, updated_at", "Multi-turn dialogue sessions"],
        ["messages", "id (String 64)", "conversation_id -> convs.id", "role ('user'/'assistant'), content, message_sequence", "Sequential conversation turns"],
        ["retrieval_logs", "id (String 64)", "conversation_id -> convs.id", "query, retrieved_chunk_ids (JSON), scores, latency_ms", "Observability & latency audit"]
    ]
    add_styled_table(doc, db_headers, db_data, col_widths=[1.1, 1.0, 1.3, 1.8, 1.2])

    add_heading_1(doc, "3.5 Functional Modules & Architectural Subsystems")
    add_body_paragraph(doc, "The software architecture is partitioned into seven decoupled functional modules:")
    add_bullet_point(doc, "Dispatches file streams to PyMuPDF, python-docx, or UTF-8 loaders based on MIME-type validation, extracting raw text with 1-indexed page boundaries.", "1. Document Ingestion Module: ")
    add_bullet_point(doc, "Applies regex filters to strip ASCII control bytes (0-31), mends hyphenated word breaks, and recursively chunks text into 1000-character windows with 150-character overlaps.", "2. Cleaning & Chunking Module: ")
    add_bullet_point(doc, "Communicates with local Ollama daemon via asynchronous HTTP, generating 768-dimensional normalized floating-point vectors stored inside PostgreSQL pgvector.", "3. Local Embedding Service: ")
    add_bullet_point(doc, "Maintains an in-memory BM25Plus sparse index and executes vector cosine searches, fusing top candidate ranks via Reciprocal Rank Fusion.", "4. Hybrid Retrieval & RRF Engine: ")
    add_bullet_point(doc, "Maintains a 4-turn dialogue sliding window and reformulates elliptical follow-up questions into standalone queries before retrieval.", "5. Conversational Memory & Rewriter: ")
    add_bullet_point(doc, "Enforces a 0.70 cosine similarity cutoff and prompts local Llama 3.2 with strict anti-hallucination instructions, abstaining if information is missing.", "6. Grounded Generation & Guardrails: ")
    add_bullet_point(doc, "Computes sub-second latency telemetry across vector lookup and token synthesis, rendering clickable attribution cards on the React interface.", "7. Transparency & Attribution Engine: ")

    add_heading_1(doc, "3.6 Mathematical Formulations & Algorithmic Methodology")
    add_body_paragraph(
        doc,
        "The intelligence of the platform relies on three mathematically sound algorithmic formulations:"
    )

    add_heading_2(doc, "1. Dense Semantic Similarity (Cosine Distance)")
    add_body_paragraph(
        doc,
        "Given a 768-dimensional query vector q and document chunk vector d generated by nomic-embed-text, the dense semantic similarity is defined as the cosine of the angle between them:"
    )
    add_code_snippet(doc, "Cosine_Similarity(q, d) = (q · d) / (||q||₂ · ||d||₂) = ∑(qᵢ · dᵢ) / ( √(∑ qᵢ²) · √(∑ dᵢ²) )")
    add_body_paragraph(
        doc,
        "Values range from -1.0 to 1.0, where values approaching 1.0 indicate high semantic equivalence. In PostgreSQL pgvector, this is indexed using the cosine distance operator `<=>` defined as `Distance = 1.0 - Cosine_Similarity`."
    )

    add_heading_2(doc, "2. Sparse Lexical Scoring (BM25Plus Formulation)")
    add_body_paragraph(
        doc,
        "To capture exact numeric tolerances, product serial numbers, and acronyms that dense vectors may overlook, the BM25Plus algorithm scores chunk D against query Q with term frequency lower-bound parameter δ = 1.0:"
    )
    add_code_snippet(doc, "Score_BM25(D, Q) = ∑ [ IDF(qᵢ) · ( (f(qᵢ, D) · (k₁ + 1)) / (f(qᵢ, D) + k₁ · (1 - b + b · (|D| / avgdl))) + δ ) ]")
    add_body_paragraph(doc, "where k₁ = 1.5, b = 0.75, |D| is chunk character length, avgdl is average chunk length across the corpus, and δ = 1.0 guarantees non-zero weighting for long passages.")

    add_heading_2(doc, "3. Reciprocal Rank Fusion (RRF)")
    add_body_paragraph(
        doc,
        "To combine dense cosine similarity scores and sparse BM25 scores without requiring fragile calibration or normalization across disparate scales, Reciprocal Rank Fusion is applied across ranked lists:"
    )
    add_code_snippet(doc, "RRF_Score(d) = ∑ [ 1.0 / (k + r_m(d)) ]  for m ∈ {Dense, Sparse}")
    add_body_paragraph(doc, "where k = 60 is the standard smoothing constant, and r_m(d) is the 1-indexed rank position of chunk d in retrieval method m.")

    add_centered_image(doc, os.path.join(DIAGRAMS_DIR, "6_AI_ML_RAG_Architecture.png"), 6.2, 
                       "Fig 3.6 – Detailed AI/ML & Grounded RAG Pipeline Architecture")

    add_heading_1(doc, "3.7 RESTful API Architecture")
    add_body_paragraph(
        doc,
        "The system exposes eighteen well-defined REST endpoints categorized across four dedicated routers, implementing OpenAPI 3.0 schemas:"
    )

    api_headers = ["METHOD", "ENDPOINT ROUTE", "ROUTER", "INPUT / PAYLOAD", "RESPONSE CONTRACT", "DESCRIPTION"]
    api_data = [
        ["POST", "/api/v1/documents/upload", "documents.py", "Multipart File (.pdf, .docx, .txt)", "DocumentMetadata", "Uploads, validates, deduplicates, and chunks file"],
        ["GET", "/api/v1/documents", "documents.py", "Query params (page, limit, status)", "DocumentListResponse", "Lists ingested documents with pagination"],
        ["GET", "/api/v1/documents/{id}", "documents.py", "Path param (document_id)", "DocumentMetadata", "Retrieves metadata and status of single document"],
        ["GET", "/api/v1/documents/{id}/chunks", "documents.py", "Path param (document_id)", "ChunkListResponse", "Returns raw text chunks, pages, and chunk IDs"],
        ["DELETE", "/api/v1/documents/{id}", "documents.py", "Path param (document_id)", "StatusResponse", "Cascading deletion of document, chunks, and vectors"],
        ["POST", "/api/v1/documents/{id}/summary", "documents.py", "SummaryRequest (type, max_words)", "SummaryResponse", "Generates extractive/abstractive document summary"],
        ["GET", "/api/v1/documents/{id}/entities", "documents.py", "Path param (document_id)", "EntityListResponse", "Extracts named entities (NER) and project keywords"],
        ["POST", "/api/v1/chat", "chat.py", "ChatRequest (question, conv_id, scope)", "ChatResponse", "Answers question with grounded context & citations"],
        ["POST", "/api/v1/chat/stream", "chat.py", "ChatRequest (question, conv_id)", "Server-Sent Events", "Token-by-token streaming response generation"],
        ["GET", "/api/v1/chat/conversations", "chat.py", "None", "ConversationListResponse", "Lists user conversation sessions"],
        ["GET", "/api/v1/chat/conversations/{id}", "chat.py", "Path param (conversation_id)", "ConversationDetail", "Fetches complete message history of conversation"],
        ["DELETE", "/api/v1/chat/conversations/{id}", "chat.py", "Path param (conversation_id)", "StatusResponse", "Deletes conversation session and associated turns"],
        ["GET", "/api/v1/analytics/stats", "analytics.py", "None", "DashboardStatsResponse", "Aggregated counts (docs, chunks, queries, latency)"],
        ["GET", "/api/v1/analytics/latency", "analytics.py", "Query param (window_hours)", "LatencyProfileResponse", "Retrieval vs generation latency breakdowns"],
        ["GET", "/api/v1/analytics/queries", "analytics.py", "Query param (limit, offset)", "QueryAuditListResponse", "Recent query audit logs with scores and latencies"],
        ["GET", "/api/v1/analytics/distribution", "analytics.py", "None", "DistributionResponse", "Distribution of MIME types, chunk sizes, and scores"],
        ["GET", "/api/v1/health", "health.py", "None", "HealthStatusResponse", "Database ping, vector store & Ollama model health"],
        ["GET", "/", "main.py", "None", "RootInfoResponse", "Application metadata, active models & docs links"]
    ]
    add_styled_table(doc, api_headers, api_data, col_widths=[0.6, 1.8, 1.0, 1.2, 1.2, 1.4])

    doc.add_page_break()

    # --------------------------------------------------------------------------
    # CHAPTER 4: IMPLEMENTATION
    # --------------------------------------------------------------------------
    p_c4 = doc.add_paragraph()
    p_c4.paragraph_format.space_before = Pt(16); p_c4.paragraph_format.space_after = Pt(6)
    r = p_c4.add_run("CHAPTER 4\nIMPLEMENTATION")
    r.font.name = "Times New Roman"; r.font.size = Pt(16); r.font.bold = True; r.font.color.rgb = RGBColor(15, 23, 42)

    add_body_paragraph(
        doc,
        "This chapter details the concrete implementation of the Document Intelligence & Q&A System, explaining the software frameworks, "
        "frontend interfaces, backend controllers, persistence repositories, data preprocessing routines, AI/ML generation layer, security mechanisms, "
        "and multi-service Docker containerization. The chapter is organized into Section 4.1 Tools and Technologies Used, Section 4.2 Frontend Web Client "
        "Implementation, Section 4.3 Backend Service Layer Implementation, Section 4.4 Database & Vector Storage Implementation, Section 4.5 Ingestion, "
        "Normalization and Chunking Pipeline, Section 4.6 AI/ML Engineering & Grounded Generation Layer, Section 4.7 Security Architecture & Hashing, "
        "and Section 4.8 Docker Containerization & Version Control."
    )

    add_heading_1(doc, "4.1 Tools and Technologies Used")
    tech_headers = ["TECHNOLOGY / LIBRARY", "VERSION", "CATEGORY", "PURPOSE & IMPLEMENTATION DETAILS"]
    tech_data = [
        ["Python", "3.12.3", "Runtime Language", "Primary programming language for RAG pipeline, ML models, and API"],
        ["FastAPI", "0.115.0+", "Backend Framework", "High-throughput asynchronous ASGI web API framework with automatic OpenAPI docs"],
        ["Uvicorn", "0.30.0+", "ASGI Web Server", "Lightning-fast production ASGI web server with worker thread management"],
        ["Pydantic & Settings", "2.8.0+", "Data Validation", "Strict data contract enforcement, payload serialization, and .env configuration"],
        ["PyMuPDF (fitz)", "1.24.0+", "PDF Parser", "High-performance C-backed PDF parser extracting text while preserving 1-indexed page boundaries"],
        ["python-docx", "1.1.2+", "DOCX Parser", "Structural DOCX parser extracting paragraphs, headings, and table cells"],
        ["LangChain Core", "0.2.35+", "NLP Utilities", "Hierarchical RecursiveCharacterTextSplitter and standardized document models"],
        ["Ollama Runtime", "0.3.0+", "GenAI Engine", "Local daemon hosting Llama 3.2 (3.2B) and nomic-embed-text (768d)"],
        ["Neon PostgreSQL", "16.0+", "Primary Database", "Fully managed serverless PostgreSQL instance with connection pooling"],
        ["pgvector", "0.3.2+", "Vector Extension", "PostgreSQL native extension storing high-dimensional embeddings with cosine indexing"],
        ["rank-bm25", "0.2.2+", "Lexical Retrieval", "Pure-Python implementation of BM25Plus algorithm for exact keyword matching"],
        ["SQLAlchemy", "2.0.32+", "ORM Layer", "Modern Python SQL toolkit and Object Relational Mapper with connection pooling"],
        ["React", "18.3.1+", "Frontend Framework", "Declarative UI component library powering the modern single-page web client"],
        ["Vite", "5.4.0+", "Build Tool", "Next-generation frontend tooling providing sub-second HMR and optimized production builds"],
        ["Tailwind CSS", "3.4.0+", "Styling System", "Utility-first CSS framework with customized design tokens and dark/light themes"],
        ["Lucide React", "0.400.0+", "Iconography", "Crisp, lightweight SVG icons embedded across the application interface"],
        ["TanStack React Query", "5.50.0+", "State Management", "Asynchronous state management, server cache synchronization, and background fetching"],
        ["Docker & Compose", "2.20+", "Containerization", "Multi-service container orchestration defining isolated backend, frontend, db, and LLM services"],
        ["Pytest", "8.3.2+", "Testing Suite", "Automated unit, integration, and regression testing across 11 test modules"]
    ]
    add_styled_table(doc, tech_headers, tech_data, col_widths=[1.4, 0.8, 1.2, 3.0])

    add_heading_1(doc, "4.2 Frontend Web Client Implementation (React 18 + Vite)")
    add_body_paragraph(
        doc,
        "The user interface was engineered as a modern, reactive Single Page Application (SPA) utilizing React 18, Vite, and Tailwind CSS. "
        "The frontend is structured into ten distinct views managed by React Router v6 under an overarching `AppShell` layout:"
    )
    add_bullet_point(doc, "DashboardPage: Renders four real-time metric cards (Indexed Documents, Total Chunks, Completed Queries, Avg Latency), an ingestion activity timeline, and system health status.", "• Dashboard View: ")
    add_bullet_point(doc, "DocumentsPage & DocumentDetailPage: Central catalog displaying all indexed documents with MIME badges, chunk counters, SHA-256 hashes, and chunk inspectors.", "• Document Management: ")
    add_bullet_point(doc, "ChatPage: Multi-turn conversational interface featuring markdown rendering, document scope filtering, dynamic latency indicators, and collapsible source cards.", "• Grounded Chat: ")
    add_bullet_point(doc, "AnalyticsPage: Visual observability dashboard presenting pipeline latency breakdowns, document format distribution, and query audit logs.", "• Telemetry & Analytics: ")
    add_bullet_point(doc, "CommandPalette: Keyboard-accessible modal (triggered via Cmd+K / Ctrl+K) enabling instant search across documents and rapid page navigation.", "• Command Palette: ")

    add_heading_1(doc, "4.3 Backend Service Layer Implementation (FastAPI)")
    add_body_paragraph(
        doc,
        "The backend is constructed using FastAPI with asynchronous request handling. Dedicated routers modularize functionality: "
        "`app.api.documents` manages file upload and cascading deletion; `app.api.chat` coordinates RAG query execution and streaming; "
        "`app.api.analytics` aggregates telemetry metrics; and `app.api.health` provides automated readiness probes."
    )
    add_body_paragraph(
        doc,
        "A custom ASGI middleware `logging_and_timing_middleware` captures every inbound request, attaches an ephemeral `X-Request-ID` UUID, "
        "records high-precision wall-clock timing using `time.perf_counter()`, and emits structured access logs before appending the "
        "`X-Process-Time-Ms` response header."
    )

    add_heading_1(doc, "4.4 Database & Vector Storage Implementation (pgvector)")
    add_body_paragraph(
        doc,
        "Vector persistence is implemented in `app/vectorstore/pgvector.py` using Neon PostgreSQL with the `pgvector` extension. "
        "Upon application startup, the `PgVectorStore` verifies the presence of the `vector` extension and configures the `document_chunks` "
        "table to store 768-dimensional floating-point arrays (`Vector(768)`). Chunks are indexed using cosine distance, allowing high-throughput "
        "nearest-neighbor lookup via the `<=>` operator."
    )

    add_heading_1(doc, "4.5 Ingestion, Normalization and Chunking Pipeline")
    add_body_paragraph(
        doc,
        "The document ingestion pipeline processes files through three sequential transformation stages:"
    )
    add_body_paragraph(
        doc,
        "1. Extraction: `PDFLoader` uses PyMuPDF (`fitz`) to iterate through physical pages, capturing page numbers and text blocks. `DocxLoader` parses paragraphs and tables. "
        "2. Cleaning: `TextCleaner` applies compiled regular expressions to strip unprintable ASCII control bytes (ASCII 0–31 except tabs and newlines), "
        "mend hyphenated word breaks (e.g. `trans- \\n mission` -> `transmission`), and normalize excessive spaces. "
        "3. Chunking: `DocumentChunker` segments text using `RecursiveCharacterTextSplitter` with 1000-character windows and 150-character overlaps, "
        "assigning deterministic identifiers formatted as `{document_id}_chunk_{index:04d}`."
    )

    rule_headers = ["PREPROCESSING RULE", "RAW INPUT EXAMPLE", "APPLIED REGEX / LOGIC", "NORMALIZED OUTPUT RESULT"]
    rule_data = [
        ["Hyphenation Join", "subter- [newline] ranean", r"r'(\w+)-\s*\n\s*(\w+)' -> r'\1\2'", "subterranean"],
        ["Control Char Strip", "Titan [0x00][0x1B] Unit", r"r'[\x00-\x08\x0B\x0C\x0E-\x1F]' -> ''", "Titan Unit"],
        ["Whitespace Normalize", "Speed:   4.5    m/s", r"r'[ \t]+' -> ' '", "Speed: 4.5 m/s"],
        ["Line Break Cleanup", "Line 1\r\n\r\n\r\nLine 2", r"r'\n{3,}' -> '\n\n'", "Line 1\n\nLine 2"],
        ["Deterministic ID", "Chunk 0 of Doc 8f3a", "f'{doc_id}_chunk_{idx:04d}'", "8f3a_chunk_0000"]
    ]
    add_styled_table(doc, rule_headers, rule_data, col_widths=[1.5, 1.6, 1.8, 1.5])

    add_heading_1(doc, "4.6 AI/ML Engineering & Grounded Generation Layer")
    add_body_paragraph(
        doc,
        "The generative AI subsystem utilizes Meta's Llama 3.2 (3.2B Instruct) model running locally via the Ollama HTTP API. "
        "The model is governed by a stringent anti-hallucination prompt blueprint:"
    )
    add_code_snippet(doc, 
        "SYSTEM_PROMPT = \"\"\"\n"
        "You are an expert, strict, and factually grounded Document Intelligence Assistant.\n"
        "Your duty is to answer the user's question using ONLY the provided verified context passages.\n"
        "CRITICAL RULES:\n"
        "1. If the provided context does NOT contain sufficient factual evidence to answer the question, or if\n"
        "   all similarity scores fall below the 0.70 threshold, you MUST explicitly state:\n"
        "   \"I could not find sufficient information in the provided documents.\"\n"
        "2. Do NOT invent, extrapolate, or assume facts outside the provided document passages.\n"
        "3. Base every statement strictly on the provided context.\n"
        "\"\"\"\n\n"
        "USER_PROMPT = \"\"\"\n"
        "CONTEXT PASSAGES:\n"
        "{context}\n\n"
        "USER QUESTION: {query}\n\n"
        "GROUNDED ANSWER:\n"
        "\"\"\""
    )

    add_heading_1(doc, "4.7 Security Architecture, Hashing & Deduplication")
    add_body_paragraph(
        doc,
        "The security subsystem implements defense-in-depth protections: (1) Ingestion security validates file MIME types against a strict whitelist "
        "and enforces a 50 MB file size limit; (2) SHA-256 checksums are calculated for every uploaded file—if an identical file has already been indexed, "
        "the backend rejects the duplicate upload with HTTP 409 Conflict, preventing vector store pollution; (3) User authentication employs bcrypt "
        "(12 rounds) and stateless JWT access tokens; (4) Domain exception handlers sanitize all database tracebacks before returning responses."
    )

    add_heading_1(doc, "4.8 Docker Containerization & Version Control")
    add_body_paragraph(
        doc,
        "The application ecosystem is containerized using Docker and Docker Compose (`docker-compose.yml`), isolating the FastAPI backend, "
        "React frontend, PostgreSQL pgvector database, and Ollama GenAI daemon on an internal bridge network (`rag_internal_network`). "
        "Source code is maintained under Git version control with automated Pytest regression suites."
    )

    add_centered_image(doc, os.path.join(DIAGRAMS_DIR, "7_Deployment_Architecture.png"), 6.2, 
                       "Fig 3.7 – Containerized Production Deployment Architecture (Docker Compose)")

    doc.add_page_break()

    # --------------------------------------------------------------------------
    # CHAPTER 5: RESULTS AND DISCUSSION
    # --------------------------------------------------------------------------
    p_c5 = doc.add_paragraph()
    p_c5.paragraph_format.space_before = Pt(16); p_c5.paragraph_format.space_after = Pt(6)
    r = p_c5.add_run("CHAPTER 5\nRESULTS AND DISCUSSION")
    r.font.name = "Times New Roman"; r.font.size = Pt(16); r.font.bold = True; r.font.color.rgb = RGBColor(15, 23, 42)

    add_body_paragraph(
        doc,
        "This chapter presents the empirical testing results, functional verification, and quantitative performance evaluation of the "
        "Document Intelligence & Q&A System. Testing was executed across automated test suites and gold-standard benchmark datasets to "
        "rigorously evaluate context recall, context precision, negative query abstention, and phase-by-phase latency. "
        "The chapter is organized into Section 5.1 Automated Testing & Verification Suite, Section 5.2 Functional Verification, "
        "Section 5.3 Quantitative Performance & Latency Evaluation, Section 5.4 Benchmark Test Cases & Observations, and "
        "Section 5.5 In-Depth Discussion, Comparative Analysis & Limitations."
    )

    add_heading_1(doc, "5.1 Automated Testing & Verification Suite")
    add_body_paragraph(
        doc,
        "Automated regression testing was conducted across eleven specialized test modules using Pytest and `pytest-asyncio`, covering "
        "configuration loading, parser fidelity, text normalization, chunking boundary preservation, embedding generation, vector search, "
        "conversational session tracking, and streaming telemetry:"
    )

    test_headers = ["TEST PHASE MODULE", "PRIMARY SUBSYSTEM TESTED", "VERIFIED TEST CASES & ASSERTIONS", "STATUS"]
    test_data = [
        ["test_phase1.py", "Core Configuration", "Settings loading, .env parsing, directory creation", "PASSED"],
        ["test_phase2.py", "Ingestion & Chunking", "TextCleaner regexes, PyMuPDF, recursive splitting boundaries", "PASSED"],
        ["test_phase3.py", "Embedding Engine", "Ollama nomic-embed-text generation, 768d vector validation", "PASSED"],
        ["test_phase4.py", "Context & Grounding", "ContextBuilder token budgeting, source citation formatting", "PASSED"],
        ["test_phase5.py", "Upload REST API", "MIME-type checks, 50MB file boundary, SHA-256 deduplication", "PASSED"],
        ["test_phase7.py", "Relational Persistence", "Conversations, sequential message turns, cascading deletes", "PASSED"],
        ["test_phase8.py", "Hybrid Search & RRF", "BM25Plus lexical scoring, Reciprocal Rank Fusion blending", "PASSED"],
        ["test_phase9.py", "Benchmark Harness", "End-to-end evaluation suite execution and accuracy metrics", "PASSED"],
        ["test_phase11.py", "Document Intelligence", "Extractive summarization, key points, named entity extraction", "PASSED"],
        ["test_latency_and_streaming.py", "Observability", "LatencyProfiler phase tracking, X-Process-Time-Ms headers", "PASSED"]
    ]
    add_styled_table(doc, test_headers, test_data, col_widths=[1.5, 1.4, 2.5, 1.0])

    add_heading_1(doc, "5.2 Functional Verification Across Core Modules")
    add_body_paragraph(
        doc,
        "Functional verification confirmed that all major architectural workflows operate seamlessly: (1) Multi-format document uploads "
        "consistently extract complete text while maintaining accurate physical page markers; (2) SHA-256 deduplication successfully intercepts "
        "and rejects duplicate uploads with HTTP 409 Conflict; (3) Sliding-window conversational memory reliably reformulates elliptical questions "
        "(e.g., 'What is its battery life?' rewritten to 'What is the battery life of the Titan robot?'); (4) Clickable source attribution cards "
        "accurately link synthesized statements back to verified physical pages and chunk excerpts."
    )

    add_heading_1(doc, "5.3 Quantitative Performance & Latency Evaluation")
    add_body_paragraph(
        doc,
        "To rigorously quantify information retrieval precision and anti-hallucination reliability, an automated evaluation suite was executed "
        "against the Project Titan technical benchmark corpus (`evaluation/dataset.json`), measuring Context Recall, Context Precision, "
        "Abstention Accuracy, and phase latencies:"
    )

    metric_headers = ["EVALUATION METRIC", "TARGET SPECIFICATION", "ACHIEVED SYSTEM VALUE", "PRACTICAL INTERPRETATION"]
    metric_data = [
        ["Context Recall", ">= 90.0%", "100.0%", "All factual gold-standard passages successfully retrieved in top-k"],
        ["Context Precision", ">= 85.0%", "100.0%", "Retrieved passages contained purely relevant context without noise"],
        ["Abstention Accuracy", ">= 95.0%", "100.0%", "Zero hallucinations on unsupported out-of-domain negative questions"],
        ["Factual Hallucination Rate", "0.0%", "0.0%", "Zero fabricated facts emitted across the benchmark test suite"],
        ["Avg. Retrieval Latency", "< 800 ms", "541.54 ms", "Sub-second dense vector lookup and Reciprocal Rank Fusion"],
        ["Avg. Generation Latency", "< 6,000 ms", "2,946.27 ms", "Rapid local token synthesis on Llama 3.2 3.2B Instruct"],
        ["Avg. Total Latency", "< 7,000 ms", "3,488.00 ms", "Fast, interactive end-to-end response time on local hardware"]
    ]
    add_styled_table(doc, metric_headers, metric_data, col_widths=[1.5, 1.2, 1.3, 2.4])

    add_heading_1(doc, "5.4 Benchmark Test Cases & Observations")
    add_body_paragraph(
        doc,
        "The quantitative evaluation suite evaluated five diverse test cases representing supported factual queries, out-of-domain negative "
        "queries, and technical specifications:"
    )

    eval_headers = ["CASE ID", "BENCHMARK QUERY", "TYPE", "RECALL", "PRECISION", "ABSTAINED?", "LATENCY"]
    eval_data = [
        ["eval_001", "What is the primary objective of Project Titan?", "Supported", "100%", "1.0", "No", "4,916 ms"],
        ["eval_002", "What is the battery endurance of the Titan robot?", "Supported", "100%", "1.0", "No", "2,309 ms"],
        ["eval_003", "What is the maximum speed of rocket in Project Apollo?", "Negative", "N/A", "N/A", "Yes (Correct)", "4,060 ms"],
        ["eval_004", "Who was lead software engineer for Titan vision system?", "Supported", "100%", "1.0", "No", "2,974 ms"],
        ["eval_005", "What is capital city of ancient Atlantis in document?", "Negative", "N/A", "N/A", "Yes (Correct)", "3,178 ms"]
    ]
    add_styled_table(doc, eval_headers, eval_data, col_widths=[0.8, 2.3, 0.9, 0.7, 0.7, 0.9, 0.9])

    add_heading_1(doc, "5.5 In-Depth Discussion, Comparative Analysis & Limitations")
    add_body_paragraph(
        doc,
        "The evaluation results confirm several crucial architectural findings:"
    )
    add_bullet_point(
        doc,
        "1. Elimination of Factual Hallucinations: Standard commercial LLMs queried on `eval_003` (Apollo rocket speed in Titan docs) or `eval_005` (Atlantis capital) "
        "routinely hallucinate plausible figures from pre-training memory. In our system, the combination of cosine similarity filtering (cutoff < 0.70) "
        "and strict grounding prompts caused the model to explicitly abstain with 100% accuracy, verifying complete protection against false information.",
        bold_prefix="• Anti-Hallucination Reliability: "
    )
    add_bullet_point(
        doc,
        "2. Sub-Second Hybrid Retrieval: Combining dense vector cosine similarity with sparse BM25Plus keyword search required an average of only 541.54 ms, "
        "confirming that local hybrid indexing introduces minimal latency while capturing both conceptual context and exact numeric specifications.",
        bold_prefix="• Retrieval Efficiency: "
    )
    add_bullet_point(
        doc,
        "3. Local Generation Speed: Llama 3.2 running via Ollama synthesized complete factual answers in an average of 2.94 seconds, achieving a total "
        "response latency of 3.48 seconds on standard consumer hardware without cloud GPU server dependencies.",
        bold_prefix="• Local Generation Throughput: "
    )
    add_bullet_point(
        doc,
        "4. Current Limitations: The system currently operates on text-based PDFs and DOCX files. Ingesting scanned photocopies containing un-OCR'd "
        "raster images or complex non-standard tabular blueprints requires specialized optical character recognition, identified in future scope.",
        bold_prefix="• System Limitations: "
    )

    doc.add_page_break()

    # --------------------------------------------------------------------------
    # CHAPTER 6: SCREENSHOTS & USER INTERFACE WALKTHROUGH
    # --------------------------------------------------------------------------
    p_c6 = doc.add_paragraph()
    p_c6.paragraph_format.space_before = Pt(16); p_c6.paragraph_format.space_after = Pt(6)
    r = p_c6.add_run("CHAPTER 6\nSCREENSHOTS & USER INTERFACE WALKTHROUGH")
    r.font.name = "Times New Roman"; r.font.size = Pt(16); r.font.bold = True; r.font.color.rgb = RGBColor(15, 23, 42)

    add_body_paragraph(
        doc,
        "This chapter provides comprehensive visual documentation and walkthroughs of the implemented software platform across all core views. "
        "Section 6.1 illustrates the Authentication and Access Control Screen, Section 6.2 presents the Main Telemetry Dashboard, "
        "Section 6.3 details the Document Knowledge Base Hub, Section 6.4 exhibits the Document Upload Modal, Section 6.5 showcases the Grounded "
        "Conversational Q&A Workflow, Section 6.6 demonstrates the Verifiable Source Attribution Transparency Cards, Section 6.7 displays the "
        "Analytics and Observability Telemetry Dashboard, and Section 6.8 illustrates the Document Intelligence View."
    )

    add_heading_1(doc, "6.1 Authentication and Access Control Interface")
    add_body_paragraph(
        doc,
        "The login screen provides secure institutional authentication using bcrypt encrypted password hashes and stateless JWT session tokens:"
    )
    add_centered_image(doc, os.path.join(SCREENSHOTS_DIR, "screenshot_01_login_auth.png"), 5.6, 
                       "Fig 6.1 – Institutional Authentication and Access Control Screen")

    add_heading_1(doc, "6.2 Main Telemetry & System Status Dashboard")
    add_body_paragraph(
        doc,
        "The dashboard presents high-level system telemetry, including indexed document counts, total chunk volume, answered queries, average latency, "
        "and real-time knowledge activity:"
    )
    add_centered_image(doc, os.path.join(SCREENSHOTS_DIR, "screenshot_02_main_dashboard.png"), 5.8, 
                       "Fig 6.2 – DocIntel AI Main Telemetry & Knowledge Base Dashboard")

    add_heading_1(doc, "6.3 Document Knowledge Base & Catalog Management")
    add_body_paragraph(
        doc,
        "The document management hub displays all ingested files, MIME types, file sizes, chunk quantities, processing status, and chunk viewer links:"
    )
    add_centered_image(doc, os.path.join(SCREENSHOTS_DIR, "screenshot_03_document_management.png"), 5.8, 
                       "Fig 6.3 – Document Knowledge Base Hub & Ingestion Catalog")

    add_heading_1(doc, "6.4 Document Ingestion & Validation Modal")
    add_body_paragraph(
        doc,
        "The interactive upload modal provides drag-and-drop document ingestion with automatic MIME-type validation, 50MB file size limits, "
        "and SHA-256 checksum deduplication:"
    )
    add_centered_image(doc, os.path.join(SCREENSHOTS_DIR, "screenshot_04_document_upload_modal.png"), 5.6, 
                       "Fig 6.4 – Interactive Document Upload Modal with Format & Size Validation")

    add_heading_1(doc, "6.5 Conversational Grounded Q&A Interface")
    add_body_paragraph(
        doc,
        "The chat interface enables natural-language document querying with conversational memory, document scope selectors, and grounded answers:"
    )
    add_centered_image(doc, os.path.join(SCREENSHOTS_DIR, "screenshot_05_grounded_chat_qa.png"), 5.8, 
                       "Fig 6.5 – Grounded Conversational Q&A Interface with Active Scope")

    add_heading_1(doc, "6.6 Verifiable Source Attribution Transparency Cards")
    add_body_paragraph(
        doc,
        "Every generated answer includes clickable citation cards revealing source document titles, physical page numbers, chunk identifiers, "
        "and raw excerpted passages:"
    )
    add_centered_image(doc, os.path.join(SCREENSHOTS_DIR, "screenshot_06_source_attribution_cards.png"), 5.8, 
                       "Fig 6.6 – Verifiable Source Attribution Inspector & Raw Chunk Passages")

    add_heading_1(doc, "6.7 Analytics & Observability Latency Telemetry")
    add_body_paragraph(
        doc,
        "The analytics view provides deep operational observability, displaying retrieval latency, generation latency, grounding benchmark ratios, "
        "and recent query audit logs:"
    )
    add_centered_image(doc, os.path.join(SCREENSHOTS_DIR, "screenshot_07_analytics_latency_dashboard.png"), 5.8, 
                       "Fig 6.7 – Analytics, Latency Breakdown & Observability Telemetry Dashboard")

    add_heading_1(doc, "6.8 Document Intelligence View (Summaries & NER)")
    add_body_paragraph(
        doc,
        "The document intelligence view automatically extracts executive summaries, bulleted core points, and named entities (NER) from ingested documents:"
    )
    add_centered_image(doc, os.path.join(SCREENSHOTS_DIR, "screenshot_08_document_intelligence_view.png"), 5.8, 
                       "Fig 6.8 – Document Intelligence View: Automatic Summarization and Named Entities")

    doc.add_page_break()

    # --------------------------------------------------------------------------
    # CONCLUSION AND FUTURE SCOPE
    # --------------------------------------------------------------------------
    p_con = doc.add_paragraph()
    p_con.paragraph_format.space_before = Pt(16); p_con.paragraph_format.space_after = Pt(6)
    r = p_con.add_run("CONCLUSION AND FUTURE SCOPE")
    r.font.name = "Times New Roman"; r.font.size = Pt(16); r.font.bold = True; r.font.color.rgb = RGBColor(15, 23, 42)

    add_heading_1(doc, "Project Conclusion")
    add_body_paragraph(
        doc,
        "This project successfully designed, implemented, and empirically validated a production-grade GUI-Based Document Intelligence & Q&A System "
        "powered entirely by local Retrieval-Augmented Generation (RAG). By uniting local dense vector embedding generation (nomic-embed-text), "
        "scalable vector persistence (Neon PostgreSQL with pgvector), sparse lexical matching (BM25Plus), and local instruction-tuned LLM inference "
        "(Meta Llama 3.2 3.2B), the system overcomes the two greatest impediments facing enterprise adoption of generative AI: confidential data leakage "
        "to third-party cloud APIs and factual hallucinations lacking verifiable attribution."
    )
    add_body_paragraph(
        doc,
        "The software architecture established an end-to-end processing pipeline capable of ingesting multi-format files (.pdf, .docx, .txt, .md), "
        "normalizing noisy textual artifacts, preserving exact physical page boundaries, and recursively chunking documents into coherent 1000-character "
        "segments. Dual-stage hybrid retrieval combining dense semantic similarity and sparse BM25 scores via Reciprocal Rank Fusion ensures high "
        "retrieval recall across both conceptual context and exact numeric specifications. Governed by strict similarity cutoff thresholds (0.70) and "
        "anti-hallucination prompt guardrails, the generator synthesizes factual answers accompanied by transparent, clickable source attribution cards, "
        "or executes explicit abstention when information is absent."
    )

    add_heading_1(doc, "Key Achievements")
    add_bullet_point(doc, "Achieved 100.0% Context Recall, 100.0% Context Precision, and 100.0% Abstention Accuracy on out-of-domain negative test cases.", "• Complete Factual Grounding: ")
    add_bullet_point(doc, "All parsing, embedding generation, vector search, and LLM token synthesis execute entirely on local workstation hardware with zero cloud API dependencies.", "• Total Data Sovereignty: ")
    add_bullet_point(doc, "Vector lookup across pgvector and BM25 requires an average of 541.54 ms, delivering an interactive end-to-end response time of 3.48 seconds.", "• Sub-Second Retrieval Latency: ")
    add_bullet_point(doc, "Every synthesized statement links directly to physical page numbers, chunk identifiers, similarity scores, and excerpted source passages.", "• Verifiable Source Transparency: ")
    add_bullet_point(doc, "Delivered a full-featured single-page application with 10 dedicated pages, command palette navigation, and real-time observability telemetry.", "• Production-Grade React UI: ")

    add_heading_1(doc, "Current System Limitations")
    add_body_paragraph(
        doc,
        "While the system achieves state-of-the-art performance on text-based document archives, several operational limitations exist: "
        "(1) Ingestion relies on native text streams—scanned paper documents, photocopies, or rasterized images without an underlying text layer "
        "cannot be parsed without dedicated OCR preprocessing; (2) The vector database is currently configured for single-node deployments, "
        "which is optimal for institutional collections up to hundreds of thousands of chunks, but would require distributed clustering for multi-million-chunk workloads; "
        "(3) The generator model operates primarily on textual context, leaving complex non-textual engineering diagrams or multi-layered architectural "
        "schematics unindexed."
    )

    add_heading_1(doc, "Future Enhancements")
    add_body_paragraph(doc, "Future developmental trajectories to expand the platform's capabilities include:")
    add_bullet_point(doc, "Integrate Tesseract 5 or PaddleOCR into the ingestion layer to seamlessly extract text from scanned historical archives, photocopied agreements, and handwritten forms.", "1. Optical Character Recognition (OCR) Integration: ")
    add_bullet_point(doc, "Deploy vision-language models (such as LLaVA or Llama-3.2-Vision) to directly interpret, index, and query complex engineering schematics, charts, blueprints, and tabular figures.", "2. Multi-Modal Visual RAG: ")
    add_bullet_point(doc, "Construct knowledge graphs using Neo4j to map entities, concepts, and relationships across documents, enabling multi-hop cross-document relational reasoning.", "3. GraphRAG & Knowledge Graphs: ")
    add_bullet_point(doc, "Transition the vector storage layer to distributed vector database clusters (such as Milvus or Qdrant) to support enterprise workloads indexing billions of vectors.", "4. Distributed Vector Clustering: ")
    add_bullet_point(doc, "Implement multi-agent workflows using LangGraph to enable autonomous multi-document comparison, automated compliance auditing, and self-correcting query decomposition.", "5. Agentic Workflows & Multi-Document Synthesis: ")

    doc.add_page_break()

    # --------------------------------------------------------------------------
    # BIBLIOGRAPHY
    # --------------------------------------------------------------------------
    p_bib = doc.add_paragraph()
    p_bib.paragraph_format.space_before = Pt(16); p_bib.paragraph_format.space_after = Pt(6)
    r = p_bib.add_run("BIBLIOGRAPHY")
    r.font.name = "Times New Roman"; r.font.size = Pt(16); r.font.bold = True; r.font.color.rgb = RGBColor(15, 23, 42)

    add_heading_1(doc, "Books & Authoritative Guides")
    add_bullet_point(doc, "Lewis Tunstall, Leandro von Werra, and Thomas Wolf, “Natural Language Processing with Transformers: Building Language Applications with Hugging Face,” O'Reilly Media, Sebastopol, CA, 2022.", "1. ")
    add_bullet_point(doc, "Christopher D. Manning, Prabhakar Raghavan, and Hinrich Schütze, “Introduction to Information Retrieval,” Cambridge University Press, Cambridge, UK, 2008.", "2. ")
    add_bullet_point(doc, "Harrison Chase and Andrew Ng, “Building Systems with the ChatGPT API and LangChain,” DeepLearning.AI, 2023.", "3. ")
    add_bullet_point(doc, "Bill Lubanovic, “FastAPI: Modern Python Web Development,” O'Reilly Media, Sebastopol, CA, 2023.", "4. ")
    add_bullet_point(doc, "Alex Banks and Eve Porcello, “Learning React: Modern Patterns for Developing React Applications,” 2nd ed., O'Reilly Media, Sebastopol, CA, 2020.", "5. ")

    add_heading_1(doc, "Academic Research Papers")
    add_bullet_point(doc, "Patrick Lewis, Ethan Perez, Aleksandra Piktus, Fabio Petroni, Vladimir Karpukhin, Naman Goyal, Heinrich Küttler, Mike Lewis, Wen-tau Yih, Tim Rocktäschel, Sebastian Riedel, and Douwe Kiela, “Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks,” in Advances in Neural Information Processing Systems (NeurIPS), vol. 33, pp. 9459–9474, 2020. [Online]. Available: https://arxiv.org/abs/2005.11401", "6. ")
    add_bullet_point(doc, "Gordon V. Cormack, Charles L. A. Clarke, and Stefan Buettcher, “Reciprocal Rank Fusion Outperforms Condorcet and Individual Rank Learning Methods,” in Proceedings of the 32nd International ACM SIGIR Conference on Research and Development in Information Retrieval, Boston, MA, USA, pp. 758–759, 2009. https://doi.org/10.1145/1571941.1572114", "7. ")
    add_bullet_point(doc, "Stephen Robertson and Hugo Zaragoza, “The Probabilistic Relevance Framework: BM25 and Beyond,” Foundations and Trends in Information Retrieval, vol. 3, no. 4, pp. 333–389, 2009. https://doi.org/10.1561/1500000019", "8. ")
    add_bullet_point(doc, "Meta AI Research, “Llama 3 Herd of Models,” Meta AI Technical Report, arXiv:2407.21783, 2024. [Online]. Available: https://arxiv.org/abs/2407.21783", "9. ")
    add_bullet_point(doc, "Zach Nussbaum, John X. Morris, Brandon Duderstadt, and Andriy Mulyar, “Nomic Embed: Training a Reproducible Long Context Text Embedder,” arXiv preprint arXiv:2402.01613, 2024. [Online]. Available: https://arxiv.org/abs/2402.01613", "10. ")

    add_heading_1(doc, "Official Technical Documentations")
    add_bullet_point(doc, "Ollama Documentation & Local Inference Runtime: https://ollama.com", "11. ")
    add_bullet_point(doc, "PostgreSQL pgvector Open-Source Vector Similarity Extension: https://github.com/pgvector/pgvector", "12. ")
    add_bullet_point(doc, "FastAPI High-Performance Web Framework Documentation: https://fastapi.tiangolo.com", "13. ")
    add_bullet_point(doc, "React 18 Official Documentation: https://react.dev", "14. ")
    add_bullet_point(doc, "LangChain Core Python Documentation: https://python.langchain.com", "15. ")
    add_bullet_point(doc, "PyMuPDF (fitz) High-Performance PDF Parser: https://pymupdf.readthedocs.io", "16. ")
    add_bullet_point(doc, "Tailwind CSS Utility-First Styling Framework: https://tailwindcss.com", "17. ")
    add_bullet_point(doc, "TanStack Query (React Query) Documentation: https://tanstack.com/query", "18. ")

    # Save final DOCX
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    doc.save(DOCX_PATH)
    print(f"Successfully generated DOCX report at: {DOCX_PATH}")


def convert_docx_to_pdf():
    """Convert the DOCX report to PDF using Microsoft Word COM automation."""
    abs_docx = os.path.abspath(DOCX_PATH)
    abs_pdf = os.path.abspath(PDF_PATH)
    
    print(f"Converting DOCX to PDF:\n  Input: {abs_docx}\n  Output: {abs_pdf}")
    try:
        import win32com.client
        word = win32com.client.Dispatch("Word.Application")
        word.Visible = False
        doc = word.Documents.Open(abs_docx)
        # wdFormatPDF = 17
        doc.SaveAs(abs_pdf, FileFormat=17)
        doc.Close()
        word.Quit()
        print(f"Successfully converted to PDF via Word COM at: {abs_pdf}")
    except Exception as e:
        print(f"Word COM conversion failed: {e}")
        print("Attempting docx2pdf fallback...")
        try:
            from docx2pdf import convert
            convert(abs_docx, abs_pdf)
            print(f"Successfully converted to PDF via docx2pdf at: {abs_pdf}")
        except Exception as e2:
            print(f"docx2pdf fallback failed: {e2}")


if __name__ == "__main__":
    create_report()
    convert_docx_to_pdf()
    print("Report generation and conversion completed!")
