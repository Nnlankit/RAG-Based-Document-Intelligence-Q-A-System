"""Generate remaining product UI figures for Chapter 6."""

import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

SCREENSHOTS_DIR = "project_report_output/Screenshots"

def save_fig(fig, path):
    fig.savefig(path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close(fig)
    print(f"Generated: {path}")

# 1. Login & Auth Interface
def generate_login_screenshot():
    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    ax.set_xlim(0, 100); ax.set_ylim(0, 100); ax.axis('off')
    ax.add_patch(patches.Rectangle((0, 0), 100, 100, facecolor="#0B132B"))

    # Auth Card in Center
    ax.add_patch(patches.FancyBboxPatch((32, 18), 36, 64, boxstyle="round,pad=1", facecolor="#1C2541", edgecolor="#3A506B", lw=1.5))
    ax.text(50, 74, "DocIntel AI", ha='center', va='center', fontsize=14, fontweight='bold', color="#6FFFE9")
    ax.text(50, 69, "Secure Document Intelligence Login", ha='center', va='center', fontsize=8, color="#A5B4FC")

    # Email Input
    ax.text(36, 61, "Institutional Email", fontsize=7.5, color="#CBD5E1")
    ax.add_patch(patches.FancyBboxPatch((36, 52), 28, 6.5, boxstyle="round,pad=0.3", facecolor="#0B132B", edgecolor="#475569"))
    ax.text(38, 55.5, "admin@example.com", fontsize=7.5, color="#E2E8F0")

    # Password Input
    ax.text(36, 47, "Password", fontsize=7.5, color="#CBD5E1")
    ax.add_patch(patches.FancyBboxPatch((36, 38), 28, 6.5, boxstyle="round,pad=0.3", facecolor="#0B132B", edgecolor="#475569"))
    ax.text(38, 41.5, "••••••••••••••••", fontsize=8, color="#E2E8F0")

    # Sign In Button
    ax.add_patch(patches.FancyBboxPatch((36, 27), 28, 7, boxstyle="round,pad=0.4", facecolor="#2563EB", edgecolor="none"))
    ax.text(50, 30.5, "Sign In to Platform", ha='center', va='center', fontsize=8, fontweight='bold', color="#FFFFFF")

    # Security Notice
    ax.text(50, 21, "Protected by bcrypt encryption & JWT access tokens", ha='center', va='center', fontsize=6.5, color="#64748B")

    save_fig(fig, os.path.join(SCREENSHOTS_DIR, "screenshot_01_login_auth.png"))

# 4. Document Upload Modal
def generate_upload_modal():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 100); ax.set_ylim(0, 100); ax.axis('off')
    ax.add_patch(patches.Rectangle((0, 0), 100, 100, facecolor="#0F172A", alpha=0.9))

    # Modal Box
    ax.add_patch(patches.FancyBboxPatch((20, 12), 60, 76, boxstyle="round,pad=1", facecolor="#1E293B", edgecolor="#3B82F6", lw=1.5))
    ax.text(50, 81, "Upload Document to Knowledge Base", ha='center', va='center', fontsize=11, fontweight='bold', color="#F8FAFC")
    ax.text(50, 77, "Supported formats: PDF, DOCX, TXT, Markdown (Max size: 50 MB)", ha='center', va='center', fontsize=7.5, color="#94A3B8")

    # Drag and Drop Area
    ax.add_patch(patches.FancyBboxPatch((25, 42), 50, 30, boxstyle="round,pad=0.5", facecolor="#0F172A", edgecolor="#38BDF8", lw=1.2, ls="--"))
    ax.text(50, 60, "Drag and drop files here, or click to browse", ha='center', va='center', fontsize=8.5, fontweight='bold', color="#38BDF8")
    ax.text(50, 54, "Files are parsed page-by-page and chunked automatically", ha='center', va='center', fontsize=7, color="#64748B")

    # Selected File Preview
    ax.add_patch(patches.FancyBboxPatch((25, 26), 50, 12, boxstyle="round,pad=0.4", facecolor="#0F172A", edgecolor="#334155"))
    ax.text(28, 34, "Selected: Project_Titan_Specification.pdf", fontsize=7.5, fontweight='bold', color="#E2E8F0")
    ax.text(28, 29, "File Size: 4.92 MB | MIME: application/pdf | Checksum: 8a7c9f... | Valid", fontsize=6.8, color="#34D399")

    # Upload CTA
    ax.add_patch(patches.FancyBboxPatch((52, 16), 23, 7, boxstyle="round,pad=0.3", facecolor="#2563EB", edgecolor="none"))
    ax.text(63.5, 19.5, "Confirm & Process", ha='center', va='center', fontsize=7.5, fontweight='bold', color="#FFFFFF")

    ax.add_patch(patches.FancyBboxPatch((25, 16), 18, 7, boxstyle="round,pad=0.3", facecolor="#334155", edgecolor="none"))
    ax.text(34, 19.5, "Cancel", ha='center', va='center', fontsize=7.5, color="#E2E8F0")

    save_fig(fig, os.path.join(SCREENSHOTS_DIR, "screenshot_04_document_upload_modal.png"))

# 6. Source Attribution Cards Detail
def generate_source_attribution_detail():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 100); ax.set_ylim(0, 100); ax.axis('off')
    ax.add_patch(patches.Rectangle((0, 0), 100, 100, facecolor="#0F172A"))
    ax.text(5, 94, "Verifiable Source Attribution Inspector", fontsize=11, fontweight='bold', color="#F8FAFC")
    ax.text(5, 90, "Detailed Transparency: Document Titles, Physical Page Numbers, Chunk IDs, and Raw Passages", fontsize=7.5, color="#94A3B8")

    # Source 1 Expanded Card
    ax.add_patch(patches.FancyBboxPatch((5, 50), 90, 36, boxstyle="round,pad=0.5", facecolor="#1E293B", edgecolor="#059669", lw=1.5))
    ax.text(8, 80, "[SOURCE 1] Project_Titan_Specification.pdf", fontsize=8.5, fontweight='bold', color="#34D399")
    ax.text(8, 76, "Physical Page: 14 | Chunk ID: doc_7f3a_chunk_0032 | Cosine Similarity Score: 0.942 | RRF Rank: 1", fontsize=7.2, color="#A7F3D0")
    raw_snippet_1 = (
        "\"The Titan subterranean mobility unit incorporates dual lithium-sulfur battery packs operating at a nominal\n"
        "voltage of 48V. Laboratory and field testing under temperature variations between -10°C and 45°C demonstrated\n"
        "continuous autonomy of 18 hours per charge cycle under heavy sensor load and continuous LiDAR scanning.\""
    )
    ax.text(8, 62, raw_snippet_1, fontsize=7.2, color="#E2E8F0", style='italic')

    # Source 2 Expanded Card
    ax.add_patch(patches.FancyBboxPatch((5, 10), 90, 36, boxstyle="round,pad=0.5", facecolor="#1E293B", edgecolor="#3B82F6", lw=1.5))
    ax.text(8, 40, "[SOURCE 2] Project_Titan_Specification.pdf", fontsize=8.5, fontweight='bold', color="#60A5FA")
    ax.text(8, 36, "Physical Page: 16 | Chunk ID: doc_7f3a_chunk_0038 | Cosine Similarity Score: 0.897 | RRF Rank: 2", fontsize=7.2, color="#BAE6FD")
    raw_snippet_2 = (
        "\"Chassis payload integration specifications: The upper mounting rail accommodates robotic arm assemblies,\n"
        "environmental spectrometry sensors, and physical sample storage bins up to a certified maximum mass of 35 kg.\n"
        "The automated payload stabilization gimbal preserves vehicle center of gravity across uneven cavern floors.\""
    )
    ax.text(8, 22, raw_snippet_2, fontsize=7.2, color="#E2E8F0", style='italic')

    save_fig(fig, os.path.join(SCREENSHOTS_DIR, "screenshot_06_source_attribution_cards.png"))

# 8. Document Intelligence & Analytics View
def generate_intelligence_view():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 100); ax.set_ylim(0, 100); ax.axis('off')
    ax.add_patch(patches.Rectangle((0, 0), 100, 100, facecolor="#0F172A"))
    ax.text(5, 94, "Document Intelligence View: Automatic Summarization & Entity Extraction", fontsize=11, fontweight='bold', color="#F8FAFC")
    ax.text(5, 90, "Deep Semantic Analysis for: Project_Titan_Specification.pdf", fontsize=7.5, color="#94A3B8")

    # Left Box: Executive Summary & Key Points
    ax.add_patch(patches.FancyBboxPatch((5, 12), 43, 74, boxstyle="round,pad=0.5", facecolor="#1E293B", edgecolor="#334155"))
    ax.text(8, 80, "Executive Summary & Core Points", fontsize=8.5, fontweight='bold', color="#F8FAFC")
    summary_text = (
        "Summary Overview:\n"
        "Project Titan specifies an autonomous subterranean robotic\n"
        "platform designed for hazard mapping and search-and-rescue\n"
        "operations in GPS-denied underground tunnels.\n\n"
        "Extracted Key Points:\n"
        "• Battery Life: 18 hours autonomous operation.\n"
        "• Maximum Payload: 35 kg sensor and tool capacity.\n"
        "• Vision System: Stereoscopic visual odometry.\n"
        "• Lead Architect: Dr. Aris Thorne (Robotics Lab).\n"
        "• Operating Temp: -10°C to 45°C certified.\n"
        "• Communication: Mesh radio relays at 915 MHz."
    )
    ax.text(8, 48, summary_text, fontsize=7.2, color="#E2E8F0")

    # Right Box: Named Entities (NER) & Topic Keywords
    ax.add_patch(patches.FancyBboxPatch((52, 12), 43, 74, boxstyle="round,pad=0.5", facecolor="#1E293B", edgecolor="#334155"))
    ax.text(55, 80, "Named Entities & Keywords (NER)", fontsize=8.5, fontweight='bold', color="#F8FAFC")
    
    entities = [
        ("PERSON", "Dr. Aris Thorne (Lead Vision Engineer)"),
        ("ORG", "Subterranean Autonomous Systems Lab"),
        ("TECH", "LiDAR, Stereoscopic Odometry, 48V Li-S"),
        ("METRIC", "18 Hours, 35 Kilograms, 4.5 m/s"),
        ("LOCATION", "Cavern Sector B-4, Test Mine Alpha")
    ]
    for ei, (etype, evalue) in enumerate(entities):
        ey = 72 - ei * 11
        ax.add_patch(patches.FancyBboxPatch((55, ey-2), 16, 5, boxstyle="round,pad=0.2", facecolor="#065F46", edgecolor="#34D399"))
        ax.text(63, ey+0.5, etype, fontsize=6.5, fontweight='bold', color="#34D399", ha='center', va='center')
        ax.text(55, ey-6, evalue, fontsize=7, color="#E2E8F0")

    save_fig(fig, os.path.join(SCREENSHOTS_DIR, "screenshot_08_document_intelligence_view.png"))

if __name__ == "__main__":
    generate_login_screenshot()
    generate_upload_modal()
    generate_source_attribution_detail()
    generate_intelligence_view()
    print("All additional screenshots generated successfully!")
