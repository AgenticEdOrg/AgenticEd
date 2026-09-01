// Records one anonymous visit per page load: path + timestamp only. See privacy.html.
// is_entry marks the first page hit in this browser tab session (sessionStorage —
// cleared when the tab closes, not a persistent identifier).
(function () {
  var cfg = window.AGENTICED_SUPABASE;
  if (!cfg || !cfg.url || !cfg.key) return;

  var isEntry = false;
  try {
    if (!sessionStorage.getItem("agenticed_session_started")) {
      isEntry = true;
      sessionStorage.setItem("agenticed_session_started", "1");
    }
  } catch (e) {}

  fetch(cfg.url.replace(/\/$/, "") + "/rest/v1/site_visits", {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: "Bearer " + cfg.key,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify({ path: location.pathname, is_entry: isEntry }),
    keepalive: true
  }).catch(function () {});
})();

// Adds a direct feedback entry point to every page that loads the shared site script.
// The originating path is carried to the form so feedback can be tied to the page
// the visitor was viewing, without recording it until the form is submitted.
(function () {
  if (/\/feedback\.html$/i.test(location.pathname)) return;

  function addFeedbackButton() {
    if (!document.body || document.getElementById("agenticed-feedback-button")) return;

    var style = document.createElement("style");
    style.textContent =
      ".agenticed-feedback-button{" +
      "position:fixed;right:20px;bottom:20px;z-index:9999;display:inline-flex;align-items:center;gap:8px;" +
      "padding:11px 17px;border-radius:999px;background:linear-gradient(135deg,#7C3AED,#9333EA);" +
      "color:#fff!important;text-decoration:none!important;font:700 14px Inter,Arial,sans-serif;" +
      "box-shadow:0 8px 24px rgba(18,21,38,.24);transition:transform .18s,box-shadow .18s}" +
      ".agenticed-feedback-button:hover{transform:translateY(-2px);box-shadow:0 11px 28px rgba(18,21,38,.3)}" +
      ".agenticed-feedback-button:focus-visible{outline:3px solid rgba(168,85,247,.4);outline-offset:3px}" +
      ".agenticed-feedback-button__icon{font-size:17px;line-height:1}" +
      "@media(max-width:600px){.agenticed-feedback-button{right:14px;bottom:14px;padding:10px 14px;font-size:13px}}" +
      "@media print{.agenticed-feedback-button{display:none!important}}";
    document.head.appendChild(style);

    var source = location.pathname + location.search;
    var link = document.createElement("a");
    link.id = "agenticed-feedback-button";
    link.className = "agenticed-feedback-button";
    link.href = "feedback.html?from=" + encodeURIComponent(source) + "&v=20260901-1";
    link.setAttribute("aria-label", "Share feedback about this page");
    link.innerHTML = '<span class="agenticed-feedback-button__icon" aria-hidden="true">&#128172;</span><span>Feedback</span>';
    document.body.appendChild(link);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addFeedbackButton);
  } else {
    addFeedbackButton();
  }
})();
