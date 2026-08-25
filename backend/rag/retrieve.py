import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from retrive import retrieve_documents, ingest if 'ingest' in locals() else None

if __name__ == "__main__":
    from retrive import main if 'main' in locals() else None
    exec(open(os.path.join(SCRIPT_DIR, "retrive.py")).read())
