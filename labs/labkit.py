"""labkit — shared configuration for the AgenticEd developer labs.

Each framework spells model names differently. labkit reads your key once and hands every
framework the right model string, so one setting works across Pydantic AI, LiteLLM,
LangChain/LangGraph, CrewAI, and the OpenAI Agents SDK.

Configure with environment variables (a `.env` file locally, Colab Secrets in Colab):
    OPENAI_API_KEY      or   ANTHROPIC_API_KEY        (bring your own key)
    AGENTICED_MODEL     optional override, e.g. "openai:gpt-5.4-mini" or "anthropic:claude-haiku-5-5"
    OPENAI_BASE_URL     optional: any OpenAI-compatible endpoint (Ollama, vLLM, LiteLLM proxy)
"""
from __future__ import annotations

import json
import os
import pathlib
import re
from dataclasses import dataclass

LABS_DIR = pathlib.Path(__file__).resolve().parent
DATA_DIR = LABS_DIR / "data"

DEFAULT_MODELS = {
    "openai": "gpt-5.4-mini",          # low-cost OpenAI tier
    "anthropic": "claude-haiku-5-5",   # low-cost Anthropic tier
}
# USD per 1M tokens, for rough cost tracking only — check your provider's pricing page.
APPROX_PRICES = {"gpt-5.4-mini": (0.40, 1.60), "claude-haiku-5-5": (1.00, 5.00)}


def _load_secrets():
    """Copy keys from Colab Secrets or a local .env file into the environment."""
    names = ["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "OPENAI_BASE_URL", "AGENTICED_MODEL"]
    try:
        from google.colab import userdata  # type: ignore
        for n in names:
            try:
                value = userdata.get(n)
            except Exception:
                value = None
            if value and not os.environ.get(n):
                os.environ[n] = value
    except ImportError:
        try:
            from dotenv import load_dotenv
            load_dotenv(LABS_DIR / ".env")
        except ImportError:
            pass


@dataclass
class ModelConfig:
    provider: str        # "openai" or "anthropic"
    name: str            # provider's model name, e.g. "gpt-5.4-mini"
    base_url: str | None = None

    # ── framework-specific spellings ──
    @property
    def pydantic_ai(self):
        """Model for pydantic_ai.Agent(...)."""
        if self.provider == "openai" and self.base_url:
            from pydantic_ai.models.openai import OpenAIChatModel
            from pydantic_ai.providers.openai import OpenAIProvider
            return OpenAIChatModel(self.name, provider=OpenAIProvider(base_url=self.base_url,
                                                                       api_key=os.environ.get("OPENAI_API_KEY", "none")))
        return f"{self.provider}:{self.name}"

    @property
    def litellm(self):
        """Model string for litellm.completion(...) and CrewAI."""
        return f"{self.provider}/{self.name}"

    def litellm_kwargs(self):
        return {"api_base": self.base_url} if self.base_url else {}

    def langchain(self, **kwargs):
        """A LangChain chat model (works inside LangGraph)."""
        from langchain.chat_models import init_chat_model
        if self.base_url:
            kwargs.setdefault("base_url", self.base_url)
        return init_chat_model(self.name, model_provider=self.provider, **kwargs)

    def crewai(self, **kwargs):
        from crewai import LLM
        if self.base_url:
            kwargs.setdefault("base_url", self.base_url)
        return LLM(model=self.litellm, **kwargs)

    def openai_agents(self):
        """Model for the OpenAI Agents SDK (non-OpenAI providers go through LiteLLM)."""
        if self.provider == "openai" and not self.base_url:
            return self.name
        from agents.extensions.models.litellm_model import LitellmModel
        return LitellmModel(model=self.litellm, base_url=self.base_url)

    def cost(self, input_tokens, output_tokens):
        price = APPROX_PRICES.get(self.name)
        if not price:
            return None
        return round((input_tokens * price[0] + output_tokens * price[1]) / 1_000_000, 5)

    def __str__(self):
        where = f" via {self.base_url}" if self.base_url else ""
        return f"{self.provider}:{self.name}{where}"


def setup(verbose=True) -> ModelConfig:
    """Load keys and choose a model. Call once at the top of every notebook."""
    _load_secrets()
    os.environ.setdefault("PYDANTIC_AI_NO_BANNER", "1")
    base_url = os.environ.get("OPENAI_BASE_URL") or None
    override = os.environ.get("AGENTICED_MODEL")
    if override:
        provider, _, name = override.partition(":")
        cfg = ModelConfig(provider, name, base_url if provider == "openai" else None)
    elif os.environ.get("OPENAI_API_KEY"):
        cfg = ModelConfig("openai", DEFAULT_MODELS["openai"], base_url)
    elif os.environ.get("ANTHROPIC_API_KEY"):
        cfg = ModelConfig("anthropic", DEFAULT_MODELS["anthropic"])
    else:
        raise RuntimeError(
            "No API key found. Add OPENAI_API_KEY or ANTHROPIC_API_KEY to Colab Secrets "
            "(key icon in the left sidebar, enable notebook access) or to labs/.env, then re-run this cell.")
    if verbose:
        print(f"Model: {cfg}")
    return cfg


# ── Course data helpers ──────────────────────────────────────────────────
def load_corpus():
    """Return the Lakeview policy documents as a list of dicts: id, title, text, path."""
    docs = []
    for path in sorted((DATA_DIR / "corpus").glob("*.md")):
        raw = path.read_text(encoding="utf-8")
        meta, body = {}, raw
        m = re.match(r"^---\n(.*?)\n---\n(.*)$", raw, re.S)
        if m:
            for line in m.group(1).splitlines():
                key, _, value = line.partition(":")
                meta[key.strip()] = value.strip()
            body = m.group(2)
        docs.append({"id": meta.get("id", path.stem), "title": meta.get("title", path.stem),
                     "audience": meta.get("audience", ""), "text": body.strip(), "path": str(path)})
    return docs


def load_jsonl(relative_path):
    with open(DATA_DIR / relative_path, encoding="utf-8") as fh:
        return [json.loads(line) for line in fh if line.strip()]
