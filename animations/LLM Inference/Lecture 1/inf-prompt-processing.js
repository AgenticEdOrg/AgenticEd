/*!
 * inf-prompt-processing.js
 * AgenticEd Academy - LLM Inference, Lesson 1: Introduction to LLM Inference
 *
 * <agenticed-inf-prompt-processing>
 * A 6-step, step-through animation showing how a user's prompt is processed:
 * User Prompt -> Tokenizer -> LLM Model -> Token-by-Token Generation Loop -> Final Output
 *
 * Stack: Vanilla JS + inline SVG inside Shadow DOM. No frameworks, no external
 * libraries, no font imports, no build step.
 *
 * Embed (two lines):
 *   <script src="/animations/inf-prompt-processing.js" defer></script>
 *   <agenticed-inf-prompt-processing></agenticed-inf-prompt-processing>
 *
 * Optional attributes:
 *   autoplay          Start playing once the player scrolls into view.
 *                     Ignored when the visitor prefers reduced motion.
 *   start-step="1-6"  Step to show first (default 1).
 *
 * Optional CSS custom properties (set on the element from the host page):
 *   --agx-font-heading, --agx-font-body   Override the font stacks.
 *   --agx-controls-position               "sticky" (default on narrow layouts) or "static".
 *
 * Events:
 *   stepchange  CustomEvent, detail: { step, total }  (bubbles, composed)
 *
 * Accessibility:
 *   - Back / Next / Play-Pause / Restart are real <button>s with visible focus rings.
 *   - Left/Right arrow keys (plus Home/End) work only while the player has focus;
 *     on narrow layouts the active box is scrolled into view (above the sticky
 *     controls) on Back/Next/arrow keys/Restart, and during Play while the
 *     player is on screen. Playback never pulls the page back to the player
 *     once the visitor has scrolled away from it.
 *     no global window listeners, so several animations can share one page.
 *   - Captions are real DOM text in an aria-live="polite" region, not SVG text.
 *   - prefers-reduced-motion: transitions, the moving arrow dashes, staggered
 *     reveals and the autoplay attribute are all switched off.
 *
 * The sample prompt, token splits, ID numbers and percentages are illustrative.
 */
(() => {
  'use strict';

  const TAG = 'agenticed-inf-prompt-processing';
  if (typeof window === 'undefined' || !window.customElements || window.customElements.get(TAG)) return;

  /* ------------------------------------------------------------------ */
  /* Content (illustrative example)                                      */
  /* ------------------------------------------------------------------ */

  const PROMPT_TOKENS = [
    { t: 'Write', id: '8144' },
    { t: 'a', id: '264' },
    { t: 'birthday', id: '15553' },
    { t: 'wish', id: '6562' },
    { t: 'for', id: '369' },
    { t: 'my', id: '856' },
    { t: 'friend', id: '4333' },
  ];

  const GEN_ITEMS = ['Happy', 'birthday', 'to', 'my', 'amazing', 'friend', '!', 'Have', 'the', 'best', 'day', 'ever', '.']
    .map((t) => ({ t }))
    .concat([{ t: 'STOP', stop: true }]);

  const FINAL_TEXT = 'Happy birthday to my amazing friend! Have the best day ever.';

  // [token, percent, picked]
  const GUESSES = [['Happy', 62, true], ['Dear', 14, false], ['Wishing', 9, false]];

  const STEPS = [
    {
      title: 'You send a prompt',
      caption: 'You type \u201CWrite a birthday wish for my friend\u201D and press send, and your words travel to the AI model.',
      focus: 'prompt', nodes: ['prompt'], arrows: [], vars: {},
      prompt: 'hidden', gen: 0, guesses: false, phase: 'prompt', dur: 4200,
    },
    {
      title: 'The tokenizer splits it',
      caption: 'The tokenizer chops your sentence into small pieces called tokens and gives each one an ID number the model understands.',
      focus: 'tokenizer', nodes: ['tokenizer'], arrows: ['a1'], vars: {},
      prompt: 'shown', gen: 0, guesses: false, phase: 'prompt', dur: 5000,
    },
    {
      title: 'The model reads every token',
      caption: 'The LLM reads all seven tokens together, in one pass, to work out what you are asking for.',
      focus: 'model', nodes: ['model'], arrows: ['a2'], vars: { model: 'reading' },
      prompt: 'read', gen: 0, guesses: false, phase: 'prompt', dur: 4600,
    },
    {
      title: 'It predicts the first new token',
      caption: 'The model scores the most likely next tokens, picks one (\u201CHappy\u201D), and adds it to the answer.',
      focus: 'loop', nodes: ['model', 'loop'], arrows: ['a3'], vars: { model: 'predicting' },
      prompt: 'shown', gen: 1, guesses: true, phase: 'gen', dur: 5000,
    },
    {
      title: 'The loop repeats, token by token',
      caption: 'Each new token is fed back in and the model predicts again, building the reply one token at a time.',
      focus: 'loop', nodes: ['model', 'loop'], arrows: ['a3', 'back'], vars: { model: 'predicting' },
      prompt: 'shown', gen: GEN_ITEMS.length - 1, guesses: false, phase: 'gen', dur: 5600,
    },
    {
      title: 'A stop token ends the answer',
      caption: 'When the model produces a special stop token, the tokens are turned back into words and you see the finished birthday wish.',
      focus: 'output', nodes: ['output'], arrows: ['a4'], vars: { output: 'done' },
      prompt: 'shown', gen: GEN_ITEMS.length, guesses: false, phase: 'gen', dur: 5000,
    },
  ];

  /* ------------------------------------------------------------------ */
  /* SVG helpers                                                         */
  /* ------------------------------------------------------------------ */

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const r1 = (n) => Math.round(n * 10) / 10;
  // Conservative text-width estimate (SVG text does not wrap, so layouts are sized from this).
  const tw = (s, size) => String(s).length * size * 0.6;

  function wrap(text, maxW, size) {
    const lines = [];
    let cur = '';
    text.split(' ').forEach((word) => {
      const next = cur ? cur + ' ' + word : word;
      if (!cur || tw(next, size) <= maxW) cur = next;
      else { lines.push(cur); cur = word; }
    });
    if (cur) lines.push(cur);
    return lines;
  }

  function txt(x, y, size, cls, s, anchor) {
    return `<text x="${r1(x)}" y="${r1(y)}" font-size="${size}" class="${cls}"${anchor ? ` text-anchor="${anchor}"` : ''}>${esc(s)}</text>`;
  }

  // Heading + body lines, vertically centred inside a box.
  function textBlock(cx, top, h, head, body, hs, bs, tone) {
    const hl = hs * 1.25;
    const bl = bs * 1.4;
    const gap = body.length ? bs * 0.4 : 0;
    const total = head.length * hl + gap + body.length * bl;
    let y = top + (h - total) / 2;
    let out = '';
    head.forEach((line) => { out += txt(cx, y + hl / 2 + hs * 0.35, hs, `t-head ${tone}`, line, 'middle'); y += hl; });
    y += gap;
    body.forEach((line) => { out += txt(cx, y + bl / 2 + bs * 0.35, bs, `t-body ${tone}`, line, 'middle'); y += bl; });
    return out;
  }

  function badge(x, y, size) {
    const label = 'Illustrative example';
    const w = tw(label, size) + 28;
    const h = Math.round(size * 1.9);
    return `<g class="badge"><rect class="badge-box" x="${x}" y="${y}" width="${r1(w)}" height="${h}" rx="${h / 2}"/>` +
      txt(x + w / 2, y + h / 2 + size * 0.35, size, 't-strong ink', label, 'middle') + '</g>';
  }

  function nodeSVG(o) {
    const fill = { input: '#D6ECFF', tool: '#FFFFFF', model: '#0B1020', text: '#FFE4D1' }[o.kind];
    const stroke = '#0B1020';
    const tone = o.kind === 'model' ? 'on-dark' : 'on-light';
    const p = o.pill;
    let out = `<g class="node node--${o.kind}" data-node="${o.id}">`;
    out += `<rect class="halo" x="${o.x - 6}" y="${o.y - 6}" width="${o.w + 12}" height="${o.h + 12}" rx="19"/>`;
    out += `<rect class="box" x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" rx="14" fill="${fill}" stroke="${stroke}"/>`;
    Object.keys(o.variants).forEach((name) => {
      out += `<g class="var${name === 'default' ? ' is-on' : ''}" data-var="${name}">` +
        textBlock(o.x + o.w / 2, o.y, o.h, o.head, o.variants[name], o.hs, o.bs, tone) + '</g>';
    });
    out += `<g class="now"><rect class="now-pill" x="${r1(p.x)}" y="${r1(p.y)}" width="${p.w}" height="${p.h}" rx="${p.h / 2}"/>` +
      txt(p.x + p.w / 2, p.y + p.h / 2 + p.size * 0.35, p.size, 't-head now-text', 'NOW', 'middle') + '</g>';
    return out + '</g>';
  }

  // Arrowheads are drawn as paths (no <marker>/url() references, which keeps
  // the SVG robust inside Shadow DOM in every browser).
  function arrowSVG(id, d, tip, dir, extra) {
    const s = 14;
    const w = 8;
    const bx = tip[0] - dir[0] * s;
    const by = tip[1] - dir[1] * s;
    const px = -dir[1];
    const py = dir[0];
    const head = `M${r1(tip[0])} ${r1(tip[1])}L${r1(bx + px * w)} ${r1(by + py * w)}L${r1(bx - px * w)} ${r1(by - py * w)}Z`;
    return `<g class="arrow" data-arrow="${id}"><path class="a-halo" d="${d}"/><path class="a-line" d="${d}"/>` +
      `<path class="a-flow" d="${d}"/><path class="a-head" d="${head}"/>${extra || ''}</g>`;
  }

  function straightArrow(id, x1, y1, x2, y2, extra) {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const dx = (x2 - x1) / len;
    const dy = (y2 - y1) / len;
    const d = `M${r1(x1)} ${r1(y1)}L${r1(x2 - dx * 12)} ${r1(y2 - dy * 12)}`;
    return arrowSVG(id, d, [x2, y2], [dx, dy], extra);
  }

  function chipRows(items, maxW, size, padX, gap, minW) {
    const rows = [[]];
    let x = 0;
    items.forEach((it) => {
      const w = Math.max(minW, Math.max(tw(it.t, size), it.id ? tw(it.id, size) : 0) + padX * 2);
      if (x > 0 && x + w > maxW) { rows.push([]); x = 0; }
      rows[rows.length - 1].push(Object.assign({}, it, { w, dx: x }));
      x += w + gap;
    });
    return rows;
  }

  function chipsSVG(rows, kind, x0, y0, h, rowGap, size, withId) {
    let out = '';
    let i = 0;
    rows.forEach((row, r) => {
      row.forEach((c) => {
        const x = x0 + c.dx;
        const y = y0 + r * (h + rowGap);
        const cx = x + c.w / 2;
        const tokY = withId ? y + size * 1.35 : y + h / 2 + size * 0.35;
        out += `<g class="chip${c.stop ? ' chip--stop' : ''}" data-chip="${kind}" data-i="${i}">` +
          `<rect class="c-box" x="${r1(x)}" y="${r1(y)}" width="${r1(c.w)}" height="${h}" rx="8"/>` +
          txt(cx, tokY, size, 't-strong c-tok', c.t, 'middle') +
          (withId ? txt(cx, y + size * 2.6, size, 't-body c-id', c.id, 'middle') : '') + '</g>';
        i += 1;
      });
    });
    return { svg: out, bottom: y0 + rows.length * h + (rows.length - 1) * rowGap };
  }

  function guessesSVG(x, y, w, size) {
    const lh = Math.round(size * 1.9);
    const labelW = Math.max(...GUESSES.map((g) => tw(g[0], size))) + 12;
    const pctW = tw('62% (picked)', size) + 10;
    const barMax = w - labelW - pctW;
    let out = txt(x, y + size, size, 't-strong ink', 'Top guesses for the next token', 'start');
    GUESSES.forEach((g, i) => {
      const ry = y + size * 1.6 + i * lh;
      const mid = ry + lh / 2;
      const bw = Math.max(4, (barMax * g[1]) / 100);
      out += txt(x, mid + size * 0.35, size, g[2] ? 't-strong ink' : 't-body ink', g[0], 'start');
      out += `<rect class="${g[2] ? 'bar-pick' : 'bar-idle'}" x="${r1(x + labelW)}" y="${r1(mid - size * 0.45)}" width="${r1(bw)}" height="${r1(size * 0.9)}" rx="${r1(size * 0.2)}"/>`;
      out += txt(x + labelW + bw + 8, mid + size * 0.35, size, g[2] ? 't-strong ink' : 't-body ink', g[2] ? `${g[1]}% (picked)` : `${g[1]}%`, 'start');
    });
    return { svg: `<g data-role="guesses">${out}</g>`, h: size * 1.6 + GUESSES.length * lh };
  }

  function svgRoot(kind, W, H, body) {
    const title = 'Diagram, illustrative example: User Prompt, then Tokenizer, then LLM Model, then a token-by-token generation loop, then Final Output.';
    return `<svg class="diagram diagram--${kind}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${r1(H)}" role="img" ` +
      `aria-labelledby="agx-svg-title-${kind}" aria-describedby="agx-caption" data-phase="prompt">` +
      `<title id="agx-svg-title-${kind}">${esc(title)}</title>${body}</svg>`;
  }

  /* ------------------------------------------------------------------ */
  /* Wide layout: horizontal flow (container >= 860px)                   */
  /* ------------------------------------------------------------------ */

  function buildWide() {
    const W = 1048;
    const HS = 18; // headings
    const BS = 16; // body / chips. 16 user units render >= 12px at the 860px breakpoint
    const y0 = 104;
    const bh = 170;
    const cy = y0 + bh / 2;
    const gap = 44;
    const widths = { prompt: 166, tokenizer: 146, model: 156, loop: 192, output: 186 };
    const X = {};
    let x = 12;
    ['prompt', 'tokenizer', 'model', 'loop', 'output'].forEach((k) => { X[k] = x; x += widths[k] + gap; });
    const right = (k) => X[k] + widths[k];
    const pill = (k) => ({ x: X[k] + widths[k] / 2 - 36, y: y0 - 38, w: 72, h: 28, size: 16 });

    let s = badge(12, 12, 16);

    // Arrows are drawn after the nodes so an active node's glow never covers them.
    let arrows = straightArrow('a1', right('prompt') + 5, cy, X.tokenizer - 5, cy);
    arrows += straightArrow('a2', right('tokenizer') + 5, cy, X.model - 5, cy);
    arrows += straightArrow('a3', right('model') + 5, cy, X.loop - 5, cy);
    arrows += straightArrow('a4', right('loop') + 5, cy, X.output - 5, cy);

    // Feedback arc: loop -> model ("new token fed back in")
    const sx = X.loop + 30;
    const ex = right('model') - 30;
    const top = y0 - 4;
    arrows += arrowSVG('back', `M${sx} ${top}C${sx} ${y0 - 58} ${ex} ${y0 - 58} ${ex} ${top - 12}`, [ex, top], [0, 1],
      txt((sx + ex) / 2, y0 - 64, BS, 't-strong ink a-label', 'new token fed back in', 'middle'));

    s += nodeSVG({ id: 'prompt', kind: 'input', x: X.prompt, y: y0, w: widths.prompt, h: bh, hs: HS, bs: BS,
      head: ['User Prompt'], variants: { default: ['\u201CWrite a', 'birthday wish', 'for my friend\u201D'] }, pill: pill('prompt') });
    s += nodeSVG({ id: 'tokenizer', kind: 'tool', x: X.tokenizer, y: y0, w: widths.tokenizer, h: bh, hs: HS, bs: BS,
      head: ['Tokenizer'], variants: { default: ['Splits text', 'into tokens'] }, pill: pill('tokenizer') });
    s += nodeSVG({ id: 'model', kind: 'model', x: X.model, y: y0, w: widths.model, h: bh, hs: HS, bs: BS,
      head: ['LLM Model'],
      variants: { default: ['Predicts the', 'next token'], reading: ['Reading all', '7 tokens'], predicting: ['Picking the', 'next token'] },
      pill: pill('model') });
    s += nodeSVG({ id: 'loop', kind: 'tool', x: X.loop, y: y0, w: widths.loop, h: bh, hs: HS, bs: BS,
      head: ['Token-by-Token', 'Generation Loop'], variants: { default: ['Adds one token', 'at a time'] }, pill: pill('loop') });
    s += nodeSVG({ id: 'output', kind: 'text', x: X.output, y: y0, w: widths.output, h: bh, hs: HS, bs: BS,
      head: ['Final Output'],
      variants: { default: ['Turns tokens', 'back into words'], done: wrap(FINAL_TEXT, widths.output - 24, BS) },
      pill: pill('output') });
    s += arrows;

    // Token panel: prompt tokens (left) | generated tokens (right)
    const py = y0 + bh + 28;
    const px = 12;
    const pw = right('output') - px;
    const inL = px + 18;
    const wL = 520;
    const divX = inL + wL + 16;
    const inR = divX + 18;
    const wR = px + pw - 18 - inR;
    const chipY = py + 50;

    let left = txt(inL, py + 34, BS, 't-head ink', 'Your prompt as tokens (with ID numbers)', 'start');
    const pH = Math.round(BS * 3.2);
    const pc = chipsSVG(chipRows(PROMPT_TOKENS, wL, BS, 10, 8, 36), 'p', inL, chipY, pH, 8, BS, true);
    left += pc.svg;
    left += `<g data-role="ph-prompt">${txt(inL, chipY + pH / 2 + BS * 0.35, BS, 't-body muted', 'Not split into tokens yet', 'start')}</g>`;
    left += `<g data-role="note-read">${txt(inL, pc.bottom + 30, BS, 't-strong ink', 'All 7 tokens are read together, in one pass', 'start')}</g>`;
    const leftBottom = pc.bottom + 40;

    let rightS = txt(inR, py + 34, BS, 't-head ink', 'New tokens, one at a time', 'start');
    const gH = Math.round(BS * 2.2);
    const gc = chipsSVG(chipRows(GEN_ITEMS, wR, BS, 10, 8, 36), 'g', inR, chipY, gH, 8, BS, false);
    rightS += gc.svg;
    rightS += `<g data-role="ph-gen">${txt(inR, chipY + gH / 2 + BS * 0.35, BS, 't-body muted', 'Nothing generated yet', 'start')}</g>`;
    const gsY = chipY + gH + 18;
    const gs = guessesSVG(inR, gsY, wR, BS);
    rightS += gs.svg;
    const rightBottom = Math.max(gc.bottom, gsY + gs.h);

    const ph = Math.max(leftBottom, rightBottom) + 18 - py;
    s += `<g class="panel"><rect class="panel-box" x="${px}" y="${py}" width="${pw}" height="${r1(ph)}" rx="14"/>` +
      `<line class="divider" x1="${divX}" y1="${py + 18}" x2="${divX}" y2="${r1(py + ph - 18)}"/>` +
      `<g class="sec-prompt">${left}</g><g class="sec-gen">${rightS}</g></g>`;

    return svgRoot('wide', W, py + ph + 12, s);
  }

  /* ------------------------------------------------------------------ */
  /* Tall layout: vertical flow (container < 860px, down to 320px)       */
  /* ------------------------------------------------------------------ */

  function buildTall() {
    const W = 360;
    const HS = 18;
    const BS = 15; // 15 user units render >= 12px at a 320px-wide container
    const bx = 16;
    const bw = 328;
    const cx = bx + bw / 2;
    const pill = (y) => ({ x: bx + bw - 10 - 58, y: y + 8, w: 58, h: 26, size: 15 });

    const Y = {};
    const H = { prompt: 96, tokenizer: 72, model: 72, loop: 96, output: 100 };
    let y = 54;
    Y.prompt = y; y += H.prompt + 40;
    Y.tokenizer = y; y += H.tokenizer + 40;
    Y.model = y; y += H.model + 64;
    Y.loop = y; y += H.loop + 40;
    Y.output = y; y += H.output;
    const bottom = (k) => Y[k] + H[k];

    let s = badge(12, 10, 15);

    let arrows = straightArrow('a1', cx, bottom('prompt') + 5, cx, Y.tokenizer - 5);
    arrows += straightArrow('a2', cx, bottom('tokenizer') + 5, cx, Y.model - 5);
    const midY = (bottom('model') + Y.loop) / 2 + BS * 0.35;
    arrows += straightArrow('a3', 128, bottom('model') + 5, 128, Y.loop - 5,
      txt(116, midY, BS, 't-strong ink a-label', 'next token', 'end'));
    arrows += straightArrow('back', 232, Y.loop - 5, 232, bottom('model') + 5,
      txt(244, midY, BS, 't-strong ink a-label', 'fed back in', 'start'));
    arrows += straightArrow('a4', cx, bottom('loop') + 5, cx, Y.output - 5);

    s += nodeSVG({ id: 'prompt', kind: 'input', x: bx, y: Y.prompt, w: bw, h: H.prompt, hs: HS, bs: BS,
      head: ['User Prompt'], variants: { default: ['\u201CWrite a birthday wish', 'for my friend\u201D'] }, pill: pill(Y.prompt) });
    s += nodeSVG({ id: 'tokenizer', kind: 'tool', x: bx, y: Y.tokenizer, w: bw, h: H.tokenizer, hs: HS, bs: BS,
      head: ['Tokenizer'], variants: { default: ['Splits text into tokens'] }, pill: pill(Y.tokenizer) });
    s += nodeSVG({ id: 'model', kind: 'model', x: bx, y: Y.model, w: bw, h: H.model, hs: HS, bs: BS,
      head: ['LLM Model'],
      variants: { default: ['Predicts the next token'], reading: ['Reading all 7 tokens at once'], predicting: ['Picking the next token'] },
      pill: pill(Y.model) });
    s += nodeSVG({ id: 'loop', kind: 'tool', x: bx, y: Y.loop, w: bw, h: H.loop, hs: HS, bs: BS,
      head: ['Token-by-Token', 'Generation Loop'], variants: { default: ['Adds one token at a time'] }, pill: pill(Y.loop) });
    s += nodeSVG({ id: 'output', kind: 'text', x: bx, y: Y.output, w: bw, h: H.output, hs: HS, bs: BS,
      head: ['Final Output'],
      variants: { default: ['Turns tokens back into words'], done: wrap(FINAL_TEXT, bw - 24, BS) },
      pill: pill(Y.output) });
    s += arrows;

    // Token panel: shows prompt tokens (steps 1-3) or generated tokens (steps 4-6)
    const py = bottom('output') + 20;
    const px = 12;
    const pw = W - 24;
    const inX = px + 16;
    const inW = pw - 32;
    const chipY = py + 44;

    let secP = txt(inX, py + 30, BS, 't-head ink', 'Your prompt as tokens + IDs', 'start');
    const pH = Math.round(BS * 3.2);
    const pc = chipsSVG(chipRows(PROMPT_TOKENS, inW, BS, 9, 7, 34), 'p', inX, chipY, pH, 8, BS, true);
    secP += pc.svg;
    secP += `<g data-role="ph-prompt">${txt(inX, chipY + pH / 2 + BS * 0.35, BS, 't-body muted', 'Not split into tokens yet', 'start')}</g>`;
    secP += `<g data-role="note-read">${txt(inX, pc.bottom + 28, BS, 't-strong ink', 'All 7 tokens are read together', 'start')}</g>`;
    const pBottom = pc.bottom + 38;

    let secG = txt(inX, py + 30, BS, 't-head ink', 'New tokens, one at a time', 'start');
    const gH = Math.round(BS * 2.2);
    const gc = chipsSVG(chipRows(GEN_ITEMS, inW, BS, 9, 7, 34), 'g', inX, chipY, gH, 8, BS, false);
    secG += gc.svg;
    secG += `<g data-role="ph-gen">${txt(inX, chipY + gH / 2 + BS * 0.35, BS, 't-body muted', 'Nothing generated yet', 'start')}</g>`;
    const gsY = chipY + gH + 16;
    const gs = guessesSVG(inX, gsY, inW, BS);
    secG += gs.svg;
    const gBottom = Math.max(gc.bottom, gsY + gs.h);

    const ph = Math.max(pBottom, gBottom) + 14 - py;
    s += `<g class="panel"><rect class="panel-box" x="${px}" y="${py}" width="${pw}" height="${r1(ph)}" rx="14"/>` +
      `<g class="sec-prompt">${secP}</g><g class="sec-gen">${secG}</g></g>`;

    return svgRoot('tall', W, py + ph + 12, s);
  }

  /* ------------------------------------------------------------------ */
  /* Styles                                                              */
  /* ------------------------------------------------------------------ */

  const CSS = `
:host{display:block;max-width:100%;color:#0B1020;
  --agx-font-heading:'Outfit',ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;
  --agx-font-body:'Inter',ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif}
:host([hidden]){display:none}
*,*::before,*::after{box-sizing:border-box}
[hidden]{display:none!important}

/* Shadow DOM wrapper: the container-query container */
.wrap{container-type:inline-size;container-name:agx-ipp;width:100%}

.player{position:relative;background:#FFFFFF;border:1px solid #DCE0EA;border-radius:16px;padding:14px 12px 12px;
  font-family:var(--agx-font-body);font-size:15px;line-height:1.5;color:#0B1020;text-align:left}
.player:focus{outline:none}
.player:focus-visible{outline:3px solid #8B5CF6;outline-offset:3px}

.head{margin:0 0 10px}
.title{margin:0;font-family:var(--agx-font-heading);font-weight:600;font-size:18px;line-height:1.3;color:#0B1020}
.sub{margin:2px 0 0;font-size:14px;line-height:1.45;color:#3D4459}

.diagram{display:block;width:100%;height:auto;margin:0 auto}
.diagram--wide{display:none;max-width:1048px}
.diagram--tall{max-width:400px}

/* Caption + controls. Sticky on narrow layouts so they stay in view next to the tall diagram. */
.bar{position:var(--agx-controls-position,sticky);bottom:0;z-index:2;background:#FFFFFF;
  margin:12px -12px 0;padding:10px 12px 12px;border-top:1px solid #E6E9F0}
.progress{display:flex;gap:6px;margin:0 0 10px;padding:0;list-style:none}
.progress li{flex:1;height:6px;border-radius:3px;background:#E3E6EE;transition:background-color .3s ease}
.progress li.done{background:#C4B5FD}
.progress li.current{background:#8B5CF6}
.caption-box{min-height:7.6em}
.step-label{margin:0;font-family:var(--agx-font-heading);font-weight:600;font-size:14px;line-height:1.4;color:#0B1020}
.caption{margin:4px 0 0;font-size:15px;line-height:1.5;color:#0B1020}

.controls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:44px;margin:0;padding:8px 10px;
  border:1.5px solid #0B1020;border-radius:10px;background:#FFFFFF;color:#0B1020;
  font-family:var(--agx-font-heading);font-weight:600;font-size:15px;line-height:1;cursor:pointer;white-space:nowrap;
  transition:background-color .2s ease;-webkit-tap-highlight-color:transparent}
.btn svg{width:16px;height:16px;flex:none}
.btn .ico{display:inline-flex}
.btn:hover{background:#F1ECFE}
.btn--primary{background:#0B1020;color:#FFFFFF}
.btn--primary:hover{background:#262D47}
.btn:focus{outline:none}
.btn:focus-visible{outline:3px solid #8B5CF6;outline-offset:2px}
.btn[aria-disabled="true"]{opacity:.4;cursor:not-allowed}
.btn[aria-disabled="true"]:hover{background:#FFFFFF}
.btn--primary[aria-disabled="true"]:hover{background:#0B1020}
.btn--restart{grid-column:1/-1}
.hint{margin:10px 0 0;font-size:13px;line-height:1.45;color:#3D4459}

/* ---- SVG ---- */
.t-head{font-family:var(--agx-font-heading);font-weight:600}
.t-body{font-family:var(--agx-font-body);font-weight:400}
.t-strong{font-family:var(--agx-font-body);font-weight:600}
.ink,.on-light,.c-tok,.now-text{fill:#0B1020}
.on-dark{fill:#FFFFFF}
.muted,.c-id{fill:#3D4459}
.badge-box{fill:#FFFFFF;stroke:#0B1020;stroke-width:1.25;stroke-dasharray:5 4}
.panel-box{fill:#F6F7FB;stroke:#D9DDE8;stroke-width:1.25}
.divider{stroke:#D9DDE8;stroke-width:1.25}

.node .box{stroke-width:1.5;transition:stroke .3s ease,stroke-width .3s ease}
.node .halo{fill:none;stroke:#8B5CF6;stroke-width:8;opacity:0;transition:opacity .3s ease}
.node.is-active .box{stroke:#8B5CF6;stroke-width:4}
.node.is-active .halo{opacity:.3}
.now{opacity:0;transition:opacity .3s ease}
.node.is-focus .now{opacity:1}
.now-pill{fill:#EDE7FE;stroke:#8B5CF6;stroke-width:2}
.now-text{letter-spacing:.06em}
.var{opacity:0;transition:opacity .3s ease}
.var.is-on{opacity:1}

.arrow .a-line{fill:none;stroke:#8B5CF6;stroke-width:2.5;stroke-linecap:round;transition:stroke-width .3s ease}
.arrow .a-head{fill:#8B5CF6}
.arrow .a-halo{fill:none;stroke:#8B5CF6;stroke-width:14;stroke-linecap:round;opacity:0;transition:opacity .3s ease}
.arrow .a-flow{fill:none;stroke:#FFFFFF;stroke-width:2.2;stroke-linecap:round;stroke-dasharray:4 8;opacity:0}
.arrow.is-active .a-line{stroke-width:5}
.arrow.is-active .a-halo{opacity:.22}
.arrow.is-active .a-flow{opacity:1;animation:agx-flow .9s linear infinite}
@keyframes agx-flow{to{stroke-dashoffset:-12}}

.chip{opacity:0;transform:translateY(6px);
  transition:opacity .35s ease var(--agx-delay,0ms),transform .35s ease var(--agx-delay,0ms)}
.chip.is-on{opacity:1;transform:none}
.c-box{fill:#FFE4D1;stroke:#0B1020;stroke-width:1.25;
  transition:stroke .3s ease var(--agx-delay,0ms),stroke-width .3s ease var(--agx-delay,0ms)}
.chip.is-hl .c-box{stroke:#8B5CF6;stroke-width:3.5}
.chip--stop .c-box{stroke-dasharray:5 4}
.bar-pick{fill:#8B5CF6}
.bar-idle{fill:#9AA3B8}
[data-role]{opacity:0;transition:opacity .3s ease}
[data-role].is-on{opacity:1}
.diagram--tall[data-phase="prompt"] .sec-gen,
.diagram--tall[data-phase="gen"] .sec-prompt{display:none}

/* ---- Responsive (container queries) ---- */
@container agx-ipp (min-width:480px){
  .player{padding:18px 18px 14px}
  .bar{margin:14px -18px 0;padding:12px 18px 14px}
  .caption-box{min-height:6.1em}
  .controls{grid-template-columns:repeat(4,auto);justify-content:center}
  .btn{min-width:112px;padding:8px 16px}
  .btn--restart{grid-column:auto}
}
@container agx-ipp (min-width:860px){
  .player{padding:22px 20px 18px}
  .title{font-size:20px}
  .sub{font-size:15px}
  .diagram--wide{display:block}
  .diagram--tall{display:none}
  .bar{position:static;margin:16px 0 0;padding:14px 0 0;display:grid;grid-template-columns:minmax(0,1fr) auto;
    column-gap:24px;align-items:center}
  .progress{grid-column:1/-1}
  .caption-box{min-height:4.9em}
  .caption{font-size:16px}
  .controls{margin-top:0}
}

/* ---- Reduced motion ---- */
@media (prefers-reduced-motion:reduce){
  .player *,.player *::before,.player *::after{transition:none!important;animation:none!important}
  .arrow .a-flow{display:none}
  .chip{transform:none}
}
`;

  /* ------------------------------------------------------------------ */
  /* Markup                                                              */
  /* ------------------------------------------------------------------ */

  const svgIcon = (inner) => `<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">${inner}</svg>`;
  const ICON = {
    back: svgIcon('<path d="M12.5 4.5 7 10l5.5 5.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'),
    next: svgIcon('<path d="M7.5 4.5 13 10l-5.5 5.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'),
    play: svgIcon('<path d="M6.5 4.3v11.4c0 .7.8 1.1 1.3.7l8.3-5.7c.5-.3.5-1 0-1.4L7.8 3.6c-.5-.4-1.3 0-1.3.7z" fill="currentColor"/>'),
    pause: svgIcon('<rect x="5" y="4" width="3.6" height="12" rx="1" fill="currentColor"/><rect x="11.4" y="4" width="3.6" height="12" rx="1" fill="currentColor"/>'),
    restart: svgIcon('<path d="M4.6 10.5a5.5 5.5 0 1 0 1.6-4.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5.6 2.8v3.6h3.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
  };

  const TEMPLATE = `
<div class="wrap">
  <section class="player" tabindex="0" aria-labelledby="agx-title" aria-describedby="agx-hint"
    aria-roledescription="step-through animation" aria-keyshortcuts="ArrowLeft ArrowRight Home End">
    <div class="head">
      <p class="title" id="agx-title">How your prompt becomes an answer</p>
      <p class="sub">Step through what happens inside an AI model after you press send.</p>
    </div>
    <div class="stage">${buildWide()}${buildTall()}</div>
    <div class="bar">
      <ol class="progress" aria-hidden="true">${STEPS.map(() => '<li></li>').join('')}</ol>
      <div class="caption-box" id="agx-caption" aria-live="polite" aria-atomic="true">
        <p class="step-label"></p>
        <p class="caption"></p>
      </div>
      <div class="controls" role="group" aria-label="Animation controls">
        <button type="button" class="btn" data-action="back"><span class="ico">${ICON.back}</span><span>Back</span></button>
        <button type="button" class="btn" data-action="play" aria-label="Play animation"><span class="ico i-play">${ICON.play}</span><span class="ico i-pause" hidden>${ICON.pause}</span><span class="lbl">Play</span></button>
        <button type="button" class="btn btn--primary" data-action="next"><span>Next</span><span class="ico">${ICON.next}</span></button>
        <button type="button" class="btn btn--restart" data-action="restart"><span class="ico">${ICON.restart}</span><span>Restart</span></button>
      </div>
    </div>
    <p class="hint" id="agx-hint">Tip: click or tab into the player, then use the \u2190 and \u2192 arrow keys to move between steps.</p>
  </section>
</div>`;

  /* ------------------------------------------------------------------ */
  /* Custom element                                                      */
  /* ------------------------------------------------------------------ */

  class AgenticEdInfPromptProcessing extends HTMLElement {
    constructor() {
      super();
      this._step = 0;
      this._playing = false;
      this._timer = 0;
      this._prevGen = 0;
      this._prevPrompt = 'hidden';
      this._io = null;
      this._mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `<style>${CSS}</style>${TEMPLATE}`;
      const q = (sel) => root.querySelector(sel);
      const qa = (sel) => Array.prototype.slice.call(root.querySelectorAll(sel));
      this._el = {
        player: q('.player'),
        bar: q('.bar'),
        stepLabel: q('.step-label'),
        caption: q('.caption'),
        progress: qa('.progress li'),
        back: q('[data-action="back"]'),
        next: q('[data-action="next"]'),
        play: q('[data-action="play"]'),
        playLbl: q('[data-action="play"] .lbl'),
        iPlay: q('.i-play'),
        iPause: q('.i-pause'),
        nodes: qa('[data-node]'),
        arrows: qa('[data-arrow]'),
        pchips: qa('[data-chip="p"]'),
        gchips: qa('[data-chip="g"]'),
        roles: qa('[data-role]'),
        diagrams: qa('.diagram'),
      };

      this._onKey = this._onKey.bind(this);
      this._onClick = this._onClick.bind(this);
      this._onVisibility = this._onVisibility.bind(this);
      this._onMotionChange = this._onMotionChange.bind(this);
      // Keyboard + click handling is scoped to this player (never window-level).
      this._el.player.addEventListener('keydown', this._onKey);
      this._el.player.addEventListener('click', this._onClick);
    }

    connectedCallback() {
      const start = parseInt(this.getAttribute('start-step') || '1', 10);
      this._step = Number.isFinite(start) ? Math.min(Math.max(start, 1), STEPS.length) - 1 : 0;
      this._prevGen = 0;
      this._prevPrompt = 'hidden';
      this._render(false);
      this._syncPlayUI();

      document.addEventListener('visibilitychange', this._onVisibility);
      if (this._mq) {
        if (this._mq.addEventListener) this._mq.addEventListener('change', this._onMotionChange);
        else if (this._mq.addListener) this._mq.addListener(this._onMotionChange);
      }
      if (this.hasAttribute('autoplay') && !this._reducedMotion()) this._armAutoplay();
    }

    disconnectedCallback() {
      this.pause();
      document.removeEventListener('visibilitychange', this._onVisibility);
      if (this._mq) {
        if (this._mq.removeEventListener) this._mq.removeEventListener('change', this._onMotionChange);
        else if (this._mq.removeListener) this._mq.removeListener(this._onMotionChange);
      }
      if (this._io) { this._io.disconnect(); this._io = null; }
    }

    /* ---- Public API ---- */
    get step() { return this._step + 1; }
    get totalSteps() { return STEPS.length; }
    get playing() { return this._playing; }

    goTo(stepNumber) { this._go(Number(stepNumber) - 1, true); }
    next() { this._go(this._step + 1, true); }
    prev() { this._go(this._step - 1, true); }

    play() {
      if (this._playing) return;
      if (this._step === STEPS.length - 1) {
        this._go(0, true);
        this._revealActive({ onlyIfWatching: true });
      }
      this._playing = true;
      this._syncPlayUI();
      this._schedule();
    }

    pause() {
      clearTimeout(this._timer);
      this._timer = 0;
      if (!this._playing) return;
      this._playing = false;
      this._syncPlayUI();
    }

    toggle() { if (this._playing) this.pause(); else this.play(); }

    restart() {
      const wasPlaying = this._playing;
      this.pause();
      this._go(0, true);
      this._revealActive({ onlyIfWatching: true });
      if (wasPlaying) this.play();
    }

    /* ---- Internals ---- */
    _reducedMotion() { return !!(this._mq && this._mq.matches); }

    _armAutoplay() {
      if (!('IntersectionObserver' in window)) { this.play(); return; }
      this._io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          this._io.disconnect();
          this._io = null;
          if (!this._reducedMotion()) this.play();
        }
      }, { threshold: 0.4 });
      this._io.observe(this);
    }

    _schedule() {
      clearTimeout(this._timer);
      if (!this._playing) return;
      this._timer = setTimeout(() => {
        if (!this._playing) return;
        if (this._step < STEPS.length - 1) {
          this._go(this._step + 1, true);
          this._revealActive({ onlyIfWatching: true });
          if (this._step === STEPS.length - 1) this.pause();
          else this._schedule();
        } else {
          this.pause();
        }
      }, STEPS[this._step].dur || 4500);
    }

    // User navigation (buttons / arrow keys): pause, move, and bring the active box into view.
    _userGo(i) {
      this.pause();
      const before = this._step;
      this._go(i, true);
      if (this._step !== before) this._revealActive();
    }

    // Narrow (tall) layout only. With onlyIfWatching (playback, Restart), it scrolls
    // only while a good part of the player is on screen, so playback never pulls
    // the page back after the visitor has scrolled away to read something else.
    _revealActive(opts) {
      const tall = this._el.diagrams.find((d) => d.classList.contains('diagram--tall'));
      if (!tall || getComputedStyle(tall).display === 'none') return;
      if (opts && opts.onlyIfWatching && !this._isWatched()) return;
      const node = tall.querySelector(`[data-node="${STEPS[this._step].focus}"]`);
      if (!node || !node.scrollIntoView) return;
      const sticky = getComputedStyle(this._el.bar).position === 'sticky';
      node.style.scrollMarginTop = '16px';
      node.style.scrollMarginBottom = `${(sticky ? this._el.bar.offsetHeight : 0) + 16}px`;
      node.scrollIntoView({ block: 'nearest', behavior: this._reducedMotion() ? 'auto' : 'smooth' });
    }

    _go(i, animate) {
      const next = Math.min(Math.max(i, 0), STEPS.length - 1);
      if (!Number.isFinite(next) || next === this._step) return;
      this._step = next;
      this._render(animate);
      this.dispatchEvent(new CustomEvent('stepchange', {
        detail: { step: this._step + 1, total: STEPS.length }, bubbles: true, composed: true,
      }));
    }

    // True when the player fills at least 40% of the viewport height (or is mostly on screen).
    _isWatched() {
      const r = this._el.player.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const seen = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      return seen > 0 && (seen >= vh * 0.4 || seen >= r.height * 0.6);
    }

    _onKey(e) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      switch (e.key) {
        case 'ArrowRight': this._userGo(this._step + 1); break;
        case 'ArrowLeft': this._userGo(this._step - 1); break;
        case 'Home': this._userGo(0); break;
        case 'End': this._userGo(STEPS.length - 1); break;
        default: return;
      }
      e.preventDefault();
    }

    _onClick(e) {
      const btn = e.target && e.target.closest ? e.target.closest('[data-action]') : null;
      if (!btn || btn.getAttribute('aria-disabled') === 'true') return;
      switch (btn.getAttribute('data-action')) {
        case 'back': this._userGo(this._step - 1); break;
        case 'next': this._userGo(this._step + 1); break;
        case 'play': this.toggle(); break;
        case 'restart': this.restart(); break;
        default: break;
      }
    }

    _onVisibility() { if (document.hidden) this.pause(); }

    _onMotionChange() { if (this._reducedMotion()) this.pause(); }

    _syncPlayUI() {
      const el = this._el;
      el.playLbl.textContent = this._playing ? 'Pause' : 'Play';
      el.play.setAttribute('aria-label', this._playing ? 'Pause animation' : 'Play animation');
      el.iPlay.hidden = this._playing;
      el.iPause.hidden = !this._playing;
    }

    _render(animate) {
      const s = STEPS[this._step];
      const el = this._el;
      const motion = animate !== false && !this._reducedMotion();

      el.nodes.forEach((n) => {
        const id = n.getAttribute('data-node');
        n.classList.toggle('is-active', s.nodes.indexOf(id) !== -1);
        n.classList.toggle('is-focus', s.focus === id);
        const want = s.vars[id] || 'default';
        n.querySelectorAll('[data-var]').forEach((v) => v.classList.toggle('is-on', v.getAttribute('data-var') === want));
      });
      el.arrows.forEach((a) => a.classList.toggle('is-active', s.arrows.indexOf(a.getAttribute('data-arrow')) !== -1));

      // Prompt tokens: appear with a short stagger the first time they show.
      const pShow = s.prompt !== 'hidden';
      const pNew = pShow && this._prevPrompt === 'hidden';
      el.pchips.forEach((c) => {
        const k = Number(c.getAttribute('data-i'));
        c.style.setProperty('--agx-delay', `${motion && pNew ? k * 90 : 0}ms`);
        c.classList.toggle('is-on', pShow);
        c.classList.toggle('is-hl', s.prompt === 'read');
      });

      // Generated tokens: new ones appear one after another; the newest is outlined.
      const prev = this._prevGen;
      const n = s.gen;
      el.gchips.forEach((c) => {
        const k = Number(c.getAttribute('data-i'));
        const delay = motion && k >= prev && k < n ? (k - prev) * 170 : 0;
        c.style.setProperty('--agx-delay', `${delay}ms`);
        c.classList.toggle('is-on', k < n);
        c.classList.toggle('is-hl', k === n - 1);
      });

      el.roles.forEach((r) => {
        const role = r.getAttribute('data-role');
        let on = false;
        if (role === 'ph-prompt') on = !pShow;
        else if (role === 'ph-gen') on = n === 0;
        else if (role === 'note-read') on = s.prompt === 'read';
        else if (role === 'guesses') on = !!s.guesses;
        r.classList.toggle('is-on', on);
      });
      el.diagrams.forEach((d) => d.setAttribute('data-phase', s.phase));

      el.stepLabel.textContent = `Step ${this._step + 1} of ${STEPS.length} \u00B7 ${s.title}`;
      el.caption.textContent = s.caption;
      el.progress.forEach((li, i) => {
        li.className = i < this._step ? 'done' : (i === this._step ? 'current' : '');
      });
      el.back.setAttribute('aria-disabled', String(this._step === 0));
      el.next.setAttribute('aria-disabled', String(this._step === STEPS.length - 1));

      this._prevGen = n;
      this._prevPrompt = s.prompt;
    }
  }

  window.customElements.define(TAG, AgenticEdInfPromptProcessing);
})();