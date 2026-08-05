// ============================================================
//  AI Smart Translator — Image OCR Module (Tesseract.js)
// ============================================================

const ImageOCR = (() => {
  let worker = null;

  async function getWorker() {
    if (worker) return worker;
    // Tesseract is loaded via CDN in index.html
    if (!window.Tesseract) {
      showToast("OCR library not loaded yet. Please wait.", "warning");
      return null;
    }
    showToast("Initializing OCR engine…", "info", 2000);
    try {
      worker = await Tesseract.createWorker("eng", 1, {
        workerBlobURL: true, // Enables Blob URLs to bypass same-origin worker blocks on local servers
        logger: m => {
          const prog = document.getElementById("ocr-progress");
          if (prog && m.progress !== undefined) {
            prog.style.width = (m.progress * 100).toFixed(0) + "%";
          }
        },
      });
      return worker;
    } catch (err) {
      console.error("Failed to initialize Tesseract Worker:", err);
      showToast("Could not start local OCR engine. Run app on a local server.", "error", 5000);
      return null;
    }
  }

  // ── Recognize text from image ─────────────────────────────
  async function recognize(imageSource) {
    const w = await getWorker();
    if (!w) return null;

    const progressBar = document.getElementById("ocr-progress-wrap");
    const prog        = document.getElementById("ocr-progress");
    if (progressBar) progressBar.style.display = "block";
    if (prog)        prog.style.width = "0%";

    try {
      const result = await w.recognize(imageSource);
      if (progressBar) progressBar.style.display = "none";
      return result.data.text;
    } catch (err) {
      console.error("OCR error:", err);
      showToast("OCR failed: " + err.message, "error");
      if (progressBar) progressBar.style.display = "none";
      return null;
    }
  }

  // ── Handle file upload ────────────────────────────────────
  async function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      showToast("Please upload a valid image file", "warning");
      return;
    }

    // Preview
    const preview = document.getElementById("ocr-preview");
    if (preview) {
      preview.src = URL.createObjectURL(file);
      preview.style.display = "block";
    }

    showToast("Extracting text from image…", "info", 3000);
    const text = await recognize(file);

    if (text) {
      const srcTxt = document.getElementById("source-text");
      if (srcTxt) {
        srcTxt.value = text.trim();
        if (window.updateCounter) window.updateCounter();
        showToast("Text extracted! You can now translate it.", "success");

        // Switch to translator tab
        const transTab = document.querySelector('[data-tab="translator"]');
        if (transTab) transTab.click();
      }
    }
  }

  // ── Init ─────────────────────────────────────────────────
  function init() {
    const fileInput   = document.getElementById("image-upload");
    const uploadArea  = document.getElementById("upload-area");
    const pasteBtn    = document.getElementById("paste-image-btn");

    if (fileInput) {
      fileInput.addEventListener("change", e => {
        if (e.target.files[0]) handleFile(e.target.files[0]);
      });
    }

    if (uploadArea) {
      uploadArea.addEventListener("click", () => fileInput?.click());

      // Drag & drop
      uploadArea.addEventListener("dragover", e => {
        e.preventDefault();
        uploadArea.classList.add("drag-over");
      });
      uploadArea.addEventListener("dragleave", () => uploadArea.classList.remove("drag-over"));
      uploadArea.addEventListener("drop", e => {
        e.preventDefault();
        uploadArea.classList.remove("drag-over");
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      });
    }

    // Paste from clipboard
    if (pasteBtn) {
      pasteBtn.addEventListener("click", async () => {
        try {
          const items = await navigator.clipboard.read();
          for (const item of items) {
            const imageType = item.types.find(t => t.startsWith("image/"));
            if (imageType) {
              const blob = await item.getType(imageType);
              handleFile(blob);
              return;
            }
          }
          showToast("No image found in clipboard", "warning");
        } catch {
          showToast("Clipboard access denied or no image found", "warning");
        }
      });
    }
  }

  return { init, recognize, handleFile };
})();

window.ImageOCR = ImageOCR;
