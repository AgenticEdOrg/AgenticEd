"""Tests proving the AgenticEd chatbot does not invent answers.

    python -m pytest -v

The first three tests run offline with a fake LLM, so they are free and always give the
same result. The last two call the real LLM and are skipped if no API key is set.
"""
import pathlib
import re
import sys

import pytest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
from rag import AgenticEdRAG, NOT_FOUND, llm_from_env  # noqa: E402


class FakeLLM:
    """Returns a fixed reply and records whether it was called."""
    def __init__(self, reply):
        self.reply, self.calls = reply, 0

    def __call__(self, system, user):
        self.calls += 1
        return self.reply


@pytest.fixture(scope="module")
def rag():
    return AgenticEdRAG(llm=None, verbose=False)   # loads the embedder + vector DB once


def test_off_topic_question_is_refused_before_the_llm_is_called(rag):
    rag.llm = FakeLLM("It is 31°C and sunny in Mumbai.")   # would be an invented answer
    result = rag.ask("What is the weather in Mumbai today?")
    assert result["answer"] == NOT_FOUND
    assert result["sources"] == []
    assert result["mode"] == "guard"
    assert rag.llm.calls == 0, "the LLM must not even be asked about off-topic questions"


def test_answer_without_citations_is_blocked(rag):
    # A made-up answer that cites no source must never reach the student.
    # The question is on-topic (passes the guard), but the fake LLM invents a price.
    rag.llm = FakeLLM("AgenticEd costs Rs 999 per month after a free trial.")
    result = rag.ask("Is AgenticEd free to use?")
    assert rag.llm.calls == 1
    assert result["answer"] == NOT_FOUND
    assert "999" not in result["answer"]
    assert result["sources"] == []


def test_llm_refusal_is_passed_through_without_sources(rag):
    rag.llm = FakeLLM(NOT_FOUND)
    result = rag.ask("When will the Level 2 AI Application & Agent Builder path launch?")
    assert result["found"] is False
    assert result["answer"] == NOT_FOUND
    assert result["sources"] == []


live_llm = llm_from_env()
needs_key = pytest.mark.skipif(live_llm is None, reason="no API key in chatbot/.env")


@needs_key
@pytest.mark.parametrize("question", [
    "When will the Level 2 AI Application & Agent Builder path launch?",
    "What is the phone number of the AgenticEd office?",
])
def test_real_llm_refuses_missing_information(rag, question):
    rag.llm = live_llm
    result = rag.ask(question)
    assert result["answer"] == NOT_FOUND, f"invented an answer: {result['answer']}"
    assert result["sources"] == []
    assert not re.search(r"\d{4}|\+\d", result["answer"]), "no dates or phone numbers may appear"


@needs_key
def test_real_llm_answers_supported_question_with_sources(rag):
    rag.llm = live_llm
    result = rag.ask("Is AgenticEd free to use?")
    assert result["found"] is True
    assert result["sources"], "a supported answer must show its sources"
    assert re.search(r"\[\d\]", result["answer"]), "answer must cite sources like [1]"
