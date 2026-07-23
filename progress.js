(function () {
  "use strict";

  var PREFIX = "agenticed:";
  var LEVEL_KEY = PREFIX + "current-level";
  var WEEK_KEY = PREFIX + "current-week";

  function readJSON(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || "null") || fallback;
    } catch (error) {
      return fallback;
    }
  }

  function weekData(week) {
    var quiz = readJSON(PREFIX + "quiz:week" + week, {});
    var portfolio = readJSON("agenticed_portfolio", {});
    var visited = localStorage.getItem(PREFIX + "visited:week" + week) === "1";
    var activity = false;

    for (var i = 0; i < localStorage.length; i += 1) {
      var key = localStorage.key(i);
      if (key && key.indexOf(PREFIX + "autosave:week" + week + ".html:") === 0) {
        activity = true;
        break;
      }
    }

    var quizPassed = Number(quiz.best || 0) >= 4;
    var artifact = Boolean(portfolio["w" + week] && portfolio["w" + week].done);
    var checks = [visited, activity, quizPassed, artifact];

    return {
      week: week,
      visited: visited,
      activity: activity,
      quiz: quizPassed,
      quizScore: Number(quiz.best || 0),
      artifact: artifact,
      percent: checks.filter(Boolean).length * 25,
      complete: checks.every(Boolean)
    };
  }

  function allWeeks() {
    var weeks = [];
    for (var i = 1; i <= 6; i += 1) weeks.push(weekData(i));
    return weeks;
  }

  function markVisited(week) {
    localStorage.setItem(PREFIX + "visited:week" + week, "1");
    localStorage.setItem(LEVEL_KEY, "beginner");
    localStorage.setItem(WEEK_KEY, String(week));
  }

  function syncLessonPage() {
    var match = location.pathname.match(/week([1-6])\.html$/i);
    if (!match) return;
    var week = Number(match[1]);
    markVisited(week);

    var dots = document.querySelectorAll(".progress-dots .dot");
    var progress = allWeeks();
    dots.forEach(function (dot, index) {
      dot.classList.remove("dot--done", "dot--active");
      if (progress[index] && progress[index].complete) dot.classList.add("dot--done");
      if (index + 1 === week) dot.classList.add("dot--active");
      if (progress[index]) dot.title = "Week " + (index + 1) + ": " + progress[index].percent + "% complete";
    });

    var label = document.querySelector(".topbar__label");
    if (label) label.textContent = "Week " + week + " progress:";

    var footer = document.createElement("aside");
    footer.className = "agenticed-progress-card";
    footer.innerHTML =
      '<div><strong>Week ' + week + ' progress</strong><span id="ae-week-percent"></span></div>' +
      '<div class="agenticed-progress-track"><span id="ae-week-fill"></span></div>' +
      '<div class="agenticed-progress-actions"><a href="dashboard.html">View dashboard</a>' +
      '<a href="quiz.html?week=' + week + '">Take the quiz</a>' +
      '<a href="portfolio.html">Add portfolio evidence</a></div>';
    document.body.appendChild(footer);

    var data = weekData(week);
    footer.querySelector("#ae-week-percent").textContent = data.percent + "%";
    footer.querySelector("#ae-week-fill").style.width = data.percent + "%";
  }

  function addStyles() {
    var style = document.createElement("style");
    style.textContent =
      ".agenticed-progress-card{position:fixed;right:18px;bottom:18px;z-index:90;width:min(360px,calc(100vw - 36px));background:#fff;border:1px solid #E4E1F0;border-radius:14px;padding:16px 18px;box-shadow:0 16px 40px rgba(18,21,38,.16);font:13px/1.5 Inter,sans-serif;color:#121526}" +
      ".agenticed-progress-card>div:first-child{display:flex;justify-content:space-between;gap:16px}.agenticed-progress-track{height:8px;background:#F3F0FA;border-radius:99px;overflow:hidden;margin:10px 0}.agenticed-progress-track span{display:block;height:100%;background:#7C3AED;border-radius:inherit;transition:width .3s}.agenticed-progress-actions{display:flex;gap:12px;flex-wrap:wrap}.agenticed-progress-actions a{color:#B84330;font-weight:700;text-decoration:none}.agenticed-progress-actions a:hover{text-decoration:underline}@media(max-width:600px){.agenticed-progress-card{position:static;width:auto;margin:18px}.agenticed-progress-actions{gap:8px 14px}}";
    document.head.appendChild(style);
  }

  window.AgenticEdProgress = {
    allWeeks: allWeeks,
    weekData: weekData,
    markVisited: markVisited
  };

  document.addEventListener("DOMContentLoaded", function () {
    addStyles();
    syncLessonPage();
  });
})();
