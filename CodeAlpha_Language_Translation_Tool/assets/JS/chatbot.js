// ============================================================
//  AI Smart Translator — Smart AI Chatbot (No API / No Login)
//  Uses a comprehensive knowledge base + pattern matching
// ============================================================

const Chatbot = (() => {
  let isTyping = false;
  let conversationHistory = [];

  // ── Knowledge base for translation assistant ──────────────
  const KB = [
    // Greetings
    { patterns: ["hi", "hello", "hey", "howdy", "greetings", "good morning", "good evening", "good afternoon", "sup", "what's up"], response: "👋 Hello! I'm your AI language assistant. I can help you with translations, language tips, grammar questions, and much more. What would you like to know?" },
    { patterns: ["how are you", "how are you doing", "how do you do"], response: "😊 I'm doing great and ready to help you with all your translation needs! What language challenge can I assist with today?" },
    { patterns: ["who are you", "what are you", "your name", "who made you"], response: "🤖 I'm the AI Assistant built into **AI Smart Translator**. I'm specialized in helping you with language translations, grammar explanations, cultural tips, and language learning. Ask me anything!" },
    { patterns: ["thank you", "thanks", "thank u", "thx", "ty", "appreciate"], response: "You're welcome! 😊 Happy to help. Feel free to ask me anything else about languages or translations." },
    { patterns: ["bye", "goodbye", "see you", "later", "farewell"], response: "Goodbye! 👋 Come back anytime you need translation help. Happy translating!" },

    // Translation tips
    { patterns: ["how to translate", "how do i translate", "how to use translator", "translate text"], response: "🌐 To translate text:\n1. Type your text in the **source box** on the left\n2. Select your **target language** from the dropdown\n3. Click **Translate** or press **Ctrl+Enter**\n\nTip: Enable **Live Translate** to get real-time translations as you type!" },
    { patterns: ["auto detect", "detect language", "which language", "identify language"], response: "🔍 The **Auto Detect** feature automatically identifies the language of your source text! Just select 'Auto Detect' in the source language dropdown and start typing. The detected language will appear as a badge above your text." },
    { patterns: ["live translate", "real time", "real-time", "translate while typing"], response: "⚡ **Live Translate** translates your text automatically as you type! Toggle the **Live** switch near the translate button to enable it. Note: there's a small debounce delay to avoid excessive API calls." },
    { patterns: ["swap languages", "switch languages", "reverse translation"], response: "🔄 Click the **Swap** button (↔ icon) between the source and target language dropdowns to instantly swap languages and their text content!" },

    // Language questions
    { patterns: ["how many languages", "supported languages", "which languages", "language list"], response: "🌍 AI Smart Translator supports **100+ languages** including Spanish, French, German, Chinese, Japanese, Arabic, Hindi, Portuguese, Russian, Korean, Italian, Dutch, and many more! Check the language dropdown for the full list." },
    { patterns: ["most spoken language", "popular language", "common language"], response: "📊 The most spoken languages in the world:\n1. 🇨🇳 **Mandarin Chinese** (~1.1B speakers)\n2. 🇪🇸 **Spanish** (~560M speakers)\n3. 🇺🇸 **English** (~510M speakers)\n4. 🇸🇦 **Arabic** (~420M speakers)\n5. 🇮🇳 **Hindi** (~340M speakers)" },
    { patterns: ["hardest language", "difficult language", "hard to learn"], response: "🧗 Languages considered most difficult for English speakers:\n• **Japanese & Chinese** — complex writing systems\n• **Arabic** — different script + grammar\n• **Korean** — unique sentence structure\n• **Finnish** — 15 grammatical cases!\n\nBut with consistent practice, any language is learnable! 💪" },
    { patterns: ["easiest language", "easy language", "simple language"], response: "😊 Languages easiest for English speakers:\n• **Spanish** — very similar structure\n• **French** — many shared words\n• **Italian** — intuitive pronunciation\n• **Portuguese** — similar to Spanish\n• **Dutch** — closest Germanic language to English" },

    // Grammar
    { patterns: ["grammar check", "check grammar", "grammar mistake", "spell check", "spelling"], response: "✏️ To check grammar:\n1. Type your text in the source box\n2. Click **Check Grammar** button (or go to Grammar tab)\n3. Mistakes will be highlighted in red\n4. Click on suggestions to auto-fix them!\n\nWe use **LanguageTool** — a free, powerful grammar engine." },
    { patterns: ["what is grammar", "explain grammar"], response: "📚 **Grammar** is the set of rules that govern how words are combined to form sentences in a language. It includes:\n• **Syntax** — sentence structure\n• **Morphology** — word forms\n• **Phonology** — sound patterns\n• **Semantics** — meaning\n\nGood grammar makes your writing clear and professional!" },
    { patterns: ["tense", "past tense", "present tense", "future tense"], response: "⏰ **English Tenses at a glance:**\n• **Past**: I walked, I was walking, I had walked\n• **Present**: I walk, I am walking, I have walked\n• **Future**: I will walk, I am going to walk\n\nDifferent languages handle tense differently — some have fewer tenses, others have more!" },
    { patterns: ["noun", "verb", "adjective", "adverb", "pronoun"], response: "📖 **Parts of Speech:**\n• **Noun** — person, place, thing (dog, city)\n• **Verb** — action or state (run, is)\n• **Adjective** — describes a noun (big, red)\n• **Adverb** — describes a verb (quickly, very)\n• **Pronoun** — replaces a noun (he, she, they)" },

    // Voice & TTS
    { patterns: ["voice input", "speak to translate", "microphone", "speech to text"], response: "🎤 To use **Voice Input**:\n1. Click the **microphone** icon near the source text box\n2. Allow microphone access when prompted\n3. Speak clearly — your words appear as text automatically\n4. Click the mic icon again to stop\n\nWorks best in Chrome & Edge browsers." },
    { patterns: ["text to speech", "speak translation", "hear translation", "listen", "audio", "tts"], response: "🔊 To hear your translation spoken aloud:\n1. First translate your text\n2. Click the **speaker icon** (🔊) under the translation\n3. The translation will be read in the target language\n\nYou can also **download the audio** as an MP3 file using the download button!" },
    { patterns: ["download audio", "save audio", "audio file", "mp3"], response: "⬇️ To download translation audio:\n1. Translate your text first\n2. Click the **download icon** 📥 next to the speaker button\n3. A high-quality MP3 audio file will be downloaded directly to your computer!" },

    // OCR / Image
    { patterns: ["image translate", "ocr", "extract text", "text from image", "photo translate", "scan text", "image text"], response: "📷 To translate text from an image:\n1. Go to the **Image Translate** tab\n2. Drag & drop an image, click to browse, or paste from clipboard\n3. Wait for OCR to extract the text automatically\n4. The text is sent to the translator automatically!\n\n💡 Works best with clear, high-contrast images." },

    // History
    { patterns: ["history", "past translation", "saved translation", "previous translation"], response: "📜 Your translations are automatically saved to **History**!\n• Go to the **History** tab to see all past translations\n• Use the **search bar** to filter by text\n• Click **Restore** to bring a translation back to the translator\n• Click **Delete** to remove individual entries" },

    // Summary
    { patterns: ["summary", "summarize", "ai summary", "shorten text", "compress text"], response: "📝 To generate an **AI Summary**:\n1. Translate some text first\n2. Click the **AI Summary** button below the translation\n3. A concise 2-sentence summary will appear instantly!\n\nThis is useful for summarizing long articles or documents after translation." },

    // Theme
    { patterns: ["dark mode", "light mode", "theme", "toggle theme"], response: "🌙 Click the **theme toggle** button (☀️/🌙) in the top-right corner of the navigation bar to switch between **Light** and **Dark** mode. Your preference is saved automatically!" },

    // Tips
    { patterns: ["tip", "trick", "shortcut", "keyboard shortcut", "help"], response: "💡 **Quick Tips for AI Smart Translator:**\n• **Ctrl+Enter** — instant translate\n• **Live Toggle** — real-time translation as you type\n• **Auto Detect** — identifies source language automatically\n• **Swap button** — reverse language direction instantly\n• **Grammar Tab** — fix mistakes before translating\n• **History Tab** — revisit past translations" },
    { patterns: ["copy", "copy text", "clipboard"], response: "📋 To copy text:\n• Click the **copy icon** next to the source or translated text box\n• The text is instantly copied to your clipboard!\n• You can then paste it anywhere with **Ctrl+V**" },

    // Language-specific
    { patterns: ["spanish", "hola", "spanish translation"], response: "🇪🇸 **Spanish** is the 2nd most spoken native language in the world! It's the official language of 20 countries. Fun facts:\n• Spanish has masculine & feminine nouns\n• 2 past tenses: preterite & imperfect\n• Very phonetically consistent — words are pronounced as written\n• Select 'Spanish (es)' in the target language!" },
    { patterns: ["french", "bonjour", "french language"], response: "🇫🇷 **French** is spoken by 300M+ people worldwide and is an official language of the UN! Fun facts:\n• French has 2 genders (masculine/feminine)\n• Silent letters are very common\n• French influenced ~30% of English vocabulary\n• The French Academy regulates new words!" },
    { patterns: ["japanese", "nihongo", "hiragana", "katakana", "kanji"], response: "🇯🇵 **Japanese** has 3 writing systems:\n• **Hiragana** (ひらがな) — basic phonetic syllables\n• **Katakana** (カタカナ) — foreign words\n• **Kanji** (漢字) — Chinese-origin characters\n\nJapanese has honorific speech levels (Keigo) and the verb comes at the end of sentences!" },
    { patterns: ["chinese", "mandarin", "cantonese"], response: "🇨🇳 **Mandarin Chinese** is the world's most spoken language! Key features:\n• 4 tones — same word, different tones = different meanings\n• No alphabet — uses 50,000+ characters (Hanzi)\n• No verb conjugation or plural forms\n• Simplified (mainland China) vs Traditional (Taiwan/HK) characters" },
    { patterns: ["arabic", "عربي"], response: "🇸🇦 **Arabic** is written right-to-left and has 28 letters. Features:\n• Root-based system — most words come from 3-letter roots\n• Two genders: masculine & feminine\n• Dual form (for pairs of things) in addition to singular/plural\n• Modern Standard Arabic vs regional dialects" },
    { patterns: ["hindi", "हिंदी", "devanagari"], response: "🇮🇳 **Hindi** is written in the Devanagari script and spoken by 600M+ people! Features:\n• Vowels and consonants use a syllabic script\n• Nouns have grammatical gender\n• Verb comes at the end of the sentence\n• Shares Sanskrit roots with many South Asian languages" },
    { patterns: ["german", "deutsch", "german language"], response: "🇩🇪 **German** is known for its long compound words! (Donaudampfschifffahrtsgesellschaft 😄) Features:\n• 3 genders: masculine, feminine, neuter\n• 4 grammatical cases\n• Nouns are always capitalized\n• Very logical and consistent rules" },

    // Translation accuracy
    { patterns: ["accurate", "accuracy", "correct translation", "trust translation"], response: "🎯 **Translation accuracy tips:**\n• Keep sentences short and simple\n• Avoid idioms and slang when possible\n• Proofread with the Grammar Checker\n• For critical documents, always have a native speaker review\n• Machine translation is excellent for understanding, but human review matters for publishing!" },
    { patterns: ["formal", "informal", "polite", "casual"], response: "🎩 Many languages have **formal & informal registers**:\n• Spanish: 'usted' (formal) vs 'tú' (informal)\n• French: 'vous' (formal) vs 'tu' (informal)\n• Japanese: multiple politeness levels\n• Korean: 7 speech levels!\n\nWhen translating formal documents, always check the register of the output." },

    // Fallback
  ];

  // ── Smart response function ───────────────────────────────
  function getResponse(message) {
    const lower = message.toLowerCase().trim();

    // Check knowledge base patterns
    for (const entry of KB) {
      for (const pattern of entry.patterns) {
        if (lower.includes(pattern)) {
          return entry.response;
        }
      }
    }

    // Context-aware fallbacks based on keywords
    if (lower.includes("translate") || lower.includes("translation")) {
      return "🌐 I can help with translation! Use the main translator panel to translate text between 100+ languages. Select your source and target languages, enter your text, and click Translate (or Ctrl+Enter). What specific language pair are you working with?";
    }
    if (lower.includes("language")) {
      return "🌍 Languages are fascinating! I can tell you about specific languages, grammar rules, translation tips, or help you navigate this translator. Which language would you like to know more about?";
    }
    if (lower.includes("word") || lower.includes("mean") || lower.includes("definition")) {
      return "📖 For word meanings and definitions, try translating the word to English using the translator. You can also type something like 'What does [word] mean?' and I'll try to help with context. What word are you curious about?";
    }
    if (lower.includes("error") || lower.includes("issue") || lower.includes("problem") || lower.includes("not work") || lower.includes("broken")) {
      return "🔧 I'm sorry you're experiencing an issue! Here are some quick fixes:\n• Refresh the page (F5)\n• Try Chrome or Edge for best compatibility\n• For OCR, use a local server (not file://)\n• For Voice, allow microphone permissions\n• Clear browser cache if needed\n\nWhat specific feature is giving you trouble?";
    }
    if (lower.match(/\b(what|why|how|when|where|who|which|can|do|is|are|was|were)\b/)) {
      return `🤔 That's an interesting question! I'm specialized in translation and language assistance. I can help you with:\n• How to use translator features\n• Language tips and facts\n• Grammar explanations\n• Translation best practices\n\nCould you rephrase your question about languages or translation? I'll do my best to help!`;
    }

    // True fallback
    const fallbacks = [
      "🌐 I'm your language assistant! I can help with translation tips, language facts, grammar questions, and navigating this app. What would you like to know?",
      "🤔 I'm not sure I understood that fully, but I'm here to help with languages and translation! Try asking about a specific language, translation feature, or grammar topic.",
      "💬 Interesting! While I specialize in languages and translation, feel free to ask me about any language, grammar rule, or how to use a specific feature of this translator.",
      "🌍 Language is my specialty! Ask me about any of the 100+ supported languages, grammar tips, translation accuracy, or how to use features like Voice Input, OCR, or Grammar Check."
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // ── Type text with animation ──────────────────────────────
  function typeText(element, text, speed = 14) {
    return new Promise(resolve => {
      element.innerHTML = "";
      let i = 0;
      const cursor = document.createElement("span");
      cursor.className = "typing-cursor";
      cursor.textContent = "▋";
      element.appendChild(cursor);

      function next() {
        if (i < text.length) {
          // Handle newline → <br>
          if (text[i] === "\n") {
            cursor.insertAdjacentHTML("beforebegin", "<br>");
          } else {
            cursor.insertAdjacentText("beforebegin", text[i]);
          }
          i++;
          setTimeout(next, speed + Math.random() * 6);
        } else {
          cursor.remove();
          resolve();
        }
      }
      next();
    });
  }

  // ── Append TTS Speak Button ───────────────────────────────
  function appendSpeakButton(wrapper, text) {
    const actions = document.createElement("div");
    actions.className = "chat-bubble-actions";
    
    const speakBtn = document.createElement("button");
    speakBtn.className = "chat-speak-btn";
    speakBtn.title = "Speak response";
    speakBtn.setAttribute("aria-label", "Speak response");
    speakBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
      </svg>
    `;
    
    speakBtn.addEventListener("click", () => {
      if (window.TTS) {
        // Strip markdown and emojis for clean speech
        const cleanText = text
          .replace(/\*\*/g, "")
          .replace(/\*/g, "")
          .replace(/`/g, "")
          .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "");
        window.TTS.speak(cleanText, "en");
      } else {
        showToast("Speech synthesis not available", "error");
      }
    });
    
    actions.appendChild(speakBtn);
    
    const timeEl = wrapper.querySelector(".chat-time");
    if (timeEl) {
      wrapper.insertBefore(actions, timeEl);
    } else {
      wrapper.appendChild(actions);
    }
  }

  // ── Append message bubble ─────────────────────────────────
  function appendMessage(role, content, typing = false) {
    const chatBody = document.getElementById("chatbot-messages");
    if (!chatBody) return null;

    const wrapper = document.createElement("div");
    wrapper.className = `chat-msg chat-${role} anim-slide-up`;

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";

    if (typing) {
      bubble.innerHTML = `<span class="typing-dots"><span></span><span></span><span></span></span>`;
    } else {
      bubble.innerHTML = formatMessage(content);
    }

    wrapper.appendChild(bubble);

    const time = document.createElement("div");
    time.className = "chat-time";
    time.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    wrapper.appendChild(time);

    chatBody.appendChild(wrapper);
    chatBody.scrollTop = chatBody.scrollHeight;

    if (role === "assistant" && !typing && content) {
      appendSpeakButton(wrapper, content);
    }

    return bubble;
  }

  // ── Format message (markdown-lite) ────────────────────────
  function formatMessage(text) {
    return escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br>");
  }

  // ── Send message ──────────────────────────────────────────
  async function sendMessage(userText) {
    if (!userText.trim() || isTyping) return;
    isTyping = true;

    const input   = document.getElementById("chatbot-input");
    const sendBtn = document.getElementById("chatbot-send");
    if (input)   input.value = "";
    if (sendBtn) sendBtn.disabled = true;

    conversationHistory.push({ role: "user", content: userText });
    appendMessage("user", userText);

    // Simulate natural thinking delay
    const thinkingTime = 300 + Math.random() * 500;
    const typingBubble = appendMessage("assistant", "", true);

    await new Promise(r => setTimeout(r, thinkingTime));

    const reply = getResponse(userText);
    conversationHistory.push({ role: "assistant", content: reply });

    if (typingBubble) {
      // Clear typing indicator and type response
      typingBubble.innerHTML = "";
      await typeText(typingBubble, reply);
      
      const wrapper = typingBubble.closest(".chat-msg");
      if (wrapper) {
        appendSpeakButton(wrapper, reply);
      }

      // Automatically speak the response
      if (window.TTS) {
        const cleanText = reply
          .replace(/\*\*/g, "")
          .replace(/\*/g, "")
          .replace(/`/g, "")
          .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "");
        window.TTS.speak(cleanText, "en");
      }
    }

    isTyping = false;
    if (sendBtn) sendBtn.disabled = false;
    if (input) input.focus();

    const chatBody = document.getElementById("chatbot-messages");
    if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
  }

  // ── Clear chat ────────────────────────────────────────────
  function clearChat() {
    conversationHistory = [];
    const chatBody = document.getElementById("chatbot-messages");
    if (chatBody) {
      chatBody.innerHTML = "";
      appendMessage("assistant", "👋 Hi! I'm your AI language assistant. Ask me anything about languages, translations, grammar, or how to use this app!");
    }
  }

  // ── Toggle chatbot panel ──────────────────────────────────
  function toggle() {
    const panel = document.getElementById("chatbot-panel");
    const fab   = document.getElementById("chatbot-fab");
    if (!panel) return;

    const isOpen = panel.classList.toggle("open");
    if (fab) fab.classList.toggle("active", isOpen);

    if (isOpen) {
      const input = document.getElementById("chatbot-input");
      if (input) setTimeout(() => input.focus(), 300);
    }
  }

  // ── Init ─────────────────────────────────────────────────
  function init() {
    const fab      = document.getElementById("chatbot-fab");
    const closeBtn = document.getElementById("chatbot-close");
    const sendBtn  = document.getElementById("chatbot-send");
    const input    = document.getElementById("chatbot-input");
    const clearBtn = document.getElementById("chatbot-clear");

    if (fab)      fab.addEventListener("click", toggle);
    if (closeBtn) closeBtn.addEventListener("click", toggle);
    if (clearBtn) clearBtn.addEventListener("click", clearChat);

    if (sendBtn) {
      sendBtn.addEventListener("click", () => {
        const text = input?.value?.trim();
        if (text) sendMessage(text);
      });
    }

    if (input) {
      input.addEventListener("keydown", e => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          const text = input.value.trim();
          if (text) sendMessage(text);
        }
      });
    }

    clearChat();
  }

  return { init, toggle, sendMessage, clearChat };
})();

window.Chatbot = Chatbot;
