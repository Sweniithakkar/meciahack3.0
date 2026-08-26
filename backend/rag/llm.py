import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))

venv_site = os.path.join(PROJECT_ROOT, "venv", "Lib", "site-packages")
if os.path.exists(venv_site) and venv_site not in sys.path:
    sys.path.insert(0, venv_site)

if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

import ollama

DEFAULT_MODEL = "llama3.2:3b"


def get_available_model():
    """Returns available Ollama model for chat generation."""
    try:
        response = ollama.list()
        models = []
        if hasattr(response, "models"):
            models = [m.model for m in response.models if hasattr(m, "model")]
        elif isinstance(response, dict):
            models = [m.get("name") or m.get("model") for m in response.get("models", [])]
        
        # Prefer llama3.2, llama, gemma models that support chat
        for m in models:
            if m and ("llama" in m.lower() or "gemma" in m.lower()) and "embedding" not in m.lower():
                return m
        if models:
            for m in models:
                if m and "embedding" not in m.lower():
                    return m
    except Exception as e:
        print(f"[!] Warning checking Ollama models: {e}")
    return DEFAULT_MODEL


def generate_answer(question, context):
    """Generates an answer to the user's question using retrieved document context."""
    model_name = get_available_model()
    prompt = f"""
You are Legal Lence, an AI legal document analyst and explainer.

Use the provided legal document context to answer the user's question accurately and clearly.

LEGAL CONTEXT:
{context}

USER QUESTION:
{question}

Instructions:
- Explain in simple, professional language.
- Base your response on the provided context.
- Highlight key terms, figures, obligations, or provisions where relevant.
- Mention document source details if available.

Answer:
"""
    try:
        response = ollama.chat(
            model=model_name,
            messages=[{"role": "user", "content": prompt}]
        )
        return response["message"]["content"]
    except Exception as e:
        return f"Error generating answer with model {model_name}: {e}"


def generate_checklist(context):
    """Generates a 'BEFORE YOU SIGN' checklist based on legal document context."""
    model_name = get_available_model()
    prompt = f"""
You are Legal Lence, an AI legal document risk advisor.

Based on the provided legal document context, generate a practical "BEFORE YOU SIGN" checklist.

LEGAL CONTEXT:
{context}

Instructions:
- List 3 to 5 critical clauses, key obligations, payment/financial terms, probation/notice periods, or potential risks the user must verify before signing.
- Format as clean, clear bullet points.
- Keep language direct, actionable, and easy to understand.

Checklist:
"""
    try:
        response = ollama.chat(
            model=model_name,
            messages=[{"role": "user", "content": prompt}]
        )
        return response["message"]["content"]
    except Exception as e:
        return f"Error generating checklist with model {model_name}: {e}"


def main():
    try:
        from retrieve import retrieve_documents
    except ImportError:
        retrieve_documents = None

    if len(sys.argv) > 1:
        question = " ".join(sys.argv[1:])
    else:
        try:
            question = input("\nEnter your legal question: ")
        except (EOFError, KeyboardInterrupt):
            question = "What are the main terms in the document?"

    if not question.strip():
        question = "What are the main terms in the document?"

    print(f"\n[Legal Lence] Searching knowledge base for: '{question}'...")
    
    context = ""
    if retrieve_documents:
        results = retrieve_documents(question)
        if results and "documents" in results and results["documents"] and results["documents"][0]:
            context_chunks = results["documents"][0]
            sources = results["metadatas"][0] if "metadatas" in results and results["metadatas"] else []
            formatted_chunks = []
            for i, chunk in enumerate(context_chunks):
                src = sources[i] if i < len(sources) else {}
                formatted_chunks.append(f"Source ({src.get('source', 'Unknown')}): {chunk}")
            context = "\n\n".join(formatted_chunks)

    if not context:
        context = "No specific document context found in database."

    print(f"\n[Legal Lence] Generating answer & checklist using model...\n")
    answer = generate_answer(question, context)
    checklist = generate_checklist(context)
    
    print("========== LEGAL LENCE ANSWER ==========\n")
    print(answer)
    print("\n========== BEFORE YOU SIGN ==========\n")
    print(checklist)
    print("\n========================================\n")


if __name__ == "__main__":
    main()
