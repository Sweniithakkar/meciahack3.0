import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_RAG = os.path.join(PROJECT_ROOT, "backend", "rag")

if BACKEND_RAG not in sys.path:
    sys.path.insert(0, BACKEND_RAG)

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.rag.retrieve import retrieve_documents, main

if __name__ == "__main__":
    main()
