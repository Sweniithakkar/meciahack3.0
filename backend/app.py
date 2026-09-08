import os
import sys
import uuid
import json
import hashlib
import time
from datetime import datetime
import gc

# Ensure backend directory is in sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))

# Optionally load local venv site-packages if present (Windows dev)
venv_site = os.path.join(PROJECT_ROOT, "venv", "Lib", "site-packages")
if os.path.exists(venv_site) and venv_site not in sys.path:
    sys.path.insert(0, venv_site)

if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

# Load environment variables from .env files with override
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(PROJECT_ROOT, ".env"), override=True)
    load_dotenv(os.path.join(SCRIPT_DIR, ".env"), override=True)
    load_dotenv(override=True)
except Exception:
    pass

from flask import Flask, request, jsonify

from flask_cors import CORS

from utils.db import (
    init_db, ping_db, create_user, get_user_by_email, get_user_by_id,
    create_document, get_user_documents, get_document_by_id,
    get_document_by_hash, delete_user_document, log_activity,
    get_user_activity_logs, get_admin_stats, get_all_users_admin,
    get_all_activity_admin, get_all_documents_admin, get_user_details_admin,
    save_chat_message, get_chat_history, clear_chat_history
)
from utils.auth import (
    hash_password, verify_password, generate_token, login_required, admin_required
)
from utils.pdf_loader import extract_text, load_pdf
from utils.chunker import create_chunks
from document_ingest import process_pdf
from rag.pipeline import analyze_document_pdf, ask_document, analyze_document

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/api/.*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
        },
        r"/.*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
        }
    }
)

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response


# Use /tmp directory on Vercel serverless functions
if os.environ.get("VERCEL") or not os.access(SCRIPT_DIR, os.W_OK):
    UPLOAD_FOLDER = os.path.join("/tmp", "uploads")
else:
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


@app.route("/api/db-health")
def db_health():
    is_ok, db_provider = ping_db()
    if is_ok:
        return jsonify({
            "status": "ok",
            "database": db_provider,
            "message": f"Successfully connected to {db_provider}"
        })
    else:
        return jsonify({
            "status": "error",
            "database": db_provider,
            "error": "Failed to connect to database"
        }), 500


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

        log_activity(user["id"], "USER_REGISTER", f"Registered account for {email}")

        token = generate_token(user["id"], user["email"], user["name"], user.get("role", "user"))

        return jsonify({
            "success": True,
            "token": token,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user.get("role", "user")
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

        user_record = get_user_by_email(email, include_password=True)
        if not user_record or not verify_password(password, user_record["password_hash"]):
            return jsonify({"error": "Invalid email or password"}), 401

        log_activity(user_record["id"], "USER_LOGIN", f"User logged in with email {email}")

        user_role = user_record.get("role", "user")
        token = generate_token(user_record["id"], user_record["email"], user_record["name"], user_role)

        return jsonify({
            "success": True,
            "token": token,
            "user": {
                "id": user_record["id"],
                "name": user_record["name"],
                "email": user_record["email"],
                "role": user_role
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
            "email": user["email"],
            "role": user.get("role", "user")
        }
    })


@app.route("/api/activity-logs", methods=["GET"])
@login_required
def list_activity_logs():
    user_id = request.current_user["id"]
    logs = get_user_activity_logs(user_id)
    return jsonify({
        "success": True,
        "activity_logs": logs
    })


# ==========================================
# ADMIN DASHBOARD ENDPOINTS
# ==========================================

@app.route("/api/admin/stats", methods=["GET"])
@admin_required
def admin_stats():
    stats = get_admin_stats()
    return jsonify({
        "success": True,
        "stats": stats
    })


@app.route("/api/admin/users", methods=["GET"])
@admin_required
def admin_users():
    users = get_all_users_admin()
    return jsonify({
        "success": True,
        "users": users
    })


@app.route("/api/admin/activity", methods=["GET"])
@admin_required
def admin_activity():
    activities = get_all_activity_admin()
    return jsonify({
        "success": True,
        "activity_logs": activities
    })


@app.route("/api/admin/documents", methods=["GET"])
@admin_required
def admin_documents():
    documents = get_all_documents_admin()
    return jsonify({
        "success": True,
        "documents": documents
    })


# ==========================================
# USER DOCUMENTS ENDPOINTS
from utils.risk_engine import compute_risk_level

# ==========================================
# HELPER FOR PERSISTED DOCUMENT FORMATTING
# ==========================================

def format_doc_for_api(doc):
    risks = json.loads(doc["risks_json"]) if doc.get("risks_json") else []
    clauses = json.loads(doc["clauses_json"]) if doc.get("clauses_json") else []
    
    # Use persisted risk values from database if available
    db_risk_level = doc.get("risk_level")
    db_risk_score = doc.get("risk_score")

    if db_risk_score and db_risk_level and str(db_risk_level).isdigit():
        r_level = int(db_risk_level)
        r_score = db_risk_score
        r_class = db_risk_score.split(" (")[0] if " (" in db_risk_score else ("Low Risk" if r_level <= 4 else ("Medium Risk" if r_level <= 7 else "High Risk"))
    else:
        # Re-evaluate once for legacy records with missing persisted risk values
        eval_res = compute_risk_level(clauses=risks if risks else clauses)
        r_level = eval_res["risk_level"]
        r_class = eval_res["risk_classification"]
        r_score = eval_res["risk_score"]

    r_short = r_class.replace(" Risk", "")

    sq_json = doc.get("suggested_questions_json")
    suggested_questions = json.loads(sq_json) if sq_json else []
    if not suggested_questions:
        try:
            from rag.llm import extract_document_specific_questions
            combined_text = f"{doc.get('summary') or ''} {doc.get('filename') or ''} {doc.get('doc_type') or ''} {doc.get('clauses_json') or ''} {doc.get('risks_json') or ''}"
            suggested_questions = extract_document_specific_questions(combined_text)
        except Exception:
            suggested_questions = []

    return {
        "id": doc["id"],
        "name": doc["filename"],
        "displayName": doc["display_name"],
        "fileSize": doc["file_size"],
        "uploadDate": doc["upload_date"],
        "status": doc["status"],
        "summary": doc["summary"],
        "type": doc.get("doc_type") or "Legal Document",
        "risk_level": r_level,
        "risk_classification": r_class,
        "riskLevel": r_short,
        "riskScore": r_score,
        "color_code": "#2E7D32" if r_level <= 4 else ("#EF6C00" if r_level <= 7 else "#C62828"),
        "checklist": json.loads(doc["checklist_json"]) if doc.get("checklist_json") else [],
        "risks": risks,
        "clauses": clauses,
        "sources": json.loads(doc["sources_json"]) if doc.get("sources_json") else [],
        "suggestedQuestions": suggested_questions
    }


# ==========================================
# PROTECTED DOCUMENT MANAGEMENT ENDPOINTS
# ==========================================

@app.route("/api/documents", methods=["GET"])
@login_required
def list_user_documents():
    user_id = request.current_user["id"]
    raw_docs = get_user_documents(user_id)
    formatted_docs = [format_doc_for_api(doc) for doc in raw_docs]

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
        "document": format_doc_for_api(doc)
    })


@app.route("/api/documents/<doc_id>", methods=["DELETE"])
@login_required
def delete_document(doc_id):
    user_id = request.current_user["id"]
    success = delete_user_document(doc_id, user_id)

    if not success:
        return jsonify({"error": "Document not found or unauthorized"}), 404

    log_activity(user_id, "DOCUMENT_DELETE", f"Deleted document {doc_id}")

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
        language = request.form.get("language") or (request.get_json(silent=True) or {}).get("language") or "en"
        language = language.lower().strip()
        if language not in ["en", "hi", "gu"]:
            language = "en"

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

        # Unique document ID
        doc_id = f"doc_{uuid.uuid4().hex[:12]}"
        unique_name = f"{user_id}_{doc_id}_{file.filename}"
        pdf_path = os.path.join(UPLOAD_FOLDER, unique_name)

        # Save PDF
        with open(pdf_path, "wb") as f:
            f.write(file_bytes)

        del file_bytes
        gc.collect()

        print(f"\n📄 PDF received for User {user_id}: {file.filename} (Language: {language})")

        # Extract text & page structure once
        doc_info = load_pdf(pdf_path)
        text = doc_info.get("text", "")
        pages = doc_info.get("pages", [])

        if not text:
            return jsonify({"error": "Could not extract text from PDF"}), 400

        print(f"✅ Extracted {len(text)} characters ({len(pages)} pages)")

        process_pdf(
            pdf_path,
            user_id=user_id,
            doc_id=doc_id,
            doc_hash=doc_hash,
            pre_extracted_text=text,
            pages=pages
        )

        print(f"✅ PDF stored in Vector DB (user {user_id}, doc {doc_id})")

        # Run RAG Analysis with selected language
        t_llm_start = time.time()
        analysis_result = analyze_document_pdf(
            pdf_path,
            doc_id=doc_id,
            user_id=user_id,
            language=language,
            pre_extracted_text=text
        )
        t_llm_end = time.time()
        print(f"[PERF] RAG Document Analysis time: {int((t_llm_end - t_llm_start)*1000)} ms")

        summary_text = analysis_result.get("summary", "")
        risks_data = analysis_result.get("risks", [])
        clauses_data = analysis_result.get("important_clauses", [])
        checklist_data = analysis_result.get("checklist", [])
        sources_data = analysis_result.get("sources", [])
        doc_type = analysis_result.get("type", "Legal Document")
        risk_level = analysis_result.get("risk_level")
        risk_classification = analysis_result.get("risk_classification")
        color_code = analysis_result.get("color_code")
        risk_score = analysis_result.get("riskScore")
        suggested_questions = analysis_result.get("suggestedQuestions", [])

        display_name = file.filename.replace(".pdf", "").replace(".PDF", "").replace("_", " ").title()
        upload_date_str = datetime.now().strftime("%b %d, %Y")

        # Store in Database
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
            clauses_json=json.dumps(clauses_data),
            doc_type=doc_type,
            risk_level=str(risk_level) if risk_level is not None else None,
            risk_score=risk_score,
            suggested_questions_json=json.dumps(suggested_questions)
        )

        log_activity(user_id, "DOCUMENT_ANALYZE", f"Analyzed document {doc_id} ({file.filename})")

        t_total = int((time.time() - t_start) * 1000)
        print(f"[PERF] Total analysis pipeline execution time: {t_total} ms")

        return jsonify({
            "success": True,
            "doc_id": doc_id,
            "filename": file.filename,
            "language": language,
            "summary": summary_text,
            "type": doc_type,
            "risk_level": risk_level,
            "risk_classification": risk_classification,
            "color_code": color_code,
            "riskLevel": analysis_result.get("riskLevel"),
            "riskScore": risk_score,
            "word_count": analysis_result.get("word_count"),
            "reading_time": analysis_result.get("reading_time"),
            "time_saved": analysis_result.get("time_saved"),
            "risks": risks_data,
            "important_clauses": clauses_data,
            "checklist": checklist_data,
            "suggestedQuestions": suggested_questions,
            "sources": sources_data
        })

    except Exception as e:
        print("❌ ERROR in /api/analyze:", str(e))
        return jsonify({"error": f"Something went wrong while analyzing the document: {str(e)}"}), 500


@app.route("/api/documents/<doc_id>/reanalyze", methods=["POST"])
@login_required
def reanalyze_document_endpoint(doc_id):
    t_start = time.time()
    try:
        user_id = request.current_user["id"]
        data = request.get_json() or {}
        language = (data.get("language") or "en").lower().strip()
        if language not in ["en", "hi", "gu"]:
            language = "en"

        user_doc = get_document_by_id(doc_id, user_id)
        if not user_doc:
            return jsonify({"error": "Document not found or access denied"}), 404

        pdf_path = user_doc["file_path"]
        if not os.path.exists(pdf_path):
            return jsonify({"error": "Original document file is no longer available on server."}), 404

        print(f"\n🔄 Re-analyzing document {doc_id} for User {user_id} in Language: {language}")

        analysis_result = analyze_document_pdf(
            pdf_path,
            doc_id=doc_id,
            user_id=user_id,
            language=language
        )

        summary_text = analysis_result.get("summary", "")
        risks_data = analysis_result.get("risks", [])
        clauses_data = analysis_result.get("important_clauses", [])
        checklist_data = analysis_result.get("checklist", [])
        sources_data = analysis_result.get("sources", [])

        return jsonify({
            "success": True,
            "doc_id": doc_id,
            "filename": user_doc["filename"],
            "language": language,
            "summary": summary_text,
            "type": analysis_result.get("type", "Legal Document"),
            "risk_level": analysis_result.get("risk_level"),
            "risk_classification": analysis_result.get("risk_classification"),
            "color_code": analysis_result.get("color_code"),
            "riskLevel": analysis_result.get("riskLevel"),
            "riskScore": analysis_result.get("riskScore"),
            "word_count": analysis_result.get("word_count"),
            "reading_time": analysis_result.get("reading_time"),
            "time_saved": analysis_result.get("time_saved"),
            "risks": risks_data,
            "important_clauses": clauses_data,
            "checklist": checklist_data,
            "suggestedQuestions": analysis_result.get("suggestedQuestions", []),
            "sources": sources_data
        })
    except Exception as e:
        print("❌ ERROR in /api/documents/<doc_id>/reanalyze:", str(e))
        return jsonify({"error": f"Failed to re-analyze document: {str(e)}"}), 500


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
        language = (data.get("language") or "en").lower().strip()
        if language not in ["en", "hi", "gu"]:
            language = "en"

        if not question:
            return jsonify({"error": "Question cannot be empty"}), 400

        if doc_id:
            user_doc = get_document_by_id(doc_id, user_id)
            if not user_doc:
                return jsonify({"error": "Access denied for requested document"}), 403

        print(f"\n❓ Question from User {user_id} (Doc: {doc_id}, Lang: {language}): {question}")

        # Run RAG Q&A pipeline
        result = ask_document(
            question,
            user_id=user_id,
            doc_id=doc_id,
            language=language
        )

        t_total = int((time.time() - t_start) * 1000)
        print(f"[PERF] Total Q&A response time: {t_total} ms")

        log_activity(user_id, "RAG_QUESTION", f"Asked question on doc_id={doc_id}")

        return jsonify({
            "success": True,
            "answer": result.get("answer", ""),
            "sources": result.get("sources", []),
            "language": language
        })

    except Exception as e:
        print("❌ ERROR in /api/ask:", str(e))
        return jsonify({"error": "Unable to answer the question."}), 500


# ==========================================
# PROTECTED CHAT HISTORY PERSISTENCE
# ==========================================

@app.route("/api/documents/<doc_id>/chat", methods=["GET"])
@login_required
def get_doc_chat_history(doc_id):
    try:
        user_id = request.current_user["id"]
        user_doc = get_document_by_id(doc_id, user_id)
        if not user_doc:
            return jsonify({"error": "Document not found or access denied"}), 403

        history = get_chat_history(user_id, doc_id)
        return jsonify({
            "success": True,
            "history": history
        })
    except Exception as e:
        print("❌ Error fetching chat history:", str(e))
        return jsonify({"error": "Failed to fetch chat history"}), 500


@app.route("/api/documents/<doc_id>/chat", methods=["POST"])
@login_required
def save_doc_chat_message(doc_id):
    try:
        user_id = request.current_user["id"]
        user_doc = get_document_by_id(doc_id, user_id)
        if not user_doc:
            return jsonify({"error": "Document not found or access denied"}), 403

        data = request.get_json() or {}
        sender = data.get("sender", "user")
        text = data.get("text", "").strip()
        source = data.get("source")
        page = data.get("page")
        confidence = data.get("confidence")
        message_id = data.get("id")

        if not text:
            return jsonify({"error": "Message text is required"}), 400

        saved_msg = save_chat_message(
            user_id=user_id,
            document_id=doc_id,
            sender=sender,
            text=text,
            source=source,
            page=page,
            confidence=confidence,
            message_id=message_id
        )

        return jsonify({
            "success": True,
            "message": saved_msg
        })
    except Exception as e:
        print("❌ Error saving chat message:", str(e))
        return jsonify({"error": "Failed to save chat message"}), 500


@app.route("/api/documents/<doc_id>/chat", methods=["DELETE"])
@login_required
def clear_doc_chat_history(doc_id):
    try:
        user_id = request.current_user["id"]
        user_doc = get_document_by_id(doc_id, user_id)
        if not user_doc:
            return jsonify({"error": "Document not found or access denied"}), 403

        success = clear_chat_history(user_id, doc_id)
        return jsonify({
            "success": success
        })
    except Exception as e:
        print("❌ Error clearing chat history:", str(e))
        return jsonify({"error": "Failed to clear chat history"}), 500



# ==========================================
# ADMIN DASHBOARD TELEMETRY ENDPOINTS
# ==========================================

@app.route("/api/admin/stats", methods=["GET"])
@admin_required
def admin_stats_endpoint():
    try:
        stats = get_admin_stats()
        return jsonify({
            "success": True,
            "stats": stats
        })
    except Exception as e:
        print("❌ Error in /api/admin/stats:", str(e))
        return jsonify({"error": "Failed to fetch admin stats"}), 500


@app.route("/api/admin/users", methods=["GET"])
@admin_required
def admin_users_endpoint():
    try:
        users = get_all_users_admin()
        return jsonify({
            "success": True,
            "users": users
        })
    except Exception as e:
        print("❌ Error in /api/admin/users:", str(e))
        return jsonify({"error": "Failed to fetch users list"}), 500


@app.route("/api/admin/users/<int:user_id>", methods=["GET"])
@admin_required
def admin_user_detail_endpoint(user_id):
    try:
        details = get_user_details_admin(user_id)
        if not details:
            return jsonify({"error": "User not found"}), 404
        return jsonify({
            "success": True,
            **details
        })
    except Exception as e:
        print(f"❌ Error in /api/admin/users/{user_id}:", str(e))
        return jsonify({"error": "Failed to fetch user details"}), 500


@app.route("/api/admin/activity", methods=["GET"])
@admin_required
def admin_activity_endpoint():
    try:
        logs = get_all_activity_admin()
        return jsonify({
            "success": True,
            "activity_logs": logs
        })
    except Exception as e:
        print("❌ Error in /api/admin/activity:", str(e))
        return jsonify({"error": "Failed to fetch system activity"}), 500


@app.route("/api/admin/documents", methods=["GET"])
@admin_required
def admin_documents_endpoint():
    try:
        docs = get_all_documents_admin()
        return jsonify({
            "success": True,
            "documents": docs
        })
    except Exception as e:
        print("❌ Error in /api/admin/documents:", str(e))
        return jsonify({"error": "Failed to fetch document store"}), 500

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
        debug=False,
        threaded=True
    )
