import os
import sys

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

import hashlib
import chromadb
from utils.pdf_loader import extract_text
from utils.chunker import create_chunks

# ==============================
# CONFIGURATION
# ==============================

CHROMA_PATH = os.path.join(SCRIPT_DIR, "vector_db", "chroma_db")
EMBEDDING_MODEL = "embeddinggemma"
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
    Creates text embedding vector.
    Tries Ollama embeddinggemma first; falls back to Gemini API or deterministic vector.
    """
    try:
        import ollama
        response = ollama.embed(model=EMBEDDING_MODEL, input=text)
        if isinstance(response, dict) and "embeddings" in response:
            return response["embeddings"][0]
        elif hasattr(response, "embeddings"):
            return response.embeddings[0]
    except Exception as e:
        print(f"[!] Ollama embedding failed ({e}). Trying fallback...")

    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if gemini_key:
        try:
            import requests
            url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={gemini_key}"
            payload = {
                "model": "models/text-embedding-004",
                "content": {"parts": [{"text": text}]}
            }
            res = requests.post(url, json=payload, timeout=15)
            if res.status_code == 200:
                return res.json()["embedding"]["values"]
        except Exception as gem_err:
            print(f"[!] Gemini embedding failed: {gem_err}")

    # Fallback pseudo-vector for lightweight cloud execution
    h = hashlib.sha256(text.encode("utf-8")).digest()
    vec = [((b / 255.0) - 0.5) for b in (h * 12)]
    return vec


# ==============================
# PROCESS PDF
# ==============================

def process_pdf(pdf_path, user_id=None, doc_id=None, doc_hash=None, pre_extracted_text=None):
    filename = os.path.basename(pdf_path)

    print(f"\n[+] Processing PDF: {filename} (User: {user_id}, DocID: {doc_id})")

    # Step 1: Use pre-extracted text or extract from file
    text = pre_extracted_text if pre_extracted_text else extract_text(pdf_path)

    if not text or not text.strip():
        print(f"[!] No readable text found in PDF: {filename}")
        return

    print(f"[*] Extracted characters: {len(text)}")

    # Step 2: Create chunks
    chunks = create_chunks(text)

    print(f"[*] Total chunks created: {len(chunks)}")

    # Step 3: Create embeddings and store in ChromaDB
    prefix = f"{user_id}_{doc_id}_" if (user_id and doc_id) else f"{filename}_"
    
    for i, chunk in enumerate(chunks):
        embedding = create_embedding(chunk)

        meta = {
            "source": filename,
            "chunk": i
        }
        if user_id:
            meta["user_id"] = str(user_id)
        if doc_id:
            meta["doc_id"] = str(doc_id)

        collection.upsert(
            ids=[f"{prefix}chunk_{i}"],
            documents=[chunk],
            embeddings=[embedding],
            metadatas=[meta]
        )

    print(f"[+] Successfully stored '{filename}' in Vector DB!")


def main():
    print("=" * 60)
    print("           DOCUMENT INGESTION PIPELINE (EMBEDDINGGEMMA)")
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