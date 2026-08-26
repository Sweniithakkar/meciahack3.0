import os
import sys

# Ensure stdout uses UTF-8 to prevent Windows charmap/Unicode errors
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)
    except Exception:
        pass

# Ensure venv site-packages and backend/rag are in sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = SCRIPT_DIR
venv_site = os.path.join(PROJECT_ROOT, "venv", "Lib", "site-packages")
if os.path.exists(venv_site) and venv_site not in sys.path:
    sys.path.insert(0, venv_site)

backend_rag = os.path.join(PROJECT_ROOT, "backend", "rag")
if os.path.exists(backend_rag) and backend_rag not in sys.path:
    sys.path.insert(0, backend_rag)

if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

from retriever import retrieve_documents
from llm import generate_answer, generate_checklist


def build_context(results):
    """
    Convert retrieved ChromaDB results into context for the LLM.
    """
    if not results or "documents" not in results or not results["documents"] or not results["documents"][0]:
        return "", []

    documents = results["documents"][0]
    metadata = results["metadatas"][0] if "metadatas" in results and results["metadatas"] else [{}] * len(documents)

    context = ""

    for i, document in enumerate(documents):
        meta = metadata[i] if i < len(metadata) else {}
        source = meta.get("source", "Unknown")
        chunk_number = meta.get("chunk", "Unknown")

        context += f"""
SOURCE: {source}
CHUNK: {chunk_number}

CONTENT:
{document}

-------------------------
"""

    return context, metadata


def analyze_document(question):
    # 1. Retrieve relevant chunks from uploaded PDF
    results = retrieve_documents(question, n_results=5)

    # 2. Convert chunks into LLM context
    context, metadata = build_context(results)

    if not context.strip():
        return {
            "answer": "I could not find relevant information in the uploaded document.",
            "checklist": "• No specific checklist items found.",
            "sources": []
        }

    # 3. Generate answer
    answer = generate_answer(question, context)

    # 4. Generate Before You Sign checklist
    checklist = generate_checklist(context)

    # 5. Return everything
    return {
        "answer": answer,
        "checklist": checklist,
        "sources": metadata
    }


# ==================================
# TEST COMPLETE PIPELINE
# ==================================

def main():
    if len(sys.argv) > 1:
        question = " ".join(sys.argv[1:]).strip()
    else:
        try:
            question = input("\nEnter your question about the PDF: ").strip()
        except (EOFError, KeyboardInterrupt):
            question = "What are the main terms and compensation details in the offer letter?"

    if not question:
        question = "What are the main terms and compensation details in the offer letter?"

    print(f"\n[*] Analyzing document for question: '{question}'...")
    result = analyze_document(question)

    print("\n========== LEGAL LENCE ==========\n")

    print("ANSWER:")
    print(result["answer"])

    print("\n========== BEFORE YOU SIGN ==========\n")

    print(result["checklist"])

    print("\n========== SOURCES ==========\n")

    for source in result["sources"]:
        print(source)


if __name__ == "__main__":
    main()