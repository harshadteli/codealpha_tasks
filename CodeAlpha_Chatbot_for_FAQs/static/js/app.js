// Chatbot and Admin State Controller
const state = {
  step: 'ASK_NAME', // ASK_NAME, CHAT, FORM_NAME, FORM_MARKS, FORM_EMAIL
  userName: '',
  selectedLang: 'en',
  theme: 'light',
  isVoiceActive: false,
  formLead: {
    name: '',
    marks: '',
    email: ''
  },
  unansweredAttempts: 0,
  isAdminAuthenticated: false
};

// DOM elements
const el = {
  navChat: document.getElementById('nav-chat'),
  navAdmin: document.getElementById('nav-admin'),
  mobNavChat: document.getElementById('mobile-nav-chat'),
  mobNavAdmin: document.getElementById('mobile-nav-admin'),
  screenChat: document.getElementById('screen-chat'),
  screenAdmin: document.getElementById('screen-admin'),
  
  themeToggle: document.getElementById('theme-toggle'),
  themeIcon: document.getElementById('theme-icon'),
  mobThemeToggle: document.getElementById('mobile-theme-toggle'),
  mobThemeIcon: document.getElementById('mobile-theme-icon'),
  
  chatLang: document.getElementById('chat-lang'),
  chatMessages: document.getElementById('chat-messages'),
  chatInput: document.getElementById('chat-input'),
  chatSend: document.getElementById('chat-send'),
  voiceDictate: document.getElementById('voice-dictate'),
  quickReplyContainer: document.getElementById('quick-reply-container'),
  
  // Admin fields
  statTotalChats: document.getElementById('stat-total-chats'),
  statTotalLeads: document.getElementById('stat-total-leads'),
  statFeedbackPct: document.getElementById('stat-feedback-pct'),
  statTotalUnanswered: document.getElementById('stat-total-unanswered'),
  tableUnanswered: document.getElementById('table-unanswered-body'),
  tableLeads: document.getElementById('table-leads-body'),
  faqGrid: document.getElementById('faq-grid'),
  faqSearch: document.getElementById('faq-search'),
  btnAddFaq: document.getElementById('btn-add-faq'),
  
  // Modal fields
  faqModal: document.getElementById('faq-modal'),
  modalTitle: document.getElementById('modal-title-text'),
  modalClose: document.getElementById('modal-close'),
  formFaqId: document.getElementById('form-faq-id'),
  formQuestion: document.getElementById('form-question'),
  formAnswer: document.getElementById('form-answer'),
  formCategory: document.getElementById('form-category'),
  formKeywords: document.getElementById('form-keywords'),
  formPdf: document.getElementById('form-pdf'),
  faqDetailsForm: document.getElementById('faq-details-form'),

  // Admin Login elements
  adminLoginContainer: document.getElementById('admin-login-container'),
  adminDashboardContainer: document.getElementById('admin-dashboard-container'),
  adminLoginForm: document.getElementById('admin-login-form'),
  adminEmail: document.getElementById('admin-email'),
  adminPassword: document.getElementById('admin-password'),
  loginErrorAlert: document.getElementById('login-error-alert'),
  btnAdminLogout: document.getElementById('btn-admin-logout')
};

// Initial Core Suggestions
const defaultSuggestions = {
  en: ["BTech Fees", "CAP Process", "Hostel Facilities", "Scholarships", "Apply Now"],
  mr: ["बीटेक फी", "प्रवेश प्रक्रिया", "वसतिगृह सुविधा", "शिष्यवृत्ती", "प्रवेश अर्ज करा"],
  hi: ["बीटेक फीस", "प्रवेश प्रक्रिया", "हॉस्टल की सुविधा", "स्कॉलरशिप", "अभी अप्लाई करें"]
};

// Language specific translations for internal system flows
const strings = {
  en: {
    welcome: "Hello! Welcome to DY Patil School of Engineering and Management Kolhapur. I am <b>AI Mitra</b>, your chatbot helper. To personalize our chat, may I know your full name?",
    greetName: "Nice to meet you, {name}! How can I help you with our college details today?",
    formFillerName: "Awesome, let's start the BTech admission form query. Please tell me your <b>Full Name</b>:",
    formFillerMarks: "Got it. What is your <b>12th Board marks percentage</b>?",
    formFillerEmail: "Thank you. Finally, please enter your <b>Email ID</b> so our admissions desk can reach you:",
    formFillerDone: "Thank you, {name}! Your query details have been registered. Here is your pre-filled Admission Form: <a href='{link}' target='_blank' class='pdf-btn' style='display:inline-block; margin-top:5px;'><span class='material-icons' style='vertical-align:middle; font-size:1rem; margin-right:4px;'>link</span>Open Form</a>",
    escalateBtn: "Connect with Counselor on WhatsApp 💬",
    yesEscalate: "Escalate to Admin 🙋‍♂️",
    noThanks: "Ask another question ❌",
    sentToAdmin: "Your query has been logged for our Admissions Admin. We'll update our library! If you need urgent help, contact us directly on WhatsApp.",
    listening: "Listening...",
    dictationError: "Speech recognition error. Please try typing."
  },
  mr: {
    welcome: "नमस्कार! डी. वाय. पाटील स्कूल ऑफ इंजिनिअरिंग अँड मॅनेजमेंट कोल्हापूर मध्ये आपले स्वागत आहे. मी आपला चॅट सहाय्यक <b>AI मित्र</b> आहे. संवाद सुरू करण्यापूर्वी, कृपया आपले पूर्ण नाव सांगाल का?",
    greetName: "तुम्हाला भेटून आनंद झाला, {name}! आज मी तुम्हाला कॉलेज बद्दल काय माहिती देऊ?",
    formFillerName: "उत्तम! बी.टेक प्रवेश माहितीसाठी, कृपया आपले <b>पूर्ण नाव</b> सांगा:",
    formFillerMarks: "ठीक आहे. तुमची <b>१२वी बोर्डाची टक्केवारी (%)</b> किती आहे?",
    formFillerEmail: "धन्यवाद. शेवटी, आपला <b>ईमेल आयडी (Email ID)</b> द्या जेणेकरून आमचा प्रवेश विभाग संपर्क करेल:",
    formFillerDone: "धन्यवाद, {name}! तुमची चौकशी यशस्वीपणे नोंदवली गेली आहे. खालील बटन वर क्लिक करून तुमचा प्री-फिल्ड अर्ज उघडा: <a href='{link}' target='_blank' class='pdf-btn' style='display:inline-block; margin-top:5px;'><span class='material-icons' style='vertical-align:middle; font-size:1rem; margin-right:4px;'>link</span>अर्ज उघडा</a>",
    escalateBtn: "व्हॉट्सॲपवर संपर्क करा 💬",
    yesEscalate: "ॲडमिनला पाठवा 🙋‍♂️",
    noThanks: "दुसरा प्रश्न विचारा ❌",
    sentToAdmin: "तुमचा प्रश्न प्रवेश विभागाच्या प्रशासकांकडे पाठवला गेला आहे. आम्ही लवकरच FAQ अपडेट करू! तात्काळ मदतीसाठी व्हॉट्सॲपवर संपर्क साधा.",
    listening: "ऐकत आहे...",
    dictationError: "आवाज ओळखण्यात अडचण आली. कृपया टाईप करा."
  },
  hi: {
    welcome: "नमस्कार! डी. वाई. पाटील स्कूल ऑफ इंजीनियरिंग एंड मैनेजमेंट कोल्हापुर में आपका स्वागत है। मैं आपका चैट सहायक <b>AI मित्र</b> हूँ। बातचीत शुरू करने से पहले, क्या मैं आपका नाम जान सकता हूँ?",
    greetName: "आपसे मिलकर खुशी हुई, {name}! आज मैं आपको कॉलेज के बारे में क्या जानकारी दे सकता हूँ?",
    formFillerName: "बहुत बढ़िया! बी.टेक प्रवेश पूछताछ के लिए, कृपया अपना <b>पूरा नाम</b> बताएं:",
    formFillerMarks: "ठीक है। आपका <b>12वीं बोर्ड का प्रतिशत (%)</b> कितना है?",
    formFillerEmail: "धन्यवाद। अंत में, कृपया अपना <b>ईमेल आईडी (Email ID)</b> दें ताकि हमारा प्रवेश विभाग आपसे संपर्क कर सके:",
    formFillerDone: "धन्यवाद, {name}! आपकी पूछताछ सफलतापूर्वक दर्ज कर ली गई है। अपना प्री-फिल्ड आवेदन फॉर्म खोलने के लिए यहाँ क्लिक करें: <a href='{link}' target='_blank' class='pdf-btn' style='display:inline-block; margin-top:5px;'><span class='material-icons' style='vertical-align:middle; font-size:1rem; margin-right:4px;'>link</span>फॉर्म खोलें</a>",
    escalateBtn: "WhatsApp पर काउंसलर से बात करें 💬",
    yesEscalate: "एडमिन को भेजें 🙋‍♂️",
    noThanks: "दूसरा प्रश्न पूछें ❌",
    sentToAdmin: "आपका प्रश्न प्रवेश एडमिन के पास भेज दिया गया है। हम जल्द ही इसका उत्तर अपडेट करेंगे! तत्काल सहायता के लिए हमें WhatsApp पर संपर्क करें.",
    listening: "सुन रहा हूँ...",
    dictationError: "आवाज पहचानने में समस्या हुई. कृपया टाइप करें."
  }
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  // Check admin login session
  state.isAdminAuthenticated = !!sessionStorage.getItem('adminToken');

  setupNavigation();
  setupTheme();
  setupChat();
  setupVoice();
  setupAdmin();
  
  // Show welcome message
  setTimeout(() => {
    appendBotMessage(strings[state.selectedLang].welcome);
    renderQuickReplies();
  }, 500);
});

// 1. Navigation Controller
function setupNavigation() {
  const switchScreen = (screenName) => {
    if (screenName === 'chat') {
      el.navChat.classList.add('active');
      el.navAdmin.classList.remove('active');
      el.mobNavChat.classList.add('active');
      el.mobNavAdmin.classList.remove('active');
      el.screenChat.classList.add('active');
      el.screenAdmin.classList.remove('active');
    } else {
      el.navChat.classList.remove('active');
      el.navAdmin.classList.add('active');
      el.mobNavChat.classList.remove('active');
      el.mobNavAdmin.classList.add('active');
      el.screenChat.classList.remove('active');
      el.screenAdmin.classList.add('active');
      
      if (state.isAdminAuthenticated) {
        el.adminLoginContainer.style.display = 'none';
        el.adminDashboardContainer.style.display = 'flex';
        loadAdminDashboardData();
      } else {
        el.adminLoginContainer.style.display = 'flex';
        el.adminDashboardContainer.style.display = 'none';
      }
    }
  };

  el.navChat.addEventListener('click', () => switchScreen('chat'));
  el.navAdmin.addEventListener('click', () => switchScreen('admin'));
  el.mobNavChat.addEventListener('click', (e) => { e.preventDefault(); switchScreen('chat'); });
  el.mobNavAdmin.addEventListener('click', (e) => { e.preventDefault(); switchScreen('admin'); });
}

// 2. Theme Control (Light/Dark Toggle)
function setupTheme() {
  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    state.theme = newTheme;
    
    const iconName = newTheme === 'dark' ? 'light_mode' : 'dark_mode';
    const textLabel = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    
    el.themeIcon.innerText = iconName;
    el.themeToggle.querySelector('span').innerText = textLabel;
    el.mobThemeIcon.innerText = iconName;
    
    localStorage.setItem('theme', newTheme);
  };

  el.themeToggle.addEventListener('click', toggleTheme);
  el.mobThemeToggle.addEventListener('click', (e) => { e.preventDefault(); toggleTheme(); });

  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    state.theme = 'dark';
    el.themeIcon.innerText = 'light_mode';
    el.themeToggle.querySelector('span').innerText = 'Light Mode';
    el.mobThemeIcon.innerText = 'light_mode';
  }
}

// 3. Chat Logic
function setupChat() {
  // Lang change handler
  el.chatLang.addEventListener('change', (e) => {
    state.selectedLang = e.target.value;
    // Clear and restart conversation messages or simply re-greet
    appendBotMessage(`Language changed. ${strings[state.selectedLang].welcome}`);
    renderQuickReplies();
  });

  // Message Send event
  const sendMessage = () => {
    const message = el.chatInput.value.trim();
    if (!message) return;
    
    appendUserMessage(message);
    el.chatInput.value = '';
    
    processMessage(message);
  };

  el.chatSend.addEventListener('click', sendMessage);
  el.chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

function renderQuickReplies(customList = null) {
  el.quickReplyContainer.innerHTML = '';
  const replies = customList || defaultSuggestions[state.selectedLang];
  
  replies.forEach(replyText => {
    const chip = document.createElement('button');
    chip.className = 'suggested-chip';
    chip.innerText = replyText;
    chip.addEventListener('click', () => {
      appendUserMessage(replyText);
      processMessage(replyText);
    });
    el.quickReplyContainer.appendChild(chip);
  });
}

function appendUserMessage(text) {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const html = `
    <div class="message user">
      <div class="message-bubble">${text}</div>
      <div class="message-meta">${timestamp}</div>
    </div>
  `;
  el.chatMessages.insertAdjacentHTML('beforeend', html);
  scrollToBottom();
}

function appendBotMessage(text, metaHtml = '') {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const messageId = 'bot-' + Date.now();
  
  const html = `
    <div class="message bot" id="${messageId}">
      <div class="message-bubble">${text}</div>
      <div class="message-meta">
        ${timestamp} 
        <span class="material-icons" style="font-size:1rem; cursor:pointer; vertical-align:middle; margin-left:8px;" onclick="speakText('${messageId}')" title="Listen text">volume_up</span>
        ${metaHtml}
      </div>
    </div>
  `;
  el.chatMessages.insertAdjacentHTML('beforeend', html);
  scrollToBottom();
  
  // Automatically speak the bot response aloud
  setTimeout(() => {
    speakText(messageId);
  }, 100);
  
  return messageId;
}

function appendTypingIndicator() {
  const html = `
    <div class="message bot" id="typing-indicator">
      <div class="message-bubble">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    </div>
  `;
  el.chatMessages.insertAdjacentHTML('beforeend', html);
  scrollToBottom();
}

function removeTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) indicator.remove();
}

function scrollToBottom() {
  el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
}

// Smart Form Filler and Query Flow
function processMessage(message) {
  // Trigger Form Flow
  const lowMsg = message.toLowerCase();
  
  // 1. Initial State: Registering User Name
  if (state.step === 'ASK_NAME') {
    state.userName = message;
    state.step = 'CHAT';
    const greet = strings[state.selectedLang].greetName.replace('{name}', message);
    setTimeout(() => {
      appendBotMessage(greet);
    }, 600);
    return;
  }
  
  // Check triggers for applying
  if (state.step === 'CHAT' && (lowMsg.includes('apply') || lowMsg.includes('admission form') || lowMsg.includes('प्रवेश अर्ज') || lowMsg.includes('दाखिला'))) {
    state.step = 'FORM_NAME';
    setTimeout(() => {
      appendBotMessage(strings[state.selectedLang].formFillerName);
    }, 600);
    return;
  }
  
  // 2. Smart Form Filler State Machine
  if (state.step === 'FORM_NAME') {
    state.formLead.name = message;
    state.step = 'FORM_MARKS';
    setTimeout(() => {
      appendBotMessage(strings[state.selectedLang].formFillerMarks);
    }, 600);
    return;
  }
  
  if (state.step === 'FORM_MARKS') {
    // Validate marks percentage
    const pct = parseFloat(message.replace('%', '').trim());
    if (isNaN(pct) || pct < 0 || pct > 100) {
      setTimeout(() => {
        appendBotMessage(state.selectedLang === 'mr' ? "कृपया वैध टक्केवारी प्रविष्ट करा (० ते १००):" : "Please enter a valid percentage (0 to 100):");
      }, 600);
      return;
    }
    state.formLead.marks = pct;
    state.step = 'FORM_EMAIL';
    setTimeout(() => {
      appendBotMessage(strings[state.selectedLang].formFillerEmail);
    }, 600);
    return;
  }
  
  if (state.step === 'FORM_EMAIL') {
    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(message)) {
      setTimeout(() => {
        appendBotMessage(state.selectedLang === 'mr' ? "कृपया वैध ईमेल आयडी प्रविष्ट करा:" : "Please enter a valid email address:");
      }, 600);
      return;
    }
    state.formLead.email = message;
    state.step = 'CHAT';
    
    appendTypingIndicator();
    // Submit Lead to Backend
    fetch('/api/submit_lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state.formLead)
    })
    .then(res => res.json())
    .then(data => {
      removeTypingIndicator();
      const preFilledForm = `https://docs.google.com/forms/d/e/1FAIpQLSc-nDYPatilAdmissionKolhapur/viewform?entry.1000001=${encodeURIComponent(state.formLead.name)}&entry.1000002=${state.formLead.marks}&entry.1000003=${encodeURIComponent(state.formLead.email)}`;
      const completed = strings[state.selectedLang].formFillerDone
                          .replace('{name}', state.formLead.name)
                          .replace('{link}', preFilledForm);
      appendBotMessage(completed);
      renderQuickReplies();
    })
    .catch(err => {
      removeTypingIndicator();
      console.error(err);
      appendBotMessage("Form saved locally! Let's resume.");
      renderQuickReplies();
    });
    return;
  }

  // 3. General FAQ API Querying
  appendTypingIndicator();
  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: message,
      userName: state.userName,
      lang: state.selectedLang
    })
  })
  .then(res => res.json())
  .then(data => {
    removeTypingIndicator();
    
    let responseText = data.answer;
    let extraMeta = '';
    
    // Add PDF download link button if present
    if (data.pdf_url) {
      const pdfLabel = state.selectedLang === 'mr' ? 'माहिती पुस्तिका (PDF)' : (state.selectedLang === 'hi' ? 'विवरणिका (PDF)' : 'Download PDF Prospectus');
      extraMeta += `<div class="extra-options"><a href="${data.pdf_url}" target="_blank" class="pdf-btn"><span class="material-icons" style="font-size:1.1rem; vertical-align:middle;">download</span>${pdfLabel}</a></div>`;
    }

    if (data.status === 'success') {
      state.unansweredAttempts = 0; // reset
      
      // Feedbacks thumb up/down buttons
      const feedbackId = data.faq_id;
      const feedbackMeta = `
        <div class="feedback-buttons">
          <button class="feedback-btn" onclick="submitFeedback(${feedbackId}, '${message}', 'up', this)">👍 Useful</button>
          <button class="feedback-btn" onclick="submitFeedback(${feedbackId}, '${message}', 'down', this)">👎 Not Useful</button>
        </div>
      `;
      
      appendBotMessage(responseText + extraMeta, feedbackMeta);
      
      // Show Related Questions as chips
      if (data.related && data.related.length > 0) {
        const relatedChips = data.related.map(r => r.question);
        renderQuickReplies(relatedChips);
      }
    } else {
      // Unanswered state handling
      state.unansweredAttempts++;
      
      // If low match confidence, offer escalation or Whatsapp connection
      let subButtons = `
        <div class="feedback-buttons" style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
          <button class="action-btn" onclick="escalateToAdmin(${data.unanswered_id}, '${message}', this)">🙋‍♂️ ${strings[state.selectedLang].yesEscalate}</button>
        </div>
      `;
      
      // 2 times failure -> direct Human escalation WhatsApp link
      if (state.unansweredAttempts >= 2) {
        const waText = encodeURIComponent(`Hello DYP-SEM Admissions Cell, I am ${state.userName}. I had a question about the college: "${message}". Can you please guide me?`);
        const waLink = `https://wa.me/912312601431?text=${waText}`;
        subButtons += `
          <div style="margin-top:10px;">
            <a href="${waLink}" target="_blank" class="pdf-btn" style="background-color:#25d366;"><span class="material-icons" style="vertical-align:middle; margin-right:4px;">chat</span>${strings[state.selectedLang].escalateBtn}</a>
          </div>
        `;
      }
      
      appendBotMessage(responseText, subButtons);
    }
  })
  .catch(err => {
    removeTypingIndicator();
    console.error(err);
    appendBotMessage("Connection to chatbot assistant failed. Please try again.");
  });
}

// 4. Feedback Mechanism
function submitFeedback(faqId, queryText, score, btn) {
  fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      faq_id: faqId,
      query: queryText,
      feedback: score
    })
  })
  .then(res => res.json())
  .then(data => {
    // Disable other buttons
    const parent = btn.parentElement;
    parent.innerHTML = `<span style="font-size:0.8rem; color:var(--success); font-weight:500;">✓ Feedback recorded! Thanks.</span>`;
  });
}

function escalateToAdmin(unansweredId, queryText, btn) {
  // Let the user know it is sent
  btn.disabled = true;
  btn.innerText = "Sent!";
  
  // Show message in chat
  setTimeout(() => {
    appendBotMessage(strings[state.selectedLang].sentToAdmin);
    renderQuickReplies();
  }, 500);
}

// 5. Voice Chat Web Speech API implementation
function setupVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    el.voiceDictate.style.display = 'none'; // Speech synthesis is usually supported even if recognition is not
    return;
  }
  
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    state.isVoiceActive = true;
    el.voiceDictate.classList.add('recording');
    el.chatInput.placeholder = strings[state.selectedLang].listening;
  };

  recognition.onerror = (e) => {
    console.error("Speech Recognition Error:", e);
    appendBotMessage(strings[state.selectedLang].dictationError);
    stopRecording();
  };

  recognition.onend = () => {
    stopRecording();
  };

  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    el.chatInput.value = transcript;
    
    // Auto-send voice queries
    appendUserMessage(transcript);
    processMessage(transcript);
    el.chatInput.value = '';
  };

  const stopRecording = () => {
    state.isVoiceActive = false;
    el.voiceDictate.classList.remove('recording');
    el.chatInput.placeholder = "Type a message or click mic...";
  };

  el.voiceDictate.addEventListener('click', () => {
    if (state.isVoiceActive) {
      recognition.stop();
    } else {
      // Map selector language to Voice recognition locale
      const localeMap = { 'en': 'en-US', 'mr': 'mr-IN', 'hi': 'hi-IN' };
      recognition.lang = localeMap[state.selectedLang] || 'en-US';
      recognition.start();
    }
  });
}

// Voice Text-to-Speech Output
function speakText(messageBubbleId) {
  const speechBubble = document.getElementById(messageBubbleId);
  if (!speechBubble) return;
  
  // Get text without the meta/volume icon
  const bubbleText = speechBubble.querySelector('.message-bubble').innerText;
  
  // Cancel current voice playing
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(bubbleText);
  
  // Select matching voice based on selected language
  const localeMap = { 'en': 'en-US', 'mr': 'mr-IN', 'hi': 'hi-IN' };
  const targetLocale = localeMap[state.selectedLang];
  
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(voice => voice.lang.includes(targetLocale));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }
  utterance.lang = targetLocale;
  
  window.speechSynthesis.speak(utterance);
}

// 6. Admin Panel Control Dashboard
function setupAdmin() {
  // Load and search trigger
  el.faqSearch.addEventListener('input', (e) => {
    filterFAQs(e.target.value);
  });

  // Modal actions
  el.btnAddFaq.addEventListener('click', () => {
    openFAQModal();
  });
  
  el.modalClose.addEventListener('click', () => {
    el.faqModal.classList.remove('active');
  });

  // Modal Submit
  el.faqDetailsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveFAQ();
  });

  // Admin Login Form Submit
  el.adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = el.adminEmail.value.trim();
    const password = el.adminPassword.value.trim();
    
    el.loginErrorAlert.style.display = 'none';
    
    fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(err => { throw new Error(err.message || 'Login failed'); });
      }
      return res.json();
    })
    .then(data => {
      sessionStorage.setItem('adminToken', data.token);
      state.isAdminAuthenticated = true;
      el.adminLoginContainer.style.display = 'none';
      el.adminDashboardContainer.style.display = 'flex';
      loadAdminDashboardData();
    })
    .catch(err => {
      el.loginErrorAlert.innerText = err.message;
      el.loginErrorAlert.style.display = 'block';
    });
  });

  // Admin Logout click
  el.btnAdminLogout.addEventListener('click', () => {
    sessionStorage.removeItem('adminToken');
    state.isAdminAuthenticated = false;
    el.adminLoginContainer.style.display = 'flex';
    el.adminDashboardContainer.style.display = 'none';
  });
}

function loadAdminDashboardData() {
  fetch('/api/admin/dashboard')
  .then(res => res.json())
  .then(data => {
    // Populate counts
    el.statTotalChats.innerText = data.total_chats;
    el.statTotalLeads.innerText = data.total_leads;
    el.statFeedbackPct.innerText = `${data.feedback_pct}%`;
    el.statTotalUnanswered.innerText = data.unanswered.length;

    // Render unanswered table
    el.tableUnanswered.innerHTML = '';
    if (data.unanswered.length === 0) {
      el.tableUnanswered.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted)">All queries answered!</td></tr>`;
    } else {
      data.unanswered.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${escapeHtml(item.query)}</td>
          <td><span class="badge lang">${item.lang}</span></td>
          <td><button class="action-btn" onclick="openFAQAnswerModal(${item.id}, '${escapeHtml(item.english_query)}')">Answer</button></td>
        `;
        el.tableUnanswered.appendChild(row);
      });
    }

    // Render leads table
    el.tableLeads.innerHTML = '';
    if (data.leads.length === 0) {
      el.tableLeads.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted)">No inquiries yet.</td></tr>`;
    } else {
      data.leads.forEach(lead => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td style="font-weight:600;">${escapeHtml(lead.name)}</td>
          <td>${lead.marks}%</td>
          <td><a href="mailto:${lead.email}" style="color:var(--primary-color);">${escapeHtml(lead.email)}</a></td>
        `;
        el.tableLeads.appendChild(row);
      });
    }

    // Render all FAQs
    loadFAQsList();
  });
}

function loadFAQsList() {
  fetch('/api/admin/faqs')
  .then(res => res.json())
  .then(faqs => {
    window.faqsList = faqs; // save globally
    renderFAQGrid(faqs);
  });
}

function renderFAQGrid(faqs) {
  el.faqGrid.innerHTML = '';
  if (faqs.length === 0) {
    el.faqGrid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:30px; color:var(--text-muted)">No FAQs matching search.</div>`;
    return;
  }
  
  faqs.forEach(faq => {
    const card = document.createElement('div');
    card.className = 'faq-item-card';
    card.innerHTML = `
      <div>
        <div class="faq-item-question">${escapeHtml(faq.question)}</div>
        <div class="faq-item-answer">${escapeHtml(faq.answer)}</div>
      </div>
      <div class="faq-item-meta">
        <span class="faq-item-category">${faq.category}</span>
        <div class="faq-card-actions">
          <button class="faq-card-btn" onclick="openFAQEditModal(${faq.id})" title="Edit"><span class="material-icons" style="font-size:1.15rem;">edit</span></button>
          <button class="faq-card-btn delete" onclick="deleteFAQ(${faq.id})" title="Delete"><span class="material-icons" style="font-size:1.15rem;">delete</span></button>
        </div>
      </div>
    `;
    el.faqGrid.appendChild(card);
  });
}

function filterFAQs(queryText) {
  if (!window.faqsList) return;
  const filtered = window.faqsList.filter(faq => 
    faq.question.toLowerCase().includes(queryText.toLowerCase()) || 
    faq.answer.toLowerCase().includes(queryText.toLowerCase()) || 
    faq.category.toLowerCase().includes(queryText.toLowerCase())
  );
  renderFAQGrid(filtered);
}

// FAQ Modal Management
function openFAQModal() {
  el.modalTitle.innerText = "Add New FAQ";
  el.formFaqId.value = '';
  el.formQuestion.value = '';
  el.formAnswer.value = '';
  el.formCategory.value = 'General';
  el.formKeywords.value = '';
  el.formPdf.value = '';
  el.faqModal.classList.add('active');
}

function openFAQEditModal(faqId) {
  const faq = window.faqsList.find(f => f.id === faqId);
  if (!faq) return;

  el.modalTitle.innerText = "Edit FAQ";
  el.formFaqId.value = faq.id;
  el.formQuestion.value = faq.question;
  el.formAnswer.value = faq.answer;
  el.formCategory.value = faq.category || 'General';
  el.formKeywords.value = (faq.keywords || []).join(', ');
  el.formPdf.value = faq.pdf_url || '';
  el.faqModal.classList.add('active');
}

function openFAQAnswerModal(unansweredId, englishQuery) {
  // Answer an unanswered user question directly, converting it to an FAQ
  el.modalTitle.innerText = "Answer User Question";
  el.formFaqId.value = 'UNANSWERED_' + unansweredId;
  el.formQuestion.value = englishQuery;
  el.formAnswer.value = '';
  el.formCategory.value = 'General';
  el.formKeywords.value = '';
  el.formPdf.value = '';
  el.faqModal.classList.add('active');
}

function saveFAQ() {
  const idVal = el.formFaqId.value;
  const payload = {
    question: el.formQuestion.value.trim(),
    answer: el.formAnswer.value.trim(),
    category: el.formCategory.value,
    keywords: el.formKeywords.value,
    pdf_url: el.formPdf.value.trim()
  };

  let url = '/api/admin/faqs';
  let method = 'POST';

  if (idVal.startsWith('UNANSWERED_')) {
    const unansweredId = parseInt(idVal.split('_')[1]);
    url = '/api/admin/resolve_unanswered';
    payload.id = unansweredId;
  } else if (idVal) {
    url = `/api/admin/faqs/${idVal}`;
    method = 'PUT';
  }

  fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    el.faqModal.classList.remove('active');
    loadAdminDashboardData();
  });
}

function deleteFAQ(faqId) {
  if (!confirm("Are you sure you want to delete this FAQ?")) return;
  
  fetch(`/api/admin/faqs/${faqId}`, { method: 'DELETE' })
  .then(res => res.json())
  .then(data => {
    loadAdminDashboardData();
  });
}

// Utilities
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
