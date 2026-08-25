import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))

venv_site = os.path.join(PROJECT_ROOT, "venv", "Lib", "site-packages")
if os.path.exists(venv_site) and venv_site not in sys.path:
    sys.path.insert(0, venv_site)

import chromadb
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Check candidate paths for chroma_db
CHROMA_PATH = os.path.join(SCRIPT_DIR, "chroma_db")
if not os.path.exists(CHROMA_PATH):
    alt_path = os.path.join(SCRIPT_DIR, "..", "vector_db", "chroma_db")
    if os.path.exists(alt_path):
        CHROMA_PATH = alt_path

EMBEDDING_MODEL = "embeddinggemma"

client = chromadb.PersistentClient(path=CHROMA_PATH)
embedding_fn = DefaultEmbeddingFunction()

# Access legal_documents collection (fallback to rag_documents or get_or_create)
try:
    collection = client.get_collection(name="legal_documents", embedding_function=embedding_fn)
except Exception:
    try:
        collection = client.get_collection(name="rag_documents", embedding_function=embedding_fn)
    except Exception:
        collection = client.get_or_create_collection(name="legal_documents", embedding_function=embedding_fn)

def retrieve_documents(query, n_results=3):
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    return results

def main():
    if len(sys.argv) > 1:
        question = " ".join(sys.argv[1:])
    else:
        try:
            question = input("\nEnter your legal question: ")
        except (EOFError, KeyboardInterrupt):
            question = "FastAPI Python RAG System"

    if not question.strip():
        question = "FastAPI Python RAG System"

    print(f"\nSearching for: '{question}'...")
    results = retrieve_documents(question)

    print("\n========== RELEVANT LEGAL INFORMATION ==========\n")

    if results and "documents" in results and results["documents"] and results["documents"][0]:
        for i, document in enumerate(results["documents"][0]):
            print(f"--- Result {i + 1} ---")
            print(document)

            print("\nSource:")
            if "metadatas" in results and results["metadatas"] and results["metadatas"][0]:
                print(results["metadatas"][0][i])
            else:
                print("N/A")

            print("\n")
    else:
        print("No matching documents found.")

if __name__ == "__main__":
    main()