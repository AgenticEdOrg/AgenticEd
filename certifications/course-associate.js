/* AgenticEd Certifications — Associate prep course: Agent Builder.
   Module shape: {id, title, minutes, domain, objectives[], sections[{h, html}], pitfalls[], takeaways[], lab{title, steps[]}, check[{q, opts, a, why}]}
   Knowledge-check questions are practice only — they are deliberately different from the exam bank. */
window.AGENTICED_COURSES = window.AGENTICED_COURSES || {};
window.AGENTICED_COURSES.associate = {
  title: "Agent Builder — Associate",
  intro: "A practitioner course on designing, building, evaluating, and operating LLM-based agents. It covers agent architectures and design patterns, tool calling and structured output, planning and memory, production-grade RAG, multi-agent orchestration, evaluation, deployment and scaling, and running agents safely with human oversight.",
  alignedWith: "Structured around the ten domains of the NVIDIA-Certified Professional: Agentic AI (NCP-AAI) blueprint: architecture and design; development; evaluation and tuning; deployment and scaling; cognition, planning, and memory; knowledge integration; NVIDIA platform; run, monitor, and maintain; safety, ethics, and compliance; and human-AI interaction. AgenticEd is not affiliated with NVIDIA.",
  modules: [
    {
      id: "architecture-patterns",
      title: "Agent architecture and design patterns",
      minutes: 40,
      domain: "Agent architecture and design",
      objectives: [
        "Choose between a fixed workflow, a single agent, and a multi-agent system for a given problem",
        "Apply the common agentic patterns: prompt chaining, routing, parallelization, ReAct, plan-and-execute, reflection, and orchestrator-workers",
        "Design the agent's control loop, including stop conditions and budgets",
        "Document an agent design so it can be reviewed"
      ],
      sections: [
        {h: "Start with the simplest thing that works", html: `
<p>The most common architecture mistake is building an autonomous agent for a problem a fixed pipeline could solve. Use this ladder and stop at the first rung that meets the requirement:</p>
<ol>
<li><b>Single LLM call</b> with a good prompt (and maybe retrieval).</li>
<li><b>Workflow</b>: several LLM calls and tools connected by code in a fixed or branching order.</li>
<li><b>Single agent</b>: one model in a loop, choosing tools dynamically.</li>
<li><b>Multi-agent system</b>: several specialized agents coordinated by an orchestrator.</li>
</ol>
<p>Each rung adds flexibility and also adds cost, latency, unpredictability, and evaluation difficulty. Move up only when the task genuinely needs run-time decisions that can't be enumerated in advance.</p>`},
        {h: "Workflow patterns", html: `
<table class="tbl">
<tr><th>Pattern</th><th>How it works</th><th>Use when</th></tr>
<tr><td><b>Prompt chaining</b></td><td>Output of step 1 feeds step 2, with optional checks ("gates") between steps.</td><td>The task decomposes cleanly into fixed stages (outline → draft → edit).</td></tr>
<tr><td><b>Routing</b></td><td>A classifier (LLM or traditional) sends each input to a specialized prompt, model, or tool.</td><td>Inputs fall into distinct categories that need different handling (billing vs. technical support).</td></tr>
<tr><td><b>Parallelization</b></td><td>Independent subtasks run simultaneously (sectioning), or the same task runs several times and results are combined (voting).</td><td>Speed matters, or you want multiple perspectives or a majority vote.</td></tr>
<tr><td><b>Evaluator–optimizer</b></td><td>One call generates, another critiques against criteria, and the loop repeats until criteria are met.</td><td>Clear quality criteria exist and iteration measurably helps (translation, code that must pass tests).</td></tr>
</table>`},
        {h: "Agent patterns", html: `
<p><b>ReAct</b> interleaves a reasoning step with each tool call (Thought → Action → Observation). It is flexible and transparent, but it decides one step at a time and can wander on long tasks.</p>
<p><b>Plan-and-execute</b> first produces an explicit multi-step plan, then executes steps (possibly with a cheaper model), and re-plans if a step fails or new information arrives. It is better for long tasks, and the plan itself can be reviewed by a human before anything runs.</p>
<p><b>Reflection</b> (self-critique) has the agent review its own output or trajectory against criteria and revise. It catches many mistakes but cannot catch errors the model is systematically blind to; external checks (tests, validators, retrieval) are stronger.</p>
<p><b>Orchestrator–workers</b> uses a central agent that breaks a goal into subtasks at run time and delegates them to worker agents or tools, then synthesizes results. Covered in depth in Module 5.</p>`},
        {h: "Designing the control loop", html: `
<p>Every agent loop needs explicit answers to these questions before it ships:</p>
<ul>
<li><b>Stop conditions</b>: what counts as done? The model declaring a final answer, a validator passing, or a human approving.</li>
<li><b>Budgets</b>: maximum iterations, tokens, wall-clock time, and spend per task. Hitting a budget should end the run gracefully with a partial result and a clear status, not crash.</li>
<li><b>Error handling</b>: what happens when a tool times out, returns an error, or returns nonsense? Retry with backoff, try an alternative, or escalate.</li>
<li><b>Escalation</b>: when does the agent hand off to a human?</li>
<li><b>State</b>: what is kept between steps, and where (in context, in a state object, in external storage)?</li>
</ul>
<pre><code># Illustrative agent loop with budgets and stop conditions
def run_agent(goal, tools, max_steps=8, max_cost_usd=0.50):
    state = {"goal": goal, "history": [], "cost": 0.0}
    for step in range(max_steps):
        decision = llm_decide(state, tools)          # thought + chosen action
        state["cost"] += decision.cost
        if decision.type == "final_answer":
            return validate_and_return(decision.answer, state)
        if state["cost"] &gt; max_cost_usd:
            return partial_result(state, reason="budget_exceeded")
        if needs_approval(decision.action):
            if not human_approves(decision.action):
                state["history"].append(("denied", decision.action))
                continue
        result = safe_execute(decision.action, tools) # validated, sandboxed, timed out
        state["history"].append((decision.action, result))
    return partial_result(state, reason="max_steps_reached")</code></pre>`},
        {h: "Choosing models for each role", html: `
<p>Not every step needs the most capable model. A common design uses a strong reasoning model for planning and difficult judgment, and smaller, faster models for routing, extraction, and summarization. This can cut cost and latency dramatically. Make the model a configurable parameter of each step so you can swap models after evaluation (Module 6).</p>`},
        {h: "Write it down: the agent design document", html: `
<p>Before building, capture a one- or two-page design: the goal and success criteria; users; the chosen pattern and why simpler options were rejected; tools and their permission levels; data sources; memory strategy; budgets and stop conditions; human checkpoints; known risks and mitigations; and how it will be evaluated and monitored. This document becomes the basis for review, testing, and the governance record in Module 8.</p>`}
      ],
      pitfalls: [
        "Jumping to multi-agent designs because they sound advanced, not because the task needs them.",
        "Loops with no iteration, cost, or time budget.",
        "Relying on self-reflection alone when an external validator (tests, schema checks, retrieval) is available."
      ],
      takeaways: [
        "Climb the complexity ladder only as far as the task requires: call → workflow → agent → multi-agent.",
        "Workflow patterns: chaining, routing, parallelization, evaluator–optimizer.",
        "Agent patterns: ReAct, plan-and-execute, reflection, orchestrator–workers.",
        "Every loop needs stop conditions, budgets, error handling, and escalation paths.",
        "Assign models per step based on difficulty, cost, and latency."
      ],
      lab: {title: "Architecture review", steps: [
        "Take three use cases: (a) tag incoming support emails by product, (b) produce a weekly competitor-news digest, (c) investigate and fix a failing data pipeline.",
        "For each, choose the lowest rung on the complexity ladder that works and name the pattern.",
        "For the most agentic one, write its stop conditions, budgets, and one human checkpoint.",
        "Compare with a colleague and defend each choice."
      ]},
      check: [
        {q:"Incoming requests are either refund requests, technical problems, or sales questions, and each needs a different prompt and toolset. Which pattern fits best?",
         opts:["Reflection","Routing","Parallelization by voting","A fully autonomous multi-agent system"],
         a:1, why:"Distinct input categories that need different handling is the textbook case for routing."},
        {q:"What is the main advantage of plan-and-execute over pure ReAct for a long, multi-step task?",
         opts:["It never needs tools","It produces an explicit plan that can be reviewed and followed, reducing wandering, and can re-plan on failure","It uses no tokens","It removes the need for stop conditions"],
         a:1, why:"An upfront plan gives structure to long tasks, is auditable before execution, and can be revised when steps fail."},
        {q:"An agent's tool call times out three times in a row. What should a well-designed control loop do?",
         opts:["Retry forever","Crash without explanation","Follow its error policy — e.g., try an alternative or stop and return a partial result with a clear status or escalate","Invent the tool's result"],
         a:2, why:"Robust loops have explicit error handling: bounded retries, fallbacks, and graceful termination or escalation."},
        {q:"Which is the strongest way to catch errors in agent-generated code before returning it?",
         opts:["Ask the same model whether the code looks correct","Run the code against automated tests (an external validator) inside an evaluator–optimizer loop","Increase the temperature","Add more emojis to the prompt"],
         a:1, why:"External, objective checks like tests catch errors that self-reflection can miss because the model shares its own blind spots."}
      ]
    },

    {
      id: "agent-development",
      title: "Agent development: tools, function calling, and structured output",
      minutes: 45,
      domain: "Agent development",
      objectives: [
        "Define tools with clear names, descriptions, and JSON-schema parameters",
        "Implement the tool-calling loop, including parallel calls and error results",
        "Enforce and validate structured output",
        "Apply production practices: timeouts, retries, idempotency, and sandboxing"
      ],
      sections: [
        {h: "Defining a tool", html: `
<p>A tool definition has three parts: a <b>name</b>, a <b>description</b> the model reads to decide when to use it, and a <b>parameter schema</b> (usually JSON Schema). The description is effectively a prompt — write it carefully.</p>
<pre><code>{
  "name": "search_orders",
  "description": "Look up a customer's orders by email. Use this when the user
    asks about order status, delivery, or past purchases. Returns at most 10
    orders, newest first. Does NOT return payment details.",
  "parameters": {
    "type": "object",
    "properties": {
      "email":  {"type": "string", "description": "Customer email address"},
      "status": {"type": "string", "enum": ["any", "open", "shipped", "delivered"],
                 "description": "Filter by order status. Default 'any'."}
    },
    "required": ["email"]
  }
}</code></pre>
<p>Good tool design: one clear purpose per tool; names that read like verbs; enums instead of free text where possible; descriptions that say when <i>not</i> to use the tool; and outputs that are concise and relevant (huge tool outputs waste context and distract the model).</p>`},
        {h: "The tool-calling loop", html: `
<p>Most model APIs, including OpenAI-compatible endpoints such as NVIDIA NIM, follow the same flow:</p>
<ol>
<li>Send the conversation plus the list of tool definitions.</li>
<li>The model replies with either a final message or one or more <b>tool calls</b> (name + JSON arguments + an ID).</li>
<li>Your code validates the arguments, executes each call, and appends a <b>tool result</b> message referencing the call ID.</li>
<li>Send the updated conversation back. Repeat until the model returns a final message.</li>
</ol>
<pre><code># Illustrative; exact field names vary by SDK
messages = [system_msg, user_msg]
while True:
    resp = client.chat(model=MODEL, messages=messages, tools=TOOLS)
    msg = resp.message
    messages.append(msg)
    if not msg.tool_calls:
        break                                   # final answer
    for call in msg.tool_calls:                 # may be several in parallel
        try:
            args = validate(call.name, json.loads(call.arguments))
            result = REGISTRY[call.name](**args)
            content = json.dumps(result)[:4000]   # keep results compact
        except Exception as e:
            content = json.dumps({"error": str(e)})  # let the model recover
        messages.append({"role": "tool", "tool_call_id": call.id,
                         "content": content})</code></pre>
<p>Return errors to the model as tool results rather than crashing: models are often good at correcting a malformed argument or choosing a different approach once they see the error.</p>`},
        {h: "Structured output", html: `
<p>When an agent's output is consumed by code, free text is fragile. Use the strongest mechanism available:</p>
<ol>
<li><b>Schema-constrained decoding</b> (often called structured outputs or guided decoding): the inference engine only allows tokens that keep the output valid against your JSON Schema. Most reliable.</li>
<li><b>JSON mode</b>: guarantees valid JSON, but not your specific schema.</li>
<li><b>Prompt instructions plus examples</b>: weakest; works most of the time.</li>
</ol>
<p>Whatever the mechanism, <b>validate</b> the result in code (for example with Pydantic or a JSON Schema validator). On failure, retry once with the validation error included in the prompt, then fail clearly.</p>`},
        {h: "Production practices for tools", html: `
<ul>
<li><b>Timeouts</b> on every external call; agents stall silently without them.</li>
<li><b>Retries with exponential backoff</b> for transient errors (rate limits, network blips) — but only for safe operations.</li>
<li><b>Idempotency</b>: design write operations so repeating them doesn't duplicate effects (e.g., an idempotency key on "create payment"). Agents and retry logic <i>will</i> repeat calls.</li>
<li><b>Least privilege</b>: each tool gets only the permissions it needs — a read-only database user for a lookup tool.</li>
<li><b>Sandboxing</b>: run model-generated code in an isolated environment with no network or file access beyond what is needed, and with CPU/memory/time limits.</li>
<li><b>Input validation</b>: never pass model-generated arguments directly into SQL, shell commands, or file paths. Treat them as untrusted user input.</li>
<li><b>Logging</b>: record every call, its arguments, result summary, latency, and cost.</li>
</ul>`},
        {h: "Frameworks and standards", html: `
<p>You can build agents with plain API calls, which keeps everything visible. Frameworks add structure: <b>LangGraph</b> models agents as state graphs with explicit nodes and edges; <b>CrewAI</b> organizes role-based agent teams; <b>AutoGen</b> focuses on conversational multi-agent setups; <b>LlamaIndex</b> is strong on data and retrieval; and the <b>NVIDIA NeMo Agent Toolkit</b> adds framework-agnostic profiling, evaluation, and observability across agents built with any of these. The <b>Model Context Protocol (MCP)</b> standardizes how tools and data sources are exposed to agents, so a tool server written once can be used by many clients.</p>
<p>Choose a framework for what it makes easier (state management, persistence, human-in-the-loop interrupts, tracing), and make sure you can still see the exact prompts and tool calls it sends.</p>`}
      ],
      pitfalls: [
        "Vague tool descriptions, so the model calls the wrong tool or none at all.",
        "Passing model-generated arguments directly into SQL or shell commands.",
        "Retrying non-idempotent write operations and causing duplicate actions.",
        "Dumping enormous tool outputs into context."
      ],
      takeaways: [
        "Tool descriptions are prompts: say what the tool does, when to use it, and when not to.",
        "The model proposes tool calls; your code validates, executes, and returns results with matching IDs.",
        "Return tool errors to the model so it can recover.",
        "Prefer schema-constrained structured output, and always validate in code.",
        "Timeouts, backoff, idempotency, least privilege, sandboxing, and logging are mandatory in production."
      ],
      lab: {title: "Build a two-tool agent", steps: [
        "Using any LLM API with tool calling, define two tools: get_weather(city) and convert_temperature(value, from_unit, to_unit). Stub them with fake data.",
        "Implement the tool-calling loop with a maximum of 5 iterations.",
        "Ask: 'Is it warmer in Chennai or Oslo right now, in Fahrenheit?' and log every tool call.",
        "Make get_weather throw an error for one city and confirm the agent recovers or explains the failure.",
        "Add schema validation to the final answer: {warmer_city: string, difference_f: number}."
      ]},
      check: [
        {q:"An agent keeps calling 'search_docs' when it should call 'search_orders'. What is the first thing to fix?",
         opts:["Switch to a larger model","Rewrite both tool descriptions so each clearly states when it should and shouldn't be used","Remove one of the tools","Raise the temperature"],
         a:1, why:"Tool selection is driven by descriptions. Clear, contrasting descriptions are the cheapest and most effective fix."},
        {q:"A tool call fails because the model passed an invalid date format. What is the best handling?",
         opts:["Crash the agent","Return the validation error as the tool result so the model can correct the argument and retry","Silently substitute today's date","Hide the error and return an empty result"],
         a:1, why:"Models can usually self-correct when they see a clear error message, and the failure stays visible in logs."},
        {q:"Why must a 'create_refund' tool be idempotent?",
         opts:["To make it faster","Because agents and retry logic may call it more than once, and duplicates must not issue multiple refunds","Idempotency is only for read operations","To reduce token usage"],
         a:1, why:"Repeated calls are normal in agent systems. Idempotency keys ensure a repeated request has no additional effect."},
        {q:"Which approach gives the strongest guarantee that output matches a JSON Schema?",
         opts:["Asking nicely in the prompt","Schema-constrained (guided) decoding, plus validation in code","JSON mode alone","Few-shot examples alone"],
         a:1, why:"Constrained decoding prevents invalid tokens at generation time; code-side validation still catches anything unexpected."}
      ]
    },

    {
      id: "cognition-planning-memory",
      title: "Cognition, planning, and memory",
      minutes: 40,
      domain: "Cognition, planning, and memory",
      objectives: [
        "Apply task decomposition and planning strategies, including re-planning",
        "Use reasoning techniques: chain-of-thought, self-consistency, and reasoning models",
        "Design short-term and long-term memory: buffers, summaries, episodic, semantic, and procedural memory",
        "Manage the context window deliberately (context engineering)"
      ],
      sections: [
        {h: "Planning and decomposition", html: `
<p>Agents succeed on complex goals by breaking them down. Common strategies:</p>
<ul>
<li><b>Upfront decomposition</b>: generate a list of subtasks with dependencies before acting (plan-and-execute).</li>
<li><b>Hierarchical planning</b>: high-level steps first, each expanded into detailed steps only when reached.</li>
<li><b>Interleaved planning</b>: decide one step at a time based on the latest observation (ReAct).</li>
<li><b>Re-planning</b>: when a step fails or results contradict assumptions, revise the remaining plan rather than pushing on.</li>
</ul>
<p>Represent plans as structured data (a list of steps with status, inputs, and outputs) rather than prose. Structured plans can be displayed to users, checkpointed, resumed after a crash, and audited.</p>`},
        {h: "Reasoning techniques", html: `
<p><b>Chain-of-thought</b> prompting asks for intermediate reasoning and improves multi-step accuracy. <b>Self-consistency</b> samples several independent reasoning paths and takes the majority answer, trading cost for reliability. <b>Tree-of-thought</b>-style search explores and scores multiple partial solutions. Many current models are <b>reasoning models</b> that perform extended internal reasoning before answering; for these, give clear goals and constraints rather than step-by-step instructions, and budget for the extra latency and tokens.</p>
<div class="note"><b>Design choice:</b> reserve expensive reasoning for decisions that need it — planning, ambiguous judgment, debugging — and use fast models for routine steps.</div>`},
        {h: "Types of memory", html: `
<table class="tbl">
<tr><th>Memory type</th><th>Holds</th><th>Typical implementation</th></tr>
<tr><td><b>Working (short-term)</b></td><td>The current task: recent messages, tool results, the plan</td><td>The context window</td></tr>
<tr><td><b>Episodic</b></td><td>What happened in past sessions — "last week the user asked for a shorter report"</td><td>Stored conversation summaries or event logs, retrieved by relevance or recency</td></tr>
<tr><td><b>Semantic</b></td><td>Facts and knowledge: user preferences, domain facts, entity details</td><td>Key-value stores, databases, vector indexes, knowledge graphs</td></tr>
<tr><td><b>Procedural</b></td><td>How to do things: instructions, learned routines, reusable skills</td><td>The system prompt, stored prompt templates or skill files, tool definitions</td></tr>
</table>`},
        {h: "Managing the context window", html: `
<p><b>Context engineering</b> means deciding what goes into the limited context window at each step. Useful techniques:</p>
<ul>
<li><b>Sliding window</b>: keep only the last N turns.</li>
<li><b>Summarization</b>: compress older turns into a running summary; keep recent turns verbatim.</li>
<li><b>Retrieval</b>: store everything externally and pull in only what's relevant to the current step.</li>
<li><b>Scratchpads and notes</b>: let the agent write key findings to an external file or state object, then reload just those notes.</li>
<li><b>Tool-output trimming</b>: return summaries or the relevant fields instead of entire documents.</li>
<li><b>Sub-agents</b>: give a sub-task its own fresh context and return only a condensed result to the parent.</li>
</ul>
<p>Long contexts are not free: they raise cost and latency, and models can attend less reliably to details buried in the middle. More context is not always better context.</p>`},
        {h: "Writing to long-term memory safely", html: `
<p>Memory that persists across sessions needs rules: <b>what</b> is worth storing (stable preferences and facts, not every message), <b>who</b> can read it (per-user isolation), <b>how long</b> it is kept (retention limits), and how a user can <b>view and delete</b> it. Memory is also an attack surface: if an agent stores content from an untrusted web page as a "fact", that poisoned memory can influence every future session. Validate before storing, and record the source of each memory.</p>`}
      ],
      pitfalls: [
        "Pushing on with a plan after a step has clearly failed instead of re-planning.",
        "Stuffing the entire history into context until it overflows or becomes costly and confused.",
        "Storing unverified external content as long-term memory.",
        "Mixing different users' memories in a shared store without isolation."
      ],
      takeaways: [
        "Decompose goals into structured plans and re-plan when reality diverges.",
        "Chain-of-thought, self-consistency, and reasoning models trade cost for accuracy — use them where it matters.",
        "Memory types: working, episodic, semantic, procedural.",
        "Context engineering: summarize, retrieve, trim, and isolate rather than accumulate.",
        "Long-term memory needs scope, retention, user control, and protection against poisoning."
      ],
      lab: {title: "Memory design exercise", steps: [
        "Design memory for a personal study-coach agent used daily for a semester.",
        "List what goes into working, episodic, semantic, and procedural memory, with one example each.",
        "Write the rule for summarizing a session at its end, and the maximum size of that summary.",
        "Define how a student can see and delete what the coach remembers about them."
      ]},
      check: [
        {q:"An agent remembers that a user prefers metric units across all future sessions. What type of memory is this?",
         opts:["Working memory","Semantic memory (a stored fact/preference)","Procedural memory","The model's training data"],
         a:1, why:"A durable fact about the user, stored and retrieved across sessions, is semantic memory."},
        {q:"A research agent's context fills up after reading many long documents. Which approach best preserves quality?",
         opts:["Keep appending full documents until the API errors","Have the agent write concise notes per document to external state and reload only those notes","Delete the system prompt to make room","Switch to a higher temperature"],
         a:1, why:"Externalized notes keep the essential information while freeing context, which also improves focus and cost."},
        {q:"What does self-consistency do?",
         opts:["Forces the model to repeat its first answer","Samples multiple independent reasoning paths and selects the most common answer","Checks spelling","Stores memory consistently"],
         a:1, why:"Majority voting across several reasoning paths reduces the chance that one flawed path determines the answer."},
        {q:"Why is writing web-page content directly into long-term memory risky?",
         opts:["It uses too much disk space","Malicious or wrong content can become a persistent 'fact' that influences all future sessions (memory poisoning)","Web pages can't be stored","Memory must only contain numbers"],
         a:1, why:"Persisted memory outlives the session. Unvalidated external content can poison future behavior."}
      ]
    },

    {
      id: "knowledge-integration",
      title: "Knowledge integration: production RAG and data handling",
      minutes: 45,
      domain: "Knowledge integration and data handling",
      objectives: [
        "Build an ingestion pipeline: parsing, cleaning, chunking, metadata, and embedding",
        "Improve retrieval with hybrid search, reranking, query rewriting, and metadata filtering",
        "Explain agentic RAG and when to use knowledge graphs or SQL instead of vectors",
        "Handle data responsibly: access control, PII, freshness, and provenance"
      ],
      sections: [
        {h: "The RAG pipeline end to end", html: `
<p>Production RAG has two pipelines. <b>Ingestion</b> (offline): load documents → parse (PDF, HTML, tables, scans via OCR) → clean → <b>chunk</b> → attach metadata → embed → store in a vector index. <b>Query</b> (online): receive question → optionally rewrite it → retrieve candidates → <b>rerank</b> → assemble context → generate with citations → validate.</p>
<p>Most RAG quality problems are retrieval problems: if the right passage never reaches the model, no prompt can fix the answer. Evaluate retrieval separately from generation (Module 6).</p>`},
        {h: "Chunking strategies", html: `
<table class="tbl">
<tr><th>Strategy</th><th>Description</th><th>Trade-off</th></tr>
<tr><td>Fixed-size</td><td>Split every N tokens with some overlap (e.g., 500 tokens, 50 overlap)</td><td>Simple, but can cut ideas in half</td></tr>
<tr><td>Structure-aware</td><td>Split on headings, sections, paragraphs, or table boundaries</td><td>Keeps meaning together; needs good parsing</td></tr>
<tr><td>Semantic</td><td>Split where the topic shifts, based on embedding similarity</td><td>Coherent chunks; more compute</td></tr>
<tr><td>Parent–child</td><td>Retrieve small chunks for precision, then pass their larger parent section for context</td><td>Precise and complete; more complex</td></tr>
</table>
<p>Attach <b>metadata</b> to each chunk: source, title, section, date, author, access level. Metadata enables filtering ("only 2025 policies"), citations, and permission checks.</p>`},
        {h: "Better retrieval", html: `
<ul>
<li><b>Hybrid search</b>: combine dense vector search (meaning) with sparse keyword search such as BM25 (exact terms like product codes, names, error IDs), then fuse the rankings.</li>
<li><b>Reranking</b>: retrieve a broad set (e.g., top 50) cheaply, then use a cross-encoder reranker model to score each candidate against the query and keep the best 5–10. This is often the single biggest quality gain.</li>
<li><b>Query rewriting</b>: turn conversational follow-ups ("what about for contractors?") into standalone queries; expand acronyms; generate several query variants.</li>
<li><b>Metadata filtering</b>: restrict search by date, department, product, or the user's permissions before ranking.</li>
<li><b>Embedding model choice</b>: domain and language matter; evaluate on your own queries. NVIDIA NeMo Retriever, for example, provides embedding and reranking microservices for these stages.</li>
</ul>`},
        {h: "Agentic RAG and other knowledge sources", html: `
<p>In basic RAG, retrieval happens once. In <b>agentic RAG</b>, retrieval is a tool the agent chooses to call — possibly several times, with refined queries, across several sources — and it judges whether results are sufficient before answering. This handles multi-hop questions ("Which of our suppliers in Germany had late deliveries last quarter?") far better.</p>
<p>Vectors aren't always the right store. Use <b>SQL or APIs</b> for structured, exact data (counts, totals, filters) — let the agent generate a query against a read-only, permission-scoped connection. Use a <b>knowledge graph</b> when relationships between entities matter (GraphRAG). Many systems combine all three.</p>`},
        {h: "Grounded generation and citations", html: `
<p>Instruct the model to answer only from the provided context, cite the chunk ID for each claim, and say when the context is insufficient. Then <b>check</b>: verify cited IDs exist in the retrieved set, and for high-stakes uses run a groundedness check that each claim is supported by its citation.</p>`},
        {h: "Responsible data handling", html: `
<ul>
<li><b>Access control at retrieval time</b>: a user must only retrieve chunks they are permitted to see. Enforce this in the retrieval query, never by asking the model to withhold information.</li>
<li><b>PII</b>: detect and redact or exclude personal data during ingestion where it isn't needed.</li>
<li><b>Freshness</b>: re-ingest changed documents, delete removed ones, and store dates so stale content can be filtered or flagged.</li>
<li><b>Provenance</b>: know where every chunk came from and when; this underpins citations, audits, and deletion requests.</li>
<li><b>Untrusted content</b>: documents can contain hidden instructions (indirect prompt injection). Treat retrieved text as data, not commands.</li>
</ul>`}
      ],
      pitfalls: [
        "Tuning the generation prompt when the real problem is that retrieval never finds the right chunk.",
        "Relying on the model to hide documents a user isn't allowed to see.",
        "Vector search for questions that need exact aggregation — use SQL.",
        "Never re-indexing, so answers cite outdated policies."
      ],
      takeaways: [
        "RAG = ingestion (parse, chunk, embed, store) + query (rewrite, retrieve, rerank, generate, validate).",
        "Chunk along document structure and attach rich metadata.",
        "Hybrid search plus reranking is the standard recipe for strong retrieval.",
        "Agentic RAG lets the agent search iteratively across sources; use SQL and graphs where they fit.",
        "Enforce permissions, PII handling, freshness, and provenance in the data layer."
      ],
      lab: {title: "Retrieval quality experiment", steps: [
        "Collect 20 pages of documentation and write 15 questions with known answer locations.",
        "Index the docs with fixed-size chunks and measure how often the correct chunk appears in the top 5 (recall@5).",
        "Switch to structure-aware chunking and remeasure.",
        "Add keyword search (hybrid) and, if available, a reranker. Record recall@5 after each change."
      ]},
      check: [
        {q:"Users search for error code 'E-4471' and vector search returns generic troubleshooting pages. What is the best fix?",
         opts:["A larger LLM","Hybrid search that adds keyword matching (e.g., BM25) for exact terms","Higher temperature","Bigger chunks"],
         a:1, why:"Exact identifiers are where dense embeddings are weakest and keyword search is strongest. Hybrid search combines both."},
        {q:"What does a reranker do in a RAG pipeline?",
         opts:["Generates the final answer","Scores a broad set of retrieved candidates more precisely against the query and keeps the best ones","Splits documents into chunks","Encrypts the vector index"],
         a:1, why:"Retrieve-then-rerank uses a fast search for recall and a precise cross-encoder for ordering."},
        {q:"A manager asks 'How many tickets did each region close last month?' Where should the agent get the answer?",
         opts:["Vector search over ticket text","A read-only SQL query against the ticket database","The model's training data","A summary of random tickets"],
         a:1, why:"Exact counts and aggregations need structured queries; similarity search cannot reliably count."},
        {q:"How should a RAG system stop employees from seeing confidential HR documents?",
         opts:["Instruct the model not to mention them","Filter by the user's permissions in the retrieval layer so those chunks are never retrieved","Hope users don't ask","Store HR documents in a different language"],
         a:1, why:"Access control must be enforced before content reaches the model; prompts are not a security boundary."}
      ]
    },

    {
      id: "multi-agent",
      title: "Multi-agent systems and orchestration",
      minutes: 35,
      domain: "Agent architecture and design",
      objectives: [
        "Compare multi-agent topologies: orchestrator–worker, hierarchical, sequential, and peer collaboration",
        "Design reliable handoffs with structured contracts and verification",
        "Recognize multi-agent failure modes such as error compounding, loops, and context loss",
        "Decide when multiple agents are worth their extra cost"
      ],
      sections: [
        {h: "Why multiple agents?", html: `
<p>Splitting work across agents helps when subtasks need <b>different tools, instructions, or models</b>; when they can run <b>in parallel</b>; or when one agent's context would overflow. Each agent gets a focused role, a smaller toolset, and a clean context, which often improves reliability. The price is more LLM calls, more latency, and more places for things to go wrong.</p>`},
        {h: "Topologies", html: `
<table class="tbl">
<tr><th>Topology</th><th>Shape</th><th>Good for</th></tr>
<tr><td><b>Orchestrator–worker</b></td><td>A lead agent decomposes the goal, delegates to workers, and synthesizes results</td><td>Research, analysis, tasks whose subtasks aren't known in advance</td></tr>
<tr><td><b>Sequential pipeline</b></td><td>Agent A → Agent B → Agent C</td><td>Content workflows: research → draft → fact-check → publish</td></tr>
<tr><td><b>Hierarchical</b></td><td>Managers supervising teams of workers, several levels deep</td><td>Very large tasks; rarely needed</td></tr>
<tr><td><b>Peer / debate</b></td><td>Agents critique or negotiate with each other</td><td>Surfacing disagreement, red-teaming, decision review</td></tr>
</table>`},
        {h: "Handoffs are contracts", html: `
<p>A <b>handoff</b> is where one agent's output becomes another's input. Treat it as an API contract:</p>
<ul>
<li>Define a <b>schema</b> for what passes between agents (fields, types, required evidence such as source URLs).</li>
<li><b>Validate</b> at each boundary; reject or return malformed output.</li>
<li>Pass <b>the task, not the whole history</b>: give workers a clear brief (objective, constraints, expected output format, budget) so they don't inherit irrelevant context.</li>
<li>Include <b>provenance</b>: which agent produced what, from which sources.</li>
</ul>`},
        {h: "Failure modes", html: `
<ul>
<li><b>Error compounding</b>: a wrong fact from the researcher becomes a polished paragraph and then a published claim. Each stage makes the error look more credible. Mitigation: verification agents or validators between stages, and evidence requirements.</li>
<li><b>Infinite delegation or ping-pong</b>: agents keep handing work back and forth. Mitigation: global step and cost budgets, and a single owner for termination.</li>
<li><b>Duplicated or conflicting work</b>: two workers do the same task or contradict each other. Mitigation: clear task boundaries in the orchestrator's briefs.</li>
<li><b>Lost context</b>: a worker lacks information the orchestrator assumed it had. Mitigation: explicit briefs.</li>
<li><b>Responsibility diffusion</b>: no single component owns the final answer. Mitigation: the orchestrator (and ultimately a human owner) is accountable for the synthesized result.</li>
</ul>`},
        {h: "Observability across agents", html: `
<p>Debugging a multi-agent run without tracing is nearly impossible. Use distributed tracing: one trace per user request, with spans for each agent, LLM call, and tool call, including inputs, outputs, tokens, latency, and cost. Tools such as the NVIDIA NeMo Agent Toolkit, LangSmith, Langfuse, Arize Phoenix, and OpenTelemetry-based tracing provide this view (Module 8).</p>`}
      ],
      pitfalls: [
        "Adding agents to look sophisticated when a single agent with good tools would do.",
        "Passing unvalidated free text between agents.",
        "No global budget across the whole multi-agent run.",
        "No verification step between generating content and publishing it."
      ],
      takeaways: [
        "Use multiple agents for specialization, parallelism, or context isolation — not by default.",
        "Orchestrator–worker and sequential pipelines are the most common topologies.",
        "Handoffs need schemas, validation, focused briefs, and provenance.",
        "Error compounding is the defining multi-agent risk; verify between stages.",
        "Trace every agent, LLM call, and tool call under one request ID."
      ],
      lab: {title: "Design a research crew", steps: [
        "Design an orchestrator plus three workers to produce a 2-page market brief on a topic of your choice.",
        "Write the brief template the orchestrator sends to each worker.",
        "Write the JSON schema each worker must return, including a required 'sources' array.",
        "Add a fact-check stage and define what it does when a claim has no source."
      ]},
      check: [
        {q:"In a research → write → publish pipeline, an invented statistic reaches the published article. Which change addresses the root cause?",
         opts:["Use a faster writing agent","Require sources in the research schema and add a verification stage before writing and publishing","Remove the research agent","Increase the article length"],
         a:1, why:"Evidence requirements plus verification at handoffs stop errors before later stages amplify them."},
        {q:"Two agents keep delegating a task back to each other. What prevents this?",
         opts:["Higher temperature","Global step and cost budgets with a single owner responsible for termination","More agents","Removing the orchestrator's system prompt"],
         a:1, why:"Budgets and clear ownership of termination stop delegation loops."},
        {q:"What should an orchestrator send a worker agent?",
         opts:["The entire conversation history every time","A focused brief: objective, constraints, expected output format, and budget","Only a one-word task name","Nothing — workers decide their own tasks"],
         a:1, why:"Focused briefs give workers what they need without irrelevant context, reducing confusion and cost."},
        {q:"When is a multi-agent design least justified?",
         opts:["Subtasks need different tools and can run in parallel","One agent's context would overflow","A single agent with three tools already handles the task reliably","Subtasks need different specialized models"],
         a:2, why:"If a single agent works reliably, more agents only add cost, latency, and failure points."}
      ]
    },

    {
      id: "evaluation-tuning",
      title: "Evaluation and tuning",
      minutes: 45,
      domain: "Evaluation and tuning",
      objectives: [
        "Build an evaluation dataset and define task-specific success metrics",
        "Evaluate final outputs, retrieval quality, and agent trajectories",
        "Use LLM-as-a-judge responsibly alongside human review",
        "Tune agents through prompts, tools, retrieval, model choice, and fine-tuning"
      ],
      sections: [
        {h: "Evaluation is the core engineering discipline", html: `
<p>Agents are non-deterministic and fail in subtle ways, so "it worked when I tried it" is meaningless. Every change to a prompt, model, tool, or retrieval setting should be measured against a fixed <b>evaluation set</b> before release. This is often called <b>eval-driven development</b>.</p>`},
        {h: "Building an evaluation set", html: `
<ul>
<li>Start with 30–100 realistic tasks; grow it over time.</li>
<li>Include the common cases, the edge cases, adversarial inputs, and questions the agent <i>should refuse</i> or say it can't answer.</li>
<li>Add every real production failure as a new test case (<b>regression tests</b>).</li>
<li>For each case, record the expected outcome: a reference answer, required facts, required tool calls, or a rubric.</li>
<li>Keep a held-out portion you don't tune against, to avoid overfitting your prompts to the test set.</li>
</ul>`},
        {h: "What to measure", html: `
<table class="tbl">
<tr><th>Level</th><th>Example metrics</th></tr>
<tr><td><b>Final output</b></td><td>Task success rate; correctness vs. reference; rubric scores for helpfulness, tone, completeness; format validity</td></tr>
<tr><td><b>Retrieval (RAG)</b></td><td>Recall@k (was the right chunk retrieved?); precision; MRR / nDCG (was it ranked high?)</td></tr>
<tr><td><b>Generation (RAG)</b></td><td><b>Faithfulness / groundedness</b> (claims supported by context); answer relevance; citation accuracy</td></tr>
<tr><td><b>Trajectory</b></td><td>Correct tools chosen; correct arguments; unnecessary steps; loops; policy violations along the way</td></tr>
<tr><td><b>Operational</b></td><td>Latency (time to first token, total), tokens and cost per task, error and timeout rate</td></tr>
<tr><td><b>Safety</b></td><td>Refusal correctness, prompt-injection resistance, PII leakage, harmful content rate</td></tr>
</table>
<p>Because outputs vary, run each case several times and report rates (e.g., "succeeds 9 of 10 runs"), not single results.</p>`},
        {h: "LLM-as-a-judge", html: `
<p>Grading open-ended output by hand doesn't scale, so a strong model is often used as a <b>judge</b> with a rubric. Make judges trustworthy:</p>
<ul>
<li>Give a specific rubric with defined score levels, and ask for reasoning before the score.</li>
<li>Prefer <b>pairwise comparison</b> (A vs. B) or binary checks ("Is every claim supported by the context? yes/no") over vague 1–10 scales.</li>
<li>Watch for known biases: preference for longer answers, for the first option shown, and for outputs from the same model family.</li>
<li><b>Calibrate</b> against human labels on a sample and measure agreement before trusting the judge.</li>
<li>Use deterministic checks (exact match, schema validation, unit tests, regex) wherever possible; they are cheaper and more reliable than any judge.</li>
</ul>`},
        {h: "Tuning levers, in order", html: `
<ol>
<li><b>Prompts and tool descriptions</b> — cheapest and fastest.</li>
<li><b>Retrieval</b> — chunking, hybrid search, reranking, metadata filters.</li>
<li><b>Architecture</b> — add a validation step, split a step, change the pattern.</li>
<li><b>Model choice and inference settings</b> — larger or reasoning model for hard steps; smaller model where quality holds.</li>
<li><b>Fine-tuning</b> — supervised fine-tuning or parameter-efficient methods (LoRA) on high-quality examples, or preference tuning; useful for consistent format, style, domain language, or tool-use reliability on a smaller model. Frameworks such as NVIDIA NeMo support customization. Fine-tuning is the most expensive lever and requires re-evaluation.</li>
</ol>
<p>Change one thing at a time and compare against the baseline on the full eval set. Watch for regressions in other categories, not just improvement in the one you targeted.</p>`}
      ],
      pitfalls: [
        "Testing on a handful of hand-picked examples.",
        "Trusting an uncalibrated LLM judge.",
        "Measuring only the final answer and missing unsafe or wasteful trajectories.",
        "Fine-tuning before exhausting prompt, retrieval, and architecture changes."
      ],
      takeaways: [
        "Measure every change against a fixed, growing evaluation set.",
        "Evaluate outputs, retrieval, trajectories, operations, and safety.",
        "Report success rates over multiple runs, not single samples.",
        "LLM judges need rubrics, bias awareness, and calibration against humans.",
        "Tune in order: prompts → retrieval → architecture → model → fine-tuning."
      ],
      lab: {title: "Build your first eval harness", steps: [
        "Write 25 test cases for the two-tool agent from Module 2, including 5 that should fail gracefully.",
        "For each, define a pass condition (exact field values, required tool call, or rubric).",
        "Run each case 3 times and record the pass rate, average latency, and token cost.",
        "Change the system prompt in one way, rerun everything, and compare."
      ]},
      check: [
        {q:"A RAG answer is fluent and relevant but includes a claim that appears nowhere in the retrieved context. Which metric catches this?",
         opts:["Latency","Faithfulness / groundedness","Recall@k","Token count"],
         a:1, why:"Faithfulness measures whether each claim is supported by the provided context."},
        {q:"Your agent reaches the right final answer but calls a delete tool along the way that it shouldn't have. What kind of evaluation reveals this?",
         opts:["Final-output evaluation only","Trajectory evaluation of the tool calls made during the run","Spell-checking","Measuring time to first token"],
         a:1, why:"Only trajectory evaluation inspects the steps, where unsafe or unnecessary actions occur."},
        {q:"Which practice makes an LLM-as-a-judge more trustworthy?",
         opts:["Using a vague 1–10 quality scale","Calibrating it against human labels and using specific rubrics or pairwise comparisons","Letting the judge see which model produced each answer","Using it only once per test case without checking agreement"],
         a:1, why:"Specific criteria and measured agreement with humans are what make automated judging reliable."},
        {q:"After a prompt change, accuracy on billing questions rises from 80% to 90%. What else must you check?",
         opts:["Nothing — the change is an improvement","The full evaluation set, for regressions in other categories","Only the billing questions again","The model's training data"],
         a:1, why:"Prompt changes often trade one category against another. Only a full eval run shows the net effect."}
      ]
    },

    {
      id: "deployment-nvidia",
      title: "Deployment, scaling, and the NVIDIA platform",
      minutes: 40,
      domain: "Deployment and scaling · NVIDIA platform implementation",
      objectives: [
        "Explain the latency, throughput, and cost characteristics of LLM inference",
        "Apply optimization techniques: batching, KV caching, quantization, prompt caching, and model routing",
        "Describe the roles of NVIDIA NIM, Triton Inference Server, TensorRT-LLM, NeMo, NeMo Retriever, NeMo Guardrails, and the NeMo Agent Toolkit",
        "Plan a production deployment with scaling, reliability, and cost controls"
      ],
      sections: [
        {h: "How inference performance is measured", html: `
<table class="tbl">
<tr><th>Metric</th><th>Meaning</th><th>Why it matters</th></tr>
<tr><td><b>Time to first token (TTFT)</b></td><td>Delay before output starts streaming</td><td>Perceived responsiveness; driven by input length and queueing</td></tr>
<tr><td><b>Inter-token latency / tokens per second</b></td><td>Generation speed per request</td><td>How fast long answers complete</td></tr>
<tr><td><b>Throughput</b></td><td>Total tokens or requests per second across all users</td><td>How many users a deployment supports; cost per token</td></tr>
<tr><td><b>End-to-end task latency</b></td><td>Total time for an agent to finish, across all LLM and tool calls</td><td>Agents multiply latency: 8 sequential calls at 2 s each is 16 s</td></tr>
</table>
<p>For agents, the number of sequential steps usually dominates latency. Reducing steps (better tools, parallel calls, smaller models for simple steps) often matters more than raw model speed.</p>`},
        {h: "Optimization techniques", html: `
<ul>
<li><b>Continuous (in-flight) batching</b>: the server interleaves many requests on the GPU, raising throughput substantially.</li>
<li><b>KV caching</b>: stores attention computations for tokens already processed so each new token doesn't recompute the whole sequence.</li>
<li><b>Prompt / prefix caching</b>: reuses computation for a shared prefix (like a long system prompt or tool list) across requests, cutting TTFT and cost. Put stable content first in prompts to benefit.</li>
<li><b>Quantization</b>: running weights at lower precision (e.g., FP8, INT8, INT4) to reduce memory and increase speed, usually with a small, measurable quality cost.</li>
<li><b>Speculative decoding</b>: a small draft model proposes tokens that the large model verifies in parallel.</li>
<li><b>Model routing and cascades</b>: send easy requests to small models, hard ones to large models.</li>
<li><b>Response caching</b>: reuse answers for identical or near-identical requests where appropriate.</li>
</ul>`},
        {h: "The NVIDIA stack", html: `
<table class="tbl">
<tr><th>Component</th><th>Role</th></tr>
<tr><td><b>NVIDIA NIM</b></td><td>Prebuilt, optimized inference microservices packaged as containers, exposing industry-standard APIs (OpenAI-compatible for LLMs). Deploy the same model on a workstation, in a data center, or in the cloud.</td></tr>
<tr><td><b>TensorRT-LLM</b></td><td>Library that compiles and optimizes LLMs for NVIDIA GPUs (kernels, in-flight batching, quantization, KV-cache management).</td></tr>
<tr><td><b>Triton Inference Server</b></td><td>Open-source server for running models from many frameworks with dynamic batching, model ensembles, and metrics.</td></tr>
<tr><td><b>NeMo framework</b></td><td>Tools to build, customize (fine-tune, align), and evaluate generative models.</td></tr>
<tr><td><b>NeMo Retriever</b></td><td>Microservices for embedding, reranking, and document extraction in RAG pipelines.</td></tr>
<tr><td><b>NeMo Guardrails</b></td><td>Programmable rails for input, output, dialog, and retrieval safety (covered in the Specialty course).</td></tr>
<tr><td><b>NeMo Agent Toolkit</b></td><td>Framework-agnostic library for connecting, profiling, evaluating, and observing agents and workflows built with LangChain, LlamaIndex, CrewAI, and others.</td></tr>
<tr><td><b>NVIDIA AI Blueprints</b></td><td>Reference applications (e.g., RAG, video search and summarization) that combine these components.</td></tr>
</table>
<p>The broader point applies to any platform: separate the <b>application</b> (agent logic) from the <b>inference service</b> (model serving) behind a standard API, so you can swap models and hosting without rewriting the agent.</p>`},
        {h: "Production deployment checklist", html: `
<ul>
<li><b>Packaging</b>: containerize the agent service; pin model versions and prompt versions together.</li>
<li><b>Scaling</b>: autoscale inference on queue depth or GPU utilization; scale the stateless agent service horizontally; keep session state in an external store.</li>
<li><b>Reliability</b>: timeouts, retries with backoff, circuit breakers, and a fallback model or graceful degradation if the primary model is unavailable.</li>
<li><b>Rate limiting and quotas</b>: per user and per tenant, to control cost and abuse.</li>
<li><b>Streaming</b>: stream tokens and intermediate progress ("searching your documents…") to improve perceived latency.</li>
<li><b>Asynchronous execution</b>: long-running agent tasks should run as background jobs with status updates, not hold an HTTP request open.</li>
<li><b>Rollout</b>: shadow testing, canary releases, and A/B tests gated on evaluation results; one-step rollback.</li>
<li><b>Cost controls</b>: per-task budgets, cost dashboards, alerts on anomalies.</li>
</ul>`},
        {h: "Hosting choices", html: `
<p>Hosted APIs offer the fastest start and frontier capability. Self-hosted open-weight models (for example via NIM on your own GPUs) give data control, predictable cost at high volume, and customization. Hybrid designs are common: a hosted frontier model for complex reasoning, self-hosted smaller models for high-volume steps and sensitive data.</p>`}
      ],
      pitfalls: [
        "Optimizing model speed while ignoring the number of sequential agent steps.",
        "Long-running agent tasks inside synchronous web requests.",
        "No fallback when the model endpoint is slow or down.",
        "Changing model versions without re-running evaluations."
      ],
      takeaways: [
        "Track TTFT, tokens per second, throughput, and end-to-end task latency.",
        "Batching, KV and prefix caching, quantization, speculative decoding, and routing reduce latency and cost.",
        "NIM serves optimized models behind standard APIs; TensorRT-LLM and Triton optimize and serve; NeMo customizes; NeMo Retriever, Guardrails, and Agent Toolkit cover RAG, safety, and agent observability.",
        "Production agents need autoscaling, timeouts, fallbacks, rate limits, async jobs, staged rollouts, and cost controls."
      ],
      lab: {title: "Latency budget", steps: [
        "Take an agent that makes 6 sequential LLM calls (about 1.5 s each) and 4 tool calls (about 0.5 s each).",
        "Compute its end-to-end latency.",
        "Redesign it to under 6 seconds using parallel tool calls, a smaller model for two simple steps, and prefix caching. Show your estimate for each change.",
        "List what you would evaluate to make sure quality didn't drop."
      ]},
      check: [
        {q:"Every request to your agent starts with the same 3,000-token system prompt and tool list. Which optimization most directly reduces time to first token?",
         opts:["Quantization","Prompt/prefix caching of the shared prefix","Raising max tokens","Higher temperature"],
         a:1, why:"Prefix caching reuses the computation for the identical opening tokens across requests."},
        {q:"What is NVIDIA NIM?",
         opts:["A vector database","Prebuilt, optimized inference microservices that serve models behind standard APIs","A prompt-writing guide","A GPU cooling system"],
         a:1, why:"NIM packages optimized model serving into containers with industry-standard (e.g., OpenAI-compatible) APIs."},
        {q:"An agent task takes 3 minutes. How should it be exposed to users?",
         opts:["A single synchronous HTTP request that waits 3 minutes","A background job with streamed progress updates and a status endpoint","Split into 180 one-second requests by the user","It shouldn't be exposed"],
         a:1, why:"Long-running work belongs in asynchronous jobs; streaming progress keeps users informed and avoids timeouts."},
        {q:"You switch to an INT4-quantized model to save cost. What must you do before rollout?",
         opts:["Nothing — quantization never affects quality","Re-run the evaluation suite and compare quality, latency, and cost against the baseline","Increase the temperature to compensate","Delete the old model immediately"],
         a:1, why:"Quantization usually has a small quality cost that must be measured on your tasks before release."}
      ]
    },

    {
      id: "operate-oversee",
      title: "Run, monitor, and maintain — with human oversight",
      minutes: 40,
      domain: "Run, monitor, and maintain · Human-AI interaction and oversight · Safety, ethics, and compliance",
      objectives: [
        "Instrument agents with tracing, metrics, and logs, and define alerts",
        "Detect and respond to drift, regressions, and incidents",
        "Design human-in-the-loop checkpoints and good human–agent interaction",
        "Apply baseline guardrails, governance documentation, and compliance practices"
      ],
      sections: [
        {h: "Observability", html: `
<p>You can't operate what you can't see. Instrument three layers:</p>
<ul>
<li><b>Traces</b>: for each request, the full tree of agent steps, LLM calls (prompt, response, model, tokens), tool calls (arguments, result, latency), and decisions. OpenTelemetry-compatible tracing lets you use standard back ends.</li>
<li><b>Metrics</b>: request volume, success and error rates, latency percentiles (p50/p95/p99), tokens and cost per task, tool error rates, escalation rate, user feedback (thumbs up/down).</li>
<li><b>Logs</b>: structured events for audits — who requested what, what actions were taken, which approvals were given.</li>
</ul>
<p>Handle telemetry as sensitive data: traces contain user inputs. Redact PII, restrict access, and set retention limits.</p>`},
        {h: "Monitoring quality in production", html: `
<p>Infrastructure metrics don't tell you if answers are good. Add <b>online evaluation</b>: sample a percentage of production traces and score them with automated checks and LLM judges (groundedness, policy compliance), plus periodic human review. Alert on drops.</p>
<p>Watch for <b>drift</b>: user questions change, documents change, upstream model versions change, and tool APIs change. Re-run the offline eval suite on a schedule and whenever any dependency changes. Every production failure becomes a new eval case.</p>`},
        {h: "Incident response", html: `
<ol>
<li><b>Detect</b>: alerts, user reports, monitoring.</li>
<li><b>Contain</b>: a <b>kill switch</b> or feature flag to disable the agent or a specific tool immediately; fall back to a safe mode (e.g., read-only, or human handling).</li>
<li><b>Investigate</b> using traces.</li>
<li><b>Fix</b> and add regression tests.</li>
<li><b>Communicate</b> honestly with affected users: what happened, why, and what was changed.</li>
<li><b>Review</b> in a blameless post-incident review, and update the design document and risk register.</li>
</ol>`},
        {h: "Human-in-the-loop design", html: `
<p>Place human checkpoints by risk, not habit. Require approval when an action is <b>irreversible</b>, <b>affects other people</b>, involves <b>money, legal commitments, or personal data</b>, or when the agent's <b>confidence is low</b> or the situation is outside its tested scope.</p>
<p>Good checkpoints are designed for the human:</p>
<ul>
<li>Show <b>what</b> will happen, <b>why</b>, and the <b>evidence</b> (sources, reasoning summary) in a reviewable form — e.g., the exact email text, recipient, and attachments.</li>
<li>Offer <b>approve, edit, and reject</b>, and record the decision.</li>
<li>Avoid <b>approval fatigue</b>: if humans approve hundreds of trivial actions, they stop reading. Reduce checkpoints on low-risk actions so the important ones get real attention.</li>
<li>Make it obvious to users that they're interacting with an AI, what it can and can't do, and how to reach a human.</li>
</ul>`},
        {h: "Baseline guardrails", html: `
<ul>
<li><b>Input rails</b>: detect prompt injection, off-topic or disallowed requests, and PII before they reach the agent.</li>
<li><b>Output rails</b>: check for policy violations, PII leakage, ungrounded claims, and format errors before output is shown or acted upon.</li>
<li><b>Action rails</b>: allow-lists of tools per agent, argument validation, spending and rate limits, approval requirements.</li>
<li><b>Least privilege</b> credentials scoped per tool and per user.</li>
</ul>
<p>Frameworks such as NVIDIA NeMo Guardrails and safety classifier models (for example Llama Guard or NemoGuard content-safety models) implement these rails. The Specialty course goes deeper.</p>`},
        {h: "Governance and compliance basics", html: `
<p>Maintain a living governance record for each agent: purpose and intended users; data sources and data handling; tools and permission levels; human checkpoints; evaluation results; known limitations and risks; owner and escalation contacts; and change history. Be ready to answer three questions for any deployed agent: <b>What could go wrong? Who is responsible if it does? What data does it use?</b></p>
<p>Check applicable obligations early — privacy law (e.g., GDPR), sector rules (health, finance, education), and AI-specific regulation such as the EU AI Act — and involve legal, security, and domain experts before launch, not after.</p>`}
      ],
      pitfalls: [
        "Monitoring uptime and latency but never answer quality.",
        "No kill switch for an agent that can take actions.",
        "So many approval prompts that humans rubber-stamp them.",
        "Storing full user prompts in logs with no redaction or retention policy."
      ],
      takeaways: [
        "Trace every LLM and tool call; track quality, cost, latency, and escalation metrics.",
        "Use online evaluation and scheduled re-evaluation to catch drift and regressions.",
        "Incidents: detect, contain (kill switch), investigate, fix, communicate, review.",
        "Place human checkpoints by risk, and design them so humans can genuinely judge.",
        "Keep a living governance record and check legal obligations before launch."
      ],
      lab: {title: "Operational readiness review", steps: [
        "For an agent you've designed, define 5 metrics with alert thresholds.",
        "Write the kill-switch procedure: who can trigger it, how, and what users see.",
        "Mock up one approval screen for its riskiest action, showing what, why, and evidence.",
        "Draft the one-page governance record."
      ]},
      check: [
        {q:"An agent starts sending incorrect invoices to customers. What is the first operational step?",
         opts:["Retrain the model","Contain: use the kill switch or flag to disable the invoicing action and fall back to human handling","Wait for more reports","Delete the logs"],
         a:1, why:"Containment comes first to stop ongoing harm; investigation and fixes follow."},
        {q:"Reviewers approve 400 agent actions a day and now approve nearly everything in under 2 seconds. What is the problem?",
         opts:["The agent is perfect","Approval fatigue — checkpoints on low-risk actions are diluting attention on high-risk ones","Reviewers are too slow","There are not enough checkpoints"],
         a:1, why:"Too many trivial approvals turn oversight into rubber-stamping. Focus checkpoints on genuinely risky actions."},
        {q:"Latency and error rates are normal, but users report worse answers since an upstream document update. What would have caught this?",
         opts:["CPU monitoring","Online quality evaluation of sampled traces and re-running the eval suite when data changes","Bigger servers","More logging of HTTP status codes"],
         a:1, why:"Quality regressions are invisible to infrastructure metrics; you need quality evaluation in production."},
        {q:"What should an approval screen for an agent-drafted email show the reviewer?",
         opts:["Only an 'Approve' button","The exact message, recipients, attachments, the reason for sending, and options to approve, edit, or reject","The model's weights","A summary that hides the recipients"],
         a:1, why:"Reviewers can only exercise real judgment if they see exactly what will happen and why, and can change it."}
      ]
    }
  ]
};
