# Lesson 1: Introduction to RAG and how it works

## A smart model that hasn't read your documents

Imagine you're 12 years old and you ask your school's AI helper: "Can I use the AI assistant at home for my homework?"

A regular chatbot will answer straight away. It might say something like "Many schools allow AI for homework with a parent's permission." That sounds reasonable. But it's a guess. The chatbot has never read *your* school's rules.

Here's why. A language model learns from a huge amount of public text, and then the learning stops. After that, it only knows what it saw during training. It hasn't seen your school's policies, your company's handbook, or anything that happened after its training ended. When it doesn't know something, it often doesn't say "I don't know." It fills the gap with something that sounds right.

For a question about school rules, a confident wrong answer is worse than no answer at all.

## The idea: an open-book exam

Think about two kinds of exams.

In a closed-book exam, you answer from memory. If you don't remember, you guess. In an open-book exam, you're allowed to look things up. You find the right page, read it, and write your answer based on what it says.

**Retrieval-Augmented Generation (RAG)** turns the AI's test into an open-book exam. Before answering, it looks up the right part of your documents and uses that to answer.

The name describes the three steps:
- **Retrieve:** find the pieces of your documents that match the question
- **Augment:** add those pieces to the question you send to the model
- **Generate:** the model writes an answer based on those pieces

## Following one question through RAG

Let's go back to our question and watch what happens. Our school, Lakeview, has seven policy documents: AI use, student privacy, devices, exams, clubs and so on.

Some of the work happens once, before anyone asks anything.

**1. Chunk.** The documents are cut into small pieces called chunks. Lakeview's seven documents become 41 chunks, one for each section. Small pieces make it easier to find exactly the part we need, instead of a whole 10-page document.

**2. Embed.** Each chunk goes through an embedding model, which turns the text into a long list of numbers. Think of it as giving every chunk a pin on a map, where chunks about similar things are pinned close together. A chunk about age rules and a chunk about approved tools land near each other. A chunk about the chess club lands far away.

**3. Store.** All these pins are saved in a vector database, along with the original text and which document it came from.

Now someone asks a question. This part happens every single time.

**4. Embed the question.** The question goes through the *same* embedding model, so it gets a pin on the same map.

**5. Search.** The system looks for the pins closest to the question's pin. The closest one is the "Age requirements" section of the AI Use Policy. Notice something interesting: the question says "12-year-old" and the policy says "students under 13". Different words, same meaning, and the search still finds it. That's the power of searching by meaning instead of by exact words.

**6. Augment.** The best-matching chunks are added to the prompt, together with the question and an instruction like "Answer only using these sources."

**7. Generate.** Now the model answers from the policy itself:

> No. Students under 13 can use approved AI tools only during supervised lessons on school devices. From age 13, they may use them at home for schoolwork. (Source: AI Use Policy, section 3)

Compare that with the guess we got at the start. This answer is specific, correct, and you can check where it came from.

<!-- ANIMATION: <agenticed-rag-pipeline></agenticed-rag-pipeline> -->

## Two parts: getting ready, and answering

It helps to think of RAG as two separate jobs.

| Getting ready (done once) | Answering (done for every question) |
|---|---|
| Cut documents into chunks | Turn the question into numbers |
| Turn each chunk into numbers | Find the closest chunks |
| Store them in a vector database | Add them to the prompt |
| | Let the model write the answer |

If the school updates a policy, you only redo the "getting ready" part for that document. The model itself never needs retraining. That's one of the biggest reasons people use RAG: keeping the AI up to date is as easy as updating the documents.

## What RAG doesn't fix

RAG is powerful, but it isn't magic.

- **If the right chunk isn't found, the answer will still be wrong.** The model can only use what it's given. Most RAG problems are actually search problems.
- **If the documents are wrong or out of date, so is the answer.** RAG trusts its sources.
- **The model still needs clear instructions.** Without "answer only from these sources", it may mix in its own guesses.

We'll tackle each of these later in the course.

## Quick check

**1. Why did the regular chatbot give a wrong answer at the start?**
It had never seen Lakeview's policy, so it guessed from general knowledge.

**2. Which steps happen only once, before any questions are asked?**
Chunking, embedding the chunks, and storing them in the vector database.

**3. The question said "12-year-old" but the policy said "under 13". How did the search still find the right section?**
Embeddings capture meaning, not exact words, so texts that mean similar things end up close together.

## Key words

- **Chunk:** a small piece of a document, often one section or paragraph
- **Embedding:** a list of numbers that represents what a piece of text means
- **Vector database:** a database that stores embeddings and finds the closest ones quickly
- **Retrieval:** finding the chunks that best match a question
- **Grounded answer:** an answer based on real sources, which you can check

## What's next

In the next lesson, we'll look closely at chunking. How big should a chunk be? What happens if you cut a sentence in half? You'll try different ways of cutting the same document and see how it changes the answers.