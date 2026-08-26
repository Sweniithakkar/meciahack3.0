import os
import sys

# Ensure UTF-8 output on Windows terminals
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Ensure venv site-packages is loaded
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
PROJECT_ROOT = os.path.abspath(os.path.join(BACKEND_DIR, ".."))

venv_site = os.path.join(PROJECT_ROOT, "venv", "Lib", "site-packages")
if os.path.exists(venv_site) and venv_site not in sys.path:
    sys.path.insert(0, venv_site)

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

import chromadb
import ollama

# ==============================
# CONFIGURATION
# ==============================

CHROMA_PATH = os.path.join(BACKEND_DIR, "vector_db", "chroma_db")
if not os.path.exists(CHROMA_PATH):
    alt_path = os.path.join(SCRIPT_DIR, "chroma_db")
    if os.path.exists(alt_path):
        CHROMA_PATH = alt_path

EMBEDDING_MODEL = "embeddinggemma"

# ==============================
# CONNECT TO CHROMADB
# ==============================

client = chromadb.PersistentClient(path=CHROMA_PATH)

try:
    collection = client.get_collection(name="uploaded_documents")
except Exception:
    try:
        collection = client.get_collection(name="legal_documents")
    except Exception:
        collection = client.get_or_create_collection(name="uploaded_documents")


# ==============================
# RETRIEVE RELEVANT DOCUMENTS
# ==============================

def retrieve_documents(query, n_results=3):
    """
    Converts query string into embedding using embeddinggemma via Ollama,
    and searches ChromaDB vector store for top n_results chunks.
    """
    response = ollama.embed(model=EMBEDDING_MODEL, input=query)
    
    if isinstance(response, dict) and "embeddings" in response:
        query_embedding = response["embeddings"][0]
    elif hasattr(response, "embeddings"):
        query_embedding = response.embeddings[0]
    else:
        raise ValueError(f"Unexpected response format from ollama.embed: {response}")

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )

    return results


def safe_print(text):
    """Safely prints text on Windows terminals without UnicodeEncodeError crashes."""
    try:
        print(text)
    except UnicodeEncodeError:
        encoding = getattr(sys.stdout, "encoding", None) or "utf-8"
        encoded = str(text).encode(encoding, errors="replace").decode(encoding, errors="replace")
        print(encoded)


# ==============================
# TEST RETRIEVAL
# ==============================

def main():
    safe_print("=" * 60)
    safe_print("           DOCUMENT RETRIEVAL TEST (EMBEDDINGGEMMA)")
    safe_print("=" * 60)
    safe_print(f"[*] Vector DB Path: {CHROMA_PATH}")
    safe_print(f"[*] Collection Name: {collection.name}")

    if len(sys.argv) > 1:
        question = " ".join(sys.argv[1:])
    else:
        try:
            question = input("\nEnter your question about the PDF: ")
        except (EOFError, KeyboardInterrupt):
            question = "What are the payment and salary terms?"

    if not question.strip():
        question = "What are the payment and salary terms?"

    safe_print(f"\n[*] Searching for: '{question}'...")
    results = retrieve_documents(question, n_results=3)

    safe_print("\n========== RELEVANT PDF CONTENT ==========\n")

    if not results or "documents" not in results or not results["documents"] or not results["documents"][0]:
        safe_print("❌ No relevant information found.")
    else:
        for i, document in enumerate(results["documents"][0]):
            safe_print(f"--- Result {i + 1} ---")
            safe_print(document)
            safe_print("\nSource:")
            if "metadatas" in results and results["metadatas"] and results["metadatas"][0]:
                safe_print(results["metadatas"][0][i])
            else:
                safe_print("N/A")
            safe_print("\n")


if __name__ == "__main__":
    main()
