# AgenticEd Developer Labs

Hands-on notebooks for developers who want to **build, evaluate, and govern LLM agents** with the frameworks used in production. Each lab pairs with a week of the AgenticEd Foundations course; the week pages carry the no-code labs, these notebooks are the developer track.

| # | Notebook | You build | Frameworks |
|---|---|---|---|
| 00 | [Environment check](00_environment_check.ipynb) | Verified setup: packages, key, model call, tool calling, MCP, data | — |
| 1 | [Agent fundamentals](week1_agent_fundamentals.ipynb) | Metered model calls → tool loop from scratch → agent vs workflow cost → typed agent with usage limits and approval-gated tools | LiteLLM, Pydantic AI, OpenAI Agents SDK |
| 2 | [LLM engineering](week2_llm_engineering.ipynb) | Token/cost estimation, sampling implemented on GPT-2 logits, validated structured output, prompt evaluation with accuracy and confusion matrix, abstention measurement | tiktoken, transformers, Pydantic AI |
| 3 | [Tools, RAG and memory](week3_tools_rag_memory.ipynb) | Chunking, ChromaDB, BM25, hybrid RRF, cross-encoder reranking, recall@k/MRR, cited answers with abstention, MCP, long-term memory with retention and erasure | ChromaDB, sentence-transformers, MCP |
| 4 | [Multi-agent systems](week4_multi_agent_systems.ipynb) | Orchestrator–workers graph with parallel fan-out, quote-verified handoffs, fault injection, `interrupt()` approval with checkpoint resume; the same team in CrewAI | LangGraph, CrewAI |
| 5 | [Build, evaluate, ship](week5_build_evaluate_ship.ipynb) | Agent card, production-shaped agent, eval suite with custom graders and an LLM judge, v1→v2 regression, red-team, run logging, API sketch | Pydantic AI, pydantic-evals |
| 6 | [Security and governance](week6_security_governance.ipynb) | OWASP threat model, indirect prompt injection with attack-success rates across five defence layers, Presidio PII redaction, counterfactual fairness, compliance mapping | Pydantic AI, Presidio |

Each notebook has an **Open in Colab** badge, exercises with automatic checks, a hidden solution, a governance note, and further reading.

## Setup

**Bring your own API key.** One of `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`. Defaults are low-cost models (`openai:gpt-5.4-mini` or `anthropic:claude-haiku-5-5`); all labs together typically cost under US$1. Set a spend limit in your provider dashboard.

**Google Colab (easiest).** Open a notebook from the table, add your key under *Secrets* (key icon in the left sidebar, enable notebook access), and run the first cell — it clones this repo and installs the pinned requirements.

**Local.** Python 3.11–3.13 (CrewAI does not yet support 3.14):

```bash
git clone https://github.com/AgenticEdOrg/AgenticEd.git
cd AgenticEd/labs
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                     # then paste your key
jupyter lab
```

**Other models.** Set `AGENTICED_MODEL` (e.g. `openai:gpt-4.1-mini`). For Ollama, vLLM, or a LiteLLM proxy set `OPENAI_BASE_URL` and `AGENTICED_MODEL=openai:<model>`; the model must support tool calling.

## Layout

```
labs/
├── 00_environment_check.ipynb … week6_security_governance.ipynb
├── labkit.py               # key loading + one model setting for every framework
├── mcp_servers/
│   └── policy_server.py    # MCP server exposing the course corpus (Weeks 3, 0)
├── data/
│   ├── corpus/             # 7 policy documents for a fictional school district (one contains a prompt injection)
│   └── eval/               # labeled retrieval questions
├── requirements.txt        # pinned, tested versions
└── .env.example
```

## Notes

- **Versions are pinned on purpose.** Agent frameworks change fast — MCP 2.x renamed `FastMCP` to `MCPServer`, Pydantic AI 2.x changed its MCP and usage APIs. If you upgrade, re-run `00_environment_check`.
- **The data is fictional.** Lakeview Unified School District, its people, vendors, and email addresses do not exist.
- **Privacy.** Lab traffic goes to the model provider you configure. The OpenAI Agents SDK's trace upload is disabled in the labs; enable it deliberately if you want it.

Licensed under the repository's license (CC BY 4.0).
