(function () {
  var form = document.getElementById("feedback-form");
  var message = document.getElementById("message");
  var count = document.getElementById("message-count");
  var status = document.getElementById("form-status");
  var button = document.getElementById("submit-feedback");
  var loadedAt = Date.now();
  if (!form) return;

  message.addEventListener("input", function () { count.textContent = message.value.length; });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    status.className = "status";
    status.textContent = "";
    if (!form.reportValidity()) return;

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
      area: form.elements.area.value,
      rating: Number(rating.value),
      message: form.elements.message.value.trim(),
      email: form.elements.email.value.trim() || null,
      source_path: location.pathname
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
    status.className = "status success";
    status.textContent = "Thank you - your feedback has been received.";
  }
  function showError(text) { status.className = "status error"; status.textContent = text; }
})();
