import os
import sys

# Entry point shim for backend/pdf_loader.py
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
UTILS_DIR = os.path.join(SCRIPT_DIR, "utils")

if UTILS_DIR not in sys.path:
    sys.path.insert(0, UTILS_DIR)

from pdf_loader import main, PDFLoader, load_pdf, load_pdf_directory, extract_pdf_text

if __name__ == "__main__":
    main()
