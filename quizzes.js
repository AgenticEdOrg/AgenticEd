/* AgenticEd question bank — DRAFT for author review.
   Every question is derived from the curriculum text. Edit freely:
   q = question, opts = choices, a = index of correct choice (0-based),
   why = the explanation shown after answering (A4). */
window.AGENTICED_QUIZ = {
  weeks: {
    1: {
      title: "Week 1 — What Is an AI Agent?",
      questions: [
        {q:"What most distinguishes an AI agent from a simple AI tool?",
         opts:["It runs on a bigger model","It pursues a goal through a sequence of actions, adapting as it goes","It answers questions faster","It never makes mistakes"],
         a:1, why:"A tool does one thing when asked — a calculator computes, a chatbot answers. An agent is given a goal and takes a sequence of actions to achieve it: it plans, acts, observes, and adjusts until the job is done."},
        {q:"Put the agent reasoning loop in the right order.",
         opts:["Act → Think → Observe","Observe → Act → Think","Think → Act → Observe","Think → Observe → Act"],
         a:2, why:"Every agent runs Think (reason about the goal) → Act (use a tool or take an action) → Observe (see what happened, update memory) — and repeats until the goal is reached."},
        {q:"Which of these is behaving most like an agent?",
         opts:["A calculator computing 2+2","A search engine returning links","A navigation app that monitors traffic and reroutes you mid-drive","A dictionary showing a definition"],
         a:2, why:"The navigation app is continuous: it observes feedback (your location, traffic) and keeps adjusting its plan. That loop of acting, observing, and adapting is what makes something agentic."},
        {q:"What does 'autonomy' mean for an AI agent?",
         opts:["It can plan and act toward a goal without a human directing every step","It has no rules at all","It works without electricity","It always acts alone with no human involved"],
         a:0, why:"Autonomy means the agent decides its own next steps toward the goal. It does NOT mean no human involvement — well-designed agents still keep humans in the loop for important decisions."},
        {q:"When an AI agent makes a bad decision, who is accountable?",
         opts:["Nobody — it was the AI's choice","Only the AI itself","A human — every agent decision traces back to people who built, deployed, or used it","Whoever notices the mistake first"],
         a:2, why:"Agents don't bear responsibility — people do. The builder, the deployer, and the user all hold pieces of accountability. That's why 'Who owns this agent's decisions?' is the first question of the course."},
        {q:"A student says 'ChatGPT is an AI agent because it answers my questions.' What's the best response?",
         opts:["Correct — answering questions is agentic","Not quite — answering one question is tool behavior; it becomes agentic when it takes multi-step actions toward a goal","Wrong — ChatGPT is not AI at all","Correct — anything with AI in it is an agent"],
         a:1, why:"Answering a single question and stopping is tool behavior. The differentiator is autonomy: does it keep taking actions after the first response to reach a goal? That's the agent test."}
      ]
    },
    2: {
      title: "Week 2 — The Brain Behind the Agent",
      questions: [
        {q:"At its core, how does a large language model generate text?",
         opts:["It searches the internet for each answer","It predicts what words come next, based on patterns learned from training data","It copies from a database of approved answers","It asks a human behind the scenes"],
         a:1, why:"An LLM is next-token prediction at massive scale — like your phone's autocomplete trained on most of the internet. It generates what sounds right, which is usually correct but not always."},
        {q:"Why do LLMs hallucinate?",
         opts:["They are broken and need repair","They generate plausible-sounding text rather than retrieving verified facts","They are programmed to lie occasionally","Only old models hallucinate"],
         a:1, why:"Hallucination is structural, not a bug: the model produces text that fits the pattern, whether or not it's true. AI generates — it does not look facts up unless you give it tools."},
        {q:"What's the difference between a hallucination and misinformation?",
         opts:["They are the same thing","Hallucination is the mechanism (AI confidently wrong); misinformation is the harm when someone acts on the wrong answer","Misinformation only comes from humans","Hallucination only happens with math"],
         a:1, why:"The same wrong answer is harmless in a fun-fact and dangerous in a medication dosage. The skill isn't just spotting that AI is wrong — it's fact-checking before you act, especially when stakes are high."},
        {q:"Which prompt is likely to get the best result?",
         opts:["\"Explain machine learning.\"","\"machine learning???\"","\"You are a teacher. Explain machine learning to a beginner who knows basic algebra, using one real-world analogy, in under 100 words.\"","\"Tell me everything about AI.\""],
         a:2, why:"It uses three techniques at once: role assignment ('you are a teacher'), audience + constraints (beginner, under 100 words), and format guidance (one analogy). Specific prompts beat vague ones."},
        {q:"What is 'few-shot' prompting?",
         opts:["Asking the AI several times until it gets it right","Including 1–3 examples of what good output looks like in your prompt","Using as few words as possible","Giving the AI less time to answer"],
         a:1, why:"Few-shot means showing examples of input→output pairs in the prompt so the model learns your pattern instantly. Zero-shot means asking with no examples."},
        {q:"An AI gives you a confident, detailed answer about a recent event. What should you do before acting on it?",
         opts:["Trust it — it sounded confident","Verify it against a primary source, another tool, or a human expert","Ask the same AI if it's sure","Act quickly before the information gets stale"],
         a:1, why:"Confidence is not accuracy — LLMs sound equally sure when wrong. Verification against an independent source is the habit that separates responsible AI users from everyone else."}
      ]
    },
    3: {
      title: "Week 3 — Tools & Memory",
      questions: [
        {q:"What can't a bare LLM (no tools) do?",
         opts:["Write a poem","Answer from its training data","Know what happened in the news yesterday","Explain a concept"],
         a:2, why:"A bare LLM only knows its training data — no real-time information, no persistent memory, no reliable computation. Tools (search, calculators, databases) fill exactly those gaps."},
        {q:"What is the 'context window'?",
         opts:["The amount of text an LLM can see at once — its short-term working memory","The window where you type prompts","A schedule of when the AI is available","The AI's long-term storage"],
         a:0, why:"The context window is the model's working memory. Anything outside it is invisible — which is why long conversations 'forget' the beginning and why persistent memory has to live outside the model."},
        {q:"The course compares RAG to an open-book test. What does that mean?",
         opts:["The AI gets to cheat","Relevant documents are retrieved and handed to the LLM so it answers from real sources instead of memory alone","The AI reads every book ever written before answering","Students can use AI on tests"],
         a:1, why:"RAG (Retrieval-Augmented Generation) fetches the right 'pages' and gives them to the model before it answers. The LLM still reasons — but grounded in real, specific information it can cite."},
        {q:"In a RAG tool like NotebookLM, why do citations matter?",
         opts:["They make the answer look longer","They let you trace an answer back to the exact source passage — retrieval you can verify","They are required by law","They speed up the response"],
         a:1, why:"A citation shows where the answer came from. If the tool can't point to a source — or invents an answer to a question the document doesn't cover — you've caught the difference between retrieving and generating."},
        {q:"What does a vector database store?",
         opts:["Videos","Information as mathematical representations (embeddings) that enable similarity-based search","Only numbers and spreadsheets","Copies of the whole internet"],
         a:1, why:"Vector databases store embeddings — numeric representations of meaning — so a query can find the most similar content, not just exact keyword matches. That's the retrieval engine behind RAG."},
        {q:"You ask a RAG system a question its source document doesn't answer. What should a well-designed system do?",
         opts:["Make up a plausible answer","Say the answer isn't in the source","Refuse to answer anything ever again","Search your personal files without asking"],
         a:1, why:"'Not in the source' is the honest answer. A system that invents one anyway is hallucinating — and watching for that is exactly what the Week 3 activity trains you to do."}
      ]
    },
    4: {
      title: "Week 4 — Multi-Agent Systems",
      questions: [
        {q:"In a multi-agent system, what does the orchestrator do?",
         opts:["Performs every task itself","Breaks down the task and assigns subtasks to worker agents","Only checks spelling","Replaces all the other agents"],
         a:1, why:"The orchestrator is the manager: it decomposes the goal and directs specialist workers (research, writing, verification), like departments in a company."},
        {q:"What is a 'handoff'?",
         opts:["Turning the system off","Passing information or control from one agent to another","Deleting an agent","A human taking over permanently"],
         a:1, why:"Handoffs are where agents pass work along the pipeline — and where errors can slip through if the receiving agent trusts bad output without checking."},
        {q:"What's the biggest risk in a chain of agents?",
         opts:["It costs slightly more","One agent's error compounds as later agents build on it unchecked","The agents get bored","It runs too slowly to be useful"],
         a:1, why:"Error compounding is the classic multi-agent failure: a bad research result becomes a confident summary becomes a published mistake. That's why pipelines need checks between stages."},
        {q:"Where must a human-approval checkpoint (🛑) go?",
         opts:["After every single step, no exceptions","Before any action that is irreversible or affects someone else — sending, spending, publishing, sharing data","Only at the very end","Nowhere — checkpoints defeat the purpose of agents"],
         a:1, why:"The litmus test: 'If the agent gets this step wrong, can you undo it?' If not, a human belongs in the loop there. Everything reversible can stay autonomous."},
        {q:"What are guardrails?",
         opts:["Rules or checks that prevent an agent from taking harmful or unauthorized actions","Physical barriers around servers","A brand of AI software","Backup copies of the agent"],
         a:0, why:"Guardrails constrain what an agent is allowed to do — blocked actions, required approvals, content limits — so that even a confused agent can't cause serious harm."},
        {q:"Good agent teams decide where humans approve…",
         opts:["after something goes wrong","before the system is built — oversight by design","never — approvals are inefficient","only if regulators demand it"],
         a:1, why:"Retrofitting oversight after an incident is how real systems fail. Designing the checkpoints in from the start is the discipline the Week 4 activity practices."}
      ]
    },
    5: {
      title: "Week 5 — Build Your First Agent",
      questions: [
        {q:"What is a system prompt for?",
         opts:["Decoration","Background instructions that define the agent's role and behavior before users interact with it","Making responses longer","A password for the AI"],
         a:1, why:"The system prompt is your agent's job description — its role, rules, and boundaries. It's the single most important instruction you write when building."},
        {q:"Why does the course tell you to try to break your own agent on purpose?",
         opts:["To fill class time","Because finding failure modes yourself builds robustness and adversarial thinking","To prove agents are useless","Because broken agents score higher"],
         a:1, why:"Every agent fails somewhere. Builders who hunt for their own failure modes fix them before users find them — that's the same adversarial habit professional red-teamers use."},
        {q:"Which are Demo Day's three accountability questions?",
         opts:["How fast is it? How big is it? How much did it cost?","What could go wrong? Who is responsible if it fails? What data did you use?","Who coded it? What language? Which model?","Is it fun? Is it pretty? Is it fast?"],
         a:1, why:"Building is half the skill; answering for what you built is the other half. These three questions close the loop opened in Week 1 — accountability as a presentation skill."},
        {q:"Your agent gives a wrong answer during your demo. What's the strongest response?",
         opts:["Hide it and restart quickly","Blame the AI model","Name the failure mode, explain why it happened, and describe your fix or planned fix","Cancel the demo"],
         a:2, why:"The rubric rewards identifying failure modes with a fix attempt. A modest agent whose builder understands its failures beats a flashy one whose builder can't say what could go wrong."},
        {q:"What belongs in a Community Impact Agent's one-page policy?",
         opts:["Only the agent's name","Who it's for, what data it uses, where a human must approve, and what could go wrong","The source code, printed","A list of competitors"],
         a:1, why:"The policy is the governance half of the capstone: audience, data, human checkpoints, and risks. Build skill plus governance mindset is what makes it a portfolio piece."},
        {q:"Which instruction in a system prompt most reduces hallucination harm?",
         opts:["\"Answer as fast as possible\"","\"Never fabricate sources; if you are unsure about a fact, say so explicitly\"","\"Sound as confident as you can\"","\"Use lots of technical jargon\""],
         a:1, why:"Telling the agent to admit uncertainty and never invent sources directly attacks the confident-but-wrong failure mode — it's in the course's own demo system prompt for a reason."}
      ]
    },
    6: {
      title: "Week 6 — AI Safety, Ethics & Your Future",
      questions: [
        {q:"What is bias in an AI system?",
         opts:["The AI having favorite users","Systematic errors in output that reflect unfairness in the training data","A hardware defect","The AI preferring long answers"],
         a:1, why:"Models learn from human-generated data — including its unfairness. An agent making hiring or loan decisions can discriminate systematically without anyone intending it, which is why fairness must be tested, not assumed."},
        {q:"What is prompt injection?",
         opts:["Typing prompts very fast","Malicious text hidden in content the agent reads that tricks it into ignoring its instructions","Giving a prompt to two AIs at once","A medical procedure"],
         a:1, why:"If an agent reads outside content — web pages, emails, documents — attackers can hide instructions in it. Real attacks on real deployed systems; a core reason agents need guardrails."},
        {q:"What is the alignment problem?",
         opts:["Making AI systems pursue the goals their builders actually intend","Centering text on a page","Getting two models to agree","Scheduling AI maintenance"],
         a:0, why:"An agent optimizing a goal can find paths its builders never intended — the goal was right, the path wasn't. Alignment is making intended goals and actual behavior match."},
        {q:"In the hospital debate, what made Group C ('build it with constraints') distinctive?",
         opts:["It rejected AI in medicine entirely","It proposed specific safeguards — oversight, constraints, and fallbacks — instead of a yes/no answer","It argued speed matters more than safety","It let the AI decide for itself"],
         a:1, why:"Most real deployment decisions land where Group C stands: not 'should we?' but 'under exactly what safeguards?' Designing that safeguard system is the engineering-ethics skill."},
        {q:"Which is a Responsible AI principle from the course?",
         opts:["Profitability","Accountability — a human who can be held responsible when the system causes harm","Popularity","Secrecy"],
         a:1, why:"The course's five principles are fairness, transparency, accountability, privacy, and safety. Accountability means harm always traces to a responsible human — never 'the AI did it.'"},
        {q:"Which statement about AI careers is most accurate, per the course?",
         opts:["Only coders can work in AI","Responsible-AI roles — policy analyst, ethics officer, auditor, red-teamer — reward writing, judgment, and ethics, not only code","AI careers are closed to newcomers","Ethics roles are unpaid volunteer work"],
         a:1, why:"As AI deploys everywhere, organizations need people who make sure it's used well. Who holds those oversight roles shapes whose interests AI protects — and these paths are open right now."}
      ]
    }
  },

  /* Baseline (pre-course) — plain-language intuition check, no jargon assumed.
     Same 10 are re-asked after Week 6 as the 'after' half of the growth delta. */
  baseline: [
    {q:"You give a computer program a goal and it figures out the steps, tries them, and adjusts when something fails. What is that best called?",
     opts:["A search engine","An AI agent","A spreadsheet","A website"],
     a:1, why:"Pursuing a goal through its own sequence of actions — planning, acting, observing, adjusting — is what makes software an agent."},
    {q:"When an AI chatbot states something false with total confidence, that's known as…",
     opts:["a glitch in the internet","a hallucination","an opinion","proof AI is useless"],
     a:1, why:"LLMs generate plausible text rather than retrieving verified facts, so they can be confidently wrong. It's structural — not a rare malfunction."},
    {q:"How does an AI writing assistant actually produce its sentences?",
     opts:["It copies from one big approved encyclopedia","It predicts likely next words from patterns in its training data","A person types the answers live","It translates from a secret language"],
     a:1, why:"Next-token prediction at enormous scale — sophisticated autocomplete trained on much of the internet."},
    {q:"An AI answers your question and shows exactly which page of a document the answer came from. Why does that matter?",
     opts:["It looks professional","You can verify the answer against the real source instead of trusting the AI's memory","It makes the answer longer","It doesn't matter"],
     a:1, why:"Grounding answers in citable sources (retrieval) is the difference between checkable information and plausible-sounding generation."},
    {q:"A company uses several AIs — one researches, one writes, one fact-checks. The main advantage is…",
     opts:["it sounds impressive","each specialist does one job well, like departments in a company","it uses more electricity","there is no advantage"],
     a:1, why:"Multi-agent systems split complex work across specialists coordinated by an orchestrator — same logic as human teams."},
    {q:"An AI agent is about to send an email on your behalf. When should it need your approval first?",
     opts:["Never — that defeats the point","Always, for every tiny internal step","Before actions that can't be undone or that affect other people","Only on weekends"],
     a:2, why:"The rule of thumb: if you can't undo it, a human belongs in the loop. Reversible steps can stay autonomous."},
    {q:"An AI trained on past hiring decisions starts favoring the same kinds of candidates humans unfairly favored. That's…",
     opts:["bias — the data's unfairness reproduced by the system","proof the AI is smart","random chance","impossible"],
     a:0, why:"Models learn patterns from human-generated data, including its unfairness — bias in, bias out."},
    {q:"You read an AI's answer about a medical question. Before acting on it you should…",
     opts:["act fast before it changes","check it against a trusted source or a professional","ask the same AI to double-check itself","assume it's right if it sounded confident"],
     a:1, why:"Confidence is not accuracy. High-stakes answers demand independent verification — that habit is the heart of responsible AI use."},
    {q:"If an AI system causes real harm, who should be answerable?",
     opts:["No one — machines can't be blamed","The humans who built, deployed, or misused it","Only the electricity company","The AI, in court"],
     a:1, why:"Accountability always lands on people. 'The AI did it' is never an acceptable answer — that principle anchors the whole course."},
    {q:"Which of these is a real job in AI that is NOT mainly about coding?",
     opts:["AI ethics officer","There are none — AI is only for programmers","Keyboard cleaner","Robot painter"],
     a:0, why:"Policy analysts, ethics officers, auditors, and red-teamers shape how AI is used — roles that reward judgment, writing, and ethics as much as code."}
  ]
};
