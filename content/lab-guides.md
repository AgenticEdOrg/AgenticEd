# AgenticEd Lab Guides

These guides take you through the Week 1 and Week 2 labs one step at a time. Both labs run in Google Colab, a free Google website that runs code in your browser, so you don't need to install anything on your computer.

## Words you will see

- Notebook: a page that mixes notes with small boxes of code. Each lab is one notebook.
- Cell: one box of code in a notebook. To run it, click the round ▶ button on its left, or click inside it and press Shift + Enter.
- Section: each notebook is split into numbered parts with bold headings, like "1 · One model call, metered". When this guide says "the Section 1 cell", it means the code cell under that heading.
- Prompt: the question or instructions you send to an AI model.
- API key: a long secret code that lets the notebook use an AI model. Treat it like a password. Never paste it into a cell or share it.
- Token: a small piece of text, about one word or part of a word. AI models read and write in tokens, and companies charge by the token.

Run the cells in order, from top to bottom. If something goes wrong, look at the common errors at the end of each lab before you ask for help.

---

## Week 1: Agent Fundamentals

Notebook: `labs/week1_agent_fundamentals.ipynb`

In this lab you build a small AI agent that helps a school plan a class trip. It checks a real weather service, can look things up on Wikipedia and gives packing advice. The notebook says the lab takes 75 to 90 minutes.

### Before you start

- A free Google account, so you can sign in to Colab.
- An API key from one of these:
  - Gemini, from Google AI Studio (aistudio.google.com). It's the cheapest option and has a free tier.
  - OpenAI or Anthropic. These also work, but you have to add paid credit first. The notebook says the lab costs about US$0.05 with its default model.
- A web browser and an internet connection. The weather and Wikipedia tools are free and don't need a key.

### Steps

1. Open https://colab.research.google.com/github/AgenticEdOrg/AgenticEd/blob/main/labs/week1_agent_fundamentals.ipynb in your browser.
   The notebook opens in Colab. Your changes don't affect the course's copy, so to keep your work, click File → Save a copy in Drive.

2. Click the key icon in Colab's left sidebar, then Add new secret. Name it `GEMINI_API_KEY` (or `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`), paste your key in the Value box and turn on Notebook access.
   Saving the key here means it's never written in the notebook, so it won't leak if you share your work.

3. Run the first code cell and wait 2 to 3 minutes.
   It downloads the course files and installs what the lab needs. You'll probably see two red errors, and both are expected: `ResolutionImpossible` (step 4 fixes it) and, if you use Gemini, "No API key found" (step 5 fixes it). If Colab asks you to restart, click Restart and run this cell again. If you use OpenAI or Anthropic and saw no errors, skip to step 6.

4. If you saw `ResolutionImpossible`, or you use Gemini, add a new cell below the first one and run this line in it. To add a cell, move your mouse just below the first cell and click + Code.
   ```
   %pip install -q litellm pydantic-ai openai-agents
   ```
   This installs the three libraries (ready-made code written by other people) that the lab uses. When I ran it, it printed red lines about `google-colab` and `google-adk`. The install still worked, so you can ignore them.

5. Only if you use Gemini: add another cell, paste in this code and run it. It shows a green tick and prints nothing.
   ```python
   import os
   from google.colab import userdata
   from agents.extensions.models.litellm_model import LitellmModel

   os.environ["GEMINI_API_KEY"] = userdata.get("GEMINI_API_KEY")

   class GeminiCfg:
       def __init__(self, base=None):
           self._base = base
           self.litellm = "gemini/gemini-3.5-flash-lite"
           self.pydantic_ai = "google:gemini-3.5-flash-lite"
       def litellm_kwargs(self):
           return {"timeout": 60}
       def cost(self, in_tokens, out_tokens):
           # Gemini 3.5 Flash-Lite: $0.30 per million input tokens, $2.50 per million output tokens
           return round((in_tokens * 0.30 + out_tokens * 2.50) / 1_000_000, 6)
       def openai_agents(self):
           return LitellmModel(model=self.litellm, api_key=os.environ["GEMINI_API_KEY"])
       def __getattr__(self, name):
           if self._base is not None:
               return getattr(self._base, name)
           raise AttributeError(name)

   cfg = GeminiCfg(cfg if "cfg" in globals() else None)
   ```
   This tells the lab to use Gemini, and to work out costs with Gemini's prices.

6. Run the Section 1 cell. It asks the model one question and prints the answer, then the tokens used, the time taken and the cost.
   In my run the last line was `17 in / 42 out tokens · 1.6s · ~$0.00011`. An agent makes many calls like this one, so this is the cost of just one.

7. Run the Section 2 cell. It creates two tools, `get_forecast` and `wikipedia_summary`, and tries them out on Chennai.
   A tool is a small piece of code the agent can use to get real information. These two use the free Open-Meteo weather service and Wikipedia.

8. Run the Section 3 cell. It should print "The model replied with a tool request, not an answer", then a line with `name=get_forecast` and Oslo.
   The model can't run code itself. It reads the tool descriptions in `TOOLS` and asks your code to run one, and `REGISTRY` tells your code which function goes with which name.

9. Run the Section 4 cell with `run_agent(TASK)`, then the cell below it. The first prints each tool the agent used and its final answer. The second shows a table with a row for every model call and every tool call.
   Look at `in_tokens` in the model-call rows. The number goes up each time because the whole conversation is sent again with every call, and this is the main reason agents cost more.

10. Run the Section 5 cell with `trip_workflow("Chennai", "Oslo")`. It prints a small table comparing the agent with the workflow.
    In a workflow your code decides the steps, and in an agent the model decides them. The table shows how many calls and tokens each one used.

11. Run the first Section 6 cell. It prints a `TripAdvice` answer with five parts: `destination`, `rain_expected`, `max_temp_c`, `comparison` and `packing` (exactly three items).
    Pydantic AI, another toolkit, checks that the answer has exactly these parts. If it doesn't, the model is asked to try again.

12. Run the next cell, the one with the `send_message` tool. It prints `PENDING` and asks `Approve? [y/N]`. Type `y` and press Enter, or type `n`.
    The agent isn't allowed to message parents until a person approves. If you type `n`, the last line shows `actually sent: []`, which means nothing was sent.

13. Run the Section 7 cell. It plans the same trip using the OpenAI Agents SDK and prints the answer.
    This is a third way to build the same agent. The table under the cell compares all three.

14. Exercise 1: in the `days_until` cell, replace `raise NotImplementedError` with code that returns `{"days": number}`, the number of days from today to the date it's given. In the same cell, add a description of the tool to `TOOLS` and the function to `REGISTRY`. Run the cell, then run the check cell below it.
    You pass when it prints `✓ Exercise passed`. If it says "Not done yet", run your function's cell first. If you're stuck, open "Show a solution" just below. Once it passes, try `run_agent("How many days until 2026-12-14?")` to see the agent use your tool.

15. Exercise 2: fill in `run_agent_budgeted` by copying the code inside `run_agent`, but keep its first line as it is. After each model call, add the tokens it read and wrote (prompt plus completion tokens) to a running total. When the total goes over `max_total_tokens`, stop and return `"Stopped: token budget exceeded."` together with the list of steps so far (the trace), the same two things `run_agent` returns. Then run the check cell, which sets the budget to 50 tokens.
    You pass when it prints `✓ Exercise passed`. A token budget stops the agent once it has used a set amount, which keeps the cost under control.

### Common errors

1. The first cell shows a red error with the word `ResolutionImpossible`.
   Why: some versions in the course's package list (`requirements.txt`) clash with each other, so nothing from that list gets installed.
   What to do: run the install line from step 4, then carry on.

2. A later cell fails with `name 'cfg' is not defined`, or step 5 shows an error about your secret.
   Why: you're using Gemini, and the step 5 cell either didn't run or couldn't read your key.
   What to do: check that the secret is named exactly `GEMINI_API_KEY` and that Notebook access is on. Run steps 4 and 5 again, then run the cell that failed.

3. The `send_message` cell keeps running and never finishes.
   Why: it's waiting for your answer in a small text box under the cell.
   What to do: click in the box, type `y` or `n` and press Enter.

---

## Week 2: LLM Engineering

Notebook: `labs/week2_llm_engineering.ipynb`

This lab shows what goes on inside a language model. You count tokens, see how the model picks each next word, make its answers follow rules and test prompts fairly. The notebook says the lab takes 75 to 90 minutes.

### Before you start

- Finish Week 1 first, because this lab builds on it.
- A free Google account.
- An API key, the same one as Week 1. If you saved it in Colab for Week 1, it's still there. You only need to turn on Notebook access for this notebook.
- The free version of Colab is enough. You don't need a GPU.
- The lab downloads a small AI model called GPT-2 (about 548 MB). It downloads into Colab, not to your computer, but that cell is slow the first time.

### Steps

1. Open https://colab.research.google.com/github/AgenticEdOrg/AgenticEd/blob/main/labs/week2_llm_engineering.ipynb in your browser.
   As in Week 1, click File → Save a copy in Drive if you want to keep your work.

2. Click the key icon in the left sidebar and turn on Notebook access for your API key.
   The notebook can only use your key after you allow it here.

3. Run the first code cell and wait 2 to 3 minutes.
   The same two red errors as Week 1 are expected: `ResolutionImpossible`, and "No API key found" if you use Gemini. If Colab asks you to restart, click Restart and run this cell again. If you use OpenAI or Anthropic and saw no errors, skip to step 6.

4. If you saw `ResolutionImpossible`, or you use Gemini, click + Code to add a cell below the first one, and run this line in it.
   ```
   %pip install -q tiktoken transformers torch pydantic-ai pandas matplotlib
   ```
   This installs the libraries Week 2 uses. The same red lines about `google-colab` and `google-adk` may appear. The install still works, so you can ignore them.

5. Only if you use Gemini: add another cell, paste in this code and run it. It shows a green tick and prints nothing.
   ```python
   import os, labkit
   from google.colab import userdata

   os.environ["GEMINI_API_KEY"] = userdata.get("GEMINI_API_KEY")

   class GeminiCfg:
       def __init__(self, base=None):
           self._base = base
           self.litellm = "gemini/gemini-3.5-flash-lite"
           self.pydantic_ai = "google:gemini-3.5-flash-lite"
       def cost(self, in_tokens, out_tokens):
           # Gemini 3.5 Flash-Lite: $0.30 per million input tokens, $2.50 per million output tokens
           return round((in_tokens * 0.30 + out_tokens * 2.50) / 1_000_000, 6)
       def __getattr__(self, name):
           if self._base is not None:
               return getattr(self._base, name)
           raise AttributeError(name)

   cfg = GeminiCfg(cfg if "cfg" in globals() else None)
   ```
   This tells the lab to use Gemini, and to work out costs with Gemini's prices.

6. Run the Section 1 cell that starts with `import tiktoken`. It shows a table of how many tokens the same sentence takes in English, Spanish, Hindi, Tamil and JSON (a format for data).
   In the `tokens_per_word` column you should see English 1.31, Spanish 1.50, Hindi 1.45, Tamil 3.60 and JSON 3.43. So the same message costs almost three times as much in Tamil as in English. Under the table you can see the English sentence cut into tokens.

7. Run the next cell, the one with `estimate(...)`. It works out what it would take to send all of the course's policy documents as one prompt.
   With Gemini, my run printed 1,960 tokens, 1.77% and a cost of 0.001338 dollars. The 1.77% is how much of the model's reading limit this would use, measured against 128,000 tokens. The cost will be different if you use OpenAI or Anthropic.

8. Run the Section 2 cell that loads GPT-2. It shows the eight words the model thinks are most likely to come after "The safest way to deploy an AI agent is to", with their chances at three temperatures: 1, 0.5 and 1.5.
   Temperature is a setting for how much the model takes chances. At 0.5 the top word becomes even more likely, and at 1.5 the chances spread out across more words.

9. Run the next cell. It finishes the same sentence three ways: temperature 0, temperature 0.7 with `top_k=40` (only the 40 most likely words are allowed), and temperature 1.6.
   At 0 the model always picks the most likely word, so the text is the same every run. At 1.6 the text gets random and often stops making sense.

10. Run the chart cell. It draws a line showing entropy for temperatures from 0.2 to 2.0.
    Entropy is a measure of how unsure the model is. The line goes up as temperature goes up, so the text gets harder to predict.

11. Optional exercise: go back to the cell from step 9 and fill in `apply_top_p(probs, p)`. Sort the chances from highest to lowest, add them up as you go, keep words until the total reaches `p`, and set the rest to zero. Don't rescale the ones you keep, because the code after it already does that. Run that cell again, then run the check cell.
    You pass when it prints `✓ Exercise passed` and a short piece of text. If you're stuck, open "Show a solution" under the check cell.

12. Run the Section 3 cell. It sorts a help desk ticket from a parent who was charged twice for a laptop repair. Check that the answer has `category` as `billing` and `needs_human` as `true`.
    The `output_validator` is an extra rule: billing tickets must always go to a person. If the model's answer breaks the rule, it's sent back to be fixed.

13. Run the Section 4 cell. It tries three versions of a prompt (`v1 bare`, `v2 definitions` and `v3 definitions + examples`) on 24 help desk tickets where the right answer is already known, and prints how often each version was right.
    Using the same set of tickets is a fair way to compare prompts. With only 24 tickets, one mistake changes the score by about 4%, so small differences don't mean much.

14. Run the next cell. It shows a confusion matrix for the best prompt (a table of the right answers against the model's answers), and a list of the tickets it got wrong.
    The table shows which categories the model mixes up. Some tickets are unclear even to a person. For example, "Can the repair fee be waived?" could be billing or policy. If you see an `error` column, read common error 2 below.

15. Run the Section 5 cell. It asks about 3 real things and 3 made-up ones, first with plain instructions and then with instructions that let the model say it doesn't know.
    In my run, both versions gave 0 of 3 made-up answers and 0 of 3 wrong refusals. AI answers change from run to run, so yours may be different.

### Common errors

1. The first cell shows a red error with the word `ResolutionImpossible`.
   Why: some versions in the course's package list (`requirements.txt`) clash with each other, so nothing from that list gets installed.
   What to do: run the install line from step 4, then carry on.

2. In step 13 the scores are low, and some answers say `error`.
   Why: the notebook sends all 24 tickets at the same moment for each prompt. If a request fails, it just writes `error` and doesn't say why. With a free key, the most likely cause is the limit on how many requests you can send per minute. In my run, 8 of the 24 tickets for `v1 bare` came back as `error`.
   What to do: count the `error` entries as failed requests, not wrong answers, when you compare the prompts. A paid key with higher limits usually gives a clean run.

3. A warning about `HF_TOKEN` appears while GPT-2 downloads.
   Why: Hugging Face, the website GPT-2 comes from, is reminding you that you aren't logged in.
   What to do: nothing. GPT-2 is public, so it downloads and runs fine without a login.