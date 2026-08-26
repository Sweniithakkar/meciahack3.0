import os
import sys

# Ensure UTF-8 output on Windows terminals
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Determine script paths and add backend directory & venv to sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))

venv_site = os.path.join(PROJECT_ROOT, "venv", "Lib", "site-packages")
if os.path.exists(venv_site) and venv_site not in sys.path:
    sys.path.insert(0, venv_site)

if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

import chromadb
import ollama

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
    response = ollama.embed(model=EMBEDDING_MODEL, input=text)
    if isinstance(response, dict) and "embeddings" in response:
        return response["embeddings"][0]
    elif hasattr(response, "embeddings"):
        return response.embeddings[0]
    else:
        raise ValueError(f"Unexpected embedding response structure: {response}")


# ==============================
# PROCESS PDF
# ==============================

def process_pdf(pdf_path):
    filename = os.path.basename(pdf_path)

    print(f"\n[+] Processing PDF: {filename}")

    # Step 1: Extract text
    text = extract_text(pdf_path)

    if not text or not text.strip():
        print(f"[!] No readable text found in PDF: {filename}")
        return

    print(f"[*] Extracted characters: {len(text)}")

    # Step 2: Create chunks
    chunks = create_chunks(text)

    print(f"[*] Total chunks created: {len(chunks)}")

    # Step 3: Create embeddings and store in ChromaDB
    for i, chunk in enumerate(chunks):
        embedding = create_embedding(chunk)

        collection.upsert(
            ids=[f"{filename}_chunk_{i}"],
            documents=[chunk],
            embeddings=[embedding],
            metadatas=[{"source": filename, "chunk": i}]
        )

        print(f"  • Stored chunk {i + 1}/{len(chunks)}")

    print(f"[+] Successfully stored '{filename}' in Vector DB!")


# ==============================
# MAIN
# ==============================

def main():
    print("=" * 60)
    print("           DOCUMENT INGESTION PIPELINE (EMBEDDINGGEMMA)")
    print("=" * 60)
    print(f"[*] PDF Folder: {PDF_FOLDER}")
    print(f"[*] Vector DB Path: {CHROMA_PATH}")
    print(f"[*] Embedding Model: {EMBEDDING_MODEL}")

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

    print(f"[*] Found {len(pdf_files)} PDF document(s) to process.\n")
    for filename in pdf_files:
        pdf_path = os.path.join(PDF_FOLDER, filename)
        process_pdf(pdf_path)

    print("\n[+] All PDF documents successfully ingested!")


if __name__ == "__main__":
    main()