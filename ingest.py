import os
import sys

# Add backend/rag directory to sys.path and run ingestion script
target_dir = os.path.join(os.path.dirname(__file__), "backend", "rag")
if target_dir not in sys.path:
    sys.path.insert(0, target_dir)

from ingest import ingest

if __name__ == "__main__":
    ingest()
