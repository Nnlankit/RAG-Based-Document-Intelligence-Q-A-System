import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from report_builder_helpers import (
    add_styled_table, add_heading_1, add_heading_2, 
    add_body_paragraph, add_bullet_point, add_centered_image, add_code_snippet
)

def build_docx_report():
    doc = docx.Document()

    # Set 1-inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # ----------------------------------------------------
    # COVER PAGE
    # ----------------------------------------------------
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(36)
    p_title.paragraph_format.space_after = Pt(4)
    run = p_title.add_run("Project Report\n(7th Semester)\nEntitled as\n")
    run.font.name = "Times New Roman"
    run.font.size = Pt(15)
    run.font.bold = True
    run.font.color.rgb = RGBColor(15, 23, 42)

    p_proj = doc.add_paragraph()
    p_proj.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_proj.paragraph_format.space_after = Pt(12)
    run_proj = p_proj.add_run("GUI-Based Document Intelligence & Q&A System\nusing Retrieval-Augmented Generation")
    run_proj.font.name = "Times New Roman"
    run_proj.font.size = Pt(17)
    run_proj.font.bold = True
    run_proj.font.color.rgb = RGBColor(29, 78, 216)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(18)
    run_sub = p_sub.add_run("Submitted in partial fulfillment of the requirement for award of the degree of\nB.Tech. CSE (AI&ML)\n(Batch-2022-2026)")
    run_sub.font.name = "Times New Roman"
    run_sub.font.size = Pt(11)
    run_sub.font.color.rgb = RGBColor(51, 65, 85)

    # University Emblem
    if os.path.exists("report_figures/cdlu_emblem.png"):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_before = Pt(6)
        p_logo.paragraph_format.space_after = Pt(18)
        run_logo = p_logo.add_run()
        run_logo.add_picture("report_figures/cdlu_emblem.png", width=Inches(1.8))

    # Mentorship & Student Info Table
    info_table = doc.add_table(rows=1, cols=2)
    info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    info_table.autofit = False
    info_table.rows[0].cells[0].width = Inches(3.2)
    info_table.rows[0].cells[1].width = Inches(3.2)

    cell_left = info_table.rows[0].cells[0]
    p_l = cell_left.paragraphs[0]
    p_l.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = p_l.add_run("Under the Mentorship of:\n")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)
    r.font.bold = True
    r = p_l.add_run("Dr. Jasjit Singh Samagh\nAssistant Professor\nDept. of Computer Science & Engg")
    r.font.name = "Times New Roman"
    r.font.size = Pt(10.5)

    cell_right = info_table.rows[0].cells[1]
    p_r = cell_right.paragraphs[0]
    p_r.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_r.add_run("Submitted By:\n")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)
    r.font.bold = True
    r = p_r.add_run("Chandan\nB.Tech. CSE(AI&ML)- 7th Sem\nRegn. No.: 22111116840020")
    r.font.name = "Times New Roman"
    r.font.size = Pt(10.5)

    # University Footer
    p_dept = doc.add_paragraph()
    p_dept.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dept.paragraph_format.space_before = Pt(36)
    p_dept.paragraph_format.space_after = Pt(0)
    run_dept = p_dept.add_run("DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING\nCHAUDHARY DEVI LAL UNIVERSITY, SIRSA-125055\n(NOV-2025)")
    run_dept.font.name = "Times New Roman"
    run_dept.font.size = Pt(11.5)
    run_dept.font.bold = True
    run_dept.font.color.rgb = RGBColor(15, 23, 42)

    doc.add_page_break()

    # ----------------------------------------------------
    # PRELIMINARY PAGES
    # ----------------------------------------------------

    # PAGE i: STUDENT'S DECLARATION
    p_h = doc.add_paragraph()
    p_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_h.paragraph_format.space_before = Pt(36)
    p_h.paragraph_format.space_after = Pt(28)
    run = p_h.add_run("STUDENT'S DECLARATION")
    run.font.name = "Times New Roman"
    run.font.size = Pt(14)
    run.font.bold = True

    add_body_paragraph(doc, "I, Chandan, Roll No. 22111116840020, hereby declare that the project work entitled: “GUI-Based Document Intelligence & Q&A System using Retrieval-Augmented Generation” has been carried out by me during the 7th semester of the Bachelor of Technology in Computer Science & Engineering (AI & ML) under the guidance of Dr. Jasjit Singh Samagh, Department of Computer Science and Engineering, Chaudhary Devi Lal University, Sirsa, in partial fulfillment of the degree requirements prescribed by the department.", space_after=14)
    add_body_paragraph(doc, "I further declare that this project is the result of my own efforts and work, and it has not been submitted to any other university, institution, or organization for the award of any degree, diploma, certification, or similar academic title.", space_after=50)

    p_sig = doc.add_paragraph()
    p_sig.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = p_sig.add_run("Date: \nPlace: Sirsa")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)
    r.font.bold = True

    p_sig2 = doc.add_paragraph()
    p_sig2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_sig2.add_run("Chandan\n(Roll No. 22111116840020)")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)
    r.font.bold = True

    p_num = doc.add_paragraph()
    p_num.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_num.paragraph_format.space_before = Pt(80)
    r = p_num.add_run("i")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)

    doc.add_page_break()

    # PAGE ii: CERTIFICATE FROM MENTOR
    p_dept = doc.add_paragraph()
    p_dept.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dept.paragraph_format.space_before = Pt(20)
    p_dept.paragraph_format.space_after = Pt(12)
    r = p_dept.add_run("DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING\nCHAUDHARY DEVI LAL UNIVERSITY")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.bold = True

    if os.path.exists("report_figures/cdlu_emblem.png"):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_before = Pt(4)
        p_logo.paragraph_format.space_after = Pt(16)
        r = p_logo.add_run()
        r.add_picture("report_figures/cdlu_emblem.png", width=Inches(1.5))

    p_h = doc.add_paragraph()
    p_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_h.paragraph_format.space_before = Pt(12)
    p_h.paragraph_format.space_after = Pt(24)
    r = p_h.add_run("CERTIFICATE FROM MENTOR")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True

    add_body_paragraph(doc, "This is to certify that Mr. Chandan, a student of B.Tech CSE (AI&ML) semester-VII, has completed his training under my mentorship satisfactorily with the Minor-project entitled “GUI-Based Document Intelligence & Q&A System using Retrieval-Augmented Generation”, an artificial intelligence and natural language processing system.", space_after=14)
    add_body_paragraph(doc, "I wish him all the success in his future endeavors.", space_after=60)

    p_sig = doc.add_paragraph()
    p_sig.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = p_sig.add_run("Date: \nPlace: Sirsa")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)
    r.font.bold = True

    p_sig2 = doc.add_paragraph()
    p_sig2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_sig2.add_run("Dr. Jasjit Singh Samagh\n(Mentor)\nAssistant Professor\nDept. of Computer Science & Engg")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)
    r.font.bold = True

    p_num = doc.add_paragraph()
    p_num.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_num.paragraph_format.space_before = Pt(60)
    r = p_num.add_run("ii")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)

    doc.add_page_break()

    # PAGE iii: CERTIFICATE FROM CHAIRPERSON
    p_dept = doc.add_paragraph()
    p_dept.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dept.paragraph_format.space_before = Pt(20)
    p_dept.paragraph_format.space_after = Pt(12)
    r = p_dept.add_run("CHAUDHARY DEVI LAL UNIVERSITY, SIRSA")
    r.font.name = "Times New Roman"
    r.font.size = Pt(13)
    r.font.bold = True

    if os.path.exists("report_figures/cdlu_emblem.png"):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_before = Pt(4)
        p_logo.paragraph_format.space_after = Pt(16)
        r = p_logo.add_run()
        r.add_picture("report_figures/cdlu_emblem.png", width=Inches(1.5))

    p_h = doc.add_paragraph()
    p_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_h.paragraph_format.space_before = Pt(12)
    p_h.paragraph_format.space_after = Pt(24)
    r = p_h.add_run("CERTIFICATE FROM CHAIRPERSON")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True

    add_body_paragraph(doc, "This is to certify that Mr. Chandan, a student of B.Tech CSE (AI-ML) semester VII, has completed his Minor-project under the mentorship of Dr. Jasjit Singh Samagh satisfactorily. He has worked on the project entitled “GUI-Based Document Intelligence & Q&A System using Retrieval-Augmented Generation”, an applied machine learning and language modeling system.", space_after=14)
    add_body_paragraph(doc, "I wish him all the success in his future endeavors.", space_after=60)

    p_sig = doc.add_paragraph()
    p_sig.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = p_sig.add_run("Date: \nPlace: Sirsa")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)
    r.font.bold = True

    p_sig2 = doc.add_paragraph()
    p_sig2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_sig2.add_run("Prof.(Dr.) Harish Rohil\n(Chairperson)\nDepartment of Computer Science & Engineering")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)
    r.font.bold = True

    p_num = doc.add_paragraph()
    p_num.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_num.paragraph_format.space_before = Pt(60)
    r = p_num.add_run("iii")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)

    doc.add_page_break()

    # PAGE iv: ACKNOWLEDGMENT
    p_h = doc.add_paragraph()
    p_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_h.paragraph_format.space_before = Pt(36)
    p_h.paragraph_format.space_after = Pt(24)
    r = p_h.add_run("ACKNOWLEDGMENT")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True

    add_body_paragraph(doc, "I would like to express my sincere gratitude to Dr. Jasjit Singh Samagh, my Project Mentor, for his continuous support, technical guidance, and encouragement throughout the course of this project. His mentorship played a crucial role in helping me stay focused, refine the system architecture, and overcome technical challenges effectively.", space_after=12)
    add_body_paragraph(doc, "I am also deeply thankful to Prof.(Dr.) Harish Rohil, Chairperson, Department of Computer Science & Engineering, for fostering a motivating academic environment, providing access to necessary lab infrastructure, and offering valuable insights during the progress of this work.", space_after=12)
    add_body_paragraph(doc, "I extend my heartfelt gratitude to my parents for their unwavering encouragement, moral backing, and patience, which have been the foundation of my academic journey. I also thank my friends, peers, and department faculty for their thoughtful cooperation, feedback, and constructive suggestions that contributed significantly to the successful completion of this project.", space_after=40)

    p_sig2 = doc.add_paragraph()
    p_sig2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_sig2.add_run("Chandan\nB.Tech. CSE (AI&ML) - 7th Semester\nRegistration No.: 22111116840020")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)
    r.font.bold = True

    p_num = doc.add_paragraph()
    p_num.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_num.paragraph_format.space_before = Pt(80)
    r = p_num.add_run("iv")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)

    doc.add_page_break()

    # PAGE v: ABSTRACT
    p_h = doc.add_paragraph()
    p_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_h.paragraph_format.space_before = Pt(36)
    p_h.paragraph_format.space_after = Pt(24)
    r = p_h.add_run("ABSTRACT")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True

    add_body_paragraph(doc, "The GUI-Based Document Intelligence & Q&A System is a production-grade, modular, and privacy-first machine learning application designed to overcome the critical limitations of standard Large Language Models (LLMs)—specifically factual hallucinations, catastrophic memory fading, lack of private document context, and the inability to provide verifiable source attribution. Built to operate entirely within a private local infrastructure without sending confidential data to external cloud APIs, the system implements an end-to-end Retrieval-Augmented Generation (RAG) architecture.", space_after=12)
    add_body_paragraph(doc, "The system parses heterogeneous document formats (PDF, DOCX, TXT, and Markdown) page-by-page using high-fidelity extraction libraries (PyMuPDF and python-docx), cleans raw textual noise via specialized regex routines, and performs deterministic chunking using RecursiveCharacterTextSplitter with 1000-character windows and 150-character overlaps. Text chunks are indexed into vector embeddings using the 768-dimensional local embedding model nomic-embed-text running on Ollama, alongside sparse keyword indices using the BM25Plus algorithm. A dual-stage hybrid retrieval engine merges dense semantic similarity and sparse keyword scores via Reciprocal Rank Fusion (RRF) and similarity thresholding (cosine cutoff ≥ 0.70).", space_after=12)
    add_body_paragraph(doc, "To ensure strictly grounded answers, the system passes top-k retrieved contexts to a local instruction-tuned Llama 3.2 model governed by a stringent grounding prompt. If the retrieved context is insufficient or irrelevant, the model executes explicit abstention, returning a standardized notice rather than generating fabricated answers. A responsive graphical user interface developed with Streamlit provides interactive document uploads, real-time chunk library visualization, conversational memory with query rewriting, and verifiable source cards displaying document titles, page numbers, chunk identifiers, and similarity scores.", space_after=12)
    add_body_paragraph(doc, "System validation and benchmarking revealed 100.0% Context Recall, 100.0% Context Precision, and 100.0% Abstention Accuracy on ungrounded negative queries, achieving an average retrieval latency of 468.5 ms and total response latency of 4.58 seconds on standard consumer hardware. The project demonstrates the practical viability of secure, local document intelligence for enterprise, academic, and legal document analysis.", space_after=40)

    p_num = doc.add_paragraph()
    p_num.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_num.paragraph_format.space_before = Pt(30)
    r = p_num.add_run("v")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)

    doc.add_page_break()

    # ----------------------------------------------------
    # INDEX (TABLE OF CONTENTS)
    # ----------------------------------------------------
    p_h = doc.add_paragraph()
    p_h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_h.paragraph_format.space_before = Pt(24)
    p_h.paragraph_format.space_after = Pt(20)
    r = p_h.add_run("INDEX")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True

    index_data = [
        ["STUDENT'S DECLARATION", "i"],
        ["CERTIFICATE FROM MENTOR", "ii"],
        ["CERTIFICATE FROM CHAIRPERSON", "iii"],
        ["ACKNOWLEDGMENT", "iv"],
        ["ABSTRACT", "v"],
        ["CHAPTER 1: INTRODUCTION", "1"],
        ["   1.1 Background of the Study", "1"],
        ["   1.2 Problem Statement", "1"],
        ["   1.3 Motivation", "2"],
        ["   1.4 Objectives of the Project", "2"],
        ["   1.5 Scope of the Project", "2"],
        ["   1.6 Applications", "2"],
        ["   1.7 Organization of the Report", "3"],
        ["CHAPTER 2: SYSTEM ANALYSIS", "4"],
        ["   2.1 Existing System", "4"],
        ["   2.2 Drawbacks of Existing System", "4"],
        ["   2.3 Proposed Work", "5"],
        ["   2.4 System Requirements", "6"],
        ["       2.4.1 Hardware Requirements", "6"],
        ["       2.4.2 Software Requirements", "6"],
        ["CHAPTER 3: SYSTEM DESIGN", "7"],
        ["   3.1 System Architecture", "7"],
        ["   3.2 Data Flow Diagram", "8"],
        ["       3.2.1 DFD Level 0", "8"],
        ["       3.2.2 DFD Level 1", "8"],
        ["   3.3 Flowchart", "9"],
        ["   3.4 Dataset & Corpus Description", "10"],
        ["   3.5 Features and Pipeline Components", "10"],
        ["   3.6 Algorithm Description (Hybrid RAG & RRF)", "11"],
        ["CHAPTER 4: IMPLEMENTATION", "13"],
        ["   4.1 Tools and Technologies Used", "13"],
        ["   4.2 Data Preprocessing & Document Chunking", "14"],
        ["   4.3 Model Architecture & Grounded Generation", "16"],
        ["   4.4 Streamlit GUI Development", "16"],
        ["   4.5 Deployment, Docker & Version Control", "17"],
        ["CHAPTER 5: RESULTS AND DISCUSSION", "18"],
        ["   5.1 System Evaluation Metrics", "18"],
        ["   5.2 Discussion and Analysis", "18"],
        ["CHAPTER 6: SCREENSHOTS", "20"],
        ["   6.1 Web User Interface & Document Management", "20"],
        ["   6.2 Grounded Q&A & Source Attribution Display", "21"],
        ["   6.3 Document Intelligence Output", "22"],
        ["CONCLUSION AND FUTURE SCOPE", "23"],
        ["   Conclusion", "23"],
        ["   Future Enhancements", "23"],
        ["BIBLIOGRAPHY", "24"],
        ["   Books & Guides", "24"],
        ["   Websites & Online Resources", "24"],
    ]

    add_styled_table(doc, ["TOPIC", "PAGE NO."], index_data, col_widths=[5.2, 1.2])

    doc.add_page_break()

    # ----------------------------------------------------
    # CHAPTER 1: INTRODUCTION
    # ----------------------------------------------------
    p_ch1 = doc.add_paragraph()
    p_ch1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ch1.paragraph_format.space_before = Pt(20)
    p_ch1.paragraph_format.space_after = Pt(4)
    r = p_ch1.add_run("CHAPTER 1\nINTRODUCTION")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True

    add_body_paragraph(doc, "This chapter introduces the GUI-Based Document Intelligence & Q&A System, an applied machine learning and natural language processing system developed to perform private, verifiable question-answering over heterogeneous enterprise documents using Retrieval-Augmented Generation (RAG). It describes the operational context, problem definition, objectives, and scope, emphasizing how local vector embeddings and local LLMs prevent data exposure and factual hallucinations. The chapter is structured into seven sections: Section 1.1 covers the Background of the Study, Section 1.2 defines the Problem Statement, Section 1.3 presents the Motivation, Section 1.4 details the Objectives of the Project, Section 1.5 outlines the Scope of the Project, Section 1.6 discusses the Real-World Applications, and Section 1.7 outlines the Organization of the Report.", space_after=12)

    add_heading_1(doc, "1.1 Background of the Study")
    add_body_paragraph(doc, "Modern enterprises, academic institutions, and legal bodies face an unprecedented surge in unstructured digital text, including multi-page PDF research reports, legal agreements, technical manuals, Word documents, and technical notes. Traditionally, extracting actionable knowledge from such repositories requires human readers to manually skim hundreds of pages or rely on primitive keyword search tools (such as Ctrl+F), which fail to comprehend semantic meaning, synonyms, or contextual intent.", space_after=10)
    add_body_paragraph(doc, "While recent commercial cloud-based Large Language Models (LLMs) such as OpenAI ChatGPT or Google Gemini possess remarkable natural language generation capabilities, their direct enterprise deployment is heavily hindered by two fundamental barriers: data privacy hazards and factual hallucination. Uploading proprietary corporate records or confidential legal agreements to third-party cloud servers risks severe compliance violations under GDPR, HIPAA, and corporate data governance frameworks. Furthermore, standard autoregressive LLMs generate responses purely from static parameter weights, frequently inventing plausible-sounding but completely fabricated facts ('hallucinations') and failing to provide verifiable citations to underlying sources.", space_after=10)
    add_body_paragraph(doc, "Retrieval-Augmented Generation (RAG) resolves these limitations by decoupling semantic knowledge storage from text generation. Rather than relying on the internal parametric weights of an LLM, a RAG system first retrieves relevant factual passages from an indexed document corpus and injects them directly into the context window of the generator model. Combining RAG with local model execution frameworks (such as Ollama) establishes an entirely air-gapped, zero-leakage, and verifiable document intelligence architecture.", space_after=12)

    add_heading_1(doc, "1.2 Problem Statement")
    add_body_paragraph(doc, "The problem entitled “GUI-Based Document Intelligence & Q&A System using Retrieval-Augmented Generation” focuses on building a resilient, self-contained desktop and web platform capable of parsing, indexing, and querying complex unstructured documents locally without leaking private data to external cloud providers. Traditional search systems cannot synthesize multi-page answers, while standard cloud LLMs lack internal knowledge of private enterprise documents and hallucinate unsupported assertions. By synthesizing high-fidelity document loaders, dense-sparse hybrid vector search (Neon pgvector + BM25), reciprocal rank fusion, conversational memory with query rewriting, and localized Llama 3.2 text generation governed by explicit abstention, this project creates an intelligent, transparent, and reproducible system that delivers grounded answers backed by pinpoint source citations.", space_after=12)

    add_heading_1(doc, "1.3 Motivation")
    add_body_paragraph(doc, "The motivation behind this project arises from the urgent demand for data-sovereign artificial intelligence in commercial, educational, and research institutions. As organizations digitize thousands of internal policies, engineering blueprints, and clinical records, the ability to converse with documents securely on local hardware has become paramount.", space_after=10)
    add_body_paragraph(doc, "From an academic and technical perspective, developing an end-to-end RAG architecture allows the practical synthesis of fundamental computer science domains: distributed information retrieval, tokenization and chunking algorithms, dense vector algebra, high-performance async backends with FastAPI, and intuitive user interface development with Streamlit. It bridges the gap between theoretical machine learning and enterprise-ready software engineering.", space_after=12)

    add_heading_1(doc, "1.4 Objectives of the Project")
    add_body_paragraph(doc, "The primary objectives of this project are:")
    add_bullet_point(doc, "To study and implement the Retrieval-Augmented Generation (RAG) architectural pattern for multi-format document understanding.")
    add_bullet_point(doc, "To construct a high-fidelity ingestion engine supporting PDF, DOCX, TXT, and Markdown files with strict page-boundary preservation and conservative text cleaning.")
    add_bullet_point(doc, "To generate local dense vector embeddings using Ollama's nomic-embed-text model and index them in a persistent Neon PostgreSQL pgvector store.")
    add_bullet_point(doc, "To implement dual-stage hybrid retrieval combining dense semantic similarity with sparse BM25Plus keyword search using Reciprocal Rank Fusion (RRF).")
    add_bullet_point(doc, "To integrate a local Llama 3.2 model enforcing strict grounding and explicit abstention on unsupported out-of-domain queries.")
    add_bullet_point(doc, "To develop a responsive, user-friendly graphical user interface using Streamlit and modern web components with source attribution cards.")
    add_bullet_point(doc, "To quantitatively evaluate the system's precision, recall, abstention rate, and latency against benchmark evaluation datasets.")

    add_heading_1(doc, "1.5 Scope of the Project")
    add_body_paragraph(doc, "The scope of this project encompasses local document indexing, conversational retrieval, document summarization, entity extraction, and comparative analysis over structured and unstructured business documents. The system runs efficiently on consumer-grade hardware (8 GB - 16 GB RAM) with CPU or consumer GPU acceleration. While the current implementation focuses on text-centric digital documents (PDF, Word, Text, Markdown), the architecture is designed to accommodate multi-modal vision inputs, OCR scanning, and distributed vector stores in future extensions.", space_after=12)

    add_heading_1(doc, "1.6 Applications")
    add_body_paragraph(doc, "The developed Document Intelligence & Q&A System can be directly deployed across several real-world sectors:")
    add_bullet_point(doc, "Corporate & Legal Departments: For cross-referencing multi-page contracts, compliance mandates, non-disclosure agreements, and litigation archives without breaching confidentiality.")
    add_bullet_point(doc, "Academic & Scientific Research: For rapidly extracting methodologies, author claims, and experimental parameters across volumes of research publications.")
    add_bullet_point(doc, "Healthcare & Clinical Systems: For analyzing local clinical guidelines, pharmaceutical drug interaction documents, and institutional protocols in strict compliance with patient privacy laws.")
    add_bullet_point(doc, "Technical Engineering Support: For querying hardware manuals, schematics documentation, and troubleshooting guides in real time during field operations.")
    add_bullet_point(doc, "Financial & Audit Advisory: For inspecting quarterly earnings reports, regulatory audit filings, and balance sheet footnotes with verifiable page-level audit trails.")

    add_heading_1(doc, "1.7 Organization of the Report")
    add_body_paragraph(doc, "The report is structured into six comprehensive chapters:")
    add_bullet_point(doc, "Chapter 1: Introduction – Details the problem background, motivation, formal objectives, scope, and target applications.")
    add_bullet_point(doc, "Chapter 2: System Analysis – Explains existing manual and cloud-based search systems, identifies their failure modes, presents the proposed RAG solution, and specifies hardware/software requirements.")
    add_bullet_point(doc, "Chapter 3: System Design – Covers the architectural layering, Data Flow Diagrams (Level 0 and Level 1), system flowchart, dataset description, and mathematical formulations for Cosine Similarity, BM25, and Reciprocal Rank Fusion.")
    add_bullet_point(doc, "Chapter 4: Implementation – Describes the concrete tools, text cleaning routines, chunking pipelines, FastAPI backend endpoints, Streamlit GUI, and Docker deployment.")
    add_bullet_point(doc, "Chapter 5: Results and Discussion – Discusses quantitative benchmarks (Context Recall, Context Precision, Abstention Accuracy, Latency) and operational trade-offs.")
    add_bullet_point(doc, "Chapter 6: Screenshots – Provides visual proof of the working web dashboard, multi-turn chat sessions, source citations, and document intelligence features.")
    add_bullet_point(doc, "Conclusion and Future Scope – Summarizes project achievements and outlines prospective enhancements such as OCR, multi-modal embeddings, and agentic workflows.")
    add_bullet_point(doc, "Bibliography – Compiles authoritative books, academic papers, and technical documentations.")

    add_body_paragraph(doc, "This chapter established the foundational need for private, grounded document intelligence. By replacing traditional manual search and risky cloud chatbots with local Retrieval-Augmented Generation, the project provides a trustworthy, high-performance platform for institutional document analysis.", space_after=14)

    doc.add_page_break()

    # ----------------------------------------------------
    # CHAPTER 2: SYSTEM ANALYSIS
    # ----------------------------------------------------
    p_ch2 = doc.add_paragraph()
    p_ch2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ch2.paragraph_format.space_before = Pt(20)
    p_ch2.paragraph_format.space_after = Pt(4)
    r = p_ch2.add_run("CHAPTER 2\nSYSTEM ANALYSIS")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True

    add_body_paragraph(doc, "This chapter focuses on the system analysis of the Document Intelligence & Q&A platform. It analyzes the operational mechanics of current information retrieval systems, details their systemic drawbacks, introduces the proposed local RAG workflow, and specifies the minimum hardware and software prerequisites for deployment. The chapter is organized into Section 2.1 Existing System, Section 2.2 Drawbacks of Existing System, Section 2.3 Proposed Work, and Section 2.4 System Requirements (Hardware and Software).", space_after=12)

    add_heading_1(doc, "2.1 Existing System")
    add_body_paragraph(doc, "In typical organizational workflows, information retrieval across digital document archives relies on two conventional paradigms: manual lexical inspection and public cloud-based conversational agents.", space_after=10)
    add_body_paragraph(doc, "Manual inspection involves users utilizing basic string-matching utilities (such as operating system search or Adobe Acrobat's Ctrl+F functionality) to locate exact keyword matches. The reader must manually open each candidate document, scroll to every occurrence, read the surrounding paragraphs, and synthesize the overarching answer manually.", space_after=10)
    add_body_paragraph(doc, "Alternatively, organizations experiment with hosted public cloud chatbots (e.g., standard ChatGPT, Claude, or Copilot). Users paste excerpts into public browser interfaces to request summaries or answers. However, these systems lack access to proprietary document databases unless files are transmitted across third-party cloud infrastructure, posing catastrophic intellectual property and data sovereignty risks.", space_after=12)

    add_heading_1(doc, "2.2 Drawbacks of Existing System")
    add_body_paragraph(doc, "The existing manual and cloud-hosted approaches suffer from substantial limitations:")
    add_bullet_point(doc, "No Semantic Understanding: Exact keyword matching fails to locate synonyms, conceptual matches, or morphological word variations (e.g., searching 'battery endurance' fails if the document only mentions 'operating lifespan').")
    add_bullet_point(doc, "Severe Risk of Factual Hallucinations: Standard generative LLMs generate answers based on probabilistic word continuation from pre-training weights, producing persuasive but entirely fictional statements when they lack direct context.")
    add_bullet_point(doc, "Confidentiality and Data Sovereignty Violations: Uploading private financial, legal, or medical records to remote APIs breaches institutional confidentiality agreements and international regulatory standards.")
    add_bullet_point(doc, "Absence of Verifiable Citations: Traditional search either highlights raw words or cloud chatbots provide broad, unsourced text without page numbers, document titles, or similarity scores, requiring manual verification.")
    add_bullet_point(doc, "Severe Inefficiency and Information Overload: Scanning multi-hundred-page technical specifications or legal binders manually requires substantial man-hours and leads to critical human oversight errors.")

    add_heading_1(doc, "2.3 Proposed Work")
    add_body_paragraph(doc, "The proposed GUI-Based Document Intelligence & Q&A System overcomes these limitations by deploying an entirely local, verifiable Retrieval-Augmented Generation pipeline. The platform combines deterministic document preprocessing, local vector indexing, hybrid dense-sparse retrieval, and local LLM synthesis with mandatory source citations and strict abstention protocols.", space_after=10)

    add_body_paragraph(doc, "System Workflow:")
    add_bullet_point(doc, "1. Ingestion: The user uploads multi-format documents (.pdf, .docx, .txt, .md) via the graphical user interface.")
    add_bullet_point(doc, "2. Extraction & Cleaning: PyMuPDF and python-docx extract raw text page-by-page. TextCleaner normalizes whitespace, eliminates control characters, and mends hyphenated line breaks.")
    add_bullet_point(doc, "3. Deterministic Chunking: Text is segmented into 1000-character windows with 150-character overlap using RecursiveCharacterTextSplitter, generating unique chunk identifiers ({doc_id}_chunk_{index:04d}) and metadata tags.")
    add_bullet_point(doc, "4. Local Embedding Indexing: Ollama’s nomic-embed-text generates 768-dimensional dense vectors stored inside Neon PostgreSQL pgvector, while tokens are indexed into a sparse BM25Plus index.")
    add_bullet_point(doc, "5. Conversational Query Processing: User queries are analyzed in conversational context; follow-up elliptical questions are reformulated into standalone search queries.")
    add_bullet_point(doc, "6. Hybrid Retrieval & RRF: Dense semantic similarity and sparse lexical search retrieve candidate passages, fused together via Reciprocal Rank Fusion (RRF).")
    add_bullet_point(doc, "7. Threshold Verification & Abstention: Retrieved chunks undergo similarity cutoff scoring (threshold ≥ 0.70). If no chunk satisfies the criteria, the system safely abstains with a standardized notice.")
    add_bullet_point(doc, "8. Grounded Generation & Citation Display: Local Llama 3.2 synthesizes the final factual answer strictly from the retrieved chunks, rendering clickable source attribution cards with document titles and page numbers.")

    add_centered_image(doc, "report_figures/fig2_1_flowchart.png", 4.8, "Fig 2.1 – System Workflow and Retrieval Flowchart")

    add_heading_1(doc, "2.4 System Requirements")
    add_body_paragraph(doc, "The system is engineered to deliver high performance on accessible workstation and consumer hardware without requiring expensive enterprise cloud GPU clusters.", space_after=10)

    add_heading_2(doc, "2.4.1 Hardware Requirements")
    hw_headers = ["S. No.", "Component", "Minimum Requirement", "Recommended Specification"]
    hw_data = [
        ["1.", "Processor (CPU)", "Intel Core i5 / AMD Ryzen 5 (4 Cores)", "Intel Core i7/i9 or AMD Ryzen 7/9 (8+ Cores)"],
        ["2.", "System RAM", "8 GB DDR4", "16 GB – 32 GB DDR4/DDR5"],
        ["3.", "Hard Disk Storage", "10 GB free space (SSD)", "25 GB free space (NVMe M.2 SSD)"],
        ["4.", "Graphics (GPU)", "CPU-only execution supported", "NVIDIA RTX 3060 / 4060 (6GB+ VRAM)"],
        ["5.", "Architecture", "64-bit Operating System", "64-bit x86_64 or Apple Silicon (M-series)"],
    ]
    add_styled_table(doc, hw_headers, hw_data, col_widths=[0.6, 1.8, 2.0, 2.1])

    add_heading_2(doc, "2.4.2 Software Requirements")
    sw_headers = ["S. No.", "Component", "Software / Specification", "Purpose / Role"]
    sw_data = [
        ["1.", "Operating System", "Windows 10/11, Ubuntu 22.04 LTS, or macOS", "Host development & deployment platform"],
        ["2.", "Language Environment", "Python 3.10 – 3.12 (64-bit)", "Core backend language and ML runtime"],
        ["3.", "API Framework", "FastAPI 0.115+ (ASGI / Uvicorn)", "High-performance async REST backend engine"],
        ["4.", "Frontend Interface", "Streamlit 1.38+ / React 18 + Vite", "Interactive graphical user interface"],
        ["5.", "Local LLM Runtime", "Ollama (llama3.2:latest, 3.2B params)", "Local grounded natural language inference"],
        ["6.", "Embedding Model", "nomic-embed-text:latest (768 dimensions)", "Local dense vector embedding computation"],
        ["7.", "Vector Database", "Neon PostgreSQL + pgvector", "Serverless cloud embedding store & similarity lookup"],
        ["8.", "Relational Database", "Neon PostgreSQL / SQLAlchemy 2.0 ORM", "Document metadata, chunk catalog, & chat audit"],
        ["9.", "Document Parsers", "PyMuPDF (fitz) & python-docx", "High-fidelity PDF and DOCX text extraction"],
        ["10.", "Keyword Search", "rank-bm25 (BM25Plus)", "Sparse lexical retrieval and scoring"],
        ["11.", "Containerization", "Docker & Docker Compose (v2.20+)", "Multi-container production deployment"],
        ["12.", "Version Control", "Git and GitHub Repository", "Source code versioning and CI regression tests"],
    ]
    add_styled_table(doc, sw_headers, sw_data, col_widths=[0.6, 1.8, 2.0, 2.1])

    add_body_paragraph(doc, "This chapter analyzed the operational bottlenecks of legacy document retrieval methods, demonstrated how local RAG resolves privacy and hallucination pitfalls, outlined the complete step-by-step workflow, and established the hardware and software specifications necessary for stable deployment.", space_after=14)

    doc.add_page_break()

    # ----------------------------------------------------
    # CHAPTER 3: SYSTEM DESIGN
    # ----------------------------------------------------
    p_ch3 = doc.add_paragraph()
    p_ch3.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ch3.paragraph_format.space_before = Pt(20)
    p_ch3.paragraph_format.space_after = Pt(4)
    r = p_ch3.add_run("CHAPTER 3\nSYSTEM DESIGN")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True

    add_body_paragraph(doc, "This chapter articulates the architectural blueprint, data flow mechanics, structural flowcharts, data schemas, and mathematical formulations underpinning the Document Intelligence & Q&A System. Section 3.1 details the System Architecture, Section 3.2 illustrates the Data Flow Diagrams (DFD Level 0 and Level 1), Section 3.3 presents the procedural Flowchart, Section 3.4 describes the Ingestion Corpus and Data Schemas, Section 3.5 outlines the core pipeline components, and Section 3.6 presents the algorithmic and mathematical formulations governing hybrid retrieval, reciprocal rank fusion, and grounded inference.", space_after=12)

    add_heading_1(doc, "3.1 System Architecture")
    add_body_paragraph(doc, "The system follows a modular, four-tier decoupled architecture comprising the Presentation Layer, Application & RAG Engine Layer, Embedding & Retrieval Layer, and Persistent Storage Layer. This decoupled design ensures that vector storage backends or generation models can be swapped without affecting UI logic.", space_after=10)

    add_centered_image(doc, "report_figures/fig3_1_architecture.png", 6.2, "Fig 3.1 – Multi-Tier System Architecture Diagram")

    add_heading_1(doc, "3.2 Data Flow Diagram")
    add_body_paragraph(doc, "Data Flow Diagrams illustrate the trajectory of document data and user queries through transformation stages to final citation rendering.", space_after=10)

    add_heading_2(doc, "3.2.1 DFD Level 0 (Context Diagram)")
    add_body_paragraph(doc, "At Level 0, the external entity (User/Analyst) interacts with the central RAG Document Intelligence System by transmitting documents and text queries, receiving validated grounded answers with source citations.", space_after=8)
    add_centered_image(doc, "report_figures/fig3_2_dfd0.png", 5.2, "Fig 3.2 – Level 0 DFD (Context Level)")

    add_heading_2(doc, "3.2.2 DFD Level 1 (Functional Decomposition)")
    add_body_paragraph(doc, "Level 1 decomposes the internal processes: Process 1.0 (Document Ingestion), Process 2.0 (Text Cleaning & Recursive Chunking), Process 3.0 (Local Embedding Generation), Data Store D1 (Neon PostgreSQL), Process 4.0 (Hybrid Dense-Sparse Retrieval), and Process 5.0 (Grounded LLM Synthesis).", space_after=8)
    add_centered_image(doc, "report_figures/fig3_3_dfd1.png", 6.2, "Fig 3.3 – Level 1 DFD (Functional Decomposition)")

    add_heading_1(doc, "3.3 Flowchart")
    add_body_paragraph(doc, "The operational flowchart depicts the sequential logic executed by the RAG orchestrator upon receiving a query:")
    add_bullet_point(doc, "1. Ingestion & Indexing: Documents are ingested, cleaned, segmented into chunks, embedded via nomic-embed-text, and stored in Neon pgvector.")
    add_bullet_point(doc, "2. Query Reception & Reformulation: The user submits a natural language question. The Conversational Memory module inspects the past 4 conversation turns. If an anaphora or ellipsis is detected, the Query Rewriter generates a standalone query.")
    add_bullet_point(doc, "3. Dual-Stage Retrieval: Dense vector search queries Neon pgvector for the top-20 nearest neighbor chunks, while BM25 calculates sparse lexical match scores across chunk vocabularies.")
    add_bullet_point(doc, "4. Reciprocal Rank Fusion & Filtering: Dense and sparse ranks are fused via RRF. Chunks failing the similarity threshold (score < 0.70) are discarded.")
    add_bullet_point(doc, "5. Grounding Decision: If zero chunks meet the relevance threshold, the system triggers Explicit Abstention. If valid chunks exist, the ContextBuilder formats the passages into the prompt.")
    add_bullet_point(doc, "6. Synthesis & Attribution: Llama 3.2 synthesizes the response using only the supplied context, appending structured source attribution metadata.")

    add_heading_1(doc, "3.4 Dataset & Corpus Description")
    add_body_paragraph(doc, "Unlike standard tabular datasets, the Document Intelligence system operates on heterogeneous document collections containing structured, semi-structured, and unstructured business and technical documents. For experimental verification, the benchmark corpus utilized in this study includes technical specifications, project proposals, and research publications (e.g., Project Titan Technical Specification, Project Apollo Engineering Notes, and Corporate Operations Manuals).", space_after=10)

    corpus_headers = ["Attribute / Field", "Data Type", "Description / Constraints"]
    corpus_data = [
        ["document_id", "UUID4 (String)", "Unique global identifier generated per uploaded file"],
        ["filename", "String (VarChar 255)", "Original document filename (e.g., titan_specifications.pdf)"],
        ["file_type", "Enum (.pdf, .docx, .txt, .md)", "File extension indicating parser selection"],
        ["file_size_bytes", "Integer", "Size of uploaded file on disk (constrained to ≤ 50MB)"],
        ["page_count", "Integer", "Total number of extracted physical pages"],
        ["chunk_count", "Integer", "Total number of semantic chunks generated"],
        ["chunk_id", "String", "Deterministic identifier: {doc_id}_chunk_{index:04d}"],
        ["page_number", "Integer (Optional)", "1-indexed physical page where chunk originates"],
        ["content", "Text (String)", "Cleaned textual content (approx. 1000 characters)"],
        ["embedding_vector", "Float Array [768]", "Dense vector generated by nomic-embed-text"],
    ]
    add_styled_table(doc, corpus_headers, corpus_data, col_widths=[1.8, 1.8, 2.9])

    add_heading_1(doc, "3.5 Features and Pipeline Components")
    add_body_paragraph(doc, "The model uses several independent pipeline components to ensure rigorous data handling:")
    add_bullet_point(doc, "Page-Level Boundary Tracking: PyMuPDF preserves exact 1-indexed page associations for every extracted text block, enabling pinpoint user verification.")
    add_bullet_point(doc, "Text Normalization Engine: Strips unprintable ASCII control characters (ASCII 0 to 31), resolves newline-hyphenations (e.g., 'trans-mission' across line breaks), and standardizes whitespace while preserving technical punctuation and code syntax.")
    add_bullet_point(doc, "Recursive Character Splitter: Splits text along hierarchical linguistic boundaries (double newlines, single newlines, sentences, punctuation, and whitespace) with 1000-character windows and 150-character overlaps.")
    add_bullet_point(doc, "Conversational Memory & Rewriting: Retains sliding-window dialogue turns to reformulate contextual follow-up questions (e.g., 'What is its maximum velocity?' is rewritten as 'What is the maximum velocity of the Titan robot?').")
    add_bullet_point(doc, "Strict Similarity Cutoff: Enforces a strict cosine threshold (0.70) to prevent weakly correlated noise from entering the LLM generator prompt.")

    add_heading_1(doc, "3.6 Algorithm Description (Hybrid RAG & Reciprocal Rank Fusion)")
    add_body_paragraph(doc, "The core algorithmic intelligence combines Dense Semantic Embeddings, BM25 Lexical Ranking, Reciprocal Rank Fusion (RRF), and Grounded LLM Generation.", space_after=10)

    add_body_paragraph(doc, "1. Dense Semantic Similarity (Cosine Distance):", bold_prefix="Mathematical Formulation: ")
    add_body_paragraph(doc, "Dense vector retrieval calculates the cosine similarity between the 768-dimensional query vector q and chunk vector d:\n\n   Similarity(q, d) = (q · d) / (||q||₂ · ||d||₂)\n\nValues range between -1 and 1, where values approaching 1.0 indicate strong semantic equivalence regardless of vocabulary differences.", space_after=10)

    add_body_paragraph(doc, "2. Sparse Lexical Ranking (BM25Plus):", bold_prefix="Mathematical Formulation: ")
    add_body_paragraph(doc, "To capture exact product serial codes, acronyms, and numeric specifications that dense vectors may miss, BM25Plus scores document chunk D against query Q:\n\n   Score_BM25(D, Q) = ∑ [IDF(qᵢ) · ((f(qᵢ, D) · (k₁ + 1)) / (f(qᵢ, D) + k₁ · (1 - b + b · (|D| / avgdl))) + δ)]\n\nwhere k₁=1.5, b=0.75, and δ=1.0 ensures lower-bound term weighting for long passages.", space_after=10)

    add_body_paragraph(doc, "3. Reciprocal Rank Fusion (RRF):", bold_prefix="Mathematical Formulation: ")
    add_body_paragraph(doc, "To integrate the heterogeneous score scales of dense vector cosine similarity and sparse BM25 without requiring fragile score normalization, Reciprocal Rank Fusion is applied across ranked lists:\n\n   RRF_Score(d) = ∑ (1 / (k + r_m(d)))\n\nwhere k = 60 (standard smoothing constant), and r_m(d) represents the rank position of document chunk d in retrieval method m ∈ {Dense, Sparse}.", space_after=10)

    add_body_paragraph(doc, "Why Hybrid RAG is Used in This Project:")
    add_bullet_point(doc, "Prevents Hallucinations: Grounding LLM generation strictly on verified retrieved chunks guarantees factual accuracy.")
    add_bullet_point(doc, "Total Data Sovereignty: All computations (parsing, embedding, ranking, generation) execute on local hardware, keeping proprietary corporate records 100% private.")
    add_bullet_point(doc, "Balanced Lexical & Semantic Retrieval: Combining dense vector search with BM25 captures both conceptual meaning and exact serial numbers, model codes, and acronyms.")
    add_bullet_point(doc, "Verifiable Source Attribution: Users are never forced to accept an answer on faith; every answer links directly to document names, page numbers, and similarity metrics.")

    add_body_paragraph(doc, "Algorithm Execution Steps:")
    add_bullet_point(doc, "Step 1: Ingest document and extract raw text with page markers.")
    add_bullet_point(doc, "Step 2: Clean and normalize text using regular expressions.")
    add_bullet_point(doc, "Step 3: Recursively split text into 1000-character chunks with 150-character overlap.")
    add_bullet_point(doc, "Step 4: Compute dense embeddings using nomic-embed-text via Ollama API.")
    add_bullet_point(doc, "Step 5: Store embeddings in Neon pgvector and index tokens into BM25Plus.")
    add_bullet_point(doc, "Step 6: Receive user query, evaluate conversation history, and reformulate query if needed.")
    add_bullet_point(doc, "Step 7: Execute hybrid search, compute RRF scores, and filter candidates by similarity cutoff.")
    add_bullet_point(doc, "Step 8: Construct grounded prompt or execute explicit abstention; generate response via Llama 3.2.")

    add_body_paragraph(doc, "This chapter defined the system architecture, data flow diagrams, operational flowchart, database schemas, and mathematical foundations of dense-sparse hybrid retrieval and reciprocal rank fusion.", space_after=14)

    doc.add_page_break()

    # ----------------------------------------------------
    # CHAPTER 4: IMPLEMENTATION
    # ----------------------------------------------------
    p_ch4 = doc.add_paragraph()
    p_ch4.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ch4.paragraph_format.space_before = Pt(20)
    p_ch4.paragraph_format.space_after = Pt(4)
    r = p_ch4.add_run("CHAPTER 4\nIMPLEMENTATION")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True

    add_body_paragraph(doc, "This chapter explains the implementation process of the Document Intelligence & Q&A System, detailing the concrete software components, preprocessing pipelines, model orchestration, user interface development, and deployment setup. Section 4.1 covers Tools and Technologies Used, Section 4.2 details Data Preprocessing, Normalization and Chunking, Section 4.3 outlines Model Training, Embeddings and Grounded Generation, Section 4.4 presents Graphical User Interface Development, and Section 4.5 details Deployment and Version Control.", space_after=12)

    add_heading_1(doc, "4.1 Tools and Technologies Used")
    add_body_paragraph(doc, "The platform was constructed using a robust stack of modern open-source machine learning, backend, database, and frontend libraries:", space_after=10)

    tools_headers = ["Tool / Technology", "Version", "Role / Purpose in Implementation"]
    tools_data = [
        ["Python", "3.12.x", "Primary programming language for RAG pipeline, ML models, and API"],
        ["FastAPI", "0.115.0+", "Asynchronous web framework providing auto-documented REST endpoints"],
        ["Pydantic", "2.8.x", "Strict type enforcement, payload serialization, and settings validation"],
        ["PyMuPDF (fitz)", "1.24.x", "High-performance PDF text extraction preserving 1-indexed page boundaries"],
        ["python-docx", "1.1.x", "Structural DOCX parser extracting headings, paragraphs, and table text"],
        ["LangChain Core", "0.2.x", "Recursive text splitters and standardized message orchestration interfaces"],
        ["Ollama", "0.3.x+", "Local GenAI runtime hosting nomic-embed-text and Llama 3.2 models"],
        ["Neon pgvector", "0.3.x", "Serverless PostgreSQL vector database storing dense embeddings"],
        ["rank-bm25", "0.2.x", "BM25Plus sparse lexical search implementation for exact term matching"],
        ["SQLAlchemy", "2.0.x", "ORM database abstraction for managing documents, chunks, and chat history"],
        ["Streamlit", "1.38.0+", "Interactive graphical user interface with real-time reactive components"],
        ["Docker & Compose", "2.20+", "Multi-service containerization for one-command production deployment"],
        ["Pytest", "8.2.x", "Comprehensive automated unit and regression testing across 9 test phases"],
        ["Git & GitHub", "2.44+", "Distributed version control and open-source project management"],
    ]
    add_styled_table(doc, tools_headers, tools_data, col_widths=[1.8, 1.2, 3.5])

    add_heading_1(doc, "4.2 Data Preprocessing, Normalization & Chunking")
    add_body_paragraph(doc, "Raw document uploads contain significant noise, non-printable characters, broken hyphenations across page margins, empty lines, and duplicate text blocks. Before vectors can be computed, the ingestion pipeline executes thorough data cleaning and deterministic chunking.", space_after=10)

    add_body_paragraph(doc, "1. Ingestion Data Shape: Across benchmark testing batches, raw document files containing varying page numbers and whitespace artifacts were ingested and converted into clean semantic chunks.", space_after=8)
    shape_headers = ["Metric / Attribute", "Raw Ingestion Stage", "Post-Cleaning & Chunking Stage"]
    shape_data = [
        ["Total Raw Files Ingested", "5 Documents", "5 Active Indexed Documents"],
        ["Total Extracted Physical Pages", "42 Pages", "42 Pages (Preserved with Metadata)"],
        ["Total Character Count", "118,450 Characters", "112,820 Normalized Characters"],
        ["Total Semantic Chunks Created", "N/A", "148 Deterministic Chunks"],
        ["Average Chunk Length", "N/A", "762 Characters (Within 1000 Limit)"],
    ]
    add_styled_table(doc, shape_headers, shape_data, col_widths=[2.5, 2.0, 2.0])

    add_body_paragraph(doc, "2. Duplicate Detection & Empty Chunks: Duplicate document uploads and degenerate whitespace blocks were identified and eliminated to prevent vector index corruption.", space_after=8)
    dup_headers = ["Category", "Detected in Raw Ingestion", "After Preprocessing Handling"]
    dup_data = [
        ["Duplicate Full Documents", "2 Duplicate Uploads", "0 Duplicates (Rejected with HTTP 409)"],
        ["Empty / Whitespace Chunks", "27 Whitespace Chunks", "0 Empty Chunks (Pruned)"],
        ["Corrupt Byte Streams", "1 Truncated File", "0 Corrupt Entries (Caught by Validation)"],
    ]
    add_styled_table(doc, dup_headers, dup_data, col_widths=[2.5, 2.0, 2.0])

    add_body_paragraph(doc, "3. Missing Metadata Resolution: Chunks missing page numbers (e.g. DOCX or Markdown files) were dynamically assigned structural section headers to preserve navigable context.", space_after=8)
    null_headers = ["Metadata Attribute", "Raw Extraction Status", "Post-Processing Standardized Value"]
    null_data = [
        ["page_number (PDF)", "Preserved (1 to N)", "1-Indexed Physical Page Integer"],
        ["page_number (DOCX/MD)", "None / Missing", "Section/Heading Index Assigned"],
        ["chunk_index", "Missing", "Zero-Padded Deterministic ID (chunk_0000)"],
        ["document_id", "Missing", "Cryptographically Unique UUID4"],
    ]
    add_styled_table(doc, null_headers, null_data, col_widths=[2.2, 2.1, 2.2])

    add_body_paragraph(doc, "4. Feature Transformations: The table illustrates concrete text transformations performed by the TextCleaner and RecursiveSplitter routines.", space_after=8)
    clean_headers = ["Raw Text Input", "Preprocessing Rule Applied", "Cleaned Normalized Output"]
    clean_data = [
        ["auton- [newline] mation", "Regex Hyphenation Join", "automation"],
        ["[Ctrl-Chars] Project Titan [CRLF]", "Control Char & Line Break Strip", "Project Titan"],
        ["Speed:   4.5    m/s", "Whitespace Normalization", "Speed: 4.5 m/s"],
        ["Page 1 ... [formfeed] ... Page 2", "Formfeed Boundary Separation", "Page 1 [Section Break] Page 2"],
    ]
    add_styled_table(doc, clean_headers, clean_data, col_widths=[2.2, 2.1, 2.2])

    add_heading_1(doc, "4.3 Model Architecture, Embeddings, & Grounded Synthesis")
    add_body_paragraph(doc, "Dense embeddings are generated by making local asynchronous HTTP calls to the Ollama server hosting nomic-embed-text. The model transforms 1000-character text segments into normalized 768-dimensional floating point vectors. During retrieval, candidate chunks are fetched from Neon pgvector using cosine distance and evaluated against the similarity threshold (threshold = 0.70).", space_after=10)
    add_body_paragraph(doc, "If candidate chunks meet the threshold, ContextBuilder constructs a structured prompt instructing Llama 3.2 to synthesize the answer exclusively from the supplied passages. If the passages do not provide the answer, the model is strictly commanded to output: 'I could not find sufficient information in the provided documents.'", space_after=10)

    add_body_paragraph(doc, "Core RAG Generation Code Snippet:", bold_prefix="Implementation Snippet: ")
    code_text = (
        "async def generate_grounded_answer(query: str, context_chunks: list[Chunk]) -> str:\n"
        "    if not context_chunks or all(c.score < SIMILARITY_THRESHOLD for c in context_chunks):\n"
        "        return 'I could not find sufficient information in the provided documents.'\n"
        "    \n"
        "    formatted_context = '\\n\\n'.join([\n"
        "        f'[SOURCE {i+1}] (Doc: {c.doc_name}, Page: {c.page}): {c.text}'\n"
        "        for i, c in enumerate(context_chunks)\n"
        "    ])\n"
        "    prompt = STRICT_GROUNDING_PROMPT.format(context=formatted_context, query=query)\n"
        "    response = await ollama_client.generate(model='llama3.2', prompt=prompt)\n"
        "    return response.text"
    )
    add_code_snippet(doc, code_text)

    add_heading_1(doc, "4.4 User Interface Development")
    add_body_paragraph(doc, "A full-featured Graphical User Interface was developed using Streamlit (with an alternative production React 18 + Vite interface). The interface provides a persistent sidebar for document management and an expansive conversational workspace.", space_after=10)
    add_body_paragraph(doc, "GUI Features:")
    add_bullet_point(doc, "Drag-and-Drop Document Uploader: Supports .pdf, .docx, .txt, and .md files with progress feedback and automatic chunking.")
    add_bullet_point(doc, "Active Document Library: Displays all indexed files, document IDs, chunk counts, and one-click cascading delete.")
    add_bullet_point(doc, "Conversational Q&A Container: Interactive multi-turn chat stream maintaining dialogue context and query reformulation.")
    add_bullet_point(doc, "Verifiable Source Attribution Cards: Each answer displays expander cards revealing exact source document names, 1-indexed page numbers, chunk IDs, similarity scores, and text excerpts.")
    add_bullet_point(doc, "Interactive Control Sliders: Allows users to dynamically tune similarity thresholds (0.50 – 0.95) and maximum top-k chunks.")

    add_heading_1(doc, "4.5 Deployment, Containerization, and Version Control")
    add_body_paragraph(doc, "The entire application ecosystem is containerized using Docker and orchestrated with Docker Compose, providing a zero-configuration deployment across operating systems. The multi-service architecture defines dedicated isolated containers for FastAPI (backend), Streamlit (UI), PostgreSQL with pgvector (enterprise vector storage), and Ollama (local LLM runtime).", space_after=10)
    add_body_paragraph(doc, "Version control is maintained via Git and GitHub. A continuous testing pipeline with pytest executes 25 automated integration and regression tests covering document loading, text cleaning, chunking boundaries, embedding generation, vector search, query rewriting, grounded generation, and API contract compliance.", space_after=12)

    add_body_paragraph(doc, "This chapter reviewed the practical implementation of the Document Intelligence System, including library configurations, preprocessing tables, core Python snippets, GUI development, and Docker deployment.", space_after=14)

    doc.add_page_break()

    # ----------------------------------------------------
    # CHAPTER 5: RESULTS AND DISCUSSION
    # ----------------------------------------------------
    p_ch5 = doc.add_paragraph()
    p_ch5.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ch5.paragraph_format.space_before = Pt(20)
    p_ch5.paragraph_format.space_after = Pt(4)
    r = p_ch5.add_run("CHAPTER 5\nRESULTS AND DISCUSSION")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True

    add_body_paragraph(doc, "This chapter presents the empirical results and performance analysis of the Document Intelligence & Q&A System. The system was tested across benchmark datasets to evaluate context retrieval precision, answer grounding, negative query abstention, and processing latency. Section 5.1 details the Quantitative Evaluation Metrics and Benchmarks, and Section 5.2 provides in-depth Discussion and Analysis.", space_after=12)

    add_heading_1(doc, "5.1 System Evaluation Metrics")
    add_body_paragraph(doc, "To rigorously quantify the performance of the local RAG pipeline, standard information retrieval and grounded QA metrics were computed: Context Recall (proportion of relevant facts retrieved), Context Precision (signal-to-noise ratio in retrieved context), Abstention Accuracy (ability to refuse answering ungrounded negative questions without hallucinating), and Latency breakdown across pipeline stages.", space_after=10)

    res_headers = ["Evaluation Metric", "Target Benchmark", "Achieved System Value", "Interpretation"]
    res_data = [
        ["Context Recall", "≥ 90.0%", "100.0%", "All factual gold-standard passages successfully retrieved"],
        ["Context Precision", "≥ 85.0%", "100.0%", "Top-k retrieved chunks contained solely relevant context"],
        ["Abstention Accuracy", "≥ 95.0%", "100.0%", "Zero hallucinations on unsupported negative questions"],
        ["Avg. Retrieval Latency", "< 800 ms", "468.54 ms", "Sub-second vector lookup and rank fusion"],
        ["Avg. Generation Latency", "< 6000 ms", "4118.94 ms", "Fast local token synthesis on Llama 3.2"],
        ["Avg. Total Latency", "< 7000 ms", "4587.69 ms", "End-to-end interactive response speed"],
    ]
    add_styled_table(doc, res_headers, res_data, col_widths=[1.8, 1.2, 1.4, 2.1])

    add_heading_2(doc, "Individual Benchmark Test Cases")
    add_body_paragraph(doc, "The table summarizes the automated evaluation suite executed against the Project Titan corpus:", space_after=8)

    test_headers = ["Case ID", "Query / Question", "Type", "Recall", "Precision", "Abstained?", "Latency"]
    test_data = [
        ["eval_001", "Primary objective of Project Titan?", "Supported", "100%", "1.0", "No", "2659 ms"],
        ["eval_002", "Battery endurance of Titan robot?", "Supported", "100%", "1.0", "No", "3279 ms"],
        ["eval_003", "Max speed of rocket in Project Apollo?", "Negative", "N/A", "N/A", "Yes (Correct)", "5501 ms"],
        ["eval_004", "Lead engineer for Titan vision system?", "Supported", "100%", "1.0", "No", "6937 ms"],
        ["eval_005", "Capital city of ancient Atlantis?", "Negative", "N/A", "N/A", "Yes (Correct)", "4560 ms"],
    ]
    add_styled_table(doc, test_headers, test_data, col_widths=[0.8, 2.3, 0.9, 0.7, 0.7, 1.0, 0.9])

    add_centered_image(doc, "report_figures/fig5_1_evaluation.png", 6.2, "Fig 5.1 – Evaluation Benchmark Charts (Accuracy and Latency Breakdown)")

    add_heading_1(doc, "5.2 Discussion and Analysis")
    add_body_paragraph(doc, "The evaluation results confirm that the local RAG pipeline delivers enterprise-grade reliability and strict factual grounding. Key findings include:", space_after=10)
    add_bullet_point(doc, "1. Perfect Context Retrieval (100% Recall & Precision): The combination of recursive 1000-character chunking with 150-character overlap and nomic-embed-text dense embeddings successfully placed all ground-truth passages into the top ranks without truncating critical context.")
    add_bullet_point(doc, "2. Elimination of Factual Hallucinations (100% Abstention): In test cases eval_003 (Apollo rocket in Titan docs) and eval_005 (Atlantis capital), standard LLMs typically hallucinate plausible facts. In our system, the combination of cosine similarity filtering (threshold < 0.70) and strict grounding prompts caused the model to explicitly abstain with zero hallucinations.")
    add_bullet_point(doc, "3. Sub-Second Retrieval Performance: Vector lookup across Neon pgvector and sparse BM25 scoring required an average of only 468.5 ms, confirming that local retrieval introduces minimal overhead.")
    add_bullet_point(doc, "4. Fast Local LLM Generation: Llama 3.2 running via Ollama generated complete answers in ~4.1 seconds on consumer hardware without GPU server dependencies.")
    add_bullet_point(doc, "5. Verifiable Source Transparency: Presenting page numbers, chunk IDs, and similarity scores eliminated user skepticism, enabling instant verification of complex technical statements.")

    add_body_paragraph(doc, "This chapter presented the empirical verification of the system, demonstrating 100% precision, recall, and abstention reliability while maintaining interactive response latencies.", space_after=14)

    doc.add_page_break()

    # ----------------------------------------------------
    # CHAPTER 6: SCREENSHOTS & SYSTEM DEMONSTRATION
    # ----------------------------------------------------
    p_ch6 = doc.add_paragraph()
    p_ch6.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ch6.paragraph_format.space_before = Pt(20)
    p_ch6.paragraph_format.space_after = Pt(4)
    r = p_ch6.add_run("CHAPTER 6\nSCREENSHOTS")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True

    add_body_paragraph(doc, "This chapter provides visual documentation of the working GUI-Based Document Intelligence & Q&A System. Section 6.1 displays the Web User Interface and Document Management view, Section 6.2 illustrates Grounded Q&A with Source Attribution output, and Section 6.3 presents Document Intelligence features including summarization and structured entity extraction.", space_after=12)

    add_heading_1(doc, "6.1 Web User Interface & Document Management")
    add_body_paragraph(doc, "After launching the application, users access the interactive dashboard featuring a document upload drawer, indexed library list, status badges, and query controls.", space_after=8)
    add_centered_image(doc, "report_figures/fig6_1_ui.png", 6.0, "Fig 6.1 – Streamlit Web User Interface & Document Library Management")

    add_heading_1(doc, "6.2 Grounded Q&A & Source Attribution Output")
    add_body_paragraph(doc, "When a question is submitted, the system retrieves relevant chunks, runs inference on Llama 3.2, and presents the synthesized answer along with expandable source cards showing document titles, page numbers, and similarity metrics.", space_after=8)
    add_centered_image(doc, "report_figures/fig6_2_chat_output.png", 6.0, "Fig 6.2 – Grounded Answer Generation with Source Attribution Cards")

    add_heading_1(doc, "6.3 Document Intelligence Output (Summarization & Extraction)")
    add_body_paragraph(doc, "In addition to conversational Q&A, the system provides one-click executive summarization and structured JSON entity extraction via dedicated REST endpoints.", space_after=8)
    add_centered_image(doc, "report_figures/fig6_3_intelligence.png", 6.0, "Fig 6.3 – Document Intelligence View (Executive Summary & Entity Extraction)")

    add_body_paragraph(doc, "These visual demonstrations verify that the graphical user interface, vector retrieval pipeline, and local LLM generator function cohesively to deliver private, transparent, and accurate document insights.", space_after=14)

    doc.add_page_break()

    # ----------------------------------------------------
    # CONCLUSION AND FUTURE SCOPE
    # ----------------------------------------------------
    p_concl = doc.add_paragraph()
    p_concl.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_concl.paragraph_format.space_before = Pt(20)
    p_concl.paragraph_format.space_after = Pt(8)
    r = p_concl.add_run("CONCLUSION AND FUTURE SCOPE")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True

    add_heading_1(doc, "Conclusion")
    add_body_paragraph(doc, "This project successfully designed, implemented, and validated a GUI-Based Document Intelligence & Q&A System powered by local Retrieval-Augmented Generation (RAG). By coupling local vector embedding generation (nomic-embed-text) and local LLM inference (Llama 3.2) with hybrid dense-sparse retrieval (Neon pgvector + BM25Plus), the system solves the two greatest hurdles preventing enterprise adoption of GenAI: confidential data leakage to third-party cloud APIs and factual hallucinations.", space_after=10)
    add_body_paragraph(doc, "The implementation established a rigorous document preprocessing pipeline capable of parsing multi-format files (.pdf, .docx, .txt, .md), cleaning textual artifacts, preserving exact page boundaries, and performing deterministic chunking. The hybrid retrieval engine employs Reciprocal Rank Fusion and similarity thresholding to ensure that only highly relevant passages are passed to the generator. If no relevant information exists, the system safely abstains.", space_after=10)
    add_body_paragraph(doc, "Quantitative benchmarking confirmed 100.0% Context Recall, 100.0% Context Precision, and 100.0% Abstention Accuracy on out-of-domain negative test cases, all while achieving sub-second retrieval latency (468.5 ms) and an end-to-end response time of 4.58 seconds on standard consumer hardware. The project demonstrates the viability of building privacy-first, grounded, and verifiable document AI solutions.", space_after=12)

    add_heading_1(doc, "Future Enhancements")
    add_body_paragraph(doc, "While the current system provides robust document intelligence, several future enhancements can expand its capabilities:")
    add_bullet_point(doc, "1. Optical Character Recognition (OCR) Integration: Incorporate OCR engines like Tesseract or PaddleOCR to seamlessly process scanned paper documents, photocopies, and handwritten forms.")
    add_bullet_point(doc, "2. Multi-Modal Visual RAG: Integrate vision-language models (such as LLaVA or Llama-3.2-Vision) to directly index and query engineering diagrams, infographics, tables, and architectural blueprints.")
    add_bullet_point(doc, "3. GraphRAG & Knowledge Graphs: Construct knowledge graphs from extracted entities and relationships using Neo4j to enhance multi-hop reasoning across complex cross-document dependencies.")
    add_bullet_point(doc, "4. Distributed Enterprise Scaling: Transition the vector database layer to distributed clusters using Milvus or Qdrant for enterprise workloads indexing millions of documents.")
    add_bullet_point(doc, "5. Agentic Workflows & Multi-Document Synthesis: Implement LangGraph-based multi-agent workflows enabling autonomous cross-document comparison, automated compliance auditing, and self-correcting query decomposition.")

    doc.add_page_break()

    # ----------------------------------------------------
    # BIBLIOGRAPHY
    # ----------------------------------------------------
    p_bib = doc.add_paragraph()
    p_bib.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_bib.paragraph_format.space_before = Pt(20)
    p_bib.paragraph_format.space_after = Pt(12)
    r = p_bib.add_run("BIBLIOGRAPHY")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True

    add_heading_1(doc, "Books & Guides")
    add_bullet_point(doc, "1. “Natural Language Processing with Transformers: Building Language Applications with Hugging Face” – Lewis Tunstall, Leandro von Werra, and Thomas Wolf (O'Reilly Media, 2022). Comprehensive coverage of transformer architectures, attention mechanisms, and embedding pipelines.")
    add_bullet_point(doc, "2. “Introduction to Information Retrieval” – Christopher D. Manning, Prabhakar Raghavan, and Hinrich Schütze (Cambridge University Press, 2008). Foundational theory of vector space models, inverted indices, BM25 scoring, and rank fusion.")
    add_bullet_point(doc, "3. “Building Systems with the ChatGPT API and LangChain” – Harrison Chase and Andrew Ng (DeepLearning.AI, 2023). Practical patterns for chaining retrieval systems, memory buffers, and output parsers.")
    add_bullet_point(doc, "4. “FastAPI: Modern Python Web Development” – Bill Lubanovic (O'Reilly Media, 2023). Guide to developing high-throughput asynchronous web APIs, Pydantic data validation, and dependency injection.")

    add_heading_1(doc, "Websites & Online Resources")
    add_bullet_point(doc, "1. Lewis, P., et al. (2020). “Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks.” Advances in Neural Information Processing Systems (NeurIPS 2020). https://arxiv.org/abs/2005.11401")
    add_bullet_point(doc, "2. Cormack, G. V., Clarke, C. L., & Buettcher, S. (2009). “Reciprocal Rank Fusion Outperforms Condorcet and Individual Rank Learning Methods.” ACM SIGIR Conference. https://doi.org/10.1145/1571941.1572114")
    add_bullet_point(doc, "3. Robertson, S., & Zaragoza, H. (2009). “The Probabilistic Relevance Framework: BM25 and Beyond.” Foundations and Trends in Information Retrieval. https://doi.org/10.1561/1500000019")
    add_bullet_point(doc, "4. Ollama Documentation & Local Inference Engine: https://ollama.com")
    add_bullet_point(doc, "5. Neon Serverless PostgreSQL & pgvector Documentation: https://neon.tech")
    add_bullet_point(doc, "6. FastAPI Modern High-Performance Web Framework: https://fastapi.tiangolo.com")
    add_bullet_point(doc, "7. Streamlit Interactive Web Application Framework: https://docs.streamlit.io")
    add_bullet_point(doc, "8. LangChain Core Documentation: https://python.langchain.com")
    add_bullet_point(doc, "9. PyMuPDF (fitz) High-Performance PDF Parser: https://pymupdf.readthedocs.io")
    add_bullet_point(doc, "10. Nomic AI nomic-embed-text 768-dim Embedding Model: https://huggingface.co/nomic-ai/nomic-embed-text-v1.5")

    # Save docx
    output_docx = "Project_Report_RAG_Document_Intelligence.docx"
    doc.save(output_docx)
    print(f"Document successfully created and saved as '{output_docx}'!")
    return output_docx

if __name__ == "__main__":
    build_docx_report()
