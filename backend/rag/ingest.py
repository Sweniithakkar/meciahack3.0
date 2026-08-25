import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))

venv_site = os.path.join(PROJECT_ROOT, "venv", "Lib", "site-packages")
if os.path.exists(venv_site) and venv_site not in sys.path:
    sys.path.insert(0, venv_site)

BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
DATA_DIR = os.path.join(BACKEND_DIR, "data", "legal_documents")
DB_DIR = os.path.join(SCRIPT_DIR, "chroma_db")

os.makedirs(DATA_DIR, exist_ok=True)

def load_documents(data_dir):
    docs = []
    
    files = [os.path.join(data_dir, f) for f in os.listdir(data_dir) if os.path.isfile(os.path.join(data_dir, f))]
    if not files:
        sample_path = os.path.join(data_dir, "sample_legal_document.txt")
        with open(sample_path, "w", encoding="utf-8") as f:
            f.write(
                "Legal Document Sample - FastAPI Python RAG System\n"
                "This is a legal document repository for Retrieval-Augmented Generation (RAG).\n"
                "Documents stored under backend/data/legal_documents/ are ingested into ChromaDB "
                "to provide context-aware legal analysis and query answering."
            )
        print(f"[+] Created sample legal document: {sample_path}")
        files = [sample_path]

    for file_path in files:
        ext = os.path.splitext(file_path)[1].lower()
        try:
            if ext == ".pdf":
                import pypdf
                reader = pypdf.PdfReader(file_path)
                text = ""
                for page in reader.pages:
                    text += (page.extract_text() or "") + "\n"
                if text.strip():
                    docs.append({"source": os.path.basename(file_path), "text": text})
            elif ext in [".txt", ".md", ".json", ".csv", ".py", ".html"]:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read()
                if text.strip():
                    docs.append({"source": os.path.basename(file_path), "text": text})
        except Exception as e:
            print(f"[!] Error reading {file_path}: {e}")
            
    return docs

def chunk_text(text, chunk_size=500, chunk_overlap=50):
    chunks = []
    start = 0
    text_len = len(text)
    while start < text_len:
        end = start + chunk_size
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start += chunk_size - chunk_overlap
    return chunks

def ingest():
    print("=== Starting RAG Legal Document Ingestion ===")
    print(f"[*] Data Directory: {DATA_DIR}")
    print(f"[*] Database Directory: {DB_DIR}")

    docs = load_documents(DATA_DIR)
    if not docs:
        print("[!] No readable legal documents found for ingestion.")
        return

    all_chunks = []
    all_metadatas = []
    all_ids = []

    total_chunks = 0
    for doc in docs:
        chunks = chunk_text(doc["text"])
        for idx, chunk in enumerate(chunks):
            total_chunks += 1
            all_chunks.append(chunk)
            all_metadatas.append({"source": doc["source"], "chunk_index": idx})
            all_ids.append(f"{doc['source']}_chunk_{idx}")

    print(f"[*] Processed {len(docs)} document(s) into {total_chunks} chunk(s).")

    import chromadb
    from chromadb.utils.embedding_functions import DefaultEmbeddingFunction

    client = chromadb.PersistentClient(path=DB_DIR)
    embedding_fn = DefaultEmbeddingFunction()

    # Populate both 'legal_documents' and 'rag_documents' collections
    for col_name in ["legal_documents", "rag_documents"]:
        try:
            client.delete_collection(name=col_name)
        except Exception:
            pass

        collection = client.get_or_create_collection(
            name=col_name,
            embedding_function=embedding_fn
        )

        collection.upsert(
            documents=all_chunks,
            metadatas=all_metadatas,
            ids=all_ids
        )

    print(f"[+] Successfully ingested {total_chunks} chunks into ChromaDB at '{DB_DIR}'.")

if __name__ == "__main__":
    ingest()
