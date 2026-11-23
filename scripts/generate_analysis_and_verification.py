"""Analyze the complete codebase and generate Technical_Analysis.md and Verification_Report.md."""

import os
import re
import json

def analyze_backend():
    results = {
        "api_endpoints": [],
        "models": [],
        "core_services": [],
        "ingestion_parsers": [],
        "retrieval_strategies": [],
        "ai_models": [],
        "security_features": []
    }
    
    # Analyze API routes
    api_dir = "app/api"
    for fname in sorted(os.listdir(api_dir)):
        if fname.endswith(".py") and fname != "__init__.py":
            fpath = os.path.join(api_dir, fname)
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
            matches = re.findall(r'@router\.(get|post|put|delete|patch)\(\s*["\']([^"\']+)["\'](?:,\s*response_model=([^,\)]+))?', content)
            for m, p, rm in matches:
                full_path = f"/api/v1/{fname.replace('.py','')}{p}" if p != "" else f"/api/v1/{fname.replace('.py','')}"
                results["api_endpoints"].append({
                    "router": fname,
                    "method": m.upper(),
                    "path": p,
                    "response_model": rm.strip() if rm else "dict/None"
                })

    # Analyze database models
    models_path = "app/database/models.py"
    with open(models_path, "r", encoding="utf-8") as f:
        mcontent = f.read()
    classes = re.findall(r'class\s+(\w+)\(Base\):[\s\S]*?__tablename__\s*=\s*["\']([^"\']+)["\']', mcontent)
    for cls_name, tbl_name in classes:
        # extract columns
        cls_block = mcontent[mcontent.find(f"class {cls_name}"):mcontent.find(f"class {cls_name}") + 1500]
        cols = re.findall(r'(\w+)\s*=\s*Column\((\w+)', cls_block)
        results["models"].append({
            "class": cls_name,
            "table": tbl_name,
            "columns": cols
        })

    return results

def analyze_frontend():
    results = {
        "pages": [],
        "components": {},
        "services": [],
        "contexts": []
    }
    
    pages_dir = "frontend/src/pages"
    for fname in sorted(os.listdir(pages_dir)):
        if fname.endswith(".tsx"):
            fpath = os.path.join(pages_dir, fname)
            with open(fpath, "r", encoding="utf-8") as f:
                lines = len(f.readlines())
            results["pages"].append({"name": fname, "lines": lines})

    comp_dir = "frontend/src/components"
    for sub in sorted(os.listdir(comp_dir)):
        sub_path = os.path.join(comp_dir, sub)
        if os.path.isdir(sub_path):
            results["components"][sub] = []
            for fname in sorted(os.listdir(sub_path)):
                if fname.endswith(".tsx"):
                    results["components"][sub].append(fname)

    services_dir = "frontend/src/services"
    for fname in sorted(os.listdir(services_dir)):
        if fname.endswith(".ts"):
            results["services"].append(fname)

    ctx_dir = "frontend/src/context"
    for fname in sorted(os.listdir(ctx_dir)):
        if fname.endswith(".tsx"):
            results["contexts"].append(fname)

    return results

def count_code_metrics():
    metrics = {}
    for root, dirs, files in os.walk("."):
        dirs[:] = [d for d in dirs if d not in [".git", ".venv", "node_modules", "__pycache__", ".pytest_cache", "dist", "extracted_ref", "repo_temp"]]
        for f in files:
            ext = os.path.splitext(f)[1]
            if ext in [".py", ".ts", ".tsx", ".css", ".html", ".json", ".md", ".yml", ".yaml"]:
                p = os.path.join(root, f)
                try:
                    with open(p, "r", encoding="utf-8", errors="ignore") as fp:
                        lines = len(fp.readlines())
                    metrics[ext] = metrics.get(ext, {"files": 0, "lines": 0})
                    metrics[ext]["files"] += 1
                    metrics[ext]["lines"] += lines
                except Exception:
                    pass
    return metrics

if __name__ == "__main__":
    os.makedirs("project_report_output", exist_ok=True)
    os.makedirs("project_report_output/Architecture_Diagrams", exist_ok=True)
    os.makedirs("project_report_output/Screenshots", exist_ok=True)
    
    be = analyze_backend()
    fe = analyze_frontend()
    cm = count_code_metrics()
    
    print("Backend Endpoints Count:", len(be["api_endpoints"]))
    print("Database Models Count:", len(be["models"]))
    print("Frontend Pages Count:", len(fe["pages"]))
    print("Code Metrics:", cm)
