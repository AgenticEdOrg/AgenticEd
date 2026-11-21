## Lesson 1: Introduction to LLM Inference

Every time you ask an AI chatbot something, a lot happens in the few seconds before the answer appears. That behind-the-scenes work is called **inference**.

In this lesson, you'll follow one simple request from the moment you press send to the moment the answer shows up on your screen. You don't need any coding or AI background. If you can send a text message, you can follow along.

**Reading time:** about 10 minutes

### What you'll learn

- What an LLM is, in plain words
- What "inference" means, and how it's different from "training"
- How your words get broken into small pieces called **tokens**
- Why an AI writes its answer one small piece at a time
- Why inference matters for speed and cost

### What is an LLM?

An **LLM** (short for **large language model**) is a computer program that learned the patterns of language by reading an enormous amount of text: books, websites, articles and more.

Its core skill sounds surprisingly simple: **given some text, it predicts what text most likely comes next.**

Think of the word suggestions on your phone's keyboard. When you type "See you," your phone might suggest "soon" or "tomorrow." An LLM works on the same basic idea, but it is far more powerful. It has learned from so much text that its guesses can add up to whole emails, poems, explanations and birthday wishes.

Popular AI assistants such as ChatGPT, Claude and Gemini are built on LLMs.

### What is inference?

**Inference** is the moment an LLM is actually *used*: you give it a prompt, and it produces a response.

- **Prompt:** the message you type to the AI. For example, *"Write a birthday wish for my friend."*
- **Response (or output):** the text the AI writes back.
- **Inference:** everything the model does to turn your prompt into that response.

If an LLM were a chef, inference would be cooking the dish you just ordered.

Every message you send starts a new round of inference. With huge numbers of people chatting with AI all day, inference runs over and over, nonstop. That's why making it fast and affordable matters so much, and it's what this course is all about.

### Training vs. inference: studying vs. taking the exam

Before an LLM can answer anything, it has to be trained. The easiest way to picture the difference is a student and an exam.

**Training is like studying for an exam.**

- The model reads a huge pile of text, over and over, slowly getting better at predicting the next word.
- It takes a long time and a lot of powerful computers.
- It all happens before you ever use the model.

**Inference is like taking the exam.**

- A question arrives (your prompt), and the model answers using what it already learned.
- It happens every single time someone uses the model, so it needs to be quick. Nobody wants to wait minutes for a reply.
- The model doesn't study during the exam. Its knowledge is fixed, and your conversation doesn't change it. (Some apps add "memory" features on top, but those are kept separately from the model itself.)

|  | Training | Inference |
| --- | --- | --- |
| Everyday comparison | Studying for the exam | Taking the exam |
| When it happens | Before the model is released | Every time someone sends a prompt |
| How often | Once, or now and then for an update | Over and over, all day long |
| What changes | The model keeps adjusting itself | Nothing: the model just uses what it knows |
| What you get | A trained model | An answer to your prompt |

What the model learned is stored as billions of numbers called **parameters** (also called **weights**). You don't need to understand them yet. Just know that training *creates* them and inference *uses* them. Module 2 explores this difference in more depth.

### Step by step: what happens when you press send

Let's follow one example from start to finish: *"Write a birthday wish for my friend."*

Here's the whole journey in six steps:

1. You send your prompt.
2. A tokenizer splits it into tokens.
3. The model reads all the tokens.
4. The model predicts the next token.
5. It repeats, one token at a time.
6. A stop signal ends the answer, and the tokens become words again.

> **Note:** The token splits, ID numbers and percentages below are **illustrative**. Real models split text a little differently and use their own numbers, but the steps are the same.

*\[Interactive animation goes here: `<agenticed-inf-prompt-processing>`\]*

#### Step 1: You send your prompt

You type *"Write a birthday wish for my friend"* and press send. Your message travels over the internet to a powerful computer in a data center, where the model runs.

#### Step 2: Your words are split into tokens

The model doesn't read words the way you do. First, a tool called a **tokenizer** chops your text into small pieces called **tokens**.

A token is often a whole short word. It can also be part of a longer word, a punctuation mark, or a word with its space attached. Our prompt might be split like this:

| Token | ID number (illustrative) |
| --- | --- |
| Write | 8144 |
| a | 264 |
| birthday | 15553 |
| wish | 6562 |
| for | 369 |
| my | 856 |
| friend | 4333 |

Each token has an **ID number** from the model's fixed list of known tokens, called its **vocabulary**. Computers work with numbers, so these ID numbers are what the model actually receives.

Think of tokens like LEGO bricks: the model builds and reads everything out of these standard pieces. A long or unusual word might take several bricks. "Unbelievable," for example, could become "un" + "believ" + "able."

A handy rule of thumb for English: 100 tokens is roughly 75 words ([OpenAI](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them)).

#### Step 3: The model reads your whole prompt

Next, the model looks at all seven tokens together, in one go. It works out how they relate to each other: "birthday" and "wish" belong together, "my friend" is who it's for, and "Write" means you want it to create something.

It's like reading the whole exam question before you start writing your answer. (In Module 3, you'll learn the official names for this reading phase and the writing phase that follows.)

#### Step 4: The model predicts the next token

Now the model starts writing. It doesn't plan the whole answer at once. It asks one question: **"What token is most likely to come next?"**

It gives a score to every token in its vocabulary. For the first token of our answer, the top guesses might look like this:

| Possible next token | Chance (illustrative) |
| --- | --- |
| Happy | 62% |
| Dear | 14% |
| Wishing | 9% |
| Every other token, combined | 15% |

The model picks one, here "Happy," and adds it to the answer.

Why can the same prompt give a different answer next time? The model doesn't always pick the top guess. Apps usually let it choose with a little controlled randomness, so answers feel natural instead of robotic. A setting often called **temperature** controls how adventurous those picks are.

#### Step 5: Repeat, one token at a time

Here's the key idea of inference: **each new token is added to the text, and the model predicts again.**

- Round 1: the prompt → "Happy"
- Round 2: the prompt + "Happy" → "birthday"
- Round 3: the prompt + "Happy birthday" → "to"
- Round 4: the prompt + "Happy birthday to" → "my"
- …and so on, one token per round.

Each new token depends on all the tokens before it. That's why the model can't write the end of a sentence before the beginning.

Picture a storyteller who says one word, listens to the whole story so far, then picks the next word. That's exactly how an LLM writes.

It's also why AI answers often appear word by word on your screen. The app shows you each token as soon as it's ready, a feature called **streaming**.

#### Step 6: The model stops, and you see the answer

When the answer is complete, the model produces a special **stop token**, a signal that means "I'm done." Apps also set a maximum length, so an answer can't run on forever.

Finally, the tokens are turned back into normal text you can read:

> Happy birthday to my amazing friend! Have the best day ever.

That whole journey, from prompt to tokens to reading to predicting, repeating and stopping, is **LLM inference**.

### Why inference matters

Training happens once, before release. Inference happens every time anyone uses the model. So inference is where people feel the wait, and where companies pay the bills.

Three things matter most:

- **Speed:** how long until the first words appear, and how fast the rest follows.
- **Cost:** every token takes computer work, so more tokens mean more cost. That's why many AI services charge by the token.
- **Scale:** answering one person is easy. Answering thousands of people at the same time is the hard part.

The rest of this course is about making inference faster, cheaper and able to serve many people at once. Here's where each question you might have now gets answered:

| A question you might have now | Where we answer it |
| --- | --- |
| How exactly is training different from inference? | Module 2 |
| Why is reading the prompt different from writing the answer? | Module 3 |
| How does one-token-at-a-time writing really work? | Module 4 |
| How much computer memory does a model need? | Module 5 |
| Can we shrink a model without ruining it? | Module 6 |
| How does a model avoid redoing work for every new token? | Module 7 |
| How do we answer many users at once? | Module 8 |
| Which tools do teams use to run models? | Module 9 |
| How do we measure and improve speed? | Module 10 |
| How do we put a model online for real users? | Module 11 |

### Quick recap

- An **LLM** is a program that predicts what text comes next.
- **Training** is studying for the exam (done beforehand). **Inference** is taking the exam (every time you send a prompt).
- A **tokenizer** splits your prompt into **tokens**, and each token has an **ID number**.
- The model reads your whole prompt, then writes its answer **one token at a time**, feeding each new token back in.
- A **stop token** ends the answer, and the tokens are turned back into words.

### Key terms

| Term | Plain-English meaning |
| --- | --- |
| LLM (large language model) | A program that learned language patterns from huge amounts of text and predicts what comes next |
| Prompt | The message you send to the AI |
| Response (output) | The text the AI writes back |
| Training | The long learning process that happens before a model is used |
| Inference | Using a trained model to turn a prompt into a response |
| Parameters (weights) | The numbers inside a model that store what it learned |
| Token | A small piece of text: a word, part of a word, or a symbol |
| Tokenizer | The tool that splits text into tokens and gives each one an ID number |
| Token ID | The number that stands for a token |
| Vocabulary | The full list of tokens a model knows |
| Next-token prediction | The model's core job: guessing the most likely next token |
| Temperature | A setting that controls how adventurous the model's picks are |
| Stop token | A special token that means "the answer is finished" |
| Streaming | Showing the answer on screen as each token is produced |


## Sources

- [What are tokens and how to count them? (OpenAI Help Center)](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them): rule of thumb that 100 tokens is about 75 English words.
