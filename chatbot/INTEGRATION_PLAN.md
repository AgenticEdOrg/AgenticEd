# Website integration plan: AgenticEd Learning Assistant

## 1. What this PR changes on the website

| Change | Effect on the live site today |
|---|---|
| New folder `chatbot/` (backend + widget) | None: static hosting just serves extra files |
| 2 lines in `index.html` (`chatbot/widget/chatbot.css`, `chatbot/widget/chatbot.js`) | **None until a backend exists.** The widget calls `/api/health` first and stays hidden if no API answers |
| `site.js`, `site.css`, `analytics.js`, search, navigation | **Unchanged** |

So the PR is safe to merge before the backend is deployed. On `localhost` the widget talks
to `python chatbot/server.py` automatically.

## 2. Architecture

```
agenticed.org (static HTML/CSS/JS)                     Chatbot API (Python, new)
┌─────────────────────────────┐   POST /api/chat     ┌──────────────────────────────────┐
│ chatbot/widget/chatbot.js   │ ───────────────────► │ server.py (Flask, via gunicorn)  │
│  "✦ Ask AgenticEd" button   │ ◄─────────────────── │  rag.py: MiniLM + ChromaDB + BM25 │
│  shows answer + source links│   {answer, sources}  │  LLM API key in env, never in JS  │
└─────────────────────────────┘                      └──────────────────────────────────┘
```

The static site can't run Python or keep a secret key, so the chatbot needs a **small
separate backend**. The API key lives only in the backend's environment variables.

## 3. Rollout steps

| Phase | What | Owner | Done when |
|---|---|---|---|
| 0. This PR | RAG engine, knowledge file, tests, widget on `index.html`, hidden in production | Intern | Mentor review + merge |
| 1. Staging backend | Deploy `chatbot/` as a Python web service (any host that runs a Docker/Python app with ~1 GB RAM, e.g. Google Cloud Run, Render, Railway, Hugging Face Spaces). Start command (Linux host, with `gunicorn` added to the image): `gunicorn -w 1 -b 0.0.0.0:$PORT server:app` | Mentor/infra | `GET https://<api>/api/health` returns `ok: true` |
| 2. Connect the site | Add `<meta name="agenticed-chat-api" content="https://<api>">` to `index.html` (or set `window.AGENTICED_CHAT_API`). Set `AGENTICED_ALLOWED_ORIGINS` to the site's domains | Intern | Button appears on agenticed.org and answers questions |
| 3. Pilot | Homepage only for 2 weeks. Review server logs (`mode`, similarity, refusals) weekly | Intern + mentor | ≥ 90% of sampled answers correct and cited; no invented facts |
| 4. All pages | Add the same 2 lines to the week pages, FAQ, glossary, tools and certification pages (a shared include or a small script) | Intern | Widget on every learning page |

## 4. Keeping answers accurate

- **Knowledge stays in sync:** add a GitHub Action that runs `python chatbot/build_knowledge.py`
  when `*.html`, `agenticEd_curriculum.md` or `certifications/*.js` change, and fails the PR if
  `knowledge/agenticed_knowledge.jsonl` is out of date. The server rebuilds ChromaDB automatically
  when the knowledge file's hash changes.
- **Regression tests in CI:** run `pytest` (the 3 offline tests need no API key) on every PR;
  run `run_eval.py` weekly or before releases with a key stored as a GitHub secret.
- **Grow the eval set:** add every wrong or refused-but-answerable question from the pilot logs to
  `eval/questions.jsonl`.
- **Exam integrity:** keep excluding the exam question bank (`cert-data.js` questions) from the
  knowledge base; add a test that fails if any exam question text appears in the knowledge file.

## 5. Safety, privacy and cost

| Topic | Plan |
|---|---|
| **Student privacy** | The site promises no sign-up and on-device progress (`privacy.html`). Questions typed into the chatbot **are sent to the server and the LLM provider**. Before launch: update `privacy.html`, keep the in-widget notice ("don't share personal information"), log only the first 80 characters of each question plus mode and similarity (as `server.py` does now), and turn off access logs so IP addresses are kept only in memory for the 60 s rate-limit window |
| **Data use by provider** | Gemini's free tier may use prompts to improve Google's models. For the public launch use a **paid tier** (prompts not used for training) or another provider; switching is a `.env` change (`OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `AGENTICED_MODEL`) |
| **Abuse / cost control** | 10 questions per minute per visitor, 500-character limit, CORS limited to agenticed.org. Add a daily spend cap at the provider. Flash-class models cost a fraction of a cent per question |
| **Prompt injection** | Retrieved text is labelled as reference material, never instructions; answers are rendered with `textContent` (no HTML injection); source links are restricted to agenticed.org pages |
| **Availability** | Retries with backoff plus a fallback model; the widget shows a friendly "busy" message instead of failing silently |
| **Accessibility** | Keyboard operable (Enter to send, Esc to close), `role="dialog"`, `aria-live` answers, visible focus, respects reduced motion, full-screen on phones |

## 6. Open questions for the mentor

1. Which host should run the backend (Cloud Run, Render, Hugging Face Spaces, or existing infrastructure)?
2. Which LLM provider/tier for production, given the privacy promise?
3. Should the widget appear for all learners, or only on lesson pages at first?
4. Should anonymous chat logs feed into the existing feedback/analytics dashboard?
