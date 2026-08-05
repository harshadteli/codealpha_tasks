// ============================================================
//  AI Smart Translator — Voice Input Module
// ============================================================

const VoiceInput = (() => {
  let recognition = null;
  let isListening = false;

  function isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function init() {
    const btn = document.getElementById("voice-input-btn");
    if (!btn) return;

    if (!isSupported()) {
      btn.disabled = true;
      btn.title = "Voice input not supported in this browser";
      return;
    }

    btn.addEventListener("click", toggle);
  }

  function toggle() {
    isListening ? stop() : start();
  }

  function start(langCode = "en-US") {
    if (!isSupported()) { showToast("Voice input not supported", "error"); return; }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    // Use the selected source language if possible
    const srcSel = document.getElementById("source-lang");
    if (srcSel && srcSel.value !== "auto") {
      recognition.lang = srcSel.value;
    } else {
      recognition.lang = langCode;
    }

    recognition.continuous      = true;
    recognition.interimResults  = true;
    recognition.maxAlternatives = 1;

    const srcTxt = document.getElementById("source-text");
    const existingText = srcTxt?.value || "";

    recognition.onstart = () => {
      isListening = true;
      setMicActive(true);
      showToast("🎙️ Listening… speak now", "info", 2000);
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final   = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript;
        else interim += transcript;
      }
      if (srcTxt) {
        srcTxt.value = existingText + final + interim;
        if (window.updateCounter) window.updateCounter();
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      if (event.error === "not-allowed") {
        showToast("Microphone access denied. Please allow mic permission.", "error");
      } else {
        showToast("Voice error: " + event.error, "error");
      }
      stop();
    };

    recognition.onend = () => { if (isListening) recognition.start(); }; // keep alive

    recognition.start();
  }

  function stop() {
    if (recognition) { recognition.onend = null; recognition.stop(); recognition = null; }
    isListening = false;
    setMicActive(false);
    showToast("Stopped listening", "info", 1500);
  }

  function setMicActive(active) {
    const btn = document.getElementById("voice-input-btn");
    if (!btn) return;
    btn.classList.toggle("recording", active);
    btn.setAttribute("aria-label", active ? "Stop recording" : "Start voice input");
    btn.innerHTML = active
      ? `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>`
      : `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>`;
  }

  return { init, start, stop, toggle, isSupported };
})();

window.VoiceInput = VoiceInput;
