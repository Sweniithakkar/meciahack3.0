import os
import sys
from datetime import datetime
from contextlib import contextmanager

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
PROJECT_ROOT = os.path.abspath(os.path.join(BACKEND_DIR, ".."))

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.exc import IntegrityError

from models import Base, User, Document, ActivityLog, ChatMessage

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(PROJECT_ROOT, ".env"))
    load_dotenv(os.path.join(BACKEND_DIR, ".env"))
except Exception:
    pass

# Detect DB connection URL from environment (Supabase / PostgreSQL or local SQLite)
RAW_DB_URL = (
    os.environ.get("DATABASE_URL") or 
    os.environ.get("SUPABASE_DB_URL") or 
    os.environ.get("POSTGRES_URL") or 
    ""
).strip()

if RAW_DB_URL:
    # Convert postgres:// to postgresql:// for SQLAlchemy 2.0+ compatibility
    if RAW_DB_URL.startswith("postgres://"):
        DATABASE_URL = RAW_DB_URL.replace("postgres://", "postgresql://", 1)
    else:
        DATABASE_URL = RAW_DB_URL
    IS_POSTGRES = True
else:
    # SQLite local fallback
    if os.environ.get("VERCEL") or not os.access(BACKEND_DIR, os.W_OK):
        DATA_DIR = "/tmp"
    else:
        DATA_DIR = os.path.join(BACKEND_DIR, "data")
    
    os.makedirs(DATA_DIR, exist_ok=True)
    DB_PATH = os.path.join(DATA_DIR, "legal_lens.db")
    DATABASE_URL = f"sqlite:///{DB_PATH}"
    IS_POSTGRES = False

# Create SQLAlchemy Engine
if IS_POSTGRES:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        pool_recycle=300
    )
else:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

SessionFactory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
ScopedSession = scoped_session(SessionFactory)


def get_db_session():
    """Provides a fresh database session."""
    return ScopedSession()


@contextmanager
def db_session_scope():
    """Context manager for safety in database operations."""
    session = ScopedSession()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_db():
    """Backward compatibility helper returning standard SQLAlchemy session."""
    return ScopedSession()


def safe_log(msg):
    try:
        print(msg)
    except UnicodeEncodeError:
        encoding = getattr(sys.stdout, "encoding", None) or "utf-8"
        encoded = str(msg).encode(encoding, errors="replace").decode(encoding, errors="replace")
        print(encoded)


def init_db():
    """Creates all database tables (users, documents, activity_logs, chat_messages) if they do not exist."""
    Base.metadata.create_all(bind=engine)
    
    # Non-destructive migration checks: add missing columns if upgrading schema
    try:
        with engine.connect() as conn:
            if IS_POSTGRES:
                conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(32) DEFAULT 'user';"))
                conn.execute(text("ALTER TABLE documents ADD COLUMN IF NOT EXISTS doc_type VARCHAR(255);"))
                conn.execute(text("ALTER TABLE documents ADD COLUMN IF NOT EXISTS risk_level VARCHAR(64);"))
                conn.execute(text("ALTER TABLE documents ADD COLUMN IF NOT EXISTS risk_score VARCHAR(128);"))
                conn.execute(text("ALTER TABLE documents ADD COLUMN IF NOT EXISTS suggested_questions_json TEXT;"))
            else:
                inspector = inspect(engine)
                u_cols = [c["name"] for c in inspector.get_columns("users")]
                if "role" not in u_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(32) DEFAULT 'user';"))
                
                d_cols = [c["name"] for c in inspector.get_columns("documents")]
                if "doc_type" not in d_cols:
                    conn.execute(text("ALTER TABLE documents ADD COLUMN doc_type VARCHAR(255);"))
                if "risk_level" not in d_cols:
                    conn.execute(text("ALTER TABLE documents ADD COLUMN risk_level VARCHAR(64);"))
                if "risk_score" not in d_cols:
                    conn.execute(text("ALTER TABLE documents ADD COLUMN risk_score VARCHAR(128);"))
                if "suggested_questions_json" not in d_cols:
                    conn.execute(text("ALTER TABLE documents ADD COLUMN suggested_questions_json TEXT;"))
            conn.commit()
    except Exception as e:
        safe_log(f"[!] Migration check notice: {e}")

    db_type = "PostgreSQL (Supabase)" if IS_POSTGRES else "SQLite (Local)"
    safe_log(f"[+] Database initialized successfully utilizing {db_type}")
    bootstrap_admin_user()



def ping_db():
    """Database connectivity health check."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True, "PostgreSQL (Supabase)" if IS_POSTGRES else "SQLite (Local)"
    except Exception as e:
        return False, str(e)


# ==========================================
# USER MANAGEMENT FUNCTIONS
# ==========================================

def create_user(name, email, password_hash, role="user"):
    session = ScopedSession()
    try:
        admin_email = os.environ.get("ADMIN_EMAIL", "").strip().lower()
        if admin_email and email.strip().lower() == admin_email:
            assigned_role = "admin"
        else:
            assigned_role = role if role in ["user", "admin"] else "user"

        new_user = User(
            name=name.strip(),
            email=email.strip().lower(),
            password_hash=password_hash,
            role=assigned_role
        )
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        user_dict = new_user.to_dict()
        session.close()
        return user_dict
    except IntegrityError:
        session.rollback()
        session.close()
        return None
    except Exception as e:
        safe_log(f"[!] Error in create_user: {e}")
        session.rollback()
        session.close()
        return None


def bootstrap_admin_user():
    """Ensures single admin user configured via ADMIN_EMAIL has admin role and clean display name."""
    session = ScopedSession()
    try:
        # Sanitize any legacy database records with hardcoded "System Admin" name
        system_admins = session.query(User).filter(User.name.in_(["System Admin", "system_admin"])).all()
        for sa in system_admins:
            clean_name = sa.email.split("@")[0].replace(".", " ").replace("_", " ").title() if sa.email else "Admin"
            sa.name = clean_name
            safe_log(f"[+] Updated legacy user name for {sa.email} to '{clean_name}'")
        if system_admins:
            session.commit()

        admin_email = os.environ.get("ADMIN_EMAIL", "").strip().lower()
        if not admin_email:
            session.close()
            return None

        user = session.query(User).filter(User.email == admin_email).first()
        if user:
            changed = False
            if user.role != "admin":
                user.role = "admin"
                changed = True
                safe_log(f"[+] Promoted user {admin_email} to admin role")
            admin_name = os.environ.get("ADMIN_NAME", "").strip()
            if admin_name and user.name != admin_name:
                user.name = admin_name
                changed = True
            if changed:
                session.commit()
            user_dict = user.to_dict()
            session.close()
            return user_dict
        
        admin_pass = os.environ.get("ADMIN_INITIAL_PASSWORD", "").strip()
        if admin_pass:
            from werkzeug.security import generate_password_hash
            pwd_hash = generate_password_hash(admin_pass)
            admin_name = os.environ.get("ADMIN_NAME", "").strip() or (admin_email.split("@")[0].replace(".", " ").replace("_", " ").title() if admin_email else "Admin")
            new_admin = User(
                name=admin_name,
                email=admin_email,
                password_hash=pwd_hash,
                role="admin"
            )
            session.add(new_admin)
            session.commit()
            session.refresh(new_admin)
            safe_log(f"[+] Bootstrapped initial admin account: {admin_email}")
            admin_dict = new_admin.to_dict()
            session.close()
            return admin_dict
        
        session.close()
        return None
    except Exception as e:
        safe_log(f"[!] Error in bootstrap_admin_user: {e}")
        session.rollback()
        session.close()
        return None


def get_user_by_email(email, include_password=False):
    session = ScopedSession()
    try:
        user = session.query(User).filter(User.email == email.strip().lower()).first()
        user_dict = user.to_dict(include_password=include_password) if user else None
        session.close()
        return user_dict
    except Exception as e:
        safe_log(f"[!] Error in get_user_by_email: {e}")
        session.close()
        return None


def get_user_by_id(user_id):
    session = ScopedSession()
    try:
        user = session.query(User).filter(User.id == int(user_id)).first()
        user_dict = user.to_dict() if user else None
        session.close()
        return user_dict
    except Exception as e:
        safe_log(f"[!] Error in get_user_by_id: {e}")
        session.close()
        return None


# ==========================================
# DOCUMENT MANAGEMENT FUNCTIONS
# ==========================================

def create_document(doc_id, user_id, filename, display_name, file_path, document_hash, file_size, upload_date, status, summary, checklist_json, risks_json, sources_json, clauses_json, doc_type=None, risk_level=None, risk_score=None, suggested_questions_json=None):
    session = ScopedSession()
    try:
        doc = Document(
            id=doc_id,
            user_id=int(user_id),
            filename=filename,
            display_name=display_name,
            file_path=file_path,
            document_hash=document_hash,
            file_size=file_size,
            upload_date=upload_date,
            status=status,
            summary=summary,
            checklist_json=checklist_json,
            risks_json=risks_json,
            sources_json=sources_json,
            clauses_json=clauses_json,
            doc_type=doc_type,
            risk_level=risk_level,
            risk_score=risk_score,
            suggested_questions_json=suggested_questions_json
        )
        session.add(doc)
        session.commit()
        session.refresh(doc)
        doc_dict = doc.to_dict()
        session.close()
        return doc_dict
    except Exception as e:
        safe_log(f"[!] Error in create_document: {e}")
        session.rollback()
        session.close()
        return None


def get_user_documents(user_id):
    session = ScopedSession()
    try:
        docs = session.query(Document).filter(Document.user_id == int(user_id)).order_by(Document.created_at.desc()).all()
        doc_dicts = [d.to_dict() for d in docs]
        session.close()
        return doc_dicts
    except Exception as e:
        safe_log(f"[!] Error in get_user_documents: {e}")
        session.close()
        return []


def get_document_by_id(doc_id, user_id):
    session = ScopedSession()
    try:
        doc = session.query(Document).filter(Document.id == doc_id, Document.user_id == int(user_id)).first()
        doc_dict = doc.to_dict() if doc else None
        session.close()
        return doc_dict
    except Exception as e:
        safe_log(f"[!] Error in get_document_by_id: {e}")
        session.close()
        return None


def get_document_by_hash(user_id, document_hash):
    session = ScopedSession()
    try:
        doc = session.query(Document).filter(
            Document.user_id == int(user_id),
            Document.document_hash == document_hash
        ).order_by(Document.created_at.desc()).first()
        doc_dict = doc.to_dict() if doc else None
        session.close()
        return doc_dict
    except Exception as e:
        safe_log(f"[!] Error in get_document_by_hash: {e}")
        session.close()
        return None


def delete_user_document(doc_id, user_id):
    session = ScopedSession()
    try:
        # Strictly verify ownership using BOTH doc_id AND user_id
        doc = session.query(Document).filter(Document.id == str(doc_id), Document.user_id == int(user_id)).first()
        if doc:
            file_path = doc.file_path

            # 1. Delete associated chat history records tied to this document and user
            session.query(ChatMessage).filter(
                ChatMessage.document_id == str(doc_id),
                ChatMessage.user_id == int(user_id)
            ).delete(synchronize_session=False)

            # 2. Delete document SQL record
            session.delete(doc)
            session.commit()
            session.close()

            # 3. Delete stored PDF file on disk if it exists
            if file_path and os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    safe_log(f"[+] Deleted stored PDF file: {file_path}")
                except Exception as fe:
                    safe_log(f"[!] Warning removing PDF file {file_path}: {fe}")

            # 4. Delete vector / Chroma DB data associated with this document
            try:
                from rag.retrieve import collection
                if collection:
                    collection.delete(where={"doc_id": str(doc_id)})
                    safe_log(f"[+] Deleted ChromaDB vector data for doc_id={doc_id}")
            except Exception as ve:
                safe_log(f"[!] ChromaDB vector deletion notice for doc_id={doc_id}: {ve}")

            return True

        session.close()
        return False
    except Exception as e:
        safe_log(f"[!] Error in delete_user_document: {e}")
        session.rollback()
        session.close()
        return False


# ==========================================
# ACTIVITY LOG FUNCTIONS
# ==========================================

def log_activity(user_id, action, details=None):
    session = ScopedSession()
    try:
        log_entry = ActivityLog(
            user_id=int(user_id) if user_id else None,
            action=action.strip(),
            details=str(details) if details else None
        )
        session.add(log_entry)
        session.commit()
        session.refresh(log_entry)
        log_dict = log_entry.to_dict()
        session.close()
        return log_dict
    except Exception as e:
        safe_log(f"[!] Error in log_activity: {e}")
        session.rollback()
        session.close()
        return None


def get_user_activity_logs(user_id, limit=50):
    session = ScopedSession()
    try:
        logs = session.query(ActivityLog).filter(
            ActivityLog.user_id == int(user_id)
        ).order_by(ActivityLog.created_at.desc()).limit(limit).all()
        log_dicts = [l.to_dict() for l in logs]
        session.close()
        return log_dicts
    except Exception as e:
        safe_log(f"[!] Error in get_user_activity_logs: {e}")
        session.close()
        return []


# ==========================================
# ADMIN DASHBOARD ANALYTICS FUNCTIONS
# ==========================================

# ==========================================
# ADMIN DASHBOARD ANALYTICS FUNCTIONS
# ==========================================

def get_admin_stats():
    session = ScopedSession()
    try:
        total_users = session.query(User).count()
        total_documents = session.query(Document).count()
        total_analyses = session.query(Document).filter(Document.status.ilike("%analyzed%")).count()
        if total_analyses == 0:
            total_analyses = total_documents
        total_questions = session.query(ActivityLog).filter(ActivityLog.action == "RAG_QUESTION").count()
        total_activities = session.query(ActivityLog).count()

        # Active users: users with at least 1 document or 1 activity log
        user_ids_with_docs = session.query(Document.user_id).distinct().all()
        user_ids_with_logs = session.query(ActivityLog.user_id).distinct().all()
        active_user_ids = set([r[0] for r in user_ids_with_docs if r[0]] + [r[0] for r in user_ids_with_logs if r[0]])
        active_users = len(active_user_ids) if active_user_ids else (1 if total_users > 0 else 0)

        session.close()
        return {
            "total_users": total_users,
            "active_users": active_users,
            "total_documents": total_documents,
            "total_analyses": total_analyses,
            "total_questions": total_questions,
            "total_activities": total_activities
        }
    except Exception as e:
        safe_log(f"[!] Error in get_admin_stats: {e}")
        session.close()
        return {
            "total_users": 0,
            "active_users": 0,
            "total_documents": 0,
            "total_analyses": 0,
            "total_questions": 0,
            "total_activities": 0
        }


def get_all_users_admin(limit=100):
    session = ScopedSession()
    try:
        users = session.query(User).order_by(User.created_at.desc()).limit(limit).all()
        result = []
        for u in users:
            doc_count = session.query(Document).filter(Document.user_id == u.id).count()
            analysis_count = session.query(ActivityLog).filter(
                ActivityLog.user_id == u.id,
                ActivityLog.action.in_(["DOCUMENT_ANALYZE", "RAG_QUESTION"])
            ).count()
            
            # Find last activity timestamp
            latest_log = session.query(ActivityLog).filter(ActivityLog.user_id == u.id).order_by(ActivityLog.created_at.desc()).first()
            latest_doc = session.query(Document).filter(Document.user_id == u.id).order_by(Document.created_at.desc()).first()
            
            last_act = None
            if latest_log and latest_log.created_at:
                last_act = latest_log.created_at.isoformat()
            elif latest_doc and latest_doc.created_at:
                last_act = latest_doc.created_at.isoformat()
            elif u.created_at:
                last_act = u.created_at.isoformat()

            is_active = doc_count > 0 or (latest_log is not None)
            
            u_dict = u.to_dict()
            u_dict["document_count"] = doc_count
            u_dict["analysis_count"] = max(doc_count, analysis_count)
            u_dict["last_activity"] = last_act
            u_dict["status"] = "Active" if is_active else "Inactive"
            result.append(u_dict)

        session.close()
        return result
    except Exception as e:
        safe_log(f"[!] Error in get_all_users_admin: {e}")
        session.close()
        return []


def get_user_details_admin(user_id):
    session = ScopedSession()
    try:
        u = session.query(User).filter(User.id == user_id).first()
        if not u:
            session.close()
            return None

        u_dict = u.to_dict()
        
        docs = session.query(Document).filter(Document.user_id == user_id).order_by(Document.created_at.desc()).all()
        doc_dicts = [d.to_dict() for d in docs]
        
        logs = session.query(ActivityLog).filter(ActivityLog.user_id == user_id).order_by(ActivityLog.created_at.desc()).all()
        log_dicts = [l.to_dict() for l in logs]

        latest_act = logs[0].created_at.isoformat() if logs and logs[0].created_at else (
            docs[0].created_at.isoformat() if docs and docs[0].created_at else u.created_at.isoformat() if u.created_at else None
        )

        u_dict["document_count"] = len(docs)
        u_dict["analysis_count"] = len(docs)
        u_dict["last_activity"] = latest_act
        u_dict["status"] = "Active" if (len(docs) > 0 or len(logs) > 0) else "Inactive"

        session.close()
        return {
            "user": u_dict,
            "documents": doc_dicts,
            "activity": log_dicts
        }
    except Exception as e:
        safe_log(f"[!] Error in get_user_details_admin for user {user_id}: {e}")
        session.close()
        return None


def get_all_activity_admin(limit=100):
    session = ScopedSession()
    try:
        logs = session.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(limit).all()
        result = []
        for l in logs:
            l_dict = l.to_dict()
            if l.user_id:
                u = session.query(User).filter(User.id == l.user_id).first()
                if u:
                    l_dict["user_name"] = u.name
                    l_dict["user_email"] = u.email
            result.append(l_dict)
        session.close()
        return result
    except Exception as e:
        safe_log(f"[!] Error in get_all_activity_admin: {e}")
        session.close()
        return []


def get_all_documents_admin(limit=100):
    session = ScopedSession()
    try:
        docs = session.query(Document).order_by(Document.created_at.desc()).limit(limit).all()
        result = []
        for d in docs:
            d_dict = d.to_dict()
            u = session.query(User).filter(User.id == d.user_id).first()
            if u:
                d_dict["user_name"] = u.name
                d_dict["user_email"] = u.email
            result.append(d_dict)
        session.close()
        return result
    except Exception as e:
        safe_log(f"[!] Error in get_all_documents_admin: {e}")
        session.close()
        return []


# ==========================================
# CHAT MESSAGE FUNCTIONS
# ==========================================

from models import ChatMessage
import uuid

def save_chat_message(user_id, document_id, sender, text, source=None, page=None, confidence=None, message_id=None):
    session = ScopedSession()
    try:
        msg_id = message_id or f"msg_{uuid.uuid4().hex[:12]}"
        msg = ChatMessage(
            id=msg_id,
            user_id=int(user_id),
            document_id=document_id,
            sender=sender,
            text=text,
            source=source,
            page=str(page) if page else None,
            confidence=confidence
        )
        session.add(msg)
        session.commit()
        session.refresh(msg)
        msg_dict = msg.to_dict()
        session.close()
        return msg_dict
    except Exception as e:
        safe_log(f"[!] Error in save_chat_message: {e}")
        session.rollback()
        session.close()
        return None


def get_chat_history(user_id, document_id):
    session = ScopedSession()
    try:
        msgs = session.query(ChatMessage).filter(
            ChatMessage.user_id == int(user_id),
            ChatMessage.document_id == document_id
        ).order_by(ChatMessage.created_at.asc()).all()
        msg_dicts = [m.to_dict() for m in msgs]
        session.close()
        return msg_dicts
    except Exception as e:
        safe_log(f"[!] Error in get_chat_history: {e}")
        session.close()
        return []


def clear_chat_history(user_id, document_id):
    session = ScopedSession()
    try:
        session.query(ChatMessage).filter(
            ChatMessage.user_id == int(user_id),
            ChatMessage.document_id == document_id
        ).delete()
        session.commit()
        session.close()
        return True
    except Exception as e:
        safe_log(f"[!] Error in clear_chat_history: {e}")
        session.rollback()
        session.close()
        return False

