# AI Mitra - DY Patil College FAQ Chatbot & Admin Dashboard

**AI Mitra** is an intelligent, multilingual FAQ Chatbot built for **D. Y. Patil School of Engineering and Management (Kasba Bavda, Kolhapur)**. It provides automated answers to student inquiries regarding admissions, fee structure, scholarships, hostels, placements, and campus facilities. It also features a fully-featured, secure Admin Analytics Control Center to track usage, monitor leads, and update FAQs in real time.

Visit at https://dypsemai2.onrender.com/

---

## 🚀 Key Features

*   **Multilingual Support (Marathi / Hindi / English)**: Automatically detects query language. Non-English queries are translated to English on-the-fly for high-accuracy semantic matching, and the answers are translated back into the user's language.
*   **Lightweight NLP Engine**: Built with a pure-Python TF-IDF vectorizer and Cosine Similarity matcher powered by `NLTK` tokenization. Implements custom **Keyword-Overlap Boosting** to prioritize topics like "fees" or "hostels" instantly.
*   **Smart Form Filler**: Guides prospective students through an interactive B.Tech application process inside the chat (asking for Name, 12th Board marks, and Email) and generates a pre-filled Google Form link.
*   **Voice Dictation & Text-to-Speech**: Integrated native browser **Web Speech API** allowing students to speak queries (with speech-to-text) and listen to replies (via volume playback icons).
*   **Google Material Light Theme**: A fully responsive, modern UI built with custom CSS variables, hover micro-animations, and full **Dark Mode** toggle support.
*   **Admin Dashboard Control Panel**:
    *   **Analytics metrics**: View query counts, lead conversions, and user thumbs-up/down ratings.
    *   **Unresolved query capture**: Low confidence queries (score < 0.3) are saved in the inbox so admins can review and add answers instantly.
    *   **Interactive CRUD**: Full dashboard grid to search, add, edit, or delete FAQs on the fly.
    *   **Leads Collector**: Visual table showing student inquiry details.
*   **Secure Authentication**: Secured dashboard view requiring login details.

---

## 🛠️ Technologies Used

### Frontend (User Interface)
*   **HTML5 / ES6 JavaScript**: Layout structure and conversational state machine logic.
*   **Vanilla CSS3 (Responsive Grid/Flexbox)**: Google Light theme UI with CSS Variables, Dark Theme toggles, and screen-fit layouts.
*   **Web Speech API**: Real-time browser voice transcription and synthesis.
*   **Google Material Design Icons**: High-quality vectors for control states.

### Backend (Server)
*   **Python (Flask)**: Serves static files, routes chat requests, and handles Admin CRUD API requests.
*   **Gunicorn**: Production-grade WSGI server for cloud deployment.

### Natural Language Processing (NLP) & Translation
*   **NLTK (Natural Language Toolkit)**: Natural language tokenizer, stopword cleaner, and lemmatizer.
*   **Custom Vectorizer**: Pure-Python TF-IDF and Cosine Similarity calculation.
*   **Googletrans (`googletrans==4.0.0-rc1`)**: Lightweight multi-language detection and translation.

### Database
*   **JSON file databases**: Fast, edit-friendly databases (`faqs.json` for FAQ data, and `analytics.json` for leads, feedbacks, and queries logs).

---

## 📂 Project Structure

```text
├── app.py                  # Flask backend server containing NLP & translation logic
├── faqs.json               # Prepopulated FAQs dataset (JSON format)
├── analytics.json          # Analytics tracker (queries, feedbacks, leads logs)
├── requirements.txt        # Python package dependencies
├── README.md               # Project documentation
├── templates/
│   └── index.html          # Chatbot & Admin Dashboard HTML markup
└── static/
    ├── css/
    │   └── style.css       # Responsive Google Light/Dark Theme CSS
    └── js/
        └── app.js          # Chat controller, Web Speech, and Admin CRUD JS
```

---

## ⚙️ Local Installation & Setup

1.  **Clone the project directory** and navigate inside it.
2.  **Install Python dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
3.  **Start the local development server**:
    ```bash
    python app.py
    ```
4.  **Access the application**:
    Open your browser and navigate to: **[http://127.0.0.1:5000/](http://127.0.0.1:5000/)**



## ☁️ Deploying to Render.com

Render is a free cloud platform perfect for hosting this application.

1.  Push your code to a repository on **GitHub**.
2.  Log in to **[Render.com](https://render.com/)** and click **New +** $\rightarrow$ **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the following settings:
    *   **Language**: `Python`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `gunicorn app:app`
    *   **Instance Type**: `Free`
5.  Click **Deploy Web Service**. Render will install dependencies and start your live chatbot!
