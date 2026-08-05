// ============================================================
//  AI Smart Translator — Theme Manager
// ============================================================

const ThemeManager = (() => {
  const STORAGE_KEY = "ast-theme";
  const ROOT = document.documentElement;

  function getStored() {
    return localStorage.getItem(STORAGE_KEY) || "light";
  }

  function apply(theme) {
    ROOT.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update toggle button icon & label
    const btn   = document.getElementById("theme-toggle");
    const label = document.getElementById("theme-label");
    if (btn) {
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
      btn.innerHTML = theme === "dark"
        ? `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
             <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
           </svg>`
        : `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
             <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-12.37l-1.06 1.06a.996.996 0 0 0 0 1.41c.39.39 1.03.39 1.41 0l1.06-1.06a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0zM7.05 18.36l-1.06 1.06a.996.996 0 0 0 0 1.41c.39.39 1.03.39 1.41 0l1.06-1.06a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0z"/>
           </svg>`;
    }
    if (label) label.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
  }

  function toggle() {
    const current = ROOT.getAttribute("data-theme") || "light";
    apply(current === "dark" ? "light" : "dark");
    showToast(`Switched to ${ROOT.getAttribute("data-theme")} mode`, "info", 1800);
  }

  function init() {
    apply(getStored());
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.addEventListener("click", toggle);
  }

  return { init, toggle, apply };
})();

window.ThemeManager = ThemeManager;
