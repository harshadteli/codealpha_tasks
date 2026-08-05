// ============================================================
//  AI Smart Translator — Utilities
// ============================================================

/* ── Debounce ─────────────────────────────────────────────── */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/* ── Clipboard copy ───────────────────────────────────────── */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!", "success");
  } catch {
    // Fallback
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    showToast("Copied!", "success");
  }
}

/* ── Toast notifications ──────────────────────────────────── */
function showToast(message, type = "info", duration = 3000) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const icons = { success: "✅", error: "❌", info: "ℹ️", warning: "⚠️" };
  toast.innerHTML = `<span class="toast-icon">${icons[type] || "ℹ️"}</span><span>${message}</span>`;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* ── Word / character counter ─────────────────────────────── */
function countStats(text) {
  const chars = text.length;
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  return { chars, words };
}

/* ── Escape HTML ──────────────────────────────────────────── */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ── Format date ──────────────────────────────────────────── */
function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/* ── Language list ────────────────────────────────────────── */
const LANGUAGES = [
  { code: "auto", name: "Auto Detect" },
  { code: "af",   name: "Afrikaans" },
  { code: "sq",   name: "Albanian" },
  { code: "am",   name: "Amharic" },
  { code: "ar",   name: "Arabic" },
  { code: "hy",   name: "Armenian" },
  { code: "az",   name: "Azerbaijani" },
  { code: "eu",   name: "Basque" },
  { code: "be",   name: "Belarusian" },
  { code: "bn",   name: "Bengali" },
  { code: "bs",   name: "Bosnian" },
  { code: "bg",   name: "Bulgarian" },
  { code: "ca",   name: "Catalan" },
  { code: "ceb",  name: "Cebuano" },
  { code: "ny",   name: "Chichewa" },
  { code: "zh",   name: "Chinese (Simplified)" },
  { code: "zh-TW",name: "Chinese (Traditional)" },
  { code: "co",   name: "Corsican" },
  { code: "hr",   name: "Croatian" },
  { code: "cs",   name: "Czech" },
  { code: "da",   name: "Danish" },
  { code: "nl",   name: "Dutch" },
  { code: "en",   name: "English" },
  { code: "eo",   name: "Esperanto" },
  { code: "et",   name: "Estonian" },
  { code: "tl",   name: "Filipino" },
  { code: "fi",   name: "Finnish" },
  { code: "fr",   name: "French" },
  { code: "fy",   name: "Frisian" },
  { code: "gl",   name: "Galician" },
  { code: "ka",   name: "Georgian" },
  { code: "de",   name: "German" },
  { code: "el",   name: "Greek" },
  { code: "gu",   name: "Gujarati" },
  { code: "ht",   name: "Haitian Creole" },
  { code: "ha",   name: "Hausa" },
  { code: "haw",  name: "Hawaiian" },
  { code: "iw",   name: "Hebrew" },
  { code: "hi",   name: "Hindi" },
  { code: "hmn",  name: "Hmong" },
  { code: "hu",   name: "Hungarian" },
  { code: "is",   name: "Icelandic" },
  { code: "ig",   name: "Igbo" },
  { code: "id",   name: "Indonesian" },
  { code: "ga",   name: "Irish" },
  { code: "it",   name: "Italian" },
  { code: "ja",   name: "Japanese" },
  { code: "jw",   name: "Javanese" },
  { code: "kn",   name: "Kannada" },
  { code: "kk",   name: "Kazakh" },
  { code: "km",   name: "Khmer" },
  { code: "ko",   name: "Korean" },
  { code: "ku",   name: "Kurdish (Kurmanji)" },
  { code: "ky",   name: "Kyrgyz" },
  { code: "lo",   name: "Lao" },
  { code: "la",   name: "Latin" },
  { code: "lv",   name: "Latvian" },
  { code: "lt",   name: "Lithuanian" },
  { code: "lb",   name: "Luxembourgish" },
  { code: "mk",   name: "Macedonian" },
  { code: "mg",   name: "Malagasy" },
  { code: "ms",   name: "Malay" },
  { code: "ml",   name: "Malayalam" },
  { code: "mt",   name: "Maltese" },
  { code: "mi",   name: "Maori" },
  { code: "mr",   name: "Marathi" },
  { code: "mn",   name: "Mongolian" },
  { code: "my",   name: "Myanmar (Burmese)" },
  { code: "ne",   name: "Nepali" },
  { code: "no",   name: "Norwegian" },
  { code: "ps",   name: "Pashto" },
  { code: "fa",   name: "Persian" },
  { code: "pl",   name: "Polish" },
  { code: "pt",   name: "Portuguese" },
  { code: "pa",   name: "Punjabi" },
  { code: "ro",   name: "Romanian" },
  { code: "ru",   name: "Russian" },
  { code: "sm",   name: "Samoan" },
  { code: "gd",   name: "Scots Gaelic" },
  { code: "sr",   name: "Serbian" },
  { code: "st",   name: "Sesotho" },
  { code: "sn",   name: "Shona" },
  { code: "sd",   name: "Sindhi" },
  { code: "si",   name: "Sinhala" },
  { code: "sk",   name: "Slovak" },
  { code: "sl",   name: "Slovenian" },
  { code: "so",   name: "Somali" },
  { code: "es",   name: "Spanish" },
  { code: "su",   name: "Sundanese" },
  { code: "sw",   name: "Swahili" },
  { code: "sv",   name: "Swedish" },
  { code: "tg",   name: "Tajik" },
  { code: "ta",   name: "Tamil" },
  { code: "te",   name: "Telugu" },
  { code: "th",   name: "Thai" },
  { code: "tr",   name: "Turkish" },
  { code: "uk",   name: "Ukrainian" },
  { code: "ur",   name: "Urdu" },
  { code: "uz",   name: "Uzbek" },
  { code: "vi",   name: "Vietnamese" },
  { code: "cy",   name: "Welsh" },
  { code: "xh",   name: "Xhosa" },
  { code: "yi",   name: "Yiddish" },
  { code: "yo",   name: "Yoruba" },
  { code: "zu",   name: "Zulu" },
];

/* ── Populate <select> with language options ──────────────── */
function populateLanguageSelect(selectEl, includeAuto = false) {
  selectEl.innerHTML = "";
  const list = includeAuto ? LANGUAGES : LANGUAGES.filter(l => l.code !== "auto");
  list.forEach(lang => {
    const opt = document.createElement("option");
    opt.value = lang.code;
    opt.textContent = lang.name;
    selectEl.appendChild(opt);
  });
}

/* ── Get language name from code ──────────────────────────── */
function getLangName(code) {
  const found = LANGUAGES.find(l => l.code === code);
  return found ? found.name : code.toUpperCase();
}

/* ── Export globals ───────────────────────────────────────── */
window.debounce           = debounce;
window.copyToClipboard    = copyToClipboard;
window.showToast          = showToast;
window.countStats         = countStats;
window.escapeHtml         = escapeHtml;
window.formatDate         = formatDate;
window.LANGUAGES          = LANGUAGES;
window.populateLanguageSelect = populateLanguageSelect;
window.getLangName        = getLangName;
