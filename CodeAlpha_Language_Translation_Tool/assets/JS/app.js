// ============================================================
//  AI Smart Translator — App Bootstrap & Navigation
// ============================================================

const App = (() => {

  // ── Tab navigation ────────────────────────────────────────
  function initTabs() {
    const tabs    = document.querySelectorAll("[data-tab]");
    const panels  = document.querySelectorAll("[data-panel]");

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.tab;

        tabs.forEach(t => t.classList.remove("active"));
        panels.forEach(p => p.classList.remove("active"));

        tab.classList.add("active");
        const panel = document.querySelector(`[data-panel="${target}"]`);
        if (panel) {
          panel.classList.add("active");
          panel.classList.remove("anim-slide-up");
          void panel.offsetWidth; // force reflow
          panel.classList.add("anim-slide-up");
        }

        // Render history list when switching to that tab
        if (target === "history" && window.HistoryManager) HistoryManager.renderList();
      });
    });
  }

  // ── Mobile menu toggle ────────────────────────────────────
  function initMobileNav() {
    const menuBtn = document.getElementById("mobile-menu-btn");
    const navMenu = document.getElementById("nav-tabs");
    if (!menuBtn || !navMenu) return;

    menuBtn.addEventListener("click", () => {
      navMenu.classList.toggle("mobile-open");
      menuBtn.classList.toggle("active");
    });

    // Close when a tab is clicked on mobile
    document.querySelectorAll("[data-tab]").forEach(tab => {
      tab.addEventListener("click", () => {
        navMenu.classList.remove("mobile-open");
        menuBtn.classList.remove("active");
      });
    });
  }

  // ── Keyboard shortcuts ────────────────────────────────────
  function initShortcuts() {
    document.addEventListener("keydown", e => {
      // Ctrl+Enter = translate
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (window.Translator) Translator.run();
      }
      // Escape = close chatbot
      if (e.key === "Escape") {
        const panel = document.getElementById("chatbot-panel");
        if (panel?.classList.contains("open") && window.Chatbot) Chatbot.toggle();
      }
    });
  }

  // ── Copy source text button ───────────────────────────────
  function initCopySource() {
    const btn = document.getElementById("copy-source-btn");
    if (btn) {
      btn.addEventListener("click", () => {
        const text = document.getElementById("source-text")?.value;
        if (text) copyToClipboard(text);
        else showToast("Nothing to copy", "warning");
      });
    }
  }

  // ── Share translation ─────────────────────────────────────
  function initShare() {
    const btn = document.getElementById("share-btn");
    if (btn) {
      btn.addEventListener("click", async () => {
        const src = document.getElementById("source-text")?.value;
        const tgt = document.getElementById("translated-text")?.value;
        if (!src && !tgt) { showToast("Nothing to share", "warning"); return; }

        const shareText = `AI Smart Translator\n\nOriginal: ${src}\nTranslation: ${tgt}`;
        if (navigator.share) {
          try { await navigator.share({ title: "AI Smart Translator", text: shareText }); }
          catch {}
        } else {
          copyToClipboard(shareText);
          showToast("Translation copied to clipboard for sharing!", "success");
        }
      });
    }
  }

  // ── Full init ─────────────────────────────────────────────
  function init() {
    // Order matters: utils → config → then modules
    ThemeManager.init();
    initTabs();
    initMobileNav();
    initShortcuts();
    initCopySource();
    initShare();

    Translator.init();
    VoiceInput.init();
    TTS.init();
    ImageOCR.init();
    HistoryManager.init();
    GrammarCheck.init();
    AISummary.init();
    Chatbot.init();

    // Counter initial state
    if (window.updateCounter) window.updateCounter();

    // Welcome animation
    document.querySelectorAll(".feature-card").forEach((card, i) => {
      card.style.animationDelay = `${i * 60}ms`;
    });

    console.log("✅ AI Smart Translator initialized");

    // Local file protocol warning
    if (window.location.protocol === "file:") {
      console.warn(
        "AI Smart Translator: Running via file:// protocol. Some features like local OCR (Tesseract.js) may trigger browser CORS restrictions because local files are treated as unique origins. For the best experience, open this project using a local web server (e.g. VS Code Live Server, Python http.server, or npm serve)."
      );
      setTimeout(() => {
        showToast("Notice: For OCR features to work, please serve the project using a local server (e.g., Live Server).", "warning", 6000);
      }, 1000);
    }
  }

  return { init };
})();

// Boot when DOM is ready
document.addEventListener("DOMContentLoaded", App.init);
window.App = App;
