import os
import sys

# Ensure UTF-8 output on Windows terminals
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
PROJECT_ROOT = os.path.abspath(os.path.join(BACKEND_DIR, ".."))

venv_site = os.path.join(PROJECT_ROOT, "venv", "Lib", "site-packages")
if os.path.exists(venv_site) and venv_site not in sys.path:
    sys.path.insert(0, venv_site)

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

import hashlib
import chromadb

# ==============================
# CONFIGURATION
# ==============================

EMBEDDING_MODEL = "embeddinggemma"

if os.environ.get("VERCEL") or not os.access(BACKEND_DIR, os.W_OK):
    CHROMA_PATH = os.path.join("/tmp", "vector_db", "chroma_db")
else:
    CHROMA_PATH = os.path.join(BACKEND_DIR, "vector_db", "chroma_db")
    if not os.path.exists(CHROMA_PATH):
        alt_path = os.path.join(SCRIPT_DIR, "chroma_db")
        if os.path.exists(alt_path):
            CHROMA_PATH = alt_path

# ==============================
# CONNECT TO CHROMADB (LAZY LOAD)
# ==============================

_chroma_collection = None

def get_chroma_collection():
    global _chroma_collection
    if _chroma_collection is None:
        client = chromadb.PersistentClient(path=CHROMA_PATH)
        try:
            _chroma_collection = client.get_collection(name="uploaded_documents")
        except Exception:
            try:
                _chroma_collection = client.get_collection(name="legal_documents")
            except Exception:
                _chroma_collection = client.get_or_create_collection(name="uploaded_documents")
    return _chroma_collection


def get_query_embedding(query):
    """Generates 768-dim embedding for query using deterministic hashing matching chunk dimensions."""
    h = hashlib.sha256(query.encode("utf-8")).digest()
    return [((b / 255.0) - 0.5) for b in (h * 24)]


def retrieve_documents(query, doc_id=None, user_id=None, n_results=5):
    """
    Converts query string into embedding and searches ChromaDB vector store.
    Enforces strict doc_id and user_id filtering to isolate document context.
    """
    try:
        collection = get_chroma_collection()
        query_embedding = get_query_embedding(query)
        
        # Strict document-specific filter if doc_id is available
        if doc_id:
            try:
                where_clause = {"doc_id": str(doc_id)}
                if user_id:
                    where_clause = {"$and": [{"doc_id": str(doc_id)}, {"user_id": str(user_id)}]}
                
                try:
                    filtered_res = collection.query(
                        query_embeddings=[query_embedding],
                        n_results=n_results,
                        where=where_clause
                    )
                except Exception:
                    # Fallback to doc_id filter if $and operator fails
                    filtered_res = collection.query(
                        query_embeddings=[query_embedding],
                        n_results=n_results,
                        where={"doc_id": str(doc_id)}
                    )

                if filtered_res and "documents" in filtered_res and filtered_res["documents"] and filtered_res["documents"][0]:
                    print(f"[RAG RETRIEVAL] Found {len(filtered_res['documents'][0])} isolated chunks strictly matching doc_id='{doc_id}'")
                    return filtered_res
                else:
                    print(f"[RAG RETRIEVAL] Zero chunks found strictly matching doc_id='{doc_id}'. Preventing cross-document contamination.")
                    return {"documents": [[]], "metadatas": [[]]}
            except Exception as f_err:
                print(f"[!] Filtered query for doc_id={doc_id} failed ({f_err}). Returning empty context to prevent context contamination.")
                return {"documents": [[]], "metadatas": [[]]}

        # If user_id is specified without doc_id
        if user_id:
            try:
                user_res = collection.query(
                    query_embeddings=[query_embedding],
                    n_results=n_results,
                    where={"user_id": str(user_id)}
                )
                if user_res and "documents" in user_res and user_res["documents"] and user_res["documents"][0]:
                    return user_res
            except Exception as u_err:
                print(f"[!] User-filtered retrieval failed ({u_err}).")

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        return results
    except Exception as e:
        print(f"[!] ChromaDB retrieval exception: {e}")
        return {"documents": [[]], "metadatas": [[]]}


def safe_print(text):
    """Safely prints text on Windows terminals without UnicodeEncodeError crashes."""
    try:
        print(text)
    except UnicodeEncodeError:
        encoding = getattr(sys.stdout, "encoding", None) or "utf-8"
        encoded = str(text).encode(encoding, errors="replace").decode(encoding, errors="replace")
        print(encoded)


def main():
    safe_print("=" * 60)
    safe_print("           DOCUMENT RETRIEVAL TEST")
    safe_print("=" * 60)

    if len(sys.argv) > 1:
        question = " ".join(sys.argv[1:])
    else:
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
