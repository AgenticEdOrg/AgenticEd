## Animation script: inf-prompt-processing (for review)

Six steps, one caption sentence each. These captions are the exact text the component shows under the diagram; the highlighted parts follow the flow User Prompt → Tokenizer → LLM Model → Token-by-Token Generation Loop → Final Output.

| Step | Title | Diagram highlight | Caption |
| --- | --- | --- | --- |
| 1 | You send a prompt | User Prompt box | You type “Write a birthday wish for my friend” and press send, and your words travel to the AI model. |
| 2 | The tokenizer splits it | Tokenizer box + arrow in; 7 token chips with ID numbers appear | The tokenizer chops your sentence into small pieces called tokens and gives each one an ID number the model understands. |
| 3 | The model reads every token | LLM Model box + arrow in; all 7 token chips outlined together | The LLM reads all seven tokens together, in one pass, to work out what you are asking for. |
| 4 | It predicts the first new token | Generation Loop + LLM Model; top-guess bars (Happy 62%, Dear 14%, Wishing 9%); “Happy” appears | The model scores the most likely next tokens, picks one (“Happy”), and adds it to the answer. |
| 5 | The loop repeats, token by token | Generation Loop + “fed back in” arrow; new tokens appear one by one | Each new token is fed back in and the model predicts again, building the reply one token at a time. |
| 6 | A stop token ends the answer | Final Output box + arrow in; STOP token; finished text shown | When the model produces a special stop token, the tokens are turned back into words and you see the finished birthday wish. |

