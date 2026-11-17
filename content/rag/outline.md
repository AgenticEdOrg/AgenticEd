# RAG Course Outline

Ask a chatbot "What time does the library close today?" and it will happily give you an answer. It just won't be *your* library's answer. It has never seen your library's opening hours, so it guesses.

Retrieval-Augmented Generation (RAG) fixes that. Before answering, the AI looks up the right page in your own documents, reads it, and answers from it. Think of an open-book exam instead of answering from memory.

Throughout this course, we'll build one thing step by step: a helper that answers questions about a school's rules, using the school's real policy documents. Every module adds one piece. Along the way you'll find animations, interactive diagrams, short quizzes and small coding exercises.

## Module 1: Introduction to RAG
**Why AI models need to look things up.**

A language model learned from a huge pile of public text, then stopped learning. It doesn't know your company's handbook, your school's rules, or yesterday's news. When it doesn't know, it often makes something up that *sounds* right. RAG gives it the right page to read first.

You'll learn to:
- Explain why a model guesses when it hasn't seen the information
- Describe the three steps: retrieve, augment, generate
- Tell when RAG is the right tool, and when a normal chatbot is enough

## Module 2: RAG architecture
**The parts of a RAG system, and how they fit together.**

A RAG system works a bit like a library. Someone has to collect the books, sort them and label the shelves. That happens once, ahead of time. Then, every time a visitor asks a question, a librarian finds the right shelf and hands over the right pages. In RAG, the "sorting" is called indexing and the "finding" is called retrieval.

You'll learn to:
- Name each part: loader, chunker, embedding model, vector database, retriever and the language model
- Separate the work done once (indexing) from the work done for every question (answering)
- Follow one question all the way through the system

## Module 3: Document loading and preprocessing
**Getting clean text out of messy files.**

Real documents are messy. PDFs have page numbers in the middle of sentences, and web pages come with menus and cookie banners. If you feed that mess in, you get mess out. This module is about cleaning up before anything else happens.

You'll learn to:
- Pull text out of PDFs, web pages and Markdown files
- Remove noise like headers, footers and broken lines
- Keep useful details with each piece, such as the source, title and date

## Module 4: Chunking strategies
**Cutting documents into pieces that are easy to find.**

You wouldn't hand someone a 300-page manual to answer one question. You'd point to the right paragraph. Chunking cuts documents into small pieces so the system can find just the part it needs. Cut too small and you lose the meaning; cut too big and the answer gets buried.

You'll learn to:
- Compare different ways to cut text: by size, by sentence, by paragraph, by heading and by meaning
- Pick a chunk size and overlap, and explain why
- Test how your choice changes the answers you get

## Module 5: Embeddings and vector databases
**Turning words into numbers that capture meaning.**

"12-year-old" and "students under 13" share almost no words, yet they mean nearly the same thing. An embedding turns text into a long list of numbers, so that texts with similar meaning end up close together, like pins on a map. A vector database stores those pins so we can search them quickly.

You'll learn to:
- Explain what an embedding is, using the map idea
- Choose an embedding model for your task
- Store and search embeddings in a vector database such as Chroma or FAISS

## Module 6: Similarity search and retrieval
**Finding the pieces that best match a question.**

Once the question is a pin on the map too, retrieval is simple: find the nearest pins. This module looks at how "nearest" is measured, how many results to keep, and what to do when the search brings back the wrong thing.

You'll learn to:
- Measure how close two pieces of text are (cosine similarity)
- Decide how many results to keep, and filter them by source or date
- Work out why a search returned the wrong pieces, and fix it

## Module 7: Hybrid search and reranking
**Combining two kinds of search for better results.**

Searching by meaning is great, but it can miss exact words, like a form number or someone's name. Keyword search catches those. Hybrid search uses both. A reranker then takes a second, closer look at the top results and puts the best one first.

You'll learn to:
- Combine keyword search with meaning-based search
- Use a reranker to improve the order of results
- Decide when the extra effort is worth it

## Module 8: Advanced RAG techniques
**Handling harder questions.**

Some questions are vague, like "Am I allowed to do that?" Others need information from three different documents at once. This module covers tricks for these cases: rewriting the question before searching, searching several times, and letting the AI decide what to look up next.

You'll learn to:
- Rewrite a question so the search finds better results
- Retrieve a small piece but give the model the bigger section around it
- Explain how multi-step and agent-style RAG work

## Module 9: RAG evaluation
**Checking whether it actually works.**

"It looks right" is not a test. We'll write a small set of questions with known answers, then check two things. Did the search find the right pages? Did the answer stick to what those pages say?

You'll learn to:
- Check if the right pieces were found (recall@k and MRR)
- Check if the answer stays faithful to the sources
- Build your own small test set of questions and expected sources

## Module 10: Building RAG applications
**Putting it all together.**

Time to finish the school rules helper and make it ready for real users. It should show its sources, say "I don't know" when the documents don't cover something, and ignore any sneaky instructions hidden inside a document.

You'll learn to:
- Build a complete RAG app that cites its sources
- Handle missing answers and instructions hidden in documents (prompt injection)
- Put the app online and keep an eye on its quality