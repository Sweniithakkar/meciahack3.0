import os
import sys

# Entry point shim for running document_ingest.py from project root
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(SCRIPT_DIR, "backend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from document_ingest import main

if __name__ == "__main__":
    main()
