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
    try:
        response = ollama.list()
        models = []
        if hasattr(response, "models"):
            models = [m.model for m in response.models if hasattr(m, "model")]
        elif isinstance(response, dict):
            models = [m.get("name") or m.get("model") for m in response.get("models", [])]
        
        for m in models:
            if m and "llama3.2" in m:
                return m
        if models and models[0]:
            return models[0]
    except Exception as e:
        print(f"[!] Warning checking Ollama models: {e}")
    return DEFAULT_MODEL

def generate_answer(question, context):
    model_name = get_available_model()
    prompt = f"""
You are Legal Lence, an AI legal document explainer.

Use the provided legal context to answer the user's question.

LEGAL CONTEXT:
{context}

USER QUESTION:
{question}

Instructions:
- Explain in simple language.
- Use only the provided context.
- Do not invent laws, sections, cases, or facts.
- If the context is insufficient, clearly say so.
- Mention the source when available.

Answer:
"""

    response = ollama.chat(
        model=model_name,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response["message"]["content"]

def main():
    try:
        from retrive import retrieve_documents
    except ImportError:
        retrieve_documents = None

    if len(sys.argv) > 1:
        question = " ".join(sys.argv[1:])
    else:
        try:
            question = input("\nEnter your legal question: ")
        except (EOFError, KeyboardInterrupt):
            question = "Give me information about the legal document"

    if not question.strip():
        question = "Give me information about the legal document"

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

    print(f"\n[Legal Lence] Generating response using model...\n")
    answer = generate_answer(question, context)
    print("========== LEGAL LENCE ANSWER ==========\n")
    print(answer)
    print("\n========================================\n")

if __name__ == "__main__":
    main()
