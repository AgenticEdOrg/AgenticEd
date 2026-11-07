/* AgenticEd Learning Assistant: floating chat widget. No dependencies.
 *
 * Add to a page:
 *   <link rel="stylesheet" href="chatbot/widget/chatbot.css" />
 *   <script src="chatbot/widget/chatbot.js" defer></script>
 *
 * Where the API lives:
 *   - window.AGENTICED_CHAT_API = "https://your-api.example.com" (set before this script), or
 *   - <meta name="agenticed-chat-api" content="https://your-api.example.com">, or
 *   - on localhost / 127.0.0.1 it uses the same server (python chatbot/server.py).
 * If no API is configured, or /api/health doesn't answer, the widget stays hidden, so the
 * live static site is unchanged until a backend is deployed.
 */
(function () {
  'use strict';

  var script = document.currentScript;
  var siteRoot = new URL('../../', script ? script.src : location.href);   // .../chatbot/widget/ -> site root
  var meta = document.querySelector('meta[name="agenticed-chat-api"]');
  var isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var apiBase = window.AGENTICED_CHAT_API || (meta && meta.content) || (isLocal ? location.origin : '');
  if (!apiBase) return;
  apiBase = apiBase.replace(/\/+$/, '');

  var SUGGESTIONS = [
    'Do I need coding experience?',
    'What is RAG?',
    'How do the certifications work?',
    'What do I build in Week 5?'
  ];

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    if (text) node.textContent = text;              // textContent: never inject HTML from answers
    return node;
  }

  function fetchJSON(url, options, timeoutMs) {
    var ctrl = 'AbortController' in window ? new AbortController() : null;
    var timer = ctrl && setTimeout(function () { ctrl.abort(); }, timeoutMs);
    options = options || {};
    if (ctrl) options.signal = ctrl.signal;
    return fetch(url, options).then(function (res) {
      clearTimeout(timer);
      return res.json().catch(function () { return {}; }).then(function (body) {
        if (!res.ok) throw new Error(body.error || 'The assistant is unavailable right now.');
        return body;
      });
    }, function (err) {
      clearTimeout(timer);
      throw new Error(err.name === 'AbortError' ? 'The assistant took too long to answer. Please try again.'
                                                : 'Could not reach the assistant. Please try again later.');
    });
  }

  function safeLink(url) {
    // Only allow links to pages on this site (sources are relative paths like "week3.html#rag").
    try {
      var u = new URL(url, siteRoot);
      return u.origin === siteRoot.origin ? u.href : null;
    } catch (e) { return null; }
  }

  function build() {
    var launcher = el('button', { type: 'button', 'class': 'aec-launcher', 'aria-haspopup': 'dialog',
      'aria-expanded': 'false', 'aria-controls': 'aec-panel' }, '✦ Ask AgenticEd');

    var panel = el('section', { id: 'aec-panel', 'class': 'aec-panel', role: 'dialog',
      'aria-labelledby': 'aec-title', hidden: '' });
    var head = el('div', { 'class': 'aec-head' });
    var titles = el('div');
    titles.appendChild(el('h2', { id: 'aec-title' }, 'AgenticEd Assistant'));
    titles.appendChild(el('p', {}, 'Answers only from AgenticEd lessons, with sources'));
    var close = el('button', { type: 'button', 'class': 'aec-close', 'aria-label': 'Close assistant' }, '×');
    head.appendChild(titles);
    head.appendChild(close);

    var log = el('div', { 'class': 'aec-log', role: 'log', 'aria-live': 'polite' });
    var form = el('form', { 'class': 'aec-form' });
    var input = el('textarea', { rows: '1', maxlength: '500', placeholder: 'Ask a question about AgenticEd…',
      'aria-label': 'Your question' });
    var send = el('button', { type: 'submit', 'class': 'aec-send' }, 'Ask');
    form.appendChild(input);
    form.appendChild(send);
    var note = el('p', { 'class': 'aec-note' },
      'AI can make mistakes: check the linked sources. Please don’t share personal information.');

    panel.appendChild(head);
    panel.appendChild(log);
    panel.appendChild(form);
    panel.appendChild(note);
    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    // Welcome message + suggested questions
    addBot({ answer: 'Hi! Ask me anything about AgenticEd: the six-week course, lessons, tools, or certifications. ' +
      'If the answer isn’t in AgenticEd’s materials, I’ll tell you instead of guessing.', sources: [], found: true });
    var suggest = el('div', { 'class': 'aec-suggest' });
    SUGGESTIONS.forEach(function (q) {
      var b = el('button', { type: 'button' }, q);
      b.addEventListener('click', function () { ask(q); });
      suggest.appendChild(b);
    });
    log.appendChild(suggest);

    function open() {
      panel.hidden = false;
      launcher.hidden = true;
      launcher.setAttribute('aria-expanded', 'true');
      input.focus();
    }
    function shut() {
      panel.hidden = true;
      launcher.hidden = false;
      launcher.setAttribute('aria-expanded', 'false');
      launcher.focus();
    }
    launcher.addEventListener('click', open);
    close.addEventListener('click', shut);
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') shut(); });

    function scroll() { log.scrollTop = log.scrollHeight; }

    function addUser(text) {
      log.appendChild(el('div', { 'class': 'aec-msg aec-msg--user' }, text));
      scroll();
    }

    function addBot(r, isError) {
      var cls = 'aec-msg aec-msg--bot' + (isError ? ' aec-msg--error' : r.found === false ? ' aec-msg--notfound' : '');
      var msg = el('div', { 'class': cls }, r.answer);
      if (r.sources && r.sources.length) {
        var box = el('div', { 'class': 'aec-sources' });
        box.appendChild(el('strong', {}, 'Sources'));
        r.sources.forEach(function (s) {
          var href = safeLink(s.url);
          var label = '[' + s.n + '] ' + s.title + ' › ' + s.section;
          box.appendChild(href ? el('a', { href: href }, label) : el('span', {}, label));
        });
        msg.appendChild(box);
      }
      log.appendChild(msg);
      scroll();
    }

    var busy = false;
    function ask(question) {
      question = (question || '').trim();
      if (!question || busy) return;
      busy = true;
      send.disabled = true;
      if (suggest.parentNode) suggest.parentNode.removeChild(suggest);
      addUser(question);
      input.value = '';
      var typing = el('div', { 'class': 'aec-typing' }, 'Searching AgenticEd materials…');
      log.appendChild(typing);
      scroll();
      fetchJSON(apiBase + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question })
      }, 120000).then(function (r) {
        addBot(r);
      }, function (err) {
        addBot({ answer: err.message, sources: [] }, true);
      }).then(function () {
        if (typing.parentNode) typing.parentNode.removeChild(typing);
        busy = false;
        send.disabled = false;
        input.focus();
      });
    }

    form.addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input.value); }
    });
  }

  // Show the widget only if the API is up, so a missing backend never shows a broken button.
  fetchJSON(apiBase + '/api/health', {}, 4000).then(function (h) {
    if (h && h.ok) {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
      else build();
    }
  }, function () { /* backend not running: stay hidden */ });
})();
