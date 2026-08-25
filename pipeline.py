import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
venv_site = os.path.join(PROJECT_ROOT, "venv", "Lib", "site-packages")
if os.path.exists(venv_site) and venv_site not in sys.path:
    sys.path.insert(0, venv_site)

target_dir = os.path.join(PROJECT_ROOT, "backend", "rag")
if target_dir not in sys.path:
    sys.path.insert(0, target_dir)

from pipeline import run_pipeline

if __name__ == "__main__":
    run_pipeline()
