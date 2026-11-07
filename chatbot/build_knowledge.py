"""Build the AgenticEd knowledge file for the RAG chatbot.

Reads the real website content in this repository (HTML pages, the curriculum
Markdown, and the certification prep courses), splits it into small sections,
and writes one JSON record per chunk to knowledge/agenticed_knowledge.jsonl.

Every chunk keeps where it came from (file, page URL, section heading) so the
chatbot can show its sources.

Run from the chatbot folder:
    python build_knowledge.py
"""
from __future__ import annotations

import json
import pathlib
import re

from bs4 import BeautifulSoup

CHATBOT_DIR = pathlib.Path(__file__).resolve().parent
REPO_DIR = CHATBOT_DIR.parent
OUT_FILE = CHATBOT_DIR / "knowledge" / "agenticed_knowledge.jsonl"
MAX_CHARS = 1000  # keep chunks small so retrieval stays precise

# Website pages to include. Interactive tools (quiz, exam, dashboard, feedback form,
# pacing generator) are left out: they have little text, and exam pages must never
# leak answers into the chatbot.
HTML_PAGES = [
    "index.html", "learn.html", "faq.html", "approach.html", "framework.html",
    "glossary.html", "tools.html", "privacy.html", "portfolio.html", "rubric.html",
    "research-agent.html", "certificate.html", "sessions.html",
    "week1.html", "week2.html", "week3.html", "week4.html", "week5.html", "week6.html",
    "blog/what-is-an-ai-agent.html", "blog/prompt-injection-explained.html",
    "blog/why-we-teach-safety-from-day-one.html",
]
MARKDOWN_FILES = ["agenticEd_curriculum.md", "README.md", "labs/README.md"]
# README sections that describe files instead of learning content (and are out of date).
SKIP_MD_SECTIONS = {"Repository Structure"}
COURSE_FILES = {
    "foundational": "certifications/course-foundational.js",
    "associate": "certifications/course-associate.js",
    "advanced": "certifications/course-advanced.js",
}
CERT_DATA_FILE = "certifications/cert-data.js"

HEADING_MARK = "⁣H⁣"  # invisible marker we put in front of every heading


# ── small helpers ──────────────────────────────────────────────────────────
def clean(text: str) -> str:
    """Collapse whitespace inside lines and drop empty lines."""
    lines = [re.sub(r"[ \t ]+", " ", line).strip() for line in text.splitlines()]
    return "\n".join(line for line in lines if line)


def split_long(text: str, max_chars: int = MAX_CHARS) -> list[str]:
    """Split text into pieces of at most max_chars, breaking between lines/sentences."""
    if len(text) <= max_chars:
        return [text]
    pieces, current = [], ""
    for part in re.split(r"(?<=\n)|(?<=[.!?] )", text):
        if current and len(current) + len(part) > max_chars:
            pieces.append(current.strip())
            current = ""
        current += part
    if current.strip():
        pieces.append(current.strip())
    return pieces


def make_chunks(source, url, title, sections):
    """sections: list of (heading, anchor, text). Returns chunk dicts."""
    chunks = []
    for heading, anchor, text in sections:
        text = clean(text)
        if len(text) < 40:          # skip empty or decorative sections
            continue
        link = f"{url}#{anchor}" if anchor else url
        for piece in split_long(text):
            chunks.append({
                "id": f"{source}#{len(chunks)}",
                "source": source,
                "url": link,
                "title": title,
                "section": heading or title,
                "text": piece,
            })
    return chunks


# ── HTML pages ─────────────────────────────────────────────────────────────
BLOCK_TAGS = ["p", "div", "li", "tr", "td", "th", "br", "section", "article", "details",
              "dd", "dt", "ul", "ol", "table", "blockquote", "pre", "h1", "h2", "h3", "h4",
              "summary", "header", "aside", "figure", "figcaption"]


def add_block_breaks(root):
    """Put a line break after block elements, so bold/links inside a sentence stay inline."""
    for el in root.find_all(BLOCK_TAGS):
        el.append("\n")
    for el in root.find_all("span"):   # labels like <span>Claude</span><span>Week 3</span>
        el.append(" ")


def html_sections(path: pathlib.Path):
    soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")
    title = soup.title.get_text(strip=True) if soup.title else path.stem
    title = re.split(r"\s[—|·-]\s", title)[0].strip()   # "FAQ — AgenticEd" -> "FAQ"
    for tag in soup(["script", "style", "nav", "footer", "svg", "noscript", "button", "form"]):
        tag.decompose()
    for tag in soup.select(".topbar, .announce"):                     # logo bar / banners
        tag.decompose()
    for link in soup.find_all("a", string=re.compile("Back to Course")):
        link.decompose()
    body = soup.find("main") or soup.body
    add_block_breaks(body)

    # Mark headings, FAQ questions, and glossary terms as section starts.
    for el in body.select("h1, h2, h3, h4, summary, .term__name"):
        anchor_el = el if el.get("id") else el.find_parent(attrs={"id": True})
        anchor = anchor_el.get("id", "") if anchor_el else ""
        el.replace_with(f"\n{HEADING_MARK}{anchor}{HEADING_MARK}{el.get_text(' ', strip=True)}\n")

    sections = []
    parts = body.get_text().split(HEADING_MARK)
    intro = parts[0]
    if clean(intro):
        sections.append((title, "", intro))
    # After splitting: [intro, anchor1, heading1+text1, anchor2, heading2+text2, ...]
    for i in range(1, len(parts) - 1, 2):
        anchor = parts[i]
        heading, _, text = parts[i + 1].strip().partition("\n")
        sections.append((heading.strip(), anchor, f"{heading}\n{text}"))
    return title, sections


# ── Markdown files ─────────────────────────────────────────────────────────
def markdown_sections(path: pathlib.Path):
    raw = path.read_text(encoding="utf-8")
    title = raw.splitlines()[0].lstrip("# ").strip()
    sections, parent = [], ""
    for block in re.split(r"\n(?=#{1,3} )", raw):
        first, _, text = block.strip().partition("\n")
        level = len(first) - len(first.lstrip("#"))
        heading = first.lstrip("# ").strip()
        if heading in SKIP_MD_SECTIONS:
            continue
        if level <= 2:
            parent = heading
        full_heading = heading if level <= 2 or not parent else f"{parent} › {heading}"
        text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)          # [text](link) -> text
        text = re.sub(r"[*_`]{1,3}|^\s*\|?[-: |]+\|\s*$", "", text, flags=re.M)
        sections.append((full_heading, "", f"{full_heading}\n{text}"))
    return title, sections


# ── JavaScript data files (certification courses) ──────────────────────────
def parse_js_literal(src: str, start: int):
    """Parse one JavaScript object/array literal starting at src[start] == '{' or '['.

    Handles what the AgenticEd data files use: unquoted keys, "double", 'single'
    and `backtick` strings, numbers, true/false/null, comments, trailing commas.
    """
    i = start

    def skip():
        nonlocal i
        while i < len(src):
            if src[i].isspace():
                i += 1
            elif src.startswith("//", i):
                i = src.index("\n", i) if "\n" in src[i:] else len(src)
            elif src.startswith("/*", i):
                i = src.index("*/", i) + 2
            else:
                break

    def string():
        nonlocal i
        quote, i, out = src[i], i + 1, []
        while src[i] != quote:
            if src[i] == "\\":
                nxt = src[i + 1]
                out.append({"n": "\n", "t": "\t"}.get(nxt, nxt))
                i += 2
            else:
                out.append(src[i])
                i += 1
        i += 1
        return "".join(out)

    def value():
        nonlocal i
        skip()
        ch = src[i]
        if ch == "{":
            i += 1
            obj = {}
            while True:
                skip()
                if src[i] == "}":
                    i += 1
                    return obj
                if src[i] in "\"'`":
                    key = string()
                else:
                    m = re.match(r"[A-Za-z_$][\w$]*", src[i:])
                    key = m.group(0)
                    i += len(key)
                skip()
                i += 1  # ':'
                obj[key] = value()
                skip()
                if src[i] == ",":
                    i += 1
        if ch == "[":
            i += 1
            arr = []
            while True:
                skip()
                if src[i] == "]":
                    i += 1
                    return arr
                arr.append(value())
                skip()
                if src[i] == ",":
                    i += 1
        if ch in "\"'`":
            return string()
        m = re.match(r"-?\d+(\.\d+)?|true|false|null", src[i:])
        if not m:
            raise ValueError(f"Unexpected JavaScript at position {i}: {src[i:i + 40]!r}")
        i += len(m.group(0))
        token = m.group(0)
        return {"true": True, "false": False, "null": None}.get(
            token, float(token) if "." in token else int(token) if token[0] in "-0123456789" else token)

    return value()


def js_data(path: pathlib.Path, assignment: str):
    """Return the literal assigned in e.g. `window.AGENTICED_CERTS = {...}`."""
    src = path.read_text(encoding="utf-8")
    after_equals = src.index("=", src.index(assignment)) + 1
    start = re.compile(r"[{\[]").search(src, after_equals).start()
    return parse_js_literal(src, start)


def html_to_text(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    add_block_breaks(soup)
    return soup.get_text()


def course_sections(level: str, path: pathlib.Path):
    course = js_data(path, f"window.AGENTICED_COURSES.{level}")
    url = f"certifications/course.html?level={level}"
    title = f"{course['title']} certification prep course"
    sections = [(title, "", f"{title}\n{course.get('intro', '')}")]
    for module in course["modules"]:
        name = module["title"]
        head = [f"Module: {name} ({module.get('minutes', '?')} min). Domain: {module.get('domain', '')}.",
                "Objectives:", *[f"- {o}" for o in module.get("objectives", [])]]
        sections.append((name, "", "\n".join(head)))
        for sec in module.get("sections", []):
            sections.append((f"{name} › {sec['h']}", "", f"{sec['h']}\n{html_to_text(sec['html'])}"))
        if module.get("takeaways"):
            sections.append((f"{name} › Key takeaways", "",
                             "Key takeaways:\n" + "\n".join(f"- {t}" for t in module["takeaways"])))
        if module.get("pitfalls"):
            sections.append((f"{name} › Common pitfalls", "",
                             "Common pitfalls:\n" + "\n".join(f"- {html_to_text(p)}" for p in module["pitfalls"])))
        # Knowledge-check questions are skipped on purpose (practice material, not facts).
    return url, title, sections


def certification_sections(path: pathlib.Path):
    """Level metadata only. The exam question bank is NEVER added to the knowledge base."""
    certs = js_data(path, "window.AGENTICED_CERTS")
    sections = []
    for key in certs["order"]:
        lvl = certs["levels"][key]
        prereq = certs["levels"][lvl["prerequisite"]]["name"] if lvl.get("prerequisite") else "none"
        sections.append((lvl["name"], "", "\n".join([
            f"{lvl['name']} ({lvl['tier']} tier)",
            lvl.get("tagline", ""), lvl.get("summary", ""),
            f"Exam: {lvl['total']} questions, about {lvl['minutes']} minutes, "
            f"pass with {lvl['passScore']} of {lvl['total']} correct (70%).",
            f"Recommended prerequisite: {prereq}.",
            f"Free prep course: certifications/course.html?level={key}",
        ])))
    return sections


# ── main ───────────────────────────────────────────────────────────────────
def build():
    chunks = []
    for page in HTML_PAGES:
        title, sections = html_sections(REPO_DIR / page)
        chunks += make_chunks(page, page, title, sections)
    for md in MARKDOWN_FILES:
        title, sections = markdown_sections(REPO_DIR / md)
        chunks += make_chunks(md, md, title, sections)
    chunks += make_chunks(CERT_DATA_FILE, "certifications/index.html", "AgenticEd Certifications",
                          certification_sections(REPO_DIR / CERT_DATA_FILE))
    for level, file in COURSE_FILES.items():
        url, title, sections = course_sections(level, REPO_DIR / file)
        chunks += make_chunks(file, url, title, sections)

    OUT_FILE.parent.mkdir(exist_ok=True)
    with OUT_FILE.open("w", encoding="utf-8", newline="\n") as fh:
        for c in chunks:
            fh.write(json.dumps(c, ensure_ascii=False) + "\n")

    sources = sorted({c["source"] for c in chunks})
    print(f"Wrote {len(chunks)} chunks from {len(sources)} sources to {OUT_FILE.relative_to(REPO_DIR)}")
    for s in sources:
        print(f"  {sum(c['source'] == s for c in chunks):4d}  {s}")


if __name__ == "__main__":
    build()
