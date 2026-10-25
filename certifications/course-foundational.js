/* AgenticEd Certifications — Foundational prep course: AI & Agent Foundations.
   Module shape: {id, title, minutes, domain, objectives[], sections[{h, html}], pitfalls[], takeaways[], lab{title, steps[]}, check[{q, opts, a, why}]}
   Knowledge-check questions are practice only — they are deliberately different from the exam bank. */
window.AGENTICED_COURSES = window.AGENTICED_COURSES || {};
window.AGENTICED_COURSES.foundational = {
  title: "AI & Agent Foundations",
  intro: "A complete grounding in generative AI and AI agents for learners with no technical background. You will learn how large language models are built and why they behave the way they do, how to prompt them well, what turns a model into an agent, how agents use tools and retrieval, and how to use all of it responsibly.",
  modules: [
    {
      id: "ai-landscape",
      title: "The AI landscape: from ML to generative AI",
      minutes: 25,
      domain: "AI and machine learning fundamentals",
      objectives: [
        "Distinguish artificial intelligence, machine learning, deep learning, and generative AI",
        "Explain the difference between supervised, unsupervised, and self-supervised learning",
        "Describe what a foundation model is and why it changed how AI products are built",
        "Recognize the main categories of generative AI output: text, image, audio, code, and multimodal"
      ],
      sections: [
        {h: "Four nested ideas", html: `
<p>People use "AI" loosely, so it helps to start with precise terms. They are best understood as nested circles, each one a subset of the one before it.</p>
<table class="tbl">
<tr><th>Term</th><th>What it means</th><th>Example</th></tr>
<tr><td><b>Artificial intelligence</b></td><td>Any technique that lets a computer perform a task we would normally say requires intelligence.</td><td>A chess engine, a spam filter, a route planner</td></tr>
<tr><td><b>Machine learning (ML)</b></td><td>AI where behavior is <i>learned from data</i> rather than written as explicit rules.</td><td>A model that learns to flag fraudulent card transactions from past examples</td></tr>
<tr><td><b>Deep learning</b></td><td>ML using neural networks with many layers, able to learn complex patterns from raw data such as pixels or text.</td><td>Image recognition, speech-to-text</td></tr>
<tr><td><b>Generative AI</b></td><td>Deep learning models that <i>create new content</i> — text, images, audio, code — rather than only classifying or predicting a label.</td><td>A chatbot drafting an email; a model generating an image from a description</td></tr>
</table>
<p>A useful contrast: <b>discriminative</b> models answer "which category does this belong to?" (is this email spam?). <b>Generative</b> models answer "what would a plausible example look like?" (write an email declining this meeting).</p>`},
        {h: "How machines learn", html: `
<p>Every ML model is trained by adjusting millions or billions of internal numbers (called <b>parameters</b> or <b>weights</b>) so that its outputs get closer to what the training data says they should be. The main styles of learning differ in where that "correct answer" comes from:</p>
<ul>
<li><b>Supervised learning</b> — each training example comes with a human-provided label. Thousands of X-rays labeled "fracture" or "no fracture" teach a model to detect fractures.</li>
<li><b>Unsupervised learning</b> — no labels; the model finds structure on its own, such as grouping customers into segments with similar buying habits.</li>
<li><b>Reinforcement learning</b> — the model takes actions and receives rewards or penalties, learning a strategy that maximizes reward over time. Game-playing systems and robotics often use it.</li>
<li><b>Self-supervised learning</b> — the data supplies its own labels. Hide the next word of a sentence and ask the model to predict it; the real next word is the answer. This is how large language models are pretrained, and it is why they can learn from almost unlimited unlabeled text.</li>
</ul>`},
        {h: "Foundation models changed the economics", html: `
<p>Before roughly 2020, most AI projects trained a separate model for each task: one for sentiment, one for translation, one for summarization. Each needed its own labeled dataset.</p>
<p>A <b>foundation model</b> is a single, very large model trained on broad data that can then be adapted to many tasks — often just by describing the task in plain language. Large language models such as the GPT, Claude, Gemini, Llama, and Mistral families are foundation models for text. Others handle images, audio, or several modalities at once (<b>multimodal</b> models that accept, for example, both a photo and a question about it).</p>
<p>The practical consequence: building an AI product is now usually about <i>choosing and steering</i> an existing foundation model — through prompts, retrieval, tools, and sometimes fine-tuning — rather than training one from scratch. That is the skill set this certification track teaches.</p>`},
        {h: "Open and closed models", html: `
<p>Foundation models are released in two broad ways. <b>Proprietary (closed) models</b> are accessed only through the provider's API or app; you never see the weights. <b>Open-weight models</b> publish their weights so you can download, run, and modify them on your own hardware.</p>
<p>Neither is automatically better. Closed models often lead on raw capability and need no infrastructure. Open-weight models give you control over data location, cost at scale, and customization. Many organizations use both, choosing per use case.</p>`},
        {h: "Where generative AI is genuinely useful — and where it isn't", html: `
<p>Generative AI is strong at drafting, summarizing, translating, explaining, classifying text, extracting fields from messy documents, and writing code. It is weak, on its own, at tasks that require guaranteed factual accuracy, up-to-the-minute information, precise arithmetic, or accountability for a decision. Much of the rest of this course is about techniques — tools, retrieval, verification, human oversight — that cover those weaknesses.</p>
<div class="note"><b>Rule of thumb:</b> use generative AI where a capable first draft saves time and a human can check the result. Be cautious where a single unchecked error is expensive.</div>`}
      ],
      pitfalls: [
        "Treating 'AI' and 'generative AI' as the same thing — most deployed AI is still predictive ML.",
        "Assuming the newest or biggest model is the right choice for every task; smaller models are often faster, cheaper, and good enough.",
        "Believing a foundation model 'knows' facts the way a database does."
      ],
      takeaways: [
        "AI ⊃ machine learning ⊃ deep learning ⊃ generative AI.",
        "LLMs are pretrained with self-supervised learning: predicting hidden next words in huge amounts of text.",
        "Foundation models are general-purpose and are adapted to tasks rather than trained per task.",
        "Open-weight and proprietary models trade off control against convenience."
      ],
      lab: {title: "Map your own AI use", steps: [
        "List five AI-powered features you used this week (search suggestions, photo tagging, a chatbot, etc.).",
        "For each, decide: is it discriminative (classifying/predicting) or generative (creating content)?",
        "For any generative one, write one sentence about what would happen if its output were confidently wrong."
      ]},
      check: [
        {q:"A bank trains a model on 10 years of transactions, each labeled 'fraud' or 'legitimate'. What kind of learning is this?",
         opts:["Unsupervised learning","Supervised learning","Reinforcement learning","Self-supervised learning"],
         a:1, why:"Every example has a human-provided label, which is the defining feature of supervised learning."},
        {q:"Why can large language models be pretrained on almost unlimited amounts of text?",
         opts:["Because humans label every sentence","Because self-supervised learning uses the text itself as the label — the hidden next word is the answer","Because they skip training entirely","Because they only train on dictionaries"],
         a:1, why:"Next-token prediction turns raw text into training examples automatically, so no manual labeling is needed."},
        {q:"What best describes a foundation model?",
         opts:["A model trained for exactly one narrow task","A large model trained on broad data that can be adapted to many tasks","A database of verified facts","A rule-based expert system"],
         a:1, why:"Breadth and adaptability are what make a model 'foundational' — one model, many downstream uses."},
        {q:"A hospital wants to run a language model entirely inside its own data center for privacy reasons. Which kind of model makes that possible?",
         opts:["An open-weight model","A proprietary API-only model","Any model, since all models can be downloaded","No language model can run on private hardware"],
         a:0, why:"Open-weight models publish their weights, so they can be hosted on infrastructure you control."}
      ]
    },

    {
      id: "how-llms-work",
      title: "How large language models work",
      minutes: 30,
      domain: "LLM fundamentals",
      objectives: [
        "Explain tokens, tokenization, and why limits and pricing are measured in tokens",
        "Describe next-token prediction and the role of the transformer and attention",
        "Name the stages of building a chat model: pretraining, instruction tuning, and preference tuning",
        "Explain the context window and how inference settings like temperature shape output"
      ],
      sections: [
        {h: "Tokens: the units a model reads and writes", html: `
<p>Models don't see letters or words directly. Text is first split into <b>tokens</b> by a <b>tokenizer</b>. A token is often a whole common word ("the", "agent"), but rarer words are split into pieces: "tokenization" might become "token" + "ization". Punctuation and spaces are tokens too. In English, a rough rule is that 1 token ≈ ¾ of a word, so 1,000 tokens ≈ 750 words.</p>
<p>Tokens matter in practice because <b>everything is measured in them</b>: how much text fits in the model's memory, how long a response can be, how fast it is generated, and how much an API call costs (usually priced per million input and output tokens). Languages other than English and unusual text like code or tables often use more tokens per word.</p>`},
        {h: "Next-token prediction", html: `
<p>At its core, an LLM does one thing: given a sequence of tokens, it outputs a probability for every possible next token. For the input "The capital of France is", it might give "Paris" 92%, "a" 3%, "located" 2%, and so on.</p>
<p>To produce a full response, the model picks a token, adds it to the input, and repeats — one token at a time — until it produces a stop signal. This loop is called <b>autoregressive generation</b>. Everything an LLM does, from writing poems to answering legal questions, emerges from this single repeated prediction.</p>
<div class="note"><b>Why this matters:</b> the model is predicting what text is <i>likely</i>, not looking up what is <i>true</i>. When the most likely-sounding continuation is false, the model produces a fluent falsehood — the root of hallucination, covered in Module 6.</div>`},
        {h: "The transformer and attention", html: `
<p>Modern LLMs use a neural-network design called the <b>transformer</b>, introduced in 2017. Its key mechanism is <b>self-attention</b>: when processing each token, the model weighs how relevant every other token in the input is to it. In "The trophy didn't fit in the suitcase because <i>it</i> was too big," attention lets the model connect "it" to "trophy".</p>
<p>Attention is what lets transformers handle long-range context, and it parallelizes well on GPUs, which made it practical to train models with billions of parameters on trillions of tokens. Most chat LLMs are <b>decoder-only</b> transformers, built specifically for generating the next token.</p>`},
        {h: "From raw model to helpful assistant", html: `
<p>A chat assistant is built in stages:</p>
<ol>
<li><b>Pretraining.</b> The model learns next-token prediction over a vast corpus of text and code. The result — a <b>base model</b> — has broad knowledge and language skill, but it simply continues text. Ask it a question and it may respond with more questions.</li>
<li><b>Instruction tuning (supervised fine-tuning).</b> The model is further trained on many examples of instructions paired with good responses, so it learns to follow requests and answer helpfully.</li>
<li><b>Preference tuning.</b> Humans (or AI judges) compare pairs of responses and indicate which is better. The model is trained to prefer the better kind. Techniques include <b>RLHF</b> (reinforcement learning from human feedback) and <b>DPO</b> (direct preference optimization). This stage shapes helpfulness, tone, and refusal of harmful requests.</li>
</ol>
<p>Organizations can apply further <b>fine-tuning</b> to adapt a model to their domain. Lightweight methods such as <b>LoRA</b> (low-rank adaptation) train a small number of extra parameters instead of the whole model, making this far cheaper.</p>`},
        {h: "The context window", html: `
<p>The <b>context window</b> is the maximum number of tokens the model can consider at once — its working memory. It includes the system prompt, the conversation history, any documents you supply, <i>and</i> the response being generated. Windows range from a few thousand tokens to over a million in some current models.</p>
<p>Anything outside the window is invisible. In long conversations, applications typically drop or summarize the oldest messages to make room, which is why a chatbot can "forget" what you said at the start. Even inside a large window, models can attend less reliably to information buried in the middle of very long inputs, so placing key instructions and facts clearly still matters.</p>
<p>Crucially, the context window is not learning. Telling a model a fact in one conversation does not change its weights; a new conversation starts without it.</p>`},
        {h: "Inference settings", html: `
<p>When you call a model through an API you can tune how it chooses tokens:</p>
<table class="tbl">
<tr><th>Setting</th><th>What it does</th><th>Typical use</th></tr>
<tr><td><b>Temperature</b></td><td>Scales randomness. Near 0, the model almost always picks the most likely token; higher values make less likely tokens more probable.</td><td>Low (0–0.3) for extraction, classification, code. Higher (0.7–1.0) for brainstorming and creative writing.</td></tr>
<tr><td><b>Top-p</b> (nucleus sampling)</td><td>Restricts choices to the smallest set of tokens whose probabilities add up to p.</td><td>Usually adjust temperature <i>or</i> top-p, not both.</td></tr>
<tr><td><b>Max tokens</b></td><td>Caps the length of the output.</td><td>Controlling cost and preventing runaway responses.</td></tr>
<tr><td><b>Stop sequences</b></td><td>Strings that end generation when produced.</td><td>Keeping output to a defined format.</td></tr>
</table>
<p>Low temperature makes output more consistent, but not more <i>correct</i>: a model can be consistently wrong.</p>`}
      ],
      pitfalls: [
        "Thinking a long chat 'teaches' the model — nothing in the conversation changes its weights.",
        "Assuming temperature 0 guarantees factual accuracy; it only reduces randomness.",
        "Forgetting that the response itself consumes part of the context window."
      ],
      takeaways: [
        "Text is processed as tokens; limits, speed, and cost are all measured in tokens.",
        "LLMs generate one token at a time by predicting the most likely continuation.",
        "Transformers use self-attention to relate every token to every other token.",
        "Chat models = pretraining + instruction tuning + preference tuning (e.g., RLHF, DPO).",
        "The context window is working memory, not learning."
      ],
      lab: {title: "See tokens and temperature for yourself", steps: [
        "Paste a paragraph into any free online tokenizer tool and compare the token count to the word count.",
        "Try the same with a paragraph in another language or a block of code. Which uses more tokens per word?",
        "In a chat tool or API playground, ask for 'three names for a coffee shop' at low and high temperature (if available) several times each. Note how much the answers vary."
      ]},
      check: [
        {q:"An API charges per million tokens. Why might a document in Tamil cost more to process than an English document with the same number of words?",
         opts:["Tamil is a premium language","Tokenizers often split less-represented languages into more tokens per word","Non-English text is always rejected","Token prices depend on the time of day"],
         a:1, why:"Tokenizers are optimized for the data they were trained on; text that is less common in that data usually needs more tokens per word."},
        {q:"A base model, before instruction tuning, is given the prompt 'What is the boiling point of water?' What might it do?",
         opts:["Always answer correctly and concisely","Continue the text in a plausible way, which might be more quiz questions rather than an answer","Refuse to respond","Ask for a system prompt"],
         a:1, why:"Base models just continue text. Instruction tuning is what teaches a model to treat input as a request to answer."},
        {q:"You need a model to extract invoice numbers from emails as reliably and consistently as possible. Which temperature setting is most appropriate?",
         opts:["Very high, to explore options","Low, close to 0","It makes no difference","Exactly 1.0"],
         a:1, why:"Extraction needs consistent, deterministic-leaning output. Low temperature keeps the model on its most likely answer."},
        {q:"What is the purpose of preference tuning such as RLHF or DPO?",
         opts:["To increase the context window","To train the model to prefer responses that humans (or judges) rated as better — more helpful, honest, and safe","To translate the model into other languages","To compress the model's file size"],
         a:1, why:"Preference tuning uses comparisons between responses to shape behavior toward what people judge to be better answers."}
      ]
    },

    {
      id: "prompt-engineering",
      title: "Prompt engineering",
      minutes: 30,
      domain: "Prompt engineering",
      objectives: [
        "Structure a prompt with role, task, context, constraints, and output format",
        "Use system prompts, zero-shot, few-shot, and chain-of-thought prompting appropriately",
        "Request structured output such as JSON reliably",
        "Iterate on prompts systematically instead of by trial and error"
      ],
      sections: [
        {h: "Anatomy of a strong prompt", html: `
<p>A <b>prompt</b> is everything you send the model. Because the model predicts what text should follow, a prompt works best when it leaves little room for guessing. Strong prompts usually contain five parts:</p>
<table class="tbl">
<tr><th>Part</th><th>Purpose</th><th>Example</th></tr>
<tr><td>Role</td><td>Sets expertise and voice</td><td>"You are an experienced high-school chemistry teacher."</td></tr>
<tr><td>Task</td><td>States exactly what to do</td><td>"Explain why ice floats."</td></tr>
<tr><td>Context</td><td>Gives the information and audience</td><td>"The reader is 14 and has just learned what density is."</td></tr>
<tr><td>Constraints</td><td>Sets limits</td><td>"Under 120 words. No equations."</td></tr>
<tr><td>Output format</td><td>Defines the shape of the answer</td><td>"End with one question that checks understanding."</td></tr>
</table>
<p>Compare "explain ice floating" with the full version above. The model is equally capable in both cases; the second prompt simply tells it which of thousands of possible answers you want.</p>`},
        {h: "System prompts vs. user prompts", html: `
<p>Chat models accept messages with different <b>roles</b>. The <b>system prompt</b> is set by the application builder and applies to the whole conversation: who the assistant is, what it should and shouldn't do, and its tone. <b>User messages</b> are what the person types. The model's replies are <b>assistant messages</b>.</p>
<pre><code>system:    You are a study helper for Grade 9 biology. Explain concepts,
           but never write graded assignments for students. If you are
           unsure of a fact, say so.
user:      Can you write my essay on photosynthesis?
assistant: I can't write it for you, but I can help you plan it. Let's
           start with the two stages of photosynthesis...</code></pre>
<p>Put stable rules in the system prompt and the specific request in the user message.</p>`},
        {h: "Zero-shot, few-shot, and chain-of-thought", html: `
<p><b>Zero-shot</b> prompting gives an instruction with no examples. It works well for common tasks the model has seen many times.</p>
<p><b>Few-shot</b> prompting includes a handful of worked examples so the model can copy the pattern. It is the fastest way to get a specific format, labeling scheme, or style:</p>
<pre><code>Classify the support ticket as BILLING, TECHNICAL, or OTHER.

Ticket: "I was charged twice this month." -&gt; BILLING
Ticket: "The app crashes when I upload a photo." -&gt; TECHNICAL
Ticket: "Do you have a student discount?" -&gt;</code></pre>
<p><b>Chain-of-thought</b> prompting asks the model to reason step by step before answering ("Work through this step by step, then give the final answer on the last line"). Writing out intermediate steps measurably improves accuracy on multi-step problems such as math, logic, and planning. Many current models also have built-in <b>reasoning</b> or "thinking" modes that do this automatically.</p>`},
        {h: "Getting structured output", html: `
<p>When another program will read the model's output, ask for a strict format and show it:</p>
<pre><code>Extract these fields from the email and return only valid JSON:
{"customer_name": string, "order_id": string, "issue": string,
 "urgent": true | false}
If a field is missing, use null. Do not add any other text.</code></pre>
<p>Many APIs also offer a <b>structured output</b> or <b>JSON mode</b> feature that enforces a schema at generation time, which is more reliable than instructions alone. Either way, the program receiving the output should still validate it.</p>`},
        {h: "Techniques that help, and ones that don't", html: `
<ul>
<li><b>Help:</b> clear delimiters around source material (e.g., placing a document between &lt;document&gt; tags); positive instructions ("write in plain English") rather than only negative ones; asking the model to say "I don't know" when the information isn't available; breaking a big task into a sequence of smaller prompts (<b>prompt chaining</b>).</li>
<li><b>Don't help:</b> ALL CAPS or threats; vague praise requests ("make it better"); stuffing in irrelevant context, which can distract the model; asking the same question repeatedly hoping for a different answer instead of improving the prompt.</li>
</ul>`},
        {h: "Iterate like an engineer", html: `
<p>Professional prompt work is systematic: write a prompt, run it on a small set of <b>representative test inputs</b> (including tricky ones), note where it fails, change <i>one thing</i>, and rerun. Keep the versions. A prompt that works on one example and fails on the next is not finished. This test-set habit is the seed of the formal evaluation methods covered in the Associate course.</p>`}
      ],
      pitfalls: [
        "Writing one long, unstructured paragraph that mixes instructions with source material.",
        "Testing a prompt on a single example and assuming it works in general.",
        "Asking for JSON but not handling the case where the output isn't valid JSON."
      ],
      takeaways: [
        "Strong prompts specify role, task, context, constraints, and output format.",
        "System prompts hold stable rules; user messages hold the specific request.",
        "Few-shot examples are the quickest way to lock in a pattern or format.",
        "Chain-of-thought improves multi-step reasoning.",
        "Treat prompts like code: test on varied inputs and iterate one change at a time."
      ],
      lab: {title: "Prompt makeover", steps: [
        "Start with a weak prompt: 'Write about recycling.'",
        "Rewrite it using all five parts: role, task, context, constraints, output format.",
        "Run both versions and compare. Then add one few-shot example of the style you want and run again.",
        "Write down which change made the biggest difference."
      ]},
      check: [
        {q:"Which element is missing from this prompt: 'You are a nutritionist. Suggest a weekly meal plan for a vegetarian teenager athlete.'",
         opts:["A role","A task","An output format and constraints, such as length or structure","Context about the audience"],
         a:2, why:"Role, task, and context are present. Without format or constraints, the model has to guess how long and how structured the plan should be."},
        {q:"You want a model to label customer reviews using your company's exact five-category scheme. What is the most effective technique?",
         opts:["Zero-shot with no description of the categories","Few-shot prompting with an example of each category","Raising the temperature","Writing the categories in capital letters"],
         a:1, why:"Showing examples of each label teaches the model your specific scheme much more reliably than description alone."},
        {q:"Where should the rule 'Never reveal customer account numbers' go in a support chatbot?",
         opts:["In each user message","In the system prompt, where it applies to the entire conversation","In the model's training data","Nowhere — models never reveal numbers"],
         a:1, why:"Persistent behavioral rules belong in the system prompt. (Sensitive data should also be protected by the application itself, not only by the prompt.)"},
        {q:"A prompt works perfectly on the example you wrote it for. What should you do before relying on it?",
         opts:["Ship it immediately","Test it on a varied set of inputs, including difficult and unusual cases","Make it longer","Increase the temperature to see more variety"],
         a:1, why:"One success proves little. A representative test set reveals the failures you'd otherwise discover in production."}
      ]
    },

    {
      id: "chatbots-to-agents",
      title: "From chatbots to AI agents",
      minutes: 28,
      domain: "Agent fundamentals",
      objectives: [
        "Define an AI agent and distinguish it from a chatbot and a workflow",
        "Explain the perceive–reason–act loop and the ReAct pattern",
        "Describe the core components of an agent: model, instructions, tools, memory, and orchestration",
        "Place a system on a spectrum of autonomy and explain why that matters"
      ],
      sections: [
        {h: "What makes something an agent", html: `
<p>An <b>AI agent</b> is a system that uses a language model to <b>pursue a goal over multiple steps</b>, deciding for itself what action to take next based on what it observes. Three kinds of system are often confused:</p>
<table class="tbl">
<tr><th></th><th>Chatbot</th><th>Workflow</th><th>Agent</th></tr>
<tr><td>Who decides the steps?</td><td>Nobody — one reply per message</td><td>The developer, in fixed code</td><td>The model, at run time</td></tr>
<tr><td>Can it take actions?</td><td>Usually not</td><td>Yes, in a fixed order</td><td>Yes, chosen dynamically</td></tr>
<tr><td>Adapts to results?</td><td>No</td><td>Only via pre-written branches</td><td>Yes — observes and re-plans</td></tr>
<tr><td>Example</td><td>Q&amp;A on a help page</td><td>"Summarize every new support ticket and post to Slack"</td><td>"Find out why sales dropped last week and draft a report"</td></tr>
</table>
<p>Workflows are predictable and easier to test; agents are flexible but harder to control. A good builder uses the simplest design that solves the problem — many real products are workflows with one or two agentic steps.</p>`},
        {h: "The agent loop", html: `
<p>Every agent runs a loop, often described as <b>perceive → reason → act</b>, or <b>Think → Act → Observe</b>:</p>
<ol>
<li><b>Think:</b> the model considers the goal and everything observed so far, and decides on the next action.</li>
<li><b>Act:</b> it calls a tool — search the web, query a database, run code, send a message.</li>
<li><b>Observe:</b> the tool's result is added to the model's context.</li>
</ol>
<p>The loop repeats until the goal is met, the agent decides it cannot proceed, or a limit (number of steps, time, or cost) is reached. A well-built agent always has such a limit, so it can't loop forever.</p>`},
        {h: "ReAct: reasoning and acting together", html: `
<p>The <b>ReAct</b> pattern (short for Reason + Act) is the most widely used way to implement this loop. The model alternates between writing a short reasoning step and taking an action:</p>
<pre><code>Goal: What is the population of the city where the 2024 Olympics were held?
Thought: I need to find the host city first.
Action: search("2024 Summer Olympics host city")
Observation: Paris, France.
Thought: Now I need the population of Paris.
Action: search("Paris population")
Observation: About 2.1 million (city proper), around 11 million metro area.
Thought: I have enough to answer, noting both figures.
Answer: Paris hosted the 2024 Olympics. Its city population is about
        2.1 million; the metropolitan area is about 11 million.</code></pre>
<p>Writing out the reasoning makes the agent's choices easier to follow, debug, and audit.</p>`},
        {h: "The five building blocks", html: `
<ul>
<li><b>Model</b> — the LLM that does the reasoning. Different steps may use different models (a large one for planning, a small fast one for simple classification).</li>
<li><b>Instructions</b> — the system prompt defining the agent's role, goal, rules, and boundaries.</li>
<li><b>Tools</b> — functions the agent can call to get information or take action (Module 5).</li>
<li><b>Memory</b> — the current context (short-term) plus anything stored externally across sessions (long-term).</li>
<li><b>Orchestration</b> — the code that runs the loop: passes tool results back, enforces step limits, handles errors, and pauses for human approval when needed.</li>
</ul>`},
        {h: "Autonomy is a dial, not a switch", html: `
<p>Autonomy means the agent chooses its own next steps without a human directing each one. It does <b>not</b> mean the agent is unsupervised. It helps to picture levels:</p>
<ol>
<li><b>Assistant</b> — suggests; a human does everything (autocomplete).</li>
<li><b>Copilot</b> — drafts actions; a human approves each one.</li>
<li><b>Supervised agent</b> — acts on its own for low-risk steps; a human approves high-risk ones.</li>
<li><b>Autonomous agent</b> — acts end-to-end within defined boundaries, with monitoring.</li>
</ol>
<p>The right level depends on the stakes. An agent tidying your calendar can be highly autonomous; an agent sending money should not be. Matching autonomy to risk is a theme throughout all three certifications.</p>`}
      ],
      pitfalls: [
        "Building an autonomous agent when a simple fixed workflow would be more reliable.",
        "Running an agent loop with no step, time, or cost limit.",
        "Equating 'autonomous' with 'unsupervised' or 'unaccountable'."
      ],
      takeaways: [
        "An agent pursues a goal over multiple steps and decides its own next action.",
        "Workflows follow developer-defined steps; agents choose steps at run time.",
        "The agent loop is Think → Act → Observe; ReAct interleaves reasoning and actions.",
        "Agents are built from a model, instructions, tools, memory, and orchestration.",
        "Match the level of autonomy to the level of risk."
      ],
      lab: {title: "Design an agent on paper", steps: [
        "Pick a goal, such as 'plan a three-day study schedule before my exams'.",
        "List the tools the agent would need (calendar access, a syllabus document, etc.).",
        "Write out three iterations of the Think → Act → Observe loop as the agent might perform them.",
        "Decide which action, if any, should require your approval, and explain why."
      ]},
      check: [
        {q:"Every night, a script takes all new orders, generates a summary with an LLM, and emails it to the manager — always in that order. What is this?",
         opts:["An autonomous agent","A workflow — the steps are fixed by the developer","A chatbot","A foundation model"],
         a:1, why:"The LLM is used, but it never decides what to do next. Fixed, developer-defined steps make this a workflow."},
        {q:"In the ReAct pattern, what is written immediately after each Action?",
         opts:["The final answer","An Observation containing the tool's result","A new system prompt","Nothing — the loop ends"],
         a:1, why:"ReAct alternates Thought → Action → Observation. The observation feeds the next thought."},
        {q:"Which component enforces a maximum number of steps so an agent cannot loop forever?",
         opts:["The tokenizer","The orchestration layer","The training data","The temperature setting"],
         a:1, why:"Orchestration code runs the loop and is responsible for limits, error handling, and approvals."},
        {q:"An agent books meetings on your calendar automatically but asks before accepting any invitation from outside your company. Which autonomy level is this?",
         opts:["Assistant","Supervised agent — autonomous for low-risk steps, approval for higher-risk ones","Fully unsupervised","Not an agent at all"],
         a:1, why:"It acts independently where risk is low and checks with a human where stakes are higher — the supervised-agent pattern."}
      ]
    },

    {
      id: "tools-and-rag-basics",
      title: "Tools, retrieval, and grounding",
      minutes: 28,
      domain: "Tools and knowledge integration",
      objectives: [
        "Explain why tools are necessary and how tool calling works conceptually",
        "Describe retrieval-augmented generation (RAG) and when to use it instead of fine-tuning",
        "Explain embeddings and semantic search at a conceptual level",
        "Recognize the role of citations in making AI answers verifiable"
      ],
      sections: [
        {h: "Why a model needs tools", html: `
<p>A bare LLM is limited to what it learned during training. It has no clock, no internet, no access to your files, and it cannot reliably do exact arithmetic or take actions in the world. <b>Tools</b> close these gaps:</p>
<table class="tbl">
<tr><th>Limitation</th><th>Tool that solves it</th></tr>
<tr><td>Knowledge stops at the training cutoff</td><td>Web search, news APIs</td></tr>
<tr><td>Doesn't know your organization's data</td><td>Database queries, document search</td></tr>
<tr><td>Arithmetic and data analysis slips</td><td>Calculator, code interpreter</td></tr>
<tr><td>Can only produce text</td><td>Email, calendar, ticketing, and other action APIs</td></tr>
</table>`},
        {h: "How tool calling works", html: `
<p>The developer describes each tool to the model: its name, what it does, and what inputs it takes. When the model decides a tool would help, it doesn't run anything itself — it outputs a structured request:</p>
<pre><code>{"tool": "get_weather", "arguments": {"city": "Chennai", "unit": "celsius"}}</code></pre>
<p>The application runs the real function, then sends the result back to the model, which uses it to continue. This separation is important for safety: <b>the application, not the model, decides what actually executes</b>, so it can check permissions, validate inputs, and ask a human first.</p>
<p>An emerging standard called the <b>Model Context Protocol (MCP)</b> gives tools a common interface, so one tool integration can be reused across many AI applications.</p>`},
        {h: "Retrieval-augmented generation", html: `
<p><b>Retrieval-augmented generation (RAG)</b> is the most common way to make a model answer from <i>your</i> information. Think of it as an open-book exam:</p>
<ol>
<li>Your documents are split into passages and indexed ahead of time.</li>
<li>When a question arrives, the system <b>retrieves</b> the most relevant passages.</li>
<li>Those passages are placed in the prompt with an instruction like "Answer using only the sources below and cite them."</li>
<li>The model <b>generates</b> an answer grounded in that material.</li>
</ol>
<p>Answers based on retrieved material are called <b>grounded</b>. Grounding sharply reduces (but doesn't eliminate) hallucination, keeps answers current because you can update documents any time, and allows citations.</p>`},
        {h: "Embeddings and semantic search", html: `
<p>How does retrieval find "relevant" passages? Usually through <b>embeddings</b>: an embedding model converts a piece of text into a list of numbers (a <b>vector</b>) that represents its meaning. Texts with similar meanings get vectors that are close together.</p>
<p>So "How do I get my money back?" lands near a passage titled "Refund policy" even though they share no words. This is <b>semantic search</b>, and the vectors are stored in a <b>vector database</b> built to find nearest neighbors quickly. Many systems combine it with traditional keyword search (<b>hybrid search</b>) so exact terms like product codes are found too.</p>`},
        {h: "RAG, fine-tuning, or prompting?", html: `
<table class="tbl">
<tr><th>Need</th><th>Best first approach</th></tr>
<tr><td>Answer from specific, changing documents</td><td>RAG</td></tr>
<tr><td>Consistent style, format, or domain behavior</td><td>Prompting, then fine-tuning if prompting isn't enough</td></tr>
<tr><td>Live data or actions</td><td>Tools</td></tr>
<tr><td>A quick improvement on a common task</td><td>Better prompting</td></tr>
</table>
<p>Fine-tuning is a poor way to add facts: it is costly, facts go stale, and the model still can't cite where an answer came from.</p>`},
        {h: "Citations make answers checkable", html: `
<p>A well-built grounded system shows which source each claim came from, so a person can verify it in seconds. Two failure signs to watch for: a citation that doesn't actually support the claim, and an answer with no source when the question wasn't covered. The correct behavior when the documents don't contain the answer is to say so: <i>"That isn't covered in the documents I have access to."</i></p>`}
      ],
      pitfalls: [
        "Assuming the model executes tools itself — the application does, and must enforce safety checks.",
        "Using fine-tuning to teach a model facts that change frequently.",
        "Trusting a citation without checking that the source actually supports the claim."
      ],
      takeaways: [
        "Tools give models live data, private data, exact computation, and the ability to act.",
        "In tool calling, the model requests; the application decides and executes.",
        "RAG retrieves relevant passages and grounds the answer in them.",
        "Embeddings represent meaning as vectors, enabling semantic search.",
        "Grounded answers should cite sources and admit when the answer isn't in them."
      ],
      lab: {title: "Be the retriever", steps: [
        "Take a two-page document you know well (a school policy, a product manual).",
        "Write five questions about it, including one it does not answer.",
        "For each, find the single best passage by hand, as a retriever would.",
        "Paste only that passage plus the question into a chatbot with the instruction 'Answer only from this source; say if the answer isn't present.' Check every answer, especially the unanswerable one."
      ]},
      check: [
        {q:"In tool calling, what does the model actually output when it wants to use a tool?",
         opts:["It runs the function directly on the server","A structured request naming the tool and its arguments, which the application then executes","A screenshot of the result","Nothing — tools are called by the user"],
         a:1, why:"The model only proposes the call. Execution stays under the application's control, which is what makes safety checks possible."},
        {q:"A company's HR policies change every quarter. What is the best way to have an assistant answer questions about them?",
         opts:["Fine-tune the model every quarter","Use RAG over the current policy documents","Paste all policies from memory into every prompt","Rely on the model's training data"],
         a:1, why:"RAG lets you update the documents without retraining, keeps answers current, and supports citations."},
        {q:"Why can semantic search match 'my package never arrived' to a passage titled 'Lost shipments'?",
         opts:["It searches for identical words","Embeddings place texts with similar meanings close together, regardless of wording","The model guesses randomly","Vector databases store only titles"],
         a:1, why:"Embeddings capture meaning, so paraphrases and synonyms end up near each other."},
        {q:"A RAG assistant is asked something its documents don't cover. What is the correct response?",
         opts:["A confident answer from general knowledge, presented as if sourced","A clear statement that the answer isn't in the available documents","A citation to the closest document, even if unrelated","An error message and shutdown"],
         a:1, why:"Admitting the gap is correct. Answering anyway, or citing a source that doesn't support the claim, is a grounding failure."}
      ]
    },

    {
      id: "responsible-ai-basics",
      title: "Hallucination, risk, and responsible use",
      minutes: 28,
      domain: "Responsible AI fundamentals",
      objectives: [
        "Explain why hallucinations happen and how to reduce them",
        "Identify the main categories of AI risk: accuracy, bias, privacy, security, and misuse",
        "Apply a verification habit proportional to the stakes of a decision",
        "Explain why accountability for AI outcomes always rests with people"
      ],
      sections: [
        {h: "Why models hallucinate", html: `
<p>A <b>hallucination</b> is output that is fluent and confident but false or unsupported: an invented statistic, a non-existent court case, a fake citation. It isn't lying and it isn't a bug that will be patched away. It follows from how LLMs work: they generate the most <i>plausible</i> continuation, and a plausible-sounding answer is not always a true one.</p>
<p>Hallucinations are most likely when the question is about rare or very recent facts, asks for precise details (numbers, dates, quotes, references), or pressures the model to answer something it has no basis for.</p>`},
        {h: "Reducing hallucinations", html: `
<ul>
<li><b>Ground</b> the answer in retrieved sources (RAG) and require citations.</li>
<li><b>Permit uncertainty</b>: instruct the model to say "I don't know" rather than guess.</li>
<li><b>Use tools</b> for facts and calculations instead of the model's memory.</li>
<li><b>Lower temperature</b> for factual tasks to reduce random variation.</li>
<li><b>Verify</b> important claims independently — the only step that catches what the others miss.</li>
</ul>
<p>Separate the <b>mechanism</b> from the <b>harm</b>. Hallucination is the mechanism. <b>Misinformation</b> is the harm when someone believes or acts on it. The same error is harmless in a brainstorm and dangerous in a prescription.</p>`},
        {h: "A map of AI risks", html: `
<table class="tbl">
<tr><th>Risk</th><th>What it looks like</th></tr>
<tr><td>Accuracy</td><td>Hallucinations; outdated information; errors in reasoning</td></tr>
<tr><td>Bias and fairness</td><td>Systematically worse or unfair results for some groups, inherited from training data</td></tr>
<tr><td>Privacy</td><td>Personal or confidential data pasted into tools, stored, or exposed</td></tr>
<tr><td>Security</td><td>Prompt injection — hidden instructions in content that hijack an AI system</td></tr>
<tr><td>Misuse</td><td>Deepfakes, plagiarism, automated scams, academic dishonesty</td></tr>
<tr><td>Over-reliance</td><td>People stop checking and lose the skill or judgment to notice errors</td></tr>
</table>
<p>The Specialty certification covers each of these in depth. At the foundational level, the goal is to recognize them.</p>`},
        {h: "Verification proportional to stakes", html: `
<p>Not every output needs a fact-check, but important ones do. A simple scale:</p>
<ul>
<li><b>Low stakes</b> (brainstorming, a first draft for your own use): read critically; no formal check.</li>
<li><b>Medium stakes</b> (content others will read, a school assignment): check key facts and every quote or citation.</li>
<li><b>High stakes</b> (health, legal, financial, safety, decisions about people): verify against an authoritative source or a qualified person before acting.</li>
</ul>
<p>Verification means an <i>independent</i> check. Asking the same model "are you sure?" is not verification — it may confidently confirm its own error. A confident tone is not evidence.</p>`},
        {h: "Privacy and data handling", html: `
<p>Treat anything you paste into an AI tool as potentially stored or reviewed, unless your organization has a contract saying otherwise. Don't paste passwords, personal records, health information, or confidential business data into public tools. For practice and demos, use made-up or public example data. Organizations should publish clear guidance on which tools are approved for which kinds of data.</p>`},
        {h: "People remain accountable", html: `
<p>"The AI did it" is never an acceptable explanation. Responsibility for AI outcomes sits with people: those who built the system, those who chose to deploy it, and those who acted on its output. That is why responsible use includes disclosing AI assistance where it matters (for example in academic or published work), keeping a human in the loop for consequential decisions, and being able to explain how a decision was reached.</p>
<div class="note"><b>Core principles</b> shared across most responsible-AI frameworks: fairness, transparency, accountability, privacy, safety and security, and human oversight.</div>`}
      ],
      pitfalls: [
        "Taking a confident tone or a neat citation as proof of accuracy.",
        "Asking the same model to verify its own answer.",
        "Pasting personal or confidential information into unapproved public AI tools."
      ],
      takeaways: [
        "Hallucination is structural: models generate plausible text, not verified truth.",
        "Grounding, tools, permission to say 'I don't know', and independent verification reduce harm.",
        "Key AI risks: accuracy, bias, privacy, security, misuse, and over-reliance.",
        "Scale verification to the stakes of the decision.",
        "Accountability always rests with people."
      ],
      lab: {title: "Catch a hallucination", steps: [
        "Ask a chatbot for five academic references on a narrow topic you know (e.g., a local history subject).",
        "Search for each reference in a library catalog or Google Scholar.",
        "Record how many exist exactly as described, partly exist, or don't exist at all.",
        "Rewrite your prompt to reduce invented references (for example, allow 'I don't know') and repeat."
      ]},
      check: [
        {q:"Which question is most likely to produce a hallucination from a model with no tools?",
         opts:["'Explain what photosynthesis is.'","'Give me the exact page number of a quote from an obscure 1987 report.'","'Write a haiku about rain.'","'Summarize this paragraph: ...'"],
         a:1, why:"Precise details about rare sources are exactly where models generate plausible-looking but invented specifics."},
        {q:"A student uses AI to draft a history essay that will be graded. Which level of verification fits?",
         opts:["None — it's only an essay","Check key facts and every quote or citation before submitting","Ask the AI if it's sure","Only check spelling"],
         a:1, why:"Work that others will read and grade is medium stakes: key facts and all citations need checking."},
        {q:"A clinic deploys an AI tool that gives a patient wrong dosage advice. Who is accountable?",
         opts:["The AI model","No one","The people who built, deployed, and relied on the system, according to their roles","Only the patient"],
         a:2, why:"Accountability always traces to people. Responsibility is shared among those who built, deployed, and used the system."},
        {q:"What is the safest way to demonstrate an AI tool that summarizes student records in a training session?",
         opts:["Use real records from last year","Use realistic but fictional records containing no real personal data","Use records with names blurred in a screenshot","Ask students to bring their own records"],
         a:1, why:"Fictional data demonstrates the capability without any risk of exposing real personal information."}
      ]
    }
  ]
};
