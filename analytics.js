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
