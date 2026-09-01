(function () {
  var form = document.getElementById("feedback-form");
  var message = document.getElementById("message");
  var count = document.getElementById("message-count");
  var status = document.getElementById("form-status");
  var button = document.getElementById("submit-feedback");
  var quotePermission = document.getElementById("quote-permission");
  var displayName = document.getElementById("display-name");
  var jobTitle = document.getElementById("job-title");
  var loadedAt = Date.now();
  var sourcePath = getSourcePath();
  if (!form) return;

  message.addEventListener("input", function () { count.textContent = message.value.length; });
  quotePermission.addEventListener("change", updateAttributionRequirements);
  Array.prototype.forEach.call(form.querySelectorAll('input[name="outcomes"]'), function (item) {
    item.addEventListener("change", function () {
      var none = document.getElementById("outcome-none");
      if (item === none && none.checked) {
        Array.prototype.forEach.call(form.querySelectorAll('input[name="outcomes"]:not(#outcome-none)'), function (other) { other.checked = false; });
      } else if (item.checked) {
        none.checked = false;
      }
      document.getElementById("outcomes-error").textContent = "";
    });
  });
  updateAttributionRequirements();
  selectAreaFromSource(sourcePath);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    status.className = "status";
    status.textContent = "";
    updateAttributionRequirements();
    if (!form.reportValidity()) return;

    var outcomes = Array.prototype.map.call(form.querySelectorAll('input[name="outcomes"]:checked'), function (item) { return item.value; });
    if (!outcomes.length) {
      document.getElementById("outcomes-error").textContent = "Select at least one outcome.";
      document.getElementById("outcomes-field").scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    document.getElementById("outcomes-error").textContent = "";

    if (form.elements.company.value || Date.now() - loadedAt < 1500) {
      showSuccess();
      return;
    }

    var cfg = window.AGENTICED_SUPABASE;
    if (!cfg || !cfg.url || !cfg.key) {
      showError("Feedback is temporarily unavailable. Please email hello@agenticed.org.");
      return;
    }

    var rating = form.querySelector('input[name="rating"]:checked');
    var payload = {
      role: form.elements.role.value,
      feedback_type: form.elements.feedback_type.value,
      organization: form.elements.organization.value.trim() || null,
      country: form.elements.country.value.trim(),
      usage_context: form.elements.usage_context.value,
      area: form.elements.area.value,
      completion_status: form.elements.completion_status.value,
      learners_reached: Number(form.elements.learners_reached.value),
      confidence_before: Number(form.elements.confidence_before.value),
      confidence_after: Number(form.elements.confidence_after.value),
      project_status: form.elements.project_status.value,
      recommend_score: Number(form.elements.recommend_score.value),
      outcomes: outcomes,
      rating: Number(rating.value),
      evidence_detail: form.elements.evidence_detail.value.trim(),
      message: form.elements.message.value.trim(),
      quote_permission: form.elements.quote_permission.value,
      display_name: form.elements.display_name.value.trim() || null,
      job_title: form.elements.job_title.value.trim() || null,
      email: form.elements.email.value.trim() || null,
      source_path: sourcePath,
      consent_version: "2026-08-31"
    };

    button.disabled = true;
    button.textContent = "Sending...";
    fetch(cfg.url.replace(/\/$/, "") + "/rest/v1/feedback_submissions", {
      method: "POST",
      headers: { apikey: cfg.key, Authorization: "Bearer " + cfg.key, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(payload)
    }).then(function (response) {
      if (!response.ok) throw new Error("Submission failed");
      showSuccess();
    }).catch(function () {
      showError("We could not send your feedback. Please try again or email hello@agenticed.org.");
    }).finally(function () {
      button.disabled = false;
      button.textContent = "Send feedback";
    });
  });

  function showSuccess() {
    form.reset(); count.textContent = "0"; loadedAt = Date.now();
    updateAttributionRequirements();
    status.className = "status success";
    status.textContent = "Thank you - your feedback has been received.";
  }
  function updateAttributionRequirements() {
    var attributed = quotePermission.value === "attributed";
    displayName.required = attributed;
    jobTitle.required = attributed;
  }
  function getSourcePath() {
    var from = new URLSearchParams(location.search).get("from");
    if (from && from.charAt(0) === "/" && from.length <= 300) return from;
    try {
      var referrer = new URL(document.referrer);
      if (referrer.origin === location.origin) return (referrer.pathname + referrer.search).slice(0, 300);
    } catch (error) {}
    return "/feedback.html";
  }
  function selectAreaFromSource(path) {
    var page = path.split("?")[0].split("/").pop().toLowerCase();
    var areaByPage = {
      "week1.html": "week_1", "week2.html": "week_2", "week3.html": "week_3",
      "week4.html": "week_4", "week5.html": "week_5", "week6.html": "week_6",
      "quiz.html": "assessment", "assessment.html": "assessment",
      "dashboard.html": "dashboard", "portfolio.html": "dashboard", "certificate.html": "dashboard",
      "tools.html": "teacher_resources", "plan.html": "teacher_resources"
    };
    if (areaByPage[page]) form.elements.area.value = areaByPage[page];
  }
  function showError(text) { status.className = "status error"; status.textContent = text; }
})();
