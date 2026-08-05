// ============================================================
//  AI Smart Translator — Text-to-Speech + Audio Download
//
//  Speak    → Web Speech API (zero network, instant, offline)
//  Download → Google TTS via <audio> element (bypasses CORS for
//             media elements) shown as a floating audio player
// ============================================================

const TTS = (() => {
  let synth = window.speechSynthesis;
  let currentUtterance = null;
  let isPlaying = false;
  let audioPlayerCard = null;

  function isSupported() { return !!synth; }

  // ── Voice list ────────────────────────────────────────────
  let voices = [];
  function loadVoices() {
    if (synth) voices = synth.getVoices();
  }
  if (synth) {
    loadVoices();
    if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadVoices;
  }

  // ── Find best matching browser voice ──────────────────────
  function findVoice(langCode) {
    loadVoices();
    const lc = langCode.toLowerCase();
    return voices.find(v => v.lang.toLowerCase() === lc) ||
           voices.find(v => v.lang.toLowerCase().startsWith(lc + "-")) ||
           voices.find(v => v.lang.toLowerCase().startsWith(lc)) ||
           voices.find(v => v.lang.toLowerCase().includes(lc)) ||
           null;
  }

  // ── Build utterance ───────────────────────────────────────
  function buildUtterance(text, langCode) {
    const u = new SpeechSynthesisUtterance(text);
    const voice = findVoice(langCode);
    if (voice) { u.voice = voice; u.lang = voice.lang; }
    else        { u.lang = langCode; }
    u.rate   = 1;
    u.pitch  = 1;
    u.volume = 1;
    return u;
  }

  // ── SPEAK via Web Speech API (zero CORS, works offline) ───
  function speak(text, langCode = "en") {
    if (!isSupported()) { showToast("TTS not supported in this browser", "error"); return; }
    if (!text || !text.trim()) { showToast("Nothing to speak", "warning"); return; }

    if (isPlaying) { stop(); return; }

    synth.cancel();
    setTimeout(() => {
      currentUtterance = buildUtterance(text, langCode);
      currentUtterance.onstart = () => { isPlaying = true;  setPlayActive(true);  };
      currentUtterance.onend   = () => { isPlaying = false; setPlayActive(false); };
      currentUtterance.onerror = (e) => {
        if (e.error !== "interrupted" && e.error !== "canceled") {
          showToast(`Speech error: ${e.error || "unknown"}`, "error");
        }
        isPlaying = false;
        setPlayActive(false);
      };
      synth.speak(currentUtterance);
    }, 80);
  }

  function stop() {
    if (synth) synth.cancel();
    isPlaying = false;
    setPlayActive(false);
  }

  // ── Toggle speak button icon ──────────────────────────────
  function setPlayActive(active) {
    const btn = document.getElementById("tts-btn");
    if (!btn) return;
    btn.classList.toggle("playing", active);
    btn.setAttribute("aria-label", active ? "Stop speaking" : "Speak translation");
    btn.innerHTML = active
      ? `<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
      : `<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
  }

  // ── Build Google TTS URL (audio/mpeg, no auth needed) ─────
  // <audio> elements bypass CORS — they load cross-origin media
  // without needing Access-Control-Allow-Origin headers.
  function buildTTSUrl(text, langCode) {
    // Google TTS has a ~200 char limit per request; truncate for URL safety
    const safeText = text.trim().slice(0, 200);
    return `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(langCode)}&client=tw-ob&ttsspeed=1&q=${encodeURIComponent(safeText)}`;
  }

  // ── Show floating audio player card ───────────────────────
  function showAudioPlayer(ttsUrl, langCode, fullText) {
    // Remove existing player if any
    removeAudioPlayer();

    const card = document.createElement("div");
    card.id = "tts-audio-card";
    card.setAttribute("role", "region");
    card.setAttribute("aria-label", "Audio player");
    card.style.cssText = `
      position: fixed;
      bottom: 90px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--surface-1, #fff);
      border: 1px solid var(--border, #e0e0e0);
      border-radius: 16px;
      padding: 16px 18px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 300px;
      max-width: 90vw;
      animation: slideUp 0.3s ease both;
    `;

    card.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
        <span style="font-size:14px;font-weight:600;color:var(--primary,#1a73e8);display:flex;align-items:center;gap:6px">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
          Audio Player
        </span>
        <button id="tts-card-close" aria-label="Close audio player" style="
          background:none;border:none;cursor:pointer;
          color:var(--text-muted,#888);padding:4px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          transition:background 0.2s;
        " onmouseover="this.style.background='var(--surface-2)'" onmouseout="this.style.background='none'">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>
      <audio id="tts-audio-el" controls preload="auto" style="width:100%;border-radius:8px;height:36px;outline:none;"></audio>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <span style="font-size:11px;color:var(--text-muted,#888);flex:1">
          🌐 Powered by AI Smart Translator &nbsp;·&nbsp; ${langCode.toUpperCase()}
        </span>
        <a id="tts-direct-link" href="${ttsUrl}" target="_blank" rel="noopener noreferrer"
          style="font-size:12px;color:var(--primary,#1a73e8);text-decoration:none;
                 display:inline-flex;align-items:center;gap:4px;
                 background:var(--primary-light,#e8f0fe);padding:4px 10px;
                 border-radius:20px;font-weight:500;transition:opacity 0.2s"
          title="Open in new tab → right-click → Save As to download"
          onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
          Save MP3
        </a>
      </div>
    `;

    document.body.appendChild(card);
    audioPlayerCard = card;

    // Load audio source into <audio> element
    // Note: <audio> elements bypass CORS for media loading (unlike fetch/XHR)
    const audioEl = document.getElementById("tts-audio-el");
    if (audioEl) {
      audioEl.src = ttsUrl;
      audioEl.load();
      // Auto-play the audio
      audioEl.play().catch(() => {
        // Some browsers block autoplay; user can press play manually
      });
    }

    // Close button
    document.getElementById("tts-card-close")?.addEventListener("click", removeAudioPlayer);

    // Auto-dismiss after 60 seconds
    setTimeout(removeAudioPlayer, 60000);
  }

  function removeAudioPlayer() {
    if (audioPlayerCard) {
      const audioEl = audioPlayerCard.querySelector("audio");
      if (audioEl) { audioEl.pause(); audioEl.src = ""; }
      audioPlayerCard.remove();
      audioPlayerCard = null;
    }
  }

  // ── DOWNLOAD: Show audio player with Google TTS URL ───────
  // Uses <audio> element which bypasses CORS for media loading.
  // This is the only reliable cross-origin audio approach
  // without a backend proxy.
  function downloadAudio(text, langCode = "en") {
    if (!text || !text.trim()) { showToast("Nothing to download", "warning"); return; }

    const ttsUrl = buildTTSUrl(text, langCode);

    showAudioPlayer(ttsUrl, langCode, text);

    if (text.length > 200) {
      showToast("Audio preview: first 200 chars. Click 'Save MP3' → Open in tab → right-click to save full.", "info", 6000);
    } else {
      showToast("Audio player opened. Click 'Save MP3' to download the file.", "info", 4000);
    }
  }

  // ── Init ─────────────────────────────────────────────────
  function init() {
    const ttsBtn      = document.getElementById("tts-btn");
    const downloadBtn = document.getElementById("download-audio-btn");

    if (ttsBtn) {
      ttsBtn.addEventListener("click", () => {
        const text     = document.getElementById("translated-text")?.value;
        const langCode = document.getElementById("target-lang")?.value || "en";
        if (text?.trim()) speak(text, langCode);
        else showToast("Translate something first", "warning");
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        const text     = document.getElementById("translated-text")?.value;
        const langCode = document.getElementById("target-lang")?.value || "en";
        if (text?.trim()) downloadAudio(text, langCode);
        else showToast("Translate something first", "warning");
      });
    }
  }

  return { init, speak, stop, downloadAudio };
})();

window.TTS = TTS;
