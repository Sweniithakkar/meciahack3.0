import os
import sys
import uuid
import json
import hashlib
import time
from datetime import datetime

# Ensure backend directory is in sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))

# Optionally load local venv site-packages if present (Windows dev)
venv_site = os.path.join(PROJECT_ROOT, "venv", "Lib", "site-packages")
if os.path.exists(venv_site) and venv_site not in sys.path:
    sys.path.insert(0, venv_site)

if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from flask import Flask, request, jsonify
from flask_cors import CORS

from utils.db import (
    init_db, create_user, get_user_by_email, get_user_by_id,
    create_document, get_user_documents, get_document_by_id,
    get_document_by_hash, delete_user_document
)
from utils.auth import (
    hash_password, verify_password, generate_token, login_required
)
from utils.pdf_loader import extract_text
from utils.chunker import create_chunks
from document_ingest import process_pdf
from rag.pipeline import analyze_document_pdf, ask_document, analyze_document

app = Flask(__name__)

frontend_url = os.environ.get("FRONTEND_URL", "").strip()
allowed_origins = [origin.strip() for origin in frontend_url.split(",") if origin.strip()] if frontend_url else "*"
CORS(app, resources={r"/*": {"origins": allowed_origins}})

UPLOAD_FOLDER = os.path.join(SCRIPT_DIR, "data", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Ensure database tables are created on app start
init_db()


# ==========================================
# HEALTH CHECK
# ==========================================

@app.route("/")
def home():
    return jsonify({
        "status": "ok",
        "service": "Legal Lens Backend",
        "message": "Backend is running successfully"
    })


@app.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "service": "Legal Lens Backend"
    })


# ==========================================
# AUTHENTICATION ENDPOINTS
# ==========================================

@app.route("/api/auth/register", methods=["POST"])
def register():
    try:
        data = request.get_json() or {}
        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "").strip()

        if not name:
            return jsonify({"error": "Full name is required"}), 400
        if not email or "@" not in email:
            return jsonify({"error": "Valid email address is required"}), 400
        if not password or len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters long"}), 400

        existing_user = get_user_by_email(email)
        if existing_user:
            return jsonify({"error": "An account with this email already exists"}), 400

        pwd_hash = hash_password(password)
        user = create_user(name, email, pwd_hash)

        if not user:
            return jsonify({"error": "Failed to create user account"}), 500

        token = generate_token(user["id"], user["email"], user["name"])

        return jsonify({
            "success": True,
            "token": token,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"]
            }
        })
    except Exception as e:
        print("❌ Register Error:", str(e))
        return jsonify({"error": "Server error during registration"}), 500


@app.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.get_json() or {}
        email = data.get("email", "").strip().lower()
        password = data.get("password", "").strip()

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        user_record = get_user_by_email(email)
        if not user_record or not verify_password(password, user_record["password_hash"]):
            return jsonify({"error": "Invalid email or password"}), 401

        token = generate_token(user_record["id"], user_record["email"], user_record["name"])

        return jsonify({
            "success": True,
            "token": token,
            "user": {
                "id": user_record["id"],
                "name": user_record["name"],
                "email": user_record["email"]
            }
        })
    except Exception as e:
        print("❌ Login Error:", str(e))
        return jsonify({"error": "Server error during login"}), 500


@app.route("/api/auth/me", methods=["GET"])
@login_required
def get_current_user_profile():
    user = request.current_user
    return jsonify({
        "success": True,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    })


# ==========================================
# USER DOCUMENTS ENDPOINTS
# ==========================================

@app.route("/api/documents", methods=["GET"])
@login_required
def list_user_documents():
    user_id = request.current_user["id"]
    raw_docs = get_user_documents(user_id)
    formatted_docs = []

    for doc in raw_docs:
        formatted_docs.append({
            "id": doc["id"],
            "name": doc["filename"],
            "displayName": doc["display_name"],
            "fileSize": doc["file_size"],
            "uploadDate": doc["upload_date"],
            "status": doc["status"],
            "summary": doc["summary"],
            "checklist": json.loads(doc["checklist_json"]) if doc.get("checklist_json") else [],
            "risks": json.loads(doc["risks_json"]) if doc.get("risks_json") else [],
            "clauses": json.loads(doc["clauses_json"]) if doc.get("clauses_json") else [],
            "sources": json.loads(doc["sources_json"]) if doc.get("sources_json") else []
        })

    return jsonify({
        "success": True,
        "documents": formatted_docs
    })


@app.route("/api/documents/<doc_id>", methods=["GET"])
@login_required
def get_single_document(doc_id):
    user_id = request.current_user["id"]
    doc = get_document_by_id(doc_id, user_id)

    if not doc:
        return jsonify({"error": "Document not found or access denied"}), 404

    return jsonify({
        "success": True,
        "document": {
            "id": doc["id"],
            "name": doc["filename"],
            "displayName": doc["display_name"],
            "fileSize": doc["file_size"],
            "uploadDate": doc["upload_date"],
            "status": doc["status"],
            "summary": doc["summary"],
            "checklist": json.loads(doc["checklist_json"]) if doc.get("checklist_json") else [],
            "risks": json.loads(doc["risks_json"]) if doc.get("risks_json") else [],
            "clauses": json.loads(doc["clauses_json"]) if doc.get("clauses_json") else [],
            "sources": json.loads(doc["sources_json"]) if doc.get("sources_json") else []
        }
    })


@app.route("/api/documents/<doc_id>", methods=["DELETE"])
@login_required
def delete_document(doc_id):
    user_id = request.current_user["id"]
    success = delete_user_document(doc_id, user_id)

    if not success:
        return jsonify({"error": "Document not found or unauthorized"}), 404

    return jsonify({
        "success": True,
        "message": f"Document {doc_id} deleted successfully"
    })


# ==========================================
# PROTECTED ANALYZE PDF
# ==========================================

@app.route("/api/analyze", methods=["POST"])
@login_required
def analyze_pdf():
    t_start = time.time()
    try:
        user_id = request.current_user["id"]

        if "file" not in request.files:
            return jsonify({"error": "No PDF file provided"}), 400

        file = request.files["file"]

        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        if not file.filename.lower().endswith(".pdf"):
            return jsonify({"error": "Only PDF files are supported"}), 400

        file_bytes = file.read()
        if not file_bytes:
            return jsonify({"error": "Uploaded file is empty"}), 400

        doc_hash = hashlib.sha256(file_bytes).hexdigest()
        file_size_str = f"{(len(file_bytes) / (1024 * 1024)):.1f} MB" if len(file_bytes) > 1024 * 1024 else f"{(len(file_bytes) / 1024):.1f} KB"

        # Check hash deduplication
        existing_doc = get_document_by_hash(user_id, doc_hash)
        if existing_doc:
            elapsed = int((time.time() - t_start) * 1000)
            print(f"[PERF] Cache hit for hash {doc_hash[:10]}... total analysis: {elapsed} ms")
            checklist_arr = json.loads(existing_doc["checklist_json"]) if existing_doc.get("checklist_json") else []
            risks_arr = json.loads(existing_doc["risks_json"]) if existing_doc.get("risks_json") else []
            clauses_arr = json.loads(existing_doc["clauses_json"]) if existing_doc.get("clauses_json") else []
            sources_arr = json.loads(existing_doc["sources_json"]) if existing_doc.get("sources_json") else []
            return jsonify({
                "success": True,
                "doc_id": existing_doc["id"],
                "filename": file.filename,
                "summary": existing_doc["summary"],
                "risks": risks_arr,
                "important_clauses": clauses_arr,
                "checklist": checklist_arr,
                "sources": sources_arr,
                "cached": True
            })

        # Unique document ID
        doc_id = f"doc_{uuid.uuid4().hex[:12]}"
        unique_name = f"{user_id}_{doc_id}_{file.filename}"
        pdf_path = os.path.join(UPLOAD_FOLDER, unique_name)

        # Save PDF
        with open(pdf_path, "wb") as f:
            f.write(file_bytes)

        print(f"\n📄 PDF received for User {user_id}: {file.filename}")

        # Extract text & process chunks
        text = extract_text(pdf_path)

        if not text:
            return jsonify({"error": "Could not extract text from PDF"}), 400

        print(f"✅ Extracted {len(text)} characters")

        process_pdf(
            pdf_path,
            user_id=user_id,
            doc_id=doc_id,
            doc_hash=doc_hash,
            pre_extracted_text=text
        )

        print(f"✅ PDF stored in Vector DB (user {user_id}, doc {doc_id})")

        # Run RAG Analysis
        t_llm_start = time.time()
        analysis_result = analyze_document_pdf(
            pdf_path,
            doc_id=doc_id,
            user_id=user_id
        )
        t_llm_end = time.time()
        print(f"[PERF] RAG Document Analysis time: {int((t_llm_end - t_llm_start)*1000)} ms")

        summary_text = analysis_result.get("summary", "")
        risks_data = analysis_result.get("risks", [])
        clauses_data = analysis_result.get("important_clauses", [])
        checklist_data = analysis_result.get("checklist", [])
        sources_data = analysis_result.get("sources", [])

        display_name = file.filename.replace(".pdf", "").replace(".PDF", "").replace("_", " ").title()
        upload_date_str = datetime.now().strftime("%b %d, %Y")

        # Store in SQLite
        db_doc = create_document(
            doc_id=doc_id,
            user_id=user_id,
            filename=file.filename,
            display_name=display_name,
            file_path=pdf_path,
            document_hash=doc_hash,
            file_size=file_size_str,
            upload_date=upload_date_str,
            status="Document analyzed",
            summary=summary_text,
            checklist_json=json.dumps(checklist_data),
            risks_json=json.dumps(risks_data),
            sources_json=json.dumps(sources_data),
            clauses_json=json.dumps(clauses_data)
        )

        t_total = int((time.time() - t_start) * 1000)
        print(f"[PERF] Total analysis pipeline execution time: {t_total} ms")

        return jsonify({
            "success": True,
            "doc_id": doc_id,
            "filename": file.filename,
            "summary": summary_text,
            "type": analysis_result.get("type", "Legal Document"),
            "riskLevel": analysis_result.get("riskLevel", "Medium"),
            "riskScore": analysis_result.get("riskScore", "Medium Risk"),
            "risks": risks_data,
            "important_clauses": clauses_data,
            "checklist": checklist_data,
            "sources": sources_data
        })

    except Exception as e:
        print("❌ ERROR in /api/analyze:", str(e))
        return jsonify({"error": f"Something went wrong while analyzing the document: {str(e)}"}), 500


# ==========================================
# PROTECTED ASK QUESTION (LEGAL CHAT)
# ==========================================

@app.route("/api/ask", methods=["POST"])
@login_required
def ask_question():
    t_start = time.time()
    try:
        user_id = request.current_user["id"]
        data = request.get_json() or {}

        question = data.get("question", "").strip()
        doc_id = data.get("doc_id", None) or data.get("document_id", None)

        if not question:
            return jsonify({"error": "Question cannot be empty"}), 400

        if doc_id:
            user_doc = get_document_by_id(doc_id, user_id)
            if not user_doc:
                return jsonify({"error": "Access denied for requested document"}), 403

        print(f"\n❓ Question from User {user_id} (Doc: {doc_id}): {question}")

        # Run RAG Q&A pipeline
        result = ask_document(
            question,
            user_id=user_id,
            doc_id=doc_id
        )

        t_total = int((time.time() - t_start) * 1000)
        print(f"[PERF] Total Q&A response time: {t_total} ms")

        return jsonify({
            "success": True,
            "answer": result.get("answer", ""),
            "sources": result.get("sources", [])
        })

    except Exception as e:
        print("❌ ERROR in /api/ask:", str(e))
        return jsonify({"error": "Unable to answer the question."}), 500


# ==========================================
# RUN SERVER
# ==========================================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print("\n===================================")
    print("     LEGAL LENS BACKEND (AUTH)")
    print("===================================")
    print(f"Server starting on 0.0.0.0:{port}")
    print("===================================\n")

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )
