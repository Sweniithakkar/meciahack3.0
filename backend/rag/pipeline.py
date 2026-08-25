import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))

# Automatically load venv site-packages if running with global python
venv_site = os.path.join(PROJECT_ROOT, "venv", "Lib", "site-packages")
if os.path.exists(venv_site) and venv_site not in sys.path:
    sys.path.insert(0, venv_site)

if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from ingest import ingest
from llm import main as run_llm

def run_pipeline():
    print("=== Legal Document RAG Pipeline ===")
    # Run document ingestion to ensure database is up to date
    ingest()
    print("\nStarting Interactive QA / LLM System...")
    run_llm()

if __name__ == "__main__":
    run_pipeline()
