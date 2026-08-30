import os
import sqlite3

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(BACKEND_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

DB_PATH = os.path.join(DATA_DIR, "legal_lens.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            display_name TEXT,
            file_path TEXT,
            document_hash TEXT,
            file_size TEXT,
            upload_date TEXT,
            status TEXT,
            summary TEXT,
            checklist_json TEXT,
            risks_json TEXT,
            sources_json TEXT,
            clauses_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    conn.commit()
    conn.close()

def create_user(name, email, password_hash):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            (name, email, password_hash)
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return get_user_by_id(user_id)
    except sqlite3.IntegrityError:
        conn.close()
        return None

def get_user_by_email(email):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_id(user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def create_document(doc_id, user_id, filename, display_name, file_path, document_hash, file_size, upload_date, status, summary, checklist_json, risks_json, sources_json, clauses_json):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO documents (
            id, user_id, filename, display_name, file_path, document_hash,
            file_size, upload_date, status, summary, checklist_json,
            risks_json, sources_json, clauses_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        doc_id, user_id, filename, display_name, file_path, document_hash,
        file_size, upload_date, status, summary, checklist_json,
        risks_json, sources_json, clauses_json
    ))
    conn.commit()
    conn.close()
    return get_document_by_id(doc_id, user_id)

def get_user_documents(user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC",
        (user_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_document_by_id(doc_id, user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM documents WHERE id = ? AND user_id = ?",
        (doc_id, user_id)
    )
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_document_by_hash(user_id, document_hash):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM documents WHERE user_id = ? AND document_hash = ? ORDER BY created_at DESC LIMIT 1",
        (user_id, document_hash)
    )
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def delete_user_document(doc_id, user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM documents WHERE id = ? AND user_id = ?",
        (doc_id, user_id)
    )
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0
