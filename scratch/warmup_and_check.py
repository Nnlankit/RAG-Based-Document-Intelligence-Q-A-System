import httpx
import time

print("Waiting 2s for backend...")
time.sleep(2)

try:
    resp = httpx.get("http://localhost:8000/api/v1/health", timeout=10.0)
    print("Backend Health:", resp.status_code, resp.json())
except Exception as e:
    print("Backend Health Error:", e)

# Warm up nomic-embed-text
try:
    t0 = time.perf_counter()
    resp = httpx.post("http://localhost:11434/api/embed", json={"model": "nomic-embed-text", "input": ["warmup probe"], "keep_alive": "24h"}, timeout=30.0)
    print(f"Embedding warmup: {resp.status_code} in {round((time.perf_counter() - t0)*1000, 2)}ms")
except Exception as e:
    print("Embedding warmup error:", e)

# Warm up llama3.2
try:
    t0 = time.perf_counter()
    resp = httpx.post("http://localhost:11434/api/generate", json={"model": "llama3.2", "prompt": "Hi", "stream": False, "keep_alive": "24h"}, timeout=60.0)
    print(f"LLM warmup: {resp.status_code} in {round((time.perf_counter() - t0)*1000, 2)}ms")
except Exception as e:
    print("LLM warmup error:", e)

# Check loaded models in ollama ps
try:
    resp = httpx.get("http://localhost:11434/api/ps", timeout=10.0)
    print("Ollama Loaded Models:", resp.json())
except Exception as e:
    print("Ollama ps error:", e)
