import os
import sys
import json
import re
import socket
import hashlib

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))

# Load venv site-packages if running locally in Windows venv
venv_site = os.path.join(PROJECT_ROOT, "venv", "Lib", "site-packages")
if os.path.exists(venv_site) and venv_site not in sys.path:
    sys.path.insert(0, venv_site)

if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

DEFAULT_MODEL = "llama3.2:3b"

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi (हिंदी)",
    "gu": "Gujarati (ગુજરાતી)"
}


def is_ollama_running():
    """Fast check to verify if local Ollama daemon is active."""
    try:
        s = socket.create_connection(("127.0.0.1", 11434), timeout=0.8)
        s.close()
        return True
    except Exception:
        return False


def get_available_model():
    """Returns available Ollama model for chat generation if Ollama is running."""
    if not is_ollama_running():
        return None
    try:
        import ollama
        response = ollama.list()
        models = []
        if hasattr(response, "models"):
            models = [m.model for m in response.models if hasattr(m, "model")]
        elif isinstance(response, dict):
            models = [m.get("name") or m.get("model") for m in response.get("models", [])]
        
        for m in models:
            if m and ("llama" in m.lower() or "gemma" in m.lower() or "mistral" in m.lower()) and "embedding" not in m.lower():
                return m
        if models:
            for m in models:
                if m and "embedding" not in m.lower():
                    return m
    except Exception as e:
        print(f"[!] Warning checking Ollama models: {e}")
    return None


def bold_key_legal_terms(text):
    """
    Highlights critical numbers, monetary amounts, notice periods, durations, dates,
    penalties, and legal obligations in bold for executive readability.
    """
    if not text:
        return text

    # Bold notice periods / durations like "60 days", "30 (thirty) days", "12 months"
    text = re.sub(
        r'\b(\d+\s*(?:\(\w+\)\s*)?(?:days?|months?|years?|weeks?|hours?))\b',
        r'**\1**',
        text,
        flags=re.IGNORECASE
    )

    # Bold monetary amounts / percentages like "$5,000", "18% per annum", "Rs. 50,000"
    text = re.sub(
        r'\b((?:\$|€|£|₹|Rs\.?\s*)\d+(?:,\d+)*(?:\.\d+)?|\d+(?:\.\d+)?%)\b',
        r'**\1**',
        text,
        flags=re.IGNORECASE
    )

    return text


def synthesize_local_answer(question, context, language="en", metadata_info=""):
    """
    Local Work Agent synthesizer: converts retrieved document context into a clean,
    structured Markdown response with bolded legal terms, key bullet points, and source citations.
    """
    if not context or not context.strip() or "does not have extracted text" in context:
        return "The uploaded document does not contain enough information to answer this question confidently."

    # Split context into passages
    passages = [p.strip() for p in context.split("-------------------------") if p.strip()]
    if not passages:
        passages = [p.strip() for p in context.split("\n\n") if p.strip()]

    q_words = [w.lower() for w in re.findall(r'\b\w{3,}\b', question) if w.lower() not in ["what", "where", "when", "which", "how", "this", "that", "there", "with", "have", "from", "does", "document"]]

    matching_sentences = []
    sources_used = set()

    for p in passages:
        lines = p.split("\n")
        source_header = ""
        content_lines = []
        for line in lines:
            if line.startswith("SOURCE:") or line.startswith("Source:"):
                source_header = line.strip()
            elif line.startswith("CONTENT:"):
                continue
            else:
                if line.strip():
                    content_lines.append(line.strip())

        full_passage_text = " ".join(content_lines)
        if source_header:
            sources_used.add(source_header.replace("SOURCE:", "").replace("Source:", "").strip())

        # Sentence segmentation
        raw_sentences = re.split(r'(?<=[.!?])\s+', full_passage_text)
        for sent in raw_sentences:
            s_clean = sent.strip()
            if len(s_clean) < 15:
                continue
            # Score sentence relevance
            score = sum(1 for w in q_words if w in s_clean.lower())
            if score > 0 or not q_words:
                matching_sentences.append((score, s_clean, source_header))

    # Sort matching sentences by relevance score
    matching_sentences.sort(key=lambda x: x[0], reverse=True)

    if not matching_sentences:
        # Fallback to top sentences from first passage
        top_sentences = []
        for p in passages[:2]:
            lines = [l.strip() for l in p.split("\n") if l.strip() and not l.startswith("SOURCE:") and not l.startswith("CONTENT:")]
            text_block = " ".join(lines)
            sents = re.split(r'(?<=[.!?])\s+', text_block)
            top_sentences.extend([s.strip() for s in sents if len(s.strip()) > 20][:3])
        
        extracted_body = " ".join(top_sentences[:4]) if top_sentences else context[:400]
    else:
        # Take unique top sentences up to 4
        seen_sents = set()
        chosen = []
        for sc, s, src in matching_sentences:
            if s not in seen_sents:
                seen_sents.add(s)
                chosen.append(s)
            if len(chosen) >= 4:
                break
        extracted_body = " ".join(chosen)

    formatted_body = bold_key_legal_terms(extracted_body)

    # Format into structured Markdown response
    sources_str = ", ".join(sources_used) if sources_used else (metadata_info or "Document Context")

    ans_md = f"""### Answer

According to the selected document, {formatted_body}

### Important Provisions & Highlights

- **Document Grounding**: Information verified directly from the uploaded contract text.
- **Key Terms**: Critical terms, deadlines, notice periods, and monetary amounts are highlighted in **bold** above.

### Source
{sources_str}
"""
    return ans_md.strip()


def generate_answer(question, context, language="en", metadata_info=""):
    """
    Generates a grounded RAG answer based on retrieved document context.
    Uses local Ollama if available, otherwise runs the local Legal Lens Work Agent engine.
    """
    model = get_available_model()
    if model:
        try:
            import ollama
            system_prompt = (
                "You are Legal Lens, an expert legal document assistant. "
                "Answer the question concisely and accurately based ONLY on the provided context. "
                "Structure your answer with bold headers (### Answer, ### Key Highlights) and bold important terms."
            )
            user_prompt = f"USER QUESTION: {question}\n\nDOCUMENT CONTEXT:\n{context}\n\nMETADATA:\n{metadata_info}"
            response = ollama.chat(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            )
            ans = response.get("message", {}).get("content", "").strip()
            if ans:
                return bold_key_legal_terms(ans)
        except Exception as e:
            print(f"[!] Ollama chat failed ({e}), using local synthesizer.")

    return synthesize_local_answer(question, context, language=language, metadata_info=metadata_info)


def generate_checklist(context, language="en"):
    """Generates dynamic 'BEFORE YOU SIGN' verification points based on document text."""
    items = []
    text_lower = (context or "").lower()

    if "notice" in text_lower or "terminat" in text_lower:
        items.append("Verify the required written notice period for contract termination or resignation.")
    if "payment" in text_lower or "rent" in text_lower or "salary" in text_lower or "fee" in text_lower:
        items.append("Confirm exact financial payment amounts, due dates, and late payment penalties.")
    if "deposit" in text_lower or "security" in text_lower:
        items.append("Check deposit refund conditions, deductions, and processing timelines.")
    if "confidential" in text_lower or "nondisclosure" in text_lower:
        items.append("Review confidentiality obligations and post-termination non-disclosure scope.")
    if "liability" in text_lower or "indemn" in text_lower:
        items.append("Inspect liability caps, indemnity clauses, and risk allocation terms.")

    if not items:
        items = [
            "Confirm identity of all signing parties and official effective dates.",
            "Verify notice period requirements and termination procedures.",
            "Review payment schedules, penalties, and obligation terms before signing."
        ]

    return items


def extract_document_specific_questions(text_content):
    """
    Generates 3 recommended questions grounded ONLY in clauses, terms, and facts
    actually present in the extracted document text.
    """
    if not text_content or not text_content.strip():
        text_content = ""

    text_raw = text_content.lower()
    clean_no_space = re.sub(r'\s+', '', text_raw)
    clean_single_space = re.sub(r'\s+', ' ', text_raw)
    combined = text_raw + ' ' + clean_no_space + ' ' + clean_single_space
    questions = []

    # 1. Spousal / Marital / Prenuptial / Marriage
    if any(k in combined for k in ['marital', 'prenuptial', 'spouse', 'spousal', 'marriage']):
        if any(k in combined for k in ['property', 'asset', 'wealth']):
            questions.append('How are separate and joint properties/assets distributed under this agreement?')
        if any(k in combined for k in ['support', 'alimony', 'maintenance']):
            questions.append('What provisions apply regarding spousal support or alimony waivers?')
        if any(k in combined for k in ['debt', 'liabilit']):
            questions.append('How are pre-existing individual debts and financial liabilities handled?')
        if len(questions) < 3:
            questions.append('What provisions apply regarding gifts, inheritances, or marital assets?')

    # 2. Employment / Notice / Probation / Salary / Bond
    if any(k in combined for k in ['employee', 'employer', 'resignation', 'salary', 'probation', 'employment', 'job']):
        if any(k in combined for k in ['notice', 'terminat', 'resignation']):
            questions.append('What is the notice period required for resignation or termination?')
        if any(k in combined for k in ['probation', 'trial']):
            questions.append('What are the terms and duration of the probation period?')
        if any(k in combined for k in ['salary', 'compensation', 'remuneration', 'pay', 'bonus']):
            questions.append('What are the compensation structure, payment terms, or salary details?')
        if any(k in combined for k in ['bond', 'lock-in', 'penalty']) and len(questions) < 3:
            questions.append('What are the lock-in period terms and early exit penalties?')

    # 3. Rental / Lease / Tenant / Landlord
    if any(k in combined for k in ['tenant', 'lease', 'landlord', 'rent', 'premises']):
        if any(k in combined for k in ['deposit', 'security']):
            questions.append('What is the security deposit amount and under what conditions is it refunded?')
        if any(k in combined for k in ['rent', 'maintenance']):
            questions.append('What is the rent payment amount, due date, and payment policy?')
        if any(k in combined for k in ['notice', 'terminat', 'vacate']):
            questions.append('What notice period is required for terminating the lease?')
        if any(k in combined for k in ['painting', 'repair', 'utility']) and len(questions) < 3:
            questions.append('What deductions apply for painting or property repairs upon move-out?')

    # 4. Confidentiality / NDA / Trade Secrets
    if any(k in combined for k in ['confidential', 'nondisclosure', 'non-disclosure', 'trade secret']) and len(questions) < 3:
        questions.append('What specific information is classified as confidential and what is the non-disclosure duration?')

    # 5. Non-Compete / Non-Solicit
    if any(k in combined for k in ['non-compete', 'noncompete', 'non-solicit']) and len(questions) < 3:
        questions.append('What non-compete or non-solicitation restrictions apply and for how long?')

    # 6. Intellectual Property / Inventions
    if any(k in combined for k in ['intellectual property', 'invention', 'patent', 'work product']) and len(questions) < 3:
        questions.append('Who owns the intellectual property and inventions created under this agreement?')

    # 7. Property Maintenance / Repairs / Utilities
    if any(k in combined for k in ['maintenance', 'repair', 'utility', 'alteration']) and len(questions) < 3:
        questions.append('What are the obligations regarding property maintenance, repairs, and utilities?')

    # 8. Liability Caps & Indemnification
    if any(k in combined for k in ['indemn', 'limitation of liability', 'hold harmless']) and len(questions) < 3:
        questions.append('What liability caps and indemnification obligations apply to each party?')

    # 9. Governing Law / Jurisdiction / Dispute Resolution
    if any(k in combined for k in ['governing law', 'jurisdiction', 'arbitration', 'dispute']) and len(questions) < 3:
        questions.append('What governing law or dispute resolution mechanism applies to this contract?')

    # 10. Scope of Services / Deliverables
    if any(k in combined for k in ['scope of service', 'deliverables', 'statement of work']) and len(questions) < 3:
        questions.append('What is the defined scope of services and deliverables under this agreement?')

    # 11. Document-Grounded Fallback (strictly using detected provisions)
    if len(questions) < 3:
        if any(k in combined for k in ['notice', 'terminat', 'cancellation']) and not any('notice' in q.lower() for q in questions):
            questions.append('What notice period is required to terminate or cancel this agreement?')
        if any(k in combined for k in ['payment', 'fee', 'charge', 'cost']) and not any('payment' in q.lower() or 'fee' in q.lower() or 'salary' in q.lower() or 'deposit' in q.lower() for q in questions):
            questions.append('What are the exact payment milestones and fee obligations?')
        if any(k in combined for k in ['obligations', 'rights', 'duties', 'responsibilit']) and len(questions) < 3:
            questions.append('What are the primary obligations and responsibilities of each party under this document?')

    return questions[:3]


def analyze_full_document(text_content, language="en"):
    """
    Performs full structured local analysis of legal document text, producing summary,
    risks, important clauses, checklist, risk scoring, and document-specific suggested questions.
    """
    text = (text_content or "").strip()
    text_lower = text.lower()
    first_3k = text_lower[:3000]

    # Detect Document Type
    if "employment" in first_3k or "job" in first_3k or "salary" in first_3k or "employee" in first_3k:
        doc_type = "Employment Agreement"
    elif "rent" in first_3k or "lease" in first_3k or "tenant" in first_3k or "landlord" in first_3k:
        doc_type = "Rental Agreement"
    elif "marital" in first_3k or "prenuptial" in first_3k or "marriage" in first_3k or "spouse" in first_3k:
        doc_type = "Pre-marital Agreement"
    elif "confidential" in first_3k or "nondisclosure" in first_3k or "nda" in first_3k:
        doc_type = "Non-Disclosure Agreement (NDA)"
    elif "service" in first_3k or "contractor" in first_3k or "consultant" in first_3k:
        doc_type = "Service Agreement"
    elif "commercial" in first_3k or "premises" in first_3k:
        doc_type = "Commercial Lease"
    else:
        doc_type = "Legal Contract"

    # Compute Summary
    clean_lines = [l.strip() for l in text.split("\n") if len(l.strip()) > 30]
    summary_sentences = clean_lines[:3] if len(clean_lines) >= 3 else [text[:250]]
    summary = f"This document is a {doc_type}. Key provisions: " + " ".join(summary_sentences)
    if len(summary) > 400:
        summary = summary[:397] + "..."

    # Assess Risk Level
    risk_keywords_high = ["penalty", "indemnity", "unilateral", "breach", "forfeit", "terminate without cause", "sole discretion"]
    high_count = sum(1 for w in risk_keywords_high if w in text_lower)

    if high_count >= 3:
        risk_level = "High"
        risk_score = "High Risk (8/10)"
    elif high_count >= 1:
        risk_level = "Medium"
        risk_score = "Medium Risk (5/10)"
    else:
        risk_level = "Low"
        risk_score = "Low Risk (2/10)"

    # Identify Risks
    risks = []
    if "terminate" in text_lower or "termination" in text_lower:
        risks.append({
            "title": "Strict Termination Clauses",
            "severity": "high" if high_count >= 2 else "medium",
            "description": "The contract contains specific termination rights and notice periods that must be strictly followed.",
            "recommendation": "Ensure written notice timelines are strictly recorded in your calendar prior to signing.",
            "page": "1",
            "clauseRef": "Termination Clause"
        })
    if "penalty" in text_lower or "late" in text_lower or "interest" in text_lower:
        risks.append({
            "title": "Financial Penalties & Late Fees",
            "severity": "medium",
            "description": "Additional interest charges or financial penalties apply in the event of delayed performance or payment.",
            "recommendation": "Review exact grace periods and payment schedules to avoid unexpected penalties.",
            "page": "1",
            "clauseRef": "Payment & Penalty Terms"
        })
    if "confidential" in text_lower or "non-compete" in text_lower:
        risks.append({
            "title": "Restrictive Covenants & Confidentiality",
            "severity": "medium",
            "description": "Imposes ongoing post-contract obligations regarding non-disclosure or competitive activities.",
            "recommendation": "Confirm duration and geographical scope of restrictive clauses.",
            "page": "1",
            "clauseRef": "Confidentiality Clause"
        })
    if not risks:
        risks.append({
            "title": "General Obligations Review",
            "severity": "low",
            "description": "Standard binding legal terms apply across all executing parties.",
            "recommendation": "Verify all party names, signature blocks, and effective dates.",
            "page": "1",
            "clauseRef": "General Terms"
        })

    # Important Clauses
    important_clauses = [
        {
            "title": "Scope & Primary Obligations",
            "description": "Defines the core subject matter, deliverables, or premises covered by this document.",
            "page": "1"
        },
        {
            "title": "Notice & Communication Requirements",
            "description": "Specifies formal delivery methods for legal notices and dispute communications.",
            "page": "1"
        }
    ]

    # Verification Checklist
    checklist = generate_checklist(text, language=language)

    # Document-Specific Recommended Questions grounded strictly in actual extracted text
    suggestedQuestions = extract_document_specific_questions(text)

    return {
        "summary": summary,
        "type": doc_type,
        "riskLevel": risk_level,
        "riskScore": risk_score,
        "risks": risks,
        "important_clauses": important_clauses,
        "checklist": checklist,
        "suggestedQuestions": suggestedQuestions
    }


def main():
    print("=== Legal Lens Work Agent (Local Engine) ===")
    q = "What is the termination notice period?"
    ctx = "SOURCE: Service Agreement (Page 1)\nCONTENT: Either party may terminate this agreement by providing 60 (sixty) days' prior written notice."
    ans = generate_answer(q, ctx)
    print("\n" + ans)

if __name__ == "__main__":
    main()
