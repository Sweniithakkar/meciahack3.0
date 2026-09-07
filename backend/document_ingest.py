import os
import sys
import hashlib

# Ensure UTF-8 output on Windows terminals
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))

venv_site = os.path.join(PROJECT_ROOT, "venv", "Lib", "site-packages")
if os.path.exists(venv_site) and venv_site not in sys.path:
    sys.path.insert(0, venv_site)

if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

import chromadb
from utils.pdf_loader import extract_text
from utils.chunker import create_chunks

# ==============================
# CONFIGURATION
# ==============================

EMBEDDING_MODEL = "embeddinggemma"

if os.environ.get("VERCEL") or not os.access(SCRIPT_DIR, os.W_OK):
    CHROMA_PATH = os.path.join("/tmp", "vector_db", "chroma_db")
    PDF_FOLDER = os.path.join("/tmp", "legal_documents")
else:
    CHROMA_PATH = os.path.join(SCRIPT_DIR, "vector_db", "chroma_db")
    PDF_FOLDER = os.path.join(SCRIPT_DIR, "data", "legal_documents")

os.makedirs(os.path.dirname(CHROMA_PATH), exist_ok=True)
os.makedirs(PDF_FOLDER, exist_ok=True)

# ==============================
# CONNECT TO CHROMADB
# ==============================

client = chromadb.PersistentClient(path=CHROMA_PATH)
collection = client.get_or_create_collection(name="uploaded_documents")


# ==============================
# CREATE EMBEDDING
# ==============================

def create_embedding(text):
    """
    Creates text embedding vector (768 dimensions).
    Uses a deterministic 768-dim feature vector based on text content and hashing.
    """
    h = hashlib.sha256(text.encode("utf-8")).digest()
    vec = [((b / 255.0) - 0.5) for b in (h * 24)]
    return vec


def process_pdf(pdf_path, user_id=None, doc_id=None, doc_hash=None, pre_extracted_text=None):
    filename = os.path.basename(pdf_path)

    print(f"\n[+] Processing PDF: {filename} (User: {user_id}, DocID: {doc_id})")

    from utils.pdf_loader import PDFLoader
    loader = PDFLoader()
    doc_info = loader.load_pdf(pdf_path)
    pages = doc_info.get("pages", [])

    if not pages and pre_extracted_text:
        pages = [{"page_number": 1, "text": pre_extracted_text}]

    if not pages:
        print(f"[!] No readable text found in PDF: {filename}")
        return

    prefix = f"{user_id}_{doc_id}_" if (user_id and doc_id) else f"{filename}_"
    total_chunks = 0

    for page_info in pages:
        page_num = page_info.get("page_number", 1)
        page_text = page_info.get("text", "")
        if not page_text.strip():
            continue

        page_chunks = create_chunks(page_text, chunk_size=800, overlap=150)
        for i, chunk in enumerate(page_chunks):
            embedding = create_embedding(chunk)
            meta = {
                "source": filename,
                "page": page_num,
                "chunk": total_chunks
            }
            if user_id:
                meta["user_id"] = str(user_id)
            if doc_id:
                meta["doc_id"] = str(doc_id)

            collection.upsert(
                ids=[f"{prefix}p{page_num}_c{i}_{total_chunks}"],
                documents=[chunk],
                embeddings=[embedding],
                metadatas=[meta]
            )
            total_chunks += 1

    print(f"[+] Successfully stored '{filename}' in Vector DB! Total page-aware chunks: {total_chunks}")


def main():
    print("=" * 60)
    print("           DOCUMENT INGESTION PIPELINE")
    print("=" * 60)

    if not os.path.exists(PDF_FOLDER):
        print(f"[!] PDF folder not found at: {PDF_FOLDER}")
        return

    pdf_files = [
        file for file in os.listdir(PDF_FOLDER)
        if file.lower().endswith(".pdf") and os.path.isfile(os.path.join(PDF_FOLDER, file))
    ]

    if not pdf_files:
        print(f"[!] No PDF files found in {PDF_FOLDER}")
        return

    for filename in pdf_files:
        pdf_path = os.path.join(PDF_FOLDER, filename)
        process_pdf(pdf_path)

    print("\n[+] All PDF documents successfully ingested!")


if __name__ == "__main__":
    main()