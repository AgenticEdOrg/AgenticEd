"""AgenticEd chatbot API server (and a local preview of the website).

    python server.py
    then open http://127.0.0.1:5000

Endpoints:
    GET  /api/health   -> {"ok": true}  (the widget checks this before showing)
    POST /api/chat     -> body {"question": "..."}  ->  {answer, sources, found, mode}
    GET  /<page>       -> the AgenticEd website files, so you can test the widget locally

Security notes:
    - The API key stays in chatbot/.env on the server. The browser never sees it.
    - Only public website files are served: no dotfiles, no chatbot/ code, no labs/.
    - Each visitor is limited to RATE_LIMIT questions per minute.
"""
from __future__ import annotations

import os
import pathlib
import sys
import time
from collections import defaultdict, deque

from flask import Flask, abort, jsonify, request, send_from_directory
from werkzeug.middleware.proxy_fix import ProxyFix

from rag import AgenticEdRAG

REPO_DIR = pathlib.Path(__file__).resolve().parent.parent
RATE_LIMIT = int(os.environ.get("AGENTICED_RATE_LIMIT", "10"))       # questions per minute per IP
# Number of reverse proxies in front of this server (Cloud Run, Render, nginx...). Each proxy adds
# one X-Forwarded-For entry; we trust exactly that many so visitors aren't all counted as one IP.
PROXY_HOPS = int(os.environ.get("AGENTICED_PROXY_HOPS", "0"))
MAX_QUESTION_CHARS = 500
# Websites allowed to call this API from a browser (comma separated). Same-origin always works.
ALLOWED_ORIGINS = {o.strip() for o in os.environ.get(
    "AGENTICED_ALLOWED_ORIGINS", "https://agenticed.org,https://www.agenticed.org").split(",") if o.strip()}
PUBLIC_SUFFIXES = {".html", ".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico",
                   ".pdf", ".woff", ".woff2", ".txt", ".xml", ".webmanifest", ".json"}
PRIVATE_FOLDERS = {"chatbot", "labs", "supabase", "scripts", "node_modules"}

app = Flask(__name__)
if PROXY_HOPS:
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=PROXY_HOPS)   # request.remote_addr = the real visitor
rag = AgenticEdRAG()
recent_requests: dict[str, deque] = defaultdict(deque)


def rate_limited(ip: str) -> bool:
    now, window = time.time(), recent_requests[ip]
    while window and now - window[0] > 60:
        window.popleft()
    if len(window) >= RATE_LIMIT:
        return True
    window.append(now)
    return False


@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")
    if origin and origin in ALLOWED_ORIGINS and request.path.startswith("/api/"):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Vary"] = "Origin"
    return response


@app.get("/api/health")
def health():
    # Public endpoint: only the status. Which model answers is logged on the server, not shown to visitors.
    return jsonify(ok=True)


@app.route("/api/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":                      # CORS preflight
        return "", 204
    if rate_limited(request.remote_addr or "unknown"):
        return jsonify(error="Too many questions. Please wait a minute and try again."), 429
    data = request.get_json(silent=True) or {}
    question = str(data.get("question", "")).strip()
    if not question:
        return jsonify(error="Please type a question."), 400
    if len(question) > MAX_QUESTION_CHARS:
        return jsonify(error=f"Please keep questions under {MAX_QUESTION_CHARS} characters."), 400
    try:
        result = rag.ask(question)
    except Exception as e:                               # model down, network error, ...
        print(f"[chat error] {e}", file=sys.stderr)
        return jsonify(error="The assistant is busy right now. Please try again in a minute."), 503
    print(f"[chat] mode={result['mode']} sim={result['best_similarity']} q={question[:80]!r}", file=sys.stderr)
    return jsonify({k: result[k] for k in ("answer", "sources", "found", "mode")})


@app.get("/")
@app.get("/<path:path>")
def website(path="index.html"):
    """Serve the public website files only (for local testing)."""
    target = (REPO_DIR / path).resolve()
    if target.is_dir():
        target = target / "index.html"
    parts = target.relative_to(REPO_DIR).parts if target.is_relative_to(REPO_DIR) else ("..",)
    private = (parts[0] in PRIVATE_FOLDERS and parts[:3] != ("chatbot", "widget", parts[-1])) \
        or any(p.startswith(".") for p in parts)
    if private or target.suffix.lower() not in PUBLIC_SUFFIXES or not target.is_file():
        abort(404)
    return send_from_directory(REPO_DIR, "/".join(parts))


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    print(f"\nAgenticEd chatbot running. Open http://127.0.0.1:{port}  (Ctrl + C to stop)\n")
    app.run(host="127.0.0.1", port=port, debug=False)
