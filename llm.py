import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_RAG = os.path.join(SCRIPT_DIR, "backend", "rag")

if BACKEND_RAG not in sys.path:
    sys.path.insert(0, BACKEND_RAG)

from llm import generate_answer, generate_checklist, get_available_model, main

if __name__ == "__main__":
    main()
