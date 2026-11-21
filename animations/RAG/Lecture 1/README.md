# RAG, Lecture 1: how RAG answers a question

This folder holds one animation, built as a web component. It drops into any page with two lines and looks the same everywhere.

| File | What it is |
|---|---|
| `rag-pipeline.js` | The animation: the `<agenticed-rag-pipeline>` tag |
| `preview.html` | A test page. Open it directly in your browser |
| `README.md` | This file |

## Embedding it in a course page

Put these two lines where the animation should appear:

```html
<script src="/animations/RAG/Lecture%201/rag-pipeline.js" defer></script>
<agenticed-rag-pipeline></agenticed-rag-pipeline>
```

A few things to know:

- **The `%20` is the space in "Lecture 1".** Web addresses can't contain a plain space, so it has to be written as `%20`.
- **Paths.** The path above works on the live site. If you open a page by double-clicking it on your laptop, use a relative path instead, for example `../animations/RAG/Lecture%201/rag-pipeline.js`.
- **It won't clash with your page.** It renders inside Shadow DOM, so `site.css` can't change it and its styles can't leak out.
- **It sizes itself.** It fills the width of the column you put it in. Below about 680px wide it switches to a tall drawing made for phones. Please don't give it a fixed height or put it in an iframe.
- **Spacing.** It has a 28px margin above and below. To change that, style the tag itself, for example `agenticed-rag-pipeline { margin: 40px 0; }`.
- **Fonts.** It uses Outfit and Inter, and loads them from Google Fonts if the page hasn't already.

## How it works for the learner

- Eight steps, one caption each. **Back** and **Next** move one step, and **Play** runs through them.
- The bar under the drawing shows progress. It is split into three groups: the problem, getting ready (done once), and answering (done for every question). Clicking a segment jumps to that step.
- The left and right arrow keys also move between steps, and Space plays or pauses.
- If the reader has "reduce motion" turned on, each step appears without moving.

## What is real and what is illustrative

- **Real:** the 7 policy documents, the 41 chunks (one per `##` section), the question and the quoted policy text all come from `labs/data/corpus/` and `labs/data/eval/rag_questions.jsonl` in this repo. The map in step 6 has one dot per chunk.
- **Illustrative:** the positions on the 2-D map, the length of the three match bars, and the shading of the vector cells. Replace them with real numbers from an embedding model when we have them.

## Tested

Chrome, at 320, 390, 768 and 1200px wide, with the keyboard, and with "reduce motion" on. Please also try it once in Safari and Firefox. On a 320px phone the smallest labels in the drawing are about 10px.

## Making another animation the same way

1. Copy `rag-pipeline.js` into the new lecture's folder and rename it by course: `llm-<name>.js`, `rag-<name>.js` or `inf-<name>.js`.
2. At the top of the file, change `TAG` to match (for example `agenticed-llm-tokenization`).
3. Replace `TITLE` and `STEPS`. Each step has a `phase`, a `title` and a `body`. Steps with the same phase are grouped in the progress bar. Aim for 5 to 8 steps.
4. Replace the two drawings: `WIDE_SVG` (left to right, `viewBox="0 0 720 360"`) and `TALL_SVG` (top to bottom, `viewBox="0 0 320 496"`).
5. Leave the player and `BASE_CSS` as they are, so every animation behaves and looks the same.
6. Test at 320, 390, 768 and 1200px.

Inside the drawings, mark each element with the step or steps where it should show:

| Attribute | What it does |
|---|---|
| `data-on="3"` or `data-on="2-4"` | Visible on step 3, or on steps 2 to 4 |
| `style="--d:.4s"` | Waits 0.4s before appearing |
| `class="from-left"`, `from-right`, `from-up`, `pop` | How it enters |
| `class="draw" pathLength="1"` on a path | The line draws itself in |
| `<circle class="pk" data-run="3" data-path="id">` | A dot travels along that path on step 3 |
| `<g class="slide" data-shift-until="2" style="--tx:165px">` | Sits 165px to the right up to step 2, then slides back |

### Look and feel (from the site's own styles)

| Use | Colour |
|---|---|
| Model boxes, primary button | Ink `#0B1020` with white text |
| Arrows and highlights | Violet `#8B5CF6` |
| Questions | Sky `#D6ECFF` |
| Documents and chunks | Peach `#FFEADB` |
| Vectors | Green `#0E9F75` in different strengths |
| Databases | Lilac `#F1EDFF` |
| Correct, grounded answers | Mint `#F1FBF6` with `#047857` text |

- Use sentence case for labels, not capitals.
- Keep text in the drawings at 12px or larger.
- Always add a text label as well as a colour.
- Say on screen when something is simplified, as step 6 does.
