// ============================================================
//  AI Smart Translator — Translation History Module
// ============================================================

const HistoryManager = (() => {
  const STORAGE_KEY = "ast-history";
  let entries = [];
  let searchQuery = "";

  // ── Load / Save ───────────────────────────────────────────
  function load() {
    try { entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { entries = []; }
  }

  function save() {
    // Trim to limit
    if (entries.length > API_CONFIG.HISTORY_LIMIT) {
      entries = entries.slice(0, API_CONFIG.HISTORY_LIMIT);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  // ── Add entry ─────────────────────────────────────────────
  function add({ source, target, sourceLang, targetLang }) {
    if (!source.trim() || !target.trim()) return;

    // Avoid exact duplicates at the top
    if (entries.length > 0 && entries[0].source === source && entries[0].targetLang === targetLang) return;

    entries.unshift({
      id: Date.now(),
      source: source.trim(),
      target: target.trim(),
      sourceLang,
      targetLang,
      ts: Date.now(),
    });

    save();
    if (document.getElementById("history-list")) renderList();
  }

  // ── Clear all ─────────────────────────────────────────────
  function clearAll() {
    if (!confirm("Clear all translation history?")) return;
    entries = [];
    save();
    renderList();
    showToast("History cleared", "info");
  }

  // ── Delete one ────────────────────────────────────────────
  function deleteEntry(id) {
    entries = entries.filter(e => e.id !== id);
    save();
    renderList();
  }

  // ── Restore entry to translator ───────────────────────────
  function restore(entry) {
    const srcTxt = document.getElementById("source-text");
    const tgtTxt = document.getElementById("translated-text");
    const srcSel = document.getElementById("source-lang");
    const tgtSel = document.getElementById("target-lang");

    if (srcTxt) srcTxt.value = entry.source;
    if (tgtTxt) tgtTxt.value = entry.target;
    if (srcSel) srcSel.value = entry.sourceLang;
    if (tgtSel) tgtSel.value = entry.targetLang;

    if (window.updateCounter) window.updateCounter();

    // Switch to translator tab
    const transTab = document.querySelector('[data-tab="translator"]');
    if (transTab) transTab.click();

    showToast("Restored to translator", "success");
  }

  // ── Filtered list ─────────────────────────────────────────
  function filtered() {
    if (!searchQuery) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(e =>
      e.source.toLowerCase().includes(q) ||
      e.target.toLowerCase().includes(q) ||
      getLangName(e.sourceLang).toLowerCase().includes(q) ||
      getLangName(e.targetLang).toLowerCase().includes(q)
    );
  }

  // ── Render list ───────────────────────────────────────────
  function renderList() {
    const list = document.getElementById("history-list");
    const count = document.getElementById("history-count");
    if (!list) return;

    const items = filtered();
    if (count) count.textContent = items.length;

    if (items.length === 0) {
      list.innerHTML = `
        <div class="history-empty">
          <div class="history-empty-icon">🕐</div>
          <p>${searchQuery ? "No results found" : "No translation history yet"}</p>
          <small>${searchQuery ? "Try a different search term" : "Start translating to see history here"}</small>
        </div>`;
      return;
    }

    list.innerHTML = items.map(e => `
      <div class="history-item anim-slide-up" data-id="${e.id}">
        <div class="history-langs">
          <span class="lang-badge">${getLangName(e.sourceLang)}</span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
          <span class="lang-badge">${getLangName(e.targetLang)}</span>
          <span class="history-date">${formatDate(e.ts)}</span>
        </div>
        <div class="history-source">${escapeHtml(e.source.length > 120 ? e.source.slice(0,120)+"…" : e.source)}</div>
        <div class="history-target">${escapeHtml(e.target.length > 120 ? e.target.slice(0,120)+"…" : e.target)}</div>
        <div class="history-actions">
          <button class="btn-icon" onclick="HistoryManager.restore(${JSON.stringify(e).replace(/"/g,'&quot;')})" title="Restore">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z"/></svg>
          </button>
          <button class="btn-icon" onclick="copyToClipboard(${JSON.stringify(e.target).replace(/"/g,'&quot;')})" title="Copy translation">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
          </button>
          <button class="btn-icon btn-danger" onclick="HistoryManager.deleteEntry(${e.id})" title="Delete">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
        </div>
      </div>`).join("");
  }

  // ── Init ─────────────────────────────────────────────────
  function init() {
    load();

    const searchInput = document.getElementById("history-search");
    const clearAllBtn = document.getElementById("history-clear-all");

    if (searchInput) {
      searchInput.addEventListener("input", e => {
        searchQuery = e.target.value.trim();
        renderList();
      });
    }

    if (clearAllBtn) clearAllBtn.addEventListener("click", clearAll);

    renderList();
  }

  return { init, add, deleteEntry, clearAll, restore, renderList, get entries() { return entries; } };
})();

window.HistoryManager = HistoryManager;
