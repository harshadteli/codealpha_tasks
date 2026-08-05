// ============================================================
//  AI Smart Translator — Grammar Check Module (LanguageTool)
// ============================================================

const GrammarCheck = (() => {
  let lastMatches = [];

  // ── Check grammar ─────────────────────────────────────────
  async function check(text, langCode = "en-US") {
    if (!text.trim()) { showToast("Enter text first", "warning"); return; }

    const checkBtn = document.getElementById("grammar-check-btn");
    if (checkBtn) { checkBtn.disabled = true; checkBtn.textContent = "Checking…"; }

    try {
      const body = new URLSearchParams({
        text,
        language: langCode === "auto" ? "en-US" : langCode,
        enabledOnly: "false",
      });

      const res = await fetch(API_CONFIG.LANGUAGE_TOOL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      if (!res.ok) throw new Error("LanguageTool API error: " + res.status);
      const data = await res.json();
      lastMatches = data.matches || [];
      renderResults(text, lastMatches);
    } catch (err) {
      console.error("Grammar check error:", err);
      showToast("Grammar check failed: " + err.message, "error");
    } finally {
      if (checkBtn) { checkBtn.disabled = false; checkBtn.textContent = "Check Grammar"; }
    }
  }

  // ── Render results ────────────────────────────────────────
  function renderResults(originalText, matches) {
    const panel = document.getElementById("grammar-results");
    const badge = document.getElementById("grammar-badge");
    if (!panel) return;

    if (badge) {
      badge.textContent = matches.length;
      badge.style.display = matches.length > 0 ? "inline-flex" : "none";
    }

    if (matches.length === 0) {
      panel.innerHTML = `<div class="grammar-ok"><span>✅</span><p>No grammar issues found!</p></div>`;
      return;
    }

    // Build highlighted text
    let highlighted = escapeHtml(originalText);
    const sortedMatches = [...matches].sort((a, b) => b.offset - a.offset);
    let plainText = originalText;
    sortedMatches.forEach(m => {
      const before  = escapeHtml(plainText.slice(0, m.offset));
      const error   = escapeHtml(plainText.slice(m.offset, m.offset + m.length));
      const after   = escapeHtml(plainText.slice(m.offset + m.length));
      highlighted   = before + `<mark class="grammar-error" title="${escapeHtml(m.message)}">${error}</mark>` + after;
      plainText     = plainText; // keep unchanged for next iteration offset reference
    });

    const issueList = matches.map((m, i) => {
      const replacements = m.replacements.slice(0, 3).map(r =>
        `<button class="grammar-fix-btn" data-index="${i}" data-replacement="${escapeHtml(r.value)}">${escapeHtml(r.value)}</button>`
      ).join("");
      return `
        <div class="grammar-item">
          <div class="grammar-item-header">
            <span class="grammar-category">${m.rule?.issueType || "Issue"}</span>
            <span class="grammar-context">"${escapeHtml(m.context?.text?.slice(m.context.offset, m.context.offset + m.context.length) || "")}"</span>
          </div>
          <p class="grammar-message">${escapeHtml(m.message)}</p>
          ${replacements ? `<div class="grammar-fixes"><span>Suggestions:</span>${replacements}</div>` : ""}
        </div>`;
    }).join("");

    panel.innerHTML = `
      <div class="grammar-summary">Found <strong>${matches.length}</strong> issue${matches.length !== 1 ? "s" : ""}</div>
      <div class="grammar-highlighted">${highlighted}</div>
      <div class="grammar-issues">${issueList}</div>`;

    // Fix button click
    panel.querySelectorAll(".grammar-fix-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index);
        const replacement = btn.dataset.replacement;
        const match = matches[idx];
        const srcTxt = document.getElementById("source-text");
        if (srcTxt && match) {
          const val = srcTxt.value;
          srcTxt.value = val.slice(0, match.offset) + replacement + val.slice(match.offset + match.length);
          if (window.updateCounter) window.updateCounter();
          showToast("Fix applied!", "success");
          check(srcTxt.value);
        }
      });
    });
  }

  // ── Init ─────────────────────────────────────────────────
  function init() {
    const checkBtn = document.getElementById("grammar-check-btn");
    if (checkBtn) {
      checkBtn.addEventListener("click", () => {
        const text    = document.getElementById("source-text")?.value || "";
        const langSel = document.getElementById("source-lang");
        const lang    = langSel?.value === "auto" ? "en-US" : (langSel?.value || "en-US");
        check(text, lang);
      });
    }
  }

  return { init, check, renderResults };
})();

window.GrammarCheck = GrammarCheck;
