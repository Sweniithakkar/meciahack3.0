import os
import sys

# Reconfigure stdout/stderr to UTF-8 on Windows to avoid UnicodeEncodeError (e.g. for ₹ symbol)
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

if hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Ensure venv site-packages is in sys.path if running outside activated venv
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
PROJECT_ROOT = os.path.abspath(os.path.join(BACKEND_DIR, ".."))

venv_site = os.path.join(PROJECT_ROOT, "venv", "Lib", "site-packages")
if os.path.exists(venv_site) and venv_site not in sys.path:
    sys.path.insert(0, venv_site)

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)


class PDFLoader:
    """Utility class to load and extract text and metadata from PDF files."""

    def __init__(self, data_dir=None):
        if data_dir:
            self.data_dir = os.path.abspath(data_dir)
        else:
            self.data_dir = os.path.join(BACKEND_DIR, "data", "legal_documents")
        os.makedirs(self.data_dir, exist_ok=True)

    def load_pdf(self, file_path):
        """
        Loads a single PDF file and extracts text page by page with metadata.
        Returns a dictionary containing PDF content and statistics.
        """
        file_path = os.path.abspath(file_path)
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF file not found at path: {file_path}")

        filename = os.path.basename(file_path)
        result = {
            "source": filename,
            "file_path": file_path,
            "num_pages": 0,
            "pages": [],
            "text": "",
            "metadata": {},
            "word_count": 0,
            "char_count": 0,
            "success": False,
            "error": None
        }

        try:
            import pypdf
            reader = pypdf.PdfReader(file_path)
            
            # Extract document metadata
            if reader.metadata:
                result["metadata"] = {
                    "title": reader.metadata.title or "",
                    "author": reader.metadata.author or "",
                    "subject": reader.metadata.subject or "",
                    "creator": reader.metadata.creator or "",
                    "producer": reader.metadata.producer or ""
                }

            result["num_pages"] = len(reader.pages)
            page_texts = []

            for idx, page in enumerate(reader.pages):
                extracted = (page.extract_text() or "").strip()
                page_texts.append(extracted)
                result["pages"].append({
                    "page_number": idx + 1,
                    "text": extracted,
                    "char_count": len(extracted)
                })

            full_text = "\n\n".join([p for p in page_texts if p]).strip()
            result["text"] = full_text
            result["char_count"] = len(full_text)
            result["word_count"] = len(full_text.split())
            result["success"] = True

        except Exception as e:
            result["error"] = str(e)
            result["success"] = False
            print(f"[!] Error reading PDF file '{filename}': {e}")

        return result

    def load_directory(self, dir_path=None):
        """
        Loads all PDF files in the specified directory.
        """
        target_dir = os.path.abspath(dir_path) if dir_path else self.data_dir
        if not os.path.exists(target_dir):
            print(f"[!] Target directory does not exist: {target_dir}")
            return []

        pdf_files = [
            os.path.join(target_dir, f)
            for f in os.listdir(target_dir)
            if f.lower().endswith(".pdf") and os.path.isfile(os.path.join(target_dir, f))
        ]

        documents = []
        for pdf_path in pdf_files:
            doc = self.load_pdf(pdf_path)
            if doc["success"]:
                documents.append(doc)

        return documents

    def extract_text(self, file_path):
        """Shortcut method to get plain text from a PDF file."""
        doc = self.load_pdf(file_path)
        return doc.get("text", "")


# Convenience helper functions
def load_pdf(file_path):
    loader = PDFLoader()
    return loader.load_pdf(file_path)

def load_pdf_directory(dir_path=None):
    loader = PDFLoader()
    return loader.load_directory(dir_path)

def extract_pdf_text(file_path):
    loader = PDFLoader()
    return loader.extract_text(file_path)

extract_text = extract_pdf_text

def create_sample_pdf(file_path):
    """Generates a sample PDF document with readable legal text for testing."""
    try:
        lines = [
            "SAMPLE LEGAL DOCUMENT - NON-DISCLOSURE AGREEMENT",
            "This Non-Disclosure Agreement (the 'Agreement') is entered into between Party A and Party B.",
            "1. CONFIDENTIAL INFORMATION: Both parties agree that any technical, business, or financial data",
            "   shared during the relationship shall be treated as strictly confidential.",
            "2. OBLIGATIONS: The Receiving Party shall not disclose Confidential Information to third parties",
            "   without prior written consent of the Disclosing Party.",
            "3. TERM & TERMINATION: This Agreement remains in effect for a period of three (3) years.",
            "4. GOVERNING LAW: This Agreement shall be governed by and construed under local jurisdiction laws."
        ]
        
        content_stream = ["BT", "/F1 12 Tf", "50 720 Td"]
        first = True
        for line in lines:
            safe_line = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
            if not first:
                content_stream.append("0 -20 Td")
            content_stream.append(f"({safe_line}) Tj")
            first = False
        content_stream.append("ET")
        
        stream_str = "\n".join(content_stream)
        stream_bytes = stream_str.encode("latin-1")
        
        pdf_raw = f"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
  /MediaBox [0 0 612 792]
  /Contents 4 0 R
>>
endobj
4 0 obj
<< /Length {len(stream_bytes)} >>
stream
{stream_str}
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000280 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
450
%%EOF"""
        with open(file_path, "wb") as f:
            f.write(pdf_raw.encode("latin-1"))
        return True
    except Exception as e:
        print(f"[!] Failed to generate sample PDF: {e}")
        return False


def safe_print(text):
    """Safely prints text on Windows terminals without UnicodeEncodeError crashes."""
    try:
        print(text)
    except UnicodeEncodeError:
        encoding = getattr(sys.stdout, "encoding", None) or "utf-8"
        encoded = text.encode(encoding, errors="replace").decode(encoding, errors="replace")
        print(encoded)


def main():
    print("=" * 65)
    print("                PDF DOCUMENT LOADER UTILITY")
    print("=" * 65)

    loader = PDFLoader()

    # Determine file or directory target from arguments or user input
    target_path = None
    if len(sys.argv) > 1:
        target_path = " ".join(sys.argv[1:]).strip()

    if target_path:
        target_path = target_path.strip('"').strip("'")

    if target_path and os.path.isfile(target_path):
        print(f"\n[*] Loading target PDF file: {target_path}")
        doc = loader.load_pdf(target_path)
        docs = [doc] if doc["success"] else []
    else:
        search_dir = target_path if target_path and os.path.isdir(target_path) else loader.data_dir
        print(f"\n[*] Scanning directory for PDF files: {search_dir}")
        docs = loader.load_directory(search_dir)

    # Check if existing sample PDF is empty or missing text; recreate if so
    sample_pdf = os.path.join(loader.data_dir, "sample_legal_document.pdf")
    if not docs:
        print(f"[*] Creating sample legal PDF with readable text at: {sample_pdf}")
        if create_sample_pdf(sample_pdf):
            docs = loader.load_directory(loader.data_dir)
    else:
        for d in docs:
            if d["source"] == "sample_legal_document.pdf" and d["word_count"] == 0:
                print(f"[*] Updating blank sample PDF with readable text at: {sample_pdf}")
                if create_sample_pdf(sample_pdf):
                    docs = loader.load_directory(loader.data_dir)
                break

    if docs:
        print(f"\n[+] Successfully loaded {len(docs)} PDF document(s):\n")
        for idx, doc in enumerate(docs, 1):
            safe_print(f"==================== DOCUMENT #{idx}: {doc['source']} ====================")
            safe_print(f"  • File Path:   {doc['file_path']}")
            safe_print(f"  • Total Pages: {doc['num_pages']}")
            safe_print(f"  • Word Count:  {doc['word_count']}")
            safe_print(f"  • Char Count:  {doc['char_count']}")
            if doc['metadata'] and any(doc['metadata'].values()):
                safe_print(f"  • Metadata:    {doc['metadata']}")
            safe_print(f"\n--- EXTRACTED TEXT OUTPUT ---")
            if doc['text']:
                safe_print(doc['text'])
            else:
                safe_print("(No readable text extracted or blank PDF)")
            safe_print("=" * 65 + "\n")
    else:
        print("\n[!] No readable PDF documents processed.")

    print("[+] PDF Loader execution completed successfully.")


if __name__ == "__main__":
    main()
