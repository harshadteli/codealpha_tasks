// ============================================================
//  AI Smart Translator — Core Translator Module
// ============================================================

const Translator = (() => {
  let sourceLang = "auto";
  let targetLang = "es";
  let lastTranslation = { source: "", target: "", sourceLang: "", targetLang: "" };

  // ── Detect language ──────────────────────────────────────
  async function detectLanguage(text) {
    if (!text.trim()) return null;
    try {
      const params = new URLSearchParams({
        client: "gtx",
        sl: "auto",
        tl: "en",
        dt: "t",
        q: text,
      });
      const res = await fetch(`${API_CONFIG.FREE_TRANSLATE_URL}?${params}`);
      const data = await res.json();
      return data[2] || null;
    } catch (err) {
      console.warn("Detect error:", err.message);
      return null;
    }
  }

  // ── Translate text ───────────────────────────────────────
  async function translate(text, source, target) {
    if (!text.trim()) return "";
    try {
      const params = new URLSearchParams({
        client: "gtx",
        sl: source,
        tl: target,
        dt: "t",
        q: text,
      });

      const res = await fetch(`${API_CONFIG.FREE_TRANSLATE_URL}?${params}`);
      if (!res.ok) throw new Error("Network response was not ok");
      
      const data = await res.json();
      if (!data || !data[0]) {
        throw new Error("Invalid response format from translation endpoint");
      }

      // Combine sentences if the user enters paragraphs
      const translated = data[0].map(s => s[0]).join("");
      const detectedSource = data[2] || source;

      return { translated, detectedSource };
    } catch (err) {
      showToast("Translation failed: " + err.message, "error");
      return null;
    }
  }

  // ── Update detected language badge ───────────────────────
  function updateDetectedBadge(langCode) {
    const badge = document.getElementById("detected-lang");
    if (!badge) return;
    if (langCode && sourceLang === "auto") {
      badge.textContent = `Detected: ${getLangName(langCode)}`;
      badge.style.display = "inline-flex";
    } else {
      badge.style.display = "none";
    }
  }

  // ── Swap languages ───────────────────────────────────────
  function swap() {
    const srcSel = document.getElementById("source-lang");
    const tgtSel = document.getElementById("target-lang");
    const srcTxt = document.getElementById("source-text");
    const tgtTxt = document.getElementById("translated-text");

    if (sourceLang === "auto") {
      showToast("Cannot swap while Auto Detect is active", "warning");
      return;
    }

    // Swap selects
    const tmp = srcSel.value;
    srcSel.value = tgtSel.value;
    tgtSel.value = tmp;
    sourceLang = srcSel.value;
    targetLang = tgtSel.value;

    // Swap textarea content
    const tmpTxt = srcTxt.value;
    srcTxt.value = tgtTxt.value;
    tgtTxt.value = tmpTxt;

    // Update counter
    if (window.updateCounter) window.updateCounter();
  }

  // ── Run full translation flow ────────────────────────────
  async function run() {
    const srcTxt = document.getElementById("source-text");
    const tgtTxt = document.getElementById("translated-text");
    const btn    = document.getElementById("translate-btn");
    const text   = srcTxt.value.trim();

    if (!text) {
      tgtTxt.value = "";
      updateDetectedBadge(null);
      return;
    }

    // Show loading state
    if (btn) { btn.disabled = true; btn.classList.add("loading"); }
    tgtTxt.classList.add("translating");
    tgtTxt.value = "";

    const result = await translate(text, sourceLang, targetLang);

    if (result) {
      tgtTxt.value = result.translated;
      updateDetectedBadge(result.detectedSource);
      lastTranslation = {
        source: text,
        target: result.translated,
        sourceLang: result.detectedSource || sourceLang,
        targetLang,
      };
      // Save to history
      if (window.HistoryManager) HistoryManager.add(lastTranslation);
    }

    tgtTxt.classList.remove("translating");
    if (btn) { btn.disabled = false; btn.classList.remove("loading"); }
  }

  // ── Init ─────────────────────────────────────────────────
  function init() {
    const srcSel = document.getElementById("source-lang");
    const tgtSel = document.getElementById("target-lang");
    const srcTxt = document.getElementById("source-text");
    const swapBtn = document.getElementById("swap-btn");
    const translateBtn = document.getElementById("translate-btn");
    const clearBtn = document.getElementById("clear-source");

    // Populate dropdowns
    if (srcSel) populateLanguageSelect(srcSel, true);
    if (tgtSel) populateLanguageSelect(tgtSel, false);

    if (srcSel) { srcSel.value = "auto"; srcSel.addEventListener("change", e => { sourceLang = e.target.value; }); }
    if (tgtSel) { tgtSel.value = "es";   tgtSel.addEventListener("change", e => { targetLang = e.target.value; }); }

    if (swapBtn)      swapBtn.addEventListener("click", swap);
    if (translateBtn) translateBtn.addEventListener("click", run);
    if (clearBtn)     clearBtn.addEventListener("click", () => {
      srcTxt.value = "";
      document.getElementById("translated-text").value = "";
      updateDetectedBadge(null);
      if (window.updateCounter) window.updateCounter();
    });

    // Live translate
    const liveTranslate = debounce(run, API_CONFIG.LIVE_TRANSLATE_DEBOUNCE_MS);
    if (srcTxt) {
      srcTxt.addEventListener("input", () => {
        if (window.updateCounter) window.updateCounter();
        if (document.getElementById("live-toggle")?.checked) liveTranslate();
      });
    }

    // Word/char counter
    window.updateCounter = function () {
      const stats = countStats(srcTxt?.value || "");
      const charEl = document.getElementById("char-count");
      const wordEl = document.getElementById("word-count");
      const maxEl  = document.getElementById("max-chars");
      if (charEl) charEl.textContent = stats.chars;
      if (wordEl) wordEl.textContent = stats.words;
      if (maxEl)  maxEl.textContent  = API_CONFIG.MAX_CHARS;

      // Warn if over limit
      if (srcTxt) {
        srcTxt.classList.toggle("over-limit", stats.chars > API_CONFIG.MAX_CHARS);
      }
    };

    // Copy target text button
    const copyBtn = document.getElementById("copy-translated");
    if (copyBtn) copyBtn.addEventListener("click", () => {
      const t = document.getElementById("translated-text")?.value;
      if (t) copyToClipboard(t);
      else showToast("Nothing to copy", "warning");
    });
  }

  return { init, run, swap, translate, detectLanguage, get lastTranslation() { return lastTranslation; } };
})();

window.Translator = Translator;
