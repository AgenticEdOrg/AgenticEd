# What is an AI agent?

## What an agent is

Imagine asking a friend, "What's the capital of Kenya?" They say "Nairobi," and that's it. Now imagine asking the same friend, "Can you plan our weekend trip?" and watching them check the weather, look up places, and come back with a plan.

The first friend is like a chatbot: one question, one answer, done. The second friend is like an AI agent. You give it a goal, and it works out the steps by itself.

To get things done, an agent uses tools. A tool is simply something it can use to find information or take an action, like a weather website or an internet search. The agent decides which tool to use, and when.

There is also something in between, called a workflow. In a workflow, a person decides every step in advance, and the AI just follows them in order. With an agent, the AI itself decides what happens next.

## The loop: think, act, observe

Every agent works in a simple loop of three steps. It **thinks** about what it still needs, it **acts** by using a tool, and it **observes** what came back. Then it thinks again, using what it just learned.

The loop keeps going until the job is done. But an agent can't loop forever, so people set limits, such as "stop after six steps." That way, a confused agent stops instead of going round in circles.

## An everyday example

You've run this loop yourself, probably this week. You're about to leave the house and can't find your keys. You think, "I had them when I came home," so you check your bag.

They're not there. So you think again: "Maybe I put them down when I took off my jacket." You check your jacket pocket, and there they are.

Nobody gave you a checklist. Each time something didn't work, you used what you saw to choose your next move, and you stopped once you found the keys. That's exactly how an agent works.

## An example from the course

In the Week 1 lab, a class is going on a school trip to Chennai in two days, and their partner school is in Oslo, Norway. The agent gets one request: "Will it rain in Chennai, how does the weather compare with Oslo, and what should we pack?" Nobody tells it what to do first.

So it thinks, "I need Chennai's weather," uses a weather tool, and reads the forecast. Then it thinks, "I need Oslo's weather to compare," and checks that too. With both forecasts in hand, it answers with the rain outlook, a quick comparison, and three packing tips.

Here's the part that keeps it safe. The AI can't actually use a tool on its own — it can only ask, and the program running it decides whether to say yes. For anything risky, like sending a message to all the parents, the program stops and waits for a real person to approve it.

## Check your understanding

1. What are the three steps an agent repeats?
2. What's the difference between a chatbot, a workflow, and an agent?
3. Why do some actions need a person to approve them first?

### Answers

1. Think, act, and observe. The agent repeats them until the job is done or it hits a limit.
2. A chatbot answers once and stops. A workflow follows steps a person planned in advance, while an agent decides its own next step as it goes.
3. Some actions, like sending messages or spending money, affect other people or can't be undone. A person checks first, so that one mistake doesn't cause real harm.