// ============================================================
//  AI Smart Translator — AI Summary Module
//  Uses extractive summarization — no API, no login needed
// ============================================================

const AISummary = (() => {

  // ── Extractive Summarization (TF-IDF inspired sentence scoring)
  function extractiveSummarize(text, maxSentences = 2) {
    if (!text || text.trim().length < 30) return text;

    // Split into sentences
    const sentenceRegex = /[^.!?]+[.!?]+/g;
    const sentences = text.match(sentenceRegex) || [text];

    if (sentences.length <= maxSentences) {
      return sentences.join(" ").trim();
    }

    // Build word frequency table (excluding stopwords)
    const stopWords = new Set([
      "the","a","an","and","or","but","in","on","at","to","for",
      "of","with","by","from","as","is","was","are","were","be",
      "been","being","have","has","had","do","does","did","will",
      "would","could","should","may","might","shall","can","need",
      "this","that","these","those","i","you","he","she","it","we",
      "they","my","your","his","her","its","our","their","which",
      "who","whom","what","when","where","how","why","not","no","so",
      "if","then","than","also","just","more","some","any","all",
      "each","both","few","many","much","other","same","own","about"
    ]);

    const wordFreq = {};
    const allWords = text.toLowerCase().match(/\b\w+\b/g) || [];
    allWords.forEach(word => {
      if (!stopWords.has(word) && word.length > 2) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Normalize frequencies
    const maxFreq = Math.max(...Object.values(wordFreq), 1);
    Object.keys(wordFreq).forEach(w => { wordFreq[w] /= maxFreq; });

    // Score each sentence
    const scored = sentences.map((sentence, index) => {
      const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
      const score = words.reduce((sum, w) => sum + (wordFreq[w] || 0), 0) / Math.max(words.length, 1);
      // Boost first and last sentences (they tend to be topic-defining)
      const positionBoost = (index === 0 || index === sentences.length - 1) ? 0.1 : 0;
      return { sentence: sentence.trim(), score: score + positionBoost, index };
    });

    // Pick top sentences by score, then reorder by original position
    const topSentences = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSentences)
      .sort((a, b) => a.index - b.index)
      .map(s => s.sentence);

    return topSentences.join(" ");
  }

  // ── Format summary with key highlights ────────────────────
  function buildSummaryHTML(originalText, summaryText) {
    const wordCount = originalText.trim().split(/\s+/).length;
    const summaryWordCount = summaryText.trim().split(/\s+/).length;
    const compressionRatio = Math.round((1 - summaryWordCount / wordCount) * 100);

    return `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <span style="font-size:22px">📝</span>
        <strong style="font-size:16px;color:var(--primary)">AI Summary</strong>
        <span style="margin-left:auto;font-size:12px;background:var(--primary);color:#fff;padding:2px 8px;border-radius:12px;">${compressionRatio > 0 ? compressionRatio + "% shorter" : "Concise"}</span>
      </div>
      <p style="line-height:1.7;color:var(--text-primary);margin:0 0 12px 0;">${escapeHtml(summaryText)}</p>
      <div style="font-size:12px;color:var(--text-muted);display:flex;gap:16px;border-top:1px solid var(--border);padding-top:10px;">
        <span>Original: <strong>${wordCount} words</strong></span>
        <span>Summary: <strong>${summaryWordCount} words</strong></span>
        <span>Method: <strong>Extractive AI</strong></span>
      </div>`;
  }

  // ── Main summarize function ────────────────────────────────
  async function summarize(text) {
    if (!text || !text.trim()) {
      showToast("Translate something first before summarizing", "warning");
      return;
    }
    if (text.trim().split(/\s+/).length < 15) {
      showToast("Text is too short to summarize. Translate a longer text!", "warning");
      return;
    }

    const btn   = document.getElementById("summary-btn");
    const panel = document.getElementById("summary-result");

    if (btn) { btn.disabled = true; btn.textContent = "Summarizing…"; }
    if (panel) { panel.classList.add("skeleton"); panel.innerHTML = ""; }

    // Small delay for UX feel
    await new Promise(r => setTimeout(r, 400));

    try {
      const summary = extractiveSummarize(text, 2);
      if (panel) {
        panel.classList.remove("skeleton");
        panel.innerHTML = buildSummaryHTML(text, summary);
      }

      // Also show the summary section inline on translator tab
      const summarySection = document.getElementById("summary-section");
      if (summarySection) {
        summarySection.style.display = "block";
        const inlineResult = document.getElementById("summary-result");
        if (!inlineResult || inlineResult === panel) {
          // Already the same element, no duplication needed
        }
      }
    } catch (err) {
      console.error("Summary error:", err);
      showToast("Summary failed: " + err.message, "error");
      if (panel) { panel.classList.remove("skeleton"); panel.innerHTML = ""; }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "AI Summary"; }
    }
  }

  // ── Init ─────────────────────────────────────────────────
  function init() {
    // Wire ALL summary buttons (may appear on translator tab and summary tab)
    document.querySelectorAll("#summary-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        // Try translated text first, then source text
        const translatedText = document.getElementById("translated-text")?.value || "";
        const sourceText = document.getElementById("source-text")?.value || "";
        const text = translatedText.trim() || sourceText.trim();
        summarize(text);
      });
    });
  }

  return { init, summarize };
})();

window.AISummary = AISummary;
