import os
import json
import re
import math
import collections
from datetime import datetime
from flask import Flask, request, jsonify, render_template, send_from_directory
from deep_translator import GoogleTranslator
import nltk
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords

# Ensure NLTK data is downloaded
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)
try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet', quiet=True)
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

app = Flask(__name__, template_folder='templates', static_folder='static')

# Create necessary directories
os.makedirs('templates', exist_ok=True)
os.makedirs('static/css', exist_ok=True)
os.makedirs('static/js', exist_ok=True)

# deep-translator does not require a persistent instance

class NLPProcessor:
    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()
        try:
            self.stop_words = set(stopwords.words('english'))
            # Retain question words to improve matching for short intent-based queries
            question_words = {'where', 'how', 'when', 'who', 'why', 'what', 'which', 'many', 'much'}
            self.stop_words = self.stop_words - question_words
        except Exception:
            self.stop_words = set()

    def tokenize_and_clean(self, text):
        # Convert to lowercase and remove non-alphanumeric characters
        text = re.sub(r'[^\w\s]', '', text.lower())
        try:
            tokens = word_tokenize(text)
        except Exception:
            tokens = text.split()
        
        # Lemmatize and remove stopwords
        cleaned_tokens = []
        for token in tokens:
            if token not in self.stop_words:
                try:
                    lemma = self.lemmatizer.lemmatize(token)
                except Exception:
                    lemma = token
                cleaned_tokens.append(lemma)
        return cleaned_tokens

class CustomTFIDFMatcher:
    def __init__(self, faq_file='faqs.json'):
        self.faq_file = faq_file
        self.processor = NLPProcessor()
        self.faqs = []
        self.idf = {}
        self.faq_vectors = []
        self.load_and_fit()

    def load_and_fit(self):
        if not os.path.exists(self.faq_file):
            self.faqs = []
            return
            
        with open(self.faq_file, 'r', encoding='utf-8') as f:
            self.faqs = json.load(f)
            
        if not self.faqs:
            return

        # Prepare tokens for each FAQ (using question + category + keywords)
        docs_tokens = []
        for faq in self.faqs:
            combined_text = faq['question'] + " " + faq.get('category', '') + " " + " ".join(faq.get('keywords', []))
            tokens = self.processor.tokenize_and_clean(combined_text)
            docs_tokens.append(tokens)

        # Compute IDF
        self.idf = self.compute_idf(docs_tokens)
        
        # Compute TF-IDF vectors for each document
        self.faq_vectors = []
        for tokens in docs_tokens:
            self.faq_vectors.append(self.compute_tfidf_vector(tokens))

    def compute_idf(self, docs):
        n_docs = len(docs)
        df = collections.defaultdict(int)
        for doc in docs:
            for word in set(doc):
                df[word] += 1
        
        idf = {}
        for word, count in df.items():
            # IDF smoothing
            idf[word] = math.log((1 + n_docs) / (1 + count)) + 1
        return idf

    def compute_tfidf_vector(self, tokens):
        tf = collections.Counter(tokens)
        doc_len = len(tokens) if len(tokens) > 0 else 1
        
        vector = {}
        for word, count in tf.items():
            tf_val = count / doc_len
            idf_val = self.idf.get(word, 1.0)
            vector[word] = tf_val * idf_val
        return vector

    def cosine_similarity(self, vec1, vec2):
        dot_product = 0.0
        for word in vec1:
            if word in vec2:
                dot_product += vec1[word] * vec2[word]
                
        norm1 = math.sqrt(sum(v**2 for v in vec1.values()))
        norm2 = math.sqrt(sum(v**2 for v in vec2.values()))
        
        if norm1 == 0.0 or norm2 == 0.0:
            return 0.0
        return dot_product / (norm1 * norm2)

    def match(self, query):
        if not self.faqs:
            return None, 0.0, []

        query_tokens = self.processor.tokenize_and_clean(query)
        query_vector = self.compute_tfidf_vector(query_tokens)

        similarities = []
        for idx, faq_vec in enumerate(self.faq_vectors):
            sim = self.cosine_similarity(query_vector, faq_vec)
            
            # Keyword Overlap Boost
            faq = self.faqs[idx]
            query_words = set(query_tokens)
            keywords = set(self.processor.tokenize_and_clean(" ".join(faq.get('keywords', []))))
            overlap = query_words.intersection(keywords)
            if overlap:
                # Add up to 0.25 bonus for keyword overlap
                sim += min(0.25, len(overlap) * 0.08)
                
            similarities.append((idx, sim))

        # Sort by similarity in descending order
        similarities.sort(key=lambda x: x[1], reverse=True)
        best_idx, best_score = similarities[0]
        
        # Get top 3 related questions (excluding the best match, with score > 0.02)
        related = []
        for idx, sim in similarities:
            if idx == best_idx and best_score >= 0.3:
                continue
            if len(related) < 3:
                related.append(self.faqs[idx])
                
        # If not enough related, pad with other questions
        if len(related) < 3:
            for faq in self.faqs:
                if faq['id'] != self.faqs[best_idx]['id'] and faq not in related:
                    related.append(faq)
                if len(related) >= 3:
                    break

        return self.faqs[best_idx], best_score, related

# Initialize Matcher
matcher = CustomTFIDFMatcher()

def safe_translate(text, dest_lang, src_lang='auto'):
    """Translate text using deep-translator (Python 3.13/3.14 compatible)."""
    if not text:
        return text
    # Skip translation if source and destination are both English
    if dest_lang == 'en' and (src_lang == 'en' or (src_lang == 'auto' and text.isascii())):
        return text
    try:
        # deep-translator uses 'auto' for auto-detection of source language
        result = GoogleTranslator(source=src_lang, target=dest_lang).translate(text)
        return result if result else text
    except Exception as e:
        print(f"Translation error: {e}")
        return text

def safe_detect_lang(text):
    """Detect language using Devanagari unicode heuristic first, then deep-translator."""
    if not text:
        return 'en'
    # Fast path: pure ASCII is English
    if text.isascii():
        return 'en'
    # Heuristic: Devanagari unicode block (Marathi / Hindi)
    if any('\u0900' <= char <= '\u097f' for char in text):
        return 'mr'  # Default Devanagari to Marathi
    try:
        # deep-translator does not have a built-in detect; use a translate probe
        result = GoogleTranslator(source='auto', target='en').translate(text)
        # If translation worked and differs from input, assume non-English
        return 'hi' if result and result != text else 'en'
    except Exception:
        return 'en'

def load_analytics():
    if os.path.exists('analytics.json'):
        try:
            with open('analytics.json', 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {"queries": [], "unanswered": [], "feedback": [], "leads": []}

def save_analytics(data):
    with open('analytics.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json or {}
    message = data.get('message', '').strip()
    user_name = data.get('userName', 'Student')
    lang = data.get('lang', None)

    if not message:
        return jsonify({"status": "error", "message": "Message is empty"}), 400

    # 1. Detect language if not provided
    if not lang:
        lang = safe_detect_lang(message)
    
    # Keep lang normalized
    if lang not in ['mr', 'hi', 'en']:
        lang = 'en'

    # 2. Translate query to English if needed
    english_query = message
    if lang != 'en':
        english_query = safe_translate(message, 'en', src_lang=lang)

    # 3. Match against FAQs
    matched_faq, score, related_faqs = matcher.match(english_query)
    
    analytics_data = load_analytics()
    timestamp = datetime.now().isoformat()

    # Log query
    analytics_data['queries'].append({
        "query": message,
        "english_query": english_query,
        "lang": lang,
        "matched_id": matched_faq['id'] if matched_faq and score >= 0.3 else None,
        "score": float(score),
        "timestamp": timestamp
    })

    response_data = {
        "user_name": user_name,
        "lang": lang,
        "score": float(score)
    }

    if matched_faq and score >= 0.3:
        # Match found
        ans_text = matched_faq['answer']
        ques_text = matched_faq['question']
        
        # Translate answers and questions back if not English
        if lang != 'en':
            ans_text = safe_translate(ans_text, lang, 'en')
            ques_text = safe_translate(ques_text, lang, 'en')
            
        response_data.update({
            "status": "success",
            "faq_id": matched_faq['id'],
            "question": ques_text,
            "answer": ans_text,
            "pdf_url": matched_faq.get('pdf_url', None)
        })
    else:
        # Unanswered fallback
        fallback_msg = "I'm sorry, I couldn't find a direct answer. Would you like me to escalate this query to our Admissions Admin desk?"
        if lang == 'mr':
            fallback_msg = "क्षमस्व, मला ह्याचे थेट उत्तर मिळाले नाही. तुमची ही विचारणा प्रवेश विभागाच्या प्रशासकांकडे पाठवू का?"
        elif lang == 'hi':
            fallback_msg = "क्षमा करें, मुझे इसका सीधा उत्तर नहीं मिला। क्या आप चाहते हैं कि मैं यह प्रश्न प्रवेश विभाग के एडमिन को भेजूं?"

        # Save to unanswered list
        unanswered_id = len(analytics_data['unanswered']) + 1
        analytics_data['unanswered'].append({
            "id": unanswered_id,
            "query": message,
            "english_query": english_query,
            "lang": lang,
            "timestamp": timestamp,
            "resolved": False
        })
        
        response_data.update({
            "status": "unanswered",
            "unanswered_id": unanswered_id,
            "answer": fallback_msg
        })

    # Prepare translated related questions
    translated_related = []
    for r_faq in related_faqs:
        r_q = r_faq['question']
        if lang != 'en':
            r_q = safe_translate(r_q, lang, 'en')
        translated_related.append({
            "id": r_faq['id'],
            "question": r_q
        })
    response_data["related"] = translated_related

    save_analytics(analytics_data)
    return jsonify(response_data)

@app.route('/api/feedback', methods=['POST'])
def feedback():
    data = request.json or {}
    faq_id = data.get('faq_id')
    query = data.get('query', '')
    rating = data.get('feedback', '') # 'up' or 'down'

    if not rating:
        return jsonify({"status": "error", "message": "Rating required"}), 400

    analytics_data = load_analytics()
    analytics_data['feedback'].append({
        "faq_id": faq_id,
        "query": query,
        "rating": rating,
        "timestamp": datetime.now().isoformat()
    })
    save_analytics(analytics_data)
    return jsonify({"status": "success"})

@app.route('/api/submit_lead', methods=['POST'])
def submit_lead():
    data = request.json or {}
    name = str(data.get('name', '')).strip()
    marks = str(data.get('marks', '')).strip()
    email = str(data.get('email', '')).strip()

    if not name or not marks or not email:
        return jsonify({"status": "error", "message": "Missing required fields"}), 400

    analytics_data = load_analytics()
    analytics_data['leads'].append({
        "name": name,
        "marks": marks,
        "email": email,
        "timestamp": datetime.now().isoformat()
    })
    save_analytics(analytics_data)
    return jsonify({"status": "success"})

# ADMIN ENDPOINTS

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json or {}
    email = str(data.get('email', '')).strip()
    password = str(data.get('password', '')).strip()
    
    if email == 'dypsem@gmail.com' and password == 'dypsem1234':
        return jsonify({"status": "success", "token": "session_admin_token_12345"})
    return jsonify({"status": "error", "message": "Invalid email or password"}), 401

@app.route('/api/admin/dashboard', methods=['GET'])
def admin_dashboard():
    analytics_data = load_analytics()
    
    total_chats = len(analytics_data['queries'])
    
    # Feedback metrics
    feedbacks = analytics_data['feedback']
    ups = sum(1 for f in feedbacks if f['rating'] == 'up')
    downs = sum(1 for f in feedbacks if f['rating'] == 'down')
    total_feed = ups + downs
    feedback_pct = round((ups / total_feed) * 100) if total_feed > 0 else 100
    
    total_leads = len(analytics_data['leads'])
    
    # Group most asked questions
    question_counts = collections.Counter()
    for q in analytics_data['queries']:
        if q.get('matched_id'):
            question_counts[q['matched_id']] += 1
            
    top_faqs = []
    # Load FAQ mappings
    faq_dict = {f['id']: f['question'] for f in matcher.faqs}
    for faq_id, count in question_counts.most_common(5):
        if faq_id in faq_dict:
            top_faqs.append({
                "id": faq_id,
                "question": faq_dict[faq_id],
                "count": count
            })

    # Unresolved unanswered queries
    unresolved_unanswered = [q for q in analytics_data['unanswered'] if not q.get('resolved', False)]

    return jsonify({
        "total_chats": total_chats,
        "feedback_pct": feedback_pct,
        "total_leads": total_leads,
        "top_faqs": top_faqs,
        "unanswered": unresolved_unanswered,
        "leads": analytics_data['leads']
    })

@app.route('/api/admin/faqs', methods=['GET', 'POST'])
def admin_faqs():
    if request.method == 'GET':
        return jsonify(matcher.faqs)
        
    # POST - Add new FAQ
    data = request.json or {}
    question = str(data.get('question', '')).strip()
    answer = str(data.get('answer', '')).strip()
    category = str(data.get('category', 'General')).strip()
    keywords_raw = data.get('keywords', '')
    pdf_url = str(data.get('pdf_url', '')).strip() or None

    if not question or not answer:
        return jsonify({"status": "error", "message": "Question and Answer required"}), 400

    if isinstance(keywords_raw, str):
        keywords = [k.strip() for k in keywords_raw.split(',') if k.strip()]
    else:
        keywords = keywords_raw if isinstance(keywords_raw, list) else []

    new_id = max([f['id'] for f in matcher.faqs]) + 1 if matcher.faqs else 1
    new_faq = {
        "id": new_id,
        "question": question,
        "answer": answer,
        "category": category,
        "keywords": keywords,
        "pdf_url": pdf_url
    }

    matcher.faqs.append(new_faq)
    
    with open(matcher.faq_file, 'w', encoding='utf-8') as f:
        json.dump(matcher.faqs, f, indent=2, ensure_ascii=False)
        
    matcher.load_and_fit() # Refit models
    return jsonify({"status": "success", "faq": new_faq})

@app.route('/api/admin/faqs/<int:faq_id>', methods=['PUT', 'DELETE'])
def admin_faq_detail(faq_id):
    # Find FAQ
    target_idx = None
    for idx, faq in enumerate(matcher.faqs):
        if faq['id'] == faq_id:
            target_idx = idx
            break
            
    if target_idx is None:
        return jsonify({"status": "error", "message": "FAQ not found"}), 404

    if request.method == 'PUT':
        data = request.json or {}
        question = str(data.get('question', '')).strip()
        answer = str(data.get('answer', '')).strip()
        category = str(data.get('category', 'General')).strip()
        keywords_raw = data.get('keywords', '')
        pdf_url = str(data.get('pdf_url', '')).strip() or None

        if not question or not answer:
            return jsonify({"status": "error", "message": "Question and Answer required"}), 400

        if isinstance(keywords_raw, str):
            keywords = [k.strip() for k in keywords_raw.split(',') if k.strip()]
        else:
            keywords = keywords_raw if isinstance(keywords_raw, list) else []

        matcher.faqs[target_idx].update({
            "question": question,
            "answer": answer,
            "category": category,
            "keywords": keywords,
            "pdf_url": pdf_url
        })
        
    elif request.method == 'DELETE':
        matcher.faqs.pop(target_idx)

    # Save to file
    with open(matcher.faq_file, 'w', encoding='utf-8') as f:
        json.dump(matcher.faqs, f, indent=2, ensure_ascii=False)
        
    matcher.load_and_fit() # Refit models
    return jsonify({"status": "success"})

@app.route('/api/admin/resolve_unanswered', methods=['POST'])
def resolve_unanswered():
    data = request.json or {}
    unanswered_id = data.get('id')
    answer = str(data.get('answer', '')).strip()
    category = str(data.get('category', 'General')).strip()

    if not unanswered_id or not answer:
        return jsonify({"status": "error", "message": "Missing ID or Answer"}), 400

    analytics_data = load_analytics()
    
    # Find unanswered query
    target_query = None
    for q in analytics_data['unanswered']:
        if q['id'] == unanswered_id:
            q['resolved'] = True
            target_query = q['english_query']
            break
            
    if not target_query:
        return jsonify({"status": "error", "message": "Unanswered query not found"}), 404

    # Add as a new FAQ
    new_id = max([f['id'] for f in matcher.faqs]) + 1 if matcher.faqs else 1
    new_faq = {
        "id": new_id,
        "question": target_query,
        "answer": answer,
        "category": category,
        "keywords": [k.strip() for k in target_query.lower().split() if len(k.strip()) > 3]
    }
    
    matcher.faqs.append(new_faq)
    
    with open(matcher.faq_file, 'w', encoding='utf-8') as f:
        json.dump(matcher.faqs, f, indent=2, ensure_ascii=False)
        
    save_analytics(analytics_data)
    matcher.load_and_fit() # Refit models
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
