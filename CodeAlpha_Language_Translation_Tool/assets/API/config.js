
const API_CONFIG = {
  FREE_TRANSLATE_URL: "https://translate.googleapis.com/translate_a/single",
  LANGUAGE_TOOL_URL: "https://api.languagetool.org/v2/check",
  LIVE_TRANSLATE_DEBOUNCE_MS: 600,   
  MAX_CHARS: 5000,                   
  HISTORY_LIMIT: 100,                
};
// Make available globally
window.API_CONFIG = API_CONFIG;
