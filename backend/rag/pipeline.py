import os
import sys

# Ensure UTF-8 output on Windows terminals
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)
    except Exception:
        pass

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))

# Automatically load venv site-packages if running with global python
venv_site = os.path.join(PROJECT_ROOT, "venv", "Lib", "site-packages")
if os.path.exists(venv_site) and venv_site not in sys.path:
    sys.path.insert(0, venv_site)

if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from retrieve import retrieve_documents
from llm import generate_answer, generate_checklist


def analyze_document(question):
    results = retrieve_documents(
        question,
        n_results=5
    )

    documents = results["documents"][0] if results and "documents" in results and results["documents"] else []
    metadata = results["metadatas"][0] if results and "metadatas" in results and results["metadatas"] else []

    context = ""

    for i, document in enumerate(documents):
        meta = metadata[i] if i < len(metadata) else {}
        source = meta.get("source", "Unknown")

        context += f"""
SOURCE: {source}

CONTENT:
{document}

-------------------------
"""

    if not context.strip():
        return {
            "answer": "I could not find relevant information in the uploaded document.",
            "checklist": "• No specific checklist items found.",
            "sources": []
        }

    # Page 2: Answer
    answer = generate_answer(
        question,
        context
    )

    # Page 3: Checklist
    checklist = generate_checklist(
        context
    )

    return {
        "answer": answer,
        "checklist": checklist,
        "sources": metadata
    }


def safe_print(text):
    """Safely prints text on Windows terminals without UnicodeEncodeError crashes."""
    try:
        print(text)
    except UnicodeEncodeError:
        encoding = getattr(sys.stdout, "encoding", None) or "utf-8"
        encoded = str(text).encode(encoding, errors="replace").decode(encoding, errors="replace")
        print(encoded)


def run_pipeline():
    safe_print("=== Legal Document RAG Pipeline ===")
    
    if len(sys.argv) > 1:
        question = " ".join(sys.argv[1:]).strip()
    else:
        try:
            question = input("\nEnter your question about the PDF: ").strip()
        except (EOFError, KeyboardInterrupt):
            question = "What is the probation period and salary structure?"

    if not question:
        question = "What is the probation period and salary structure?"

    safe_print(f"\n[*] Analyzing document for question: '{question}'...")
    result = analyze_document(question)

    safe_print("\n========== LEGAL LENCE ==========\n")
    safe_print("ANSWER:")
    safe_print(result["answer"])

    safe_print("\n========== BEFORE YOU SIGN ==========\n")
    safe_print(result["checklist"])

    safe_print("\n========== SOURCES ==========\n")
    for source in result["sources"]:
        safe_print(source)


if __name__ == "__main__":
    run_pipeline()
