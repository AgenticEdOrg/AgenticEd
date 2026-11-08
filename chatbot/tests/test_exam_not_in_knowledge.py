"""Exam integrity: no certification exam question may appear in the chatbot's knowledge file.

    python -m pytest -v

If this fails, the knowledge file was rebuilt from content that includes the question banks.
Fix build_knowledge.py so it skips certifications/cert-data.js, then rebuild.
"""
import json
import pathlib
import re

import pytest

CHATBOT_DIR = pathlib.Path(__file__).resolve().parents[1]
CERT_DATA = CHATBOT_DIR.parent / "certifications" / "cert-data.js"
KNOWLEDGE_FILE = CHATBOT_DIR / "knowledge" / "agenticed_knowledge.jsonl"


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip().lower()


def exam_questions():
    # Each question in cert-data.js is written as q:"...". Options and explanations are not checked.
    return re.findall(r'q:"((?:[^"\\]|\\.)*)"', CERT_DATA.read_text(encoding="utf-8"))


def knowledge_text():
    chunks = [json.loads(line) for line in KNOWLEDGE_FILE.open(encoding="utf-8") if line.strip()]
    return normalize(" \n ".join(c["text"] + " " + c["section"] for c in chunks))


@pytest.mark.skipif(not CERT_DATA.exists(), reason="certifications/cert-data.js not found")
def test_cert_data_has_the_expected_number_of_questions():
    # 3 levels x 20 questions. If this changes, the leak check below must still cover all of them.
    assert len(exam_questions()) == 60


@pytest.mark.skipif(not CERT_DATA.exists(), reason="certifications/cert-data.js not found")
def test_no_exam_question_is_in_the_knowledge_file():
    text = knowledge_text()
    leaked = [q for q in exam_questions() if normalize(q.replace('\\"', '"')) in text]
    assert not leaked, f"{len(leaked)} exam question(s) leaked into the knowledge file: {leaked[:3]}"
