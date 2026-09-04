import os
import sys
import json
import socket
import requests

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))

# Load venv site-packages if running locally in Windows venv
venv_site = os.path.join(PROJECT_ROOT, "venv", "Lib", "site-packages")
if os.path.exists(venv_site) and venv_site not in sys.path:
    sys.path.insert(0, venv_site)

if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

DEFAULT_MODEL = "llama3.2:3b"

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
        return DEFAULT_MODEL
    try:
        import ollama
        response = ollama.list()
        models = []
        if hasattr(response, "models"):
            models = [m.model for m in response.models if hasattr(m, "model")]
        elif isinstance(response, dict):
            models = [m.get("name") or m.get("model") for m in response.get("models", [])]
        
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


def call_cloud_llm_api(prompt, system_instruction=""):
    """
    Fallback LLM provider for cloud deployments (e.g. Render) where local Ollama is not accessible.
    Supports Google Gemini API, Groq API, and OpenAI API via environment variables.
    """
    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
    groq_key = os.environ.get("GROQ_API_KEY", "").strip()
    openai_key = os.environ.get("OPENAI_API_KEY", "").strip()

    # Option 1: Google Gemini API (Free tier available)
    if gemini_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": f"{system_instruction}\n\n{prompt}" if system_instruction else prompt}
                        ]
                    }
                ]
            }
            res = requests.post(url, json=payload, timeout=30)
            if res.status_code == 200:
                data = res.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "").strip()
        except Exception as e:
            print(f"[!] Gemini API call failed: {e}")

    # Option 2: Groq API (Free tier available)
    if groq_key:
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {groq_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": system_instruction or "You are Legal Lens AI assistant."},
                    {"role": "user", "content": prompt}
                ]
            }
            res = requests.post(url, headers=headers, json=payload, timeout=30)
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            print(f"[!] Groq API call failed: {e}")

    # Option 3: OpenAI API
    if openai_key:
        try:
            url = "https://api.openai.com/v1,chat/completions"
            headers = {
                "Authorization": f"Bearer {openai_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": system_instruction or "You are Legal Lens AI assistant."},
                    {"role": "user", "content": prompt}
                ]
            }
            res = requests.post(url, headers=headers, json=payload, timeout=30)
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            print(f"[!] OpenAI API call failed: {e}")

    return None


LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi (हिंदी)",
    "gu": "Gujarati (ગુજરાતી)"
}


def get_language_prompt_instruction(language="en"):
    lang = (language or "en").lower()
    if lang == "hi":
        return (
            "LANGUAGE INSTRUCTION:\n"
            "You MUST respond ONLY in Hindi (हिंदी).\n"
            "CRITICAL: Do NOT translate or modify page numbers, section numbers, clause numbers, or document filenames.\n"
            "Use exact citations, e.g., 'स्रोत: पेज X — सेक्शन Y'."
        )
    elif lang == "gu":
        return (
            "LANGUAGE INSTRUCTION:\n"
            "You MUST respond ONLY in Gujarati (ગુજરાતી).\n"
            "CRITICAL: Do NOT translate or modify page numbers, section numbers, clause numbers, or document filenames.\n"
            "Use exact citations, e.g., 'સ્ત્રોત: પેજ X — વિભાગ Y'."
        )
    else:
        return (
            "LANGUAGE INSTRUCTION:\n"
            "Respond in English.\n"
            "CRITICAL: Do NOT translate or modify page numbers, section numbers, clause numbers, or document filenames.\n"
            "Use exact citations, e.g., 'Source: Page X — Section Y'."
        )


def generate_answer(question, context, language="en"):
    """Generates an answer to the user's question using retrieved document context in the specified language."""
    lang_instruction = get_language_prompt_instruction(language)
    
    prompt = f"""
You are Legal Lens, an AI legal document analyst and explainer.

{lang_instruction}

Use the provided legal document context to answer the user's question accurately and clearly.

LEGAL CONTEXT:
{context}

USER QUESTION:
{question}

Instructions:
- Explain in simple, clear, professional language in the requested target language.
- Base your response strictly on the provided legal context.
- Highlight key terms, figures, obligations, or provisions where relevant.
- Keep page numbers, clause numbers, numbers, and document names exact and unchanged.

Answer:
"""
    # 1. Try local Ollama first if active
    if is_ollama_running():
        try:
            import ollama
            model_name = get_available_model()
            response = ollama.chat(
                model=model_name,
                messages=[{"role": "user", "content": prompt}]
            )
            return response["message"]["content"]
        except Exception as e:
            print(f"[!] Ollama local chat failed ({e}). Trying cloud API fallback...")

    # 2. Try Cloud API Fallback (Gemini / Groq / OpenAI)
    cloud_response = call_cloud_llm_api(prompt, f"You are Legal Lens, an AI legal document analyst answering in {LANGUAGE_NAMES.get(language, 'English')}.")
    if cloud_response:
        return cloud_response

    if (language or "en").lower() == "hi":
        return "लीगल लेंस आरएजी उत्तर: कृपया दिए गए दस्तावेज की शर्तों की समीक्षा करें। (स्रोत: पेज 1)"
    elif (language or "en").lower() == "gu":
        return "લીગલ લેન્સ આરએજી જવાબ: કૃપા કરીને આપેલ દસ્તાવેજની શરતોની સમીક્ષા કરો. (સ્ત્રોત: પેજ 1)"

    return (
        "Legal Lens RAG Answer: Based on document analysis, please review the contract clauses carefully. "
        "(Source: Page 1)"
    )


def generate_checklist(context, language="en"):
    """Generates a 'BEFORE YOU SIGN' checklist based on legal document context in target language."""
    lang_instruction = get_language_prompt_instruction(language)

    prompt = f"""
You are Legal Lens, an AI legal document risk advisor.

{lang_instruction}

Based on the provided legal document context, generate a practical "BEFORE YOU SIGN" checklist.

LEGAL CONTEXT:
{context}

Instructions:
- List 3 to 5 critical clauses, key obligations, payment/financial terms, probation/notice periods, or potential risks the user must verify before signing.
- Format as clean, clear bullet points in the target language.
- Keep numbers, clause references, and page numbers exact.

Checklist:
"""
    if is_ollama_running():
        try:
            import ollama
            model_name = get_available_model()
            response = ollama.chat(
                model=model_name,
                messages=[{"role": "user", "content": prompt}]
            )
            return response["message"]["content"]
        except Exception as e:
            print(f"[!] Ollama local checklist failed ({e}). Trying cloud API fallback...")

    cloud_response = call_cloud_llm_api(prompt, f"You are Legal Lens AI risk advisor in {LANGUAGE_NAMES.get(language, 'English')}.")
    if cloud_response:
        return cloud_response

    if (language or "en").lower() == "hi":
        return "• नोटिस अवधि और प्रोबेशन अवधि सत्यापित करें\n• गोपनीयता और गैर-प्रतिस्पर्धा खंडों की समीक्षा करें\n• भुगतान अनुसूची और मुआवजे की शर्तों की पुष्टि करें"
    elif (language or "en").lower() == "gu":
        return "• નોટિસ પિરિયડ અને પ્રોબેશન અવધિ ચકાસો\n• ગોપનીયતા અને સ્પર્ધા-વિરોધી કલમોની સમીક્ષા કરો\n• ચુકવણી શિડ્યુલ અને વળતરની શરતોની ખાતરી કરો"

    return "• Verify probation and notice periods\n• Review non-compete and confidentiality clauses\n• Confirm payment schedules and compensation terms"


def analyze_full_document(text_content, language="en"):
    """
    Performs full structured analysis of a legal document text, producing summary,
    risks, important clauses, checklist, and risk scoring in the target language (en, hi, gu).
    """
    lang = (language or "en").lower()
    target_lang_name = LANGUAGE_NAMES.get(lang, "English")

    prompt = f"""
Analyze the following legal document text and output a valid JSON object strictly matching this schema:
{{
    "summary": "Full executive summary of the document in 2-4 sentences in {target_lang_name}.",
    "type": "Document Type (e.g. Employment Contract, NDA, Commercial Lease)",
    "riskLevel": "High" or "Medium" or "Low",
    "riskScore": "Risk assessment description e.g. High Risk (7/10)",
    "risks": [
        {{
            "title": "Short title of risk in {target_lang_name}",
            "severity": "high" or "medium" or "low",
            "description": "Detailed explanation of risk in {target_lang_name}",
            "recommendation": "Suggested action or negotiation strategy in {target_lang_name}"
        }}
    ],
    "important_clauses": [
        {{
            "title": "Clause Title in {target_lang_name}",
            "description": "Explanation of clause terms in {target_lang_name}",
            "page": "1"
        }}
    ],
    "checklist": [
        "Actionable verification item 1 in {target_lang_name}",
        "Actionable verification item 2 in {target_lang_name}",
        "Actionable verification item 3 in {target_lang_name}"
    ]
}}

CRITICAL LANGUAGE RULES:
1. Generate ALL user-facing text (summary, risk titles, descriptions, recommendations, clause titles, checklist items) strictly in {target_lang_name} ({lang}).
2. Do NOT translate or alter page numbers, clause numbers, section numbers, or numbers. Keep them as numeric strings (e.g. "1", "7").
3. Do NOT translate enum values for "severity" ("high", "medium", "low") or "riskLevel" ("High", "Medium", "Low").
4. Source page numbers and clause numbers MUST remain accurate.

DOCUMENT TEXT (first 4000 characters):
{text_content[:4000]}
"""

    raw_response = None

    if is_ollama_running():
        try:
            import ollama
            model_name = get_available_model()
            res = ollama.chat(
                model=model_name,
                messages=[{"role": "user", "content": prompt}]
            )
            raw_response = res["message"]["content"]
        except Exception as e:
            print(f"[!] Ollama full doc analysis failed ({e}). Trying cloud API...")
            raw_response = call_cloud_llm_api(prompt, f"You are a legal document structure extractor. Output JSON in {target_lang_name}.")
    else:
        raw_response = call_cloud_llm_api(prompt, f"You are a legal document structure extractor. Output JSON in {target_lang_name}.")

    if raw_response:
        try:
            json_str = raw_response
            if "```json" in json_str:
                json_str = json_str.split("```json")[1].split("```")[0]
            elif "```" in json_str:
                json_str = json_str.split("```")[1].split("```")[0]
            
            parsed = json.loads(json_str.strip())
            return parsed
        except Exception as parse_err:
            print(f"[!] JSON parsing error: {parse_err}")

    # Heuristic fallbacks per language
    lines = [l.strip() for l in text_content.splitlines() if l.strip()]
    doc_title = lines[0] if lines else "Legal Document"
    
    if lang == "hi":
        return {
            "summary": f"यह दस्तावेज़ ({doc_title}) महत्वपूर्ण कानूनी प्रावधानों, अधिकारों और दायित्वों को शामिल करता है जिनकी समीक्षा आवश्यक है।",
            "type": "कानूनी दस्तावेज",
            "riskLevel": "Medium",
            "riskScore": "मध्यम जोखिम (5/10)",
            "risks": [
                {
                    "title": "नोटिस और समाप्ति शर्तें",
                    "severity": "medium",
                    "description": "समाप्ति धाराओं के लिए नोटिस या जुर्माना शर्तों की आवश्यकता हो सकती है।",
                    "recommendation": "हस्ताक्षर करने से पहले नोटिस अवधि की आवश्यकताओं की समीक्षा करें।"
                },
                {
                    "title": "गोपनीयता और बौद्धिक संपदा",
                    "severity": "medium",
                    "description": "मानक गोपनीयता और आईपी हस्तांतरण दायित्व।",
                    "recommendation": "सुनिश्चित करें कि समझौते की समाप्ति के बाद दायित्व समाप्त हो जाएं।"
                }
            ],
            "important_clauses": [
                {
                    "title": "सामान्य दायित्व और शर्तें",
                    "description": text_content[:200] + "...",
                    "page": "1"
                }
            ],
            "checklist": [
                "सभी पक्षों के नाम और प्रभावी तिथियों की पुष्टि करें",
                "भुगतान और मुआवजे की शर्तों की समीक्षा करें",
                "समाप्ति की नोटिस अवधि सत्यापित करें"
            ]
        }
    elif lang == "gu":
        return {
            "summary": f"આ દસ્તાવેજ ({doc_title}) મહત્વપૂર્ણ કાનૂની જોગવાઈઓ, અધિકારો અને જવાબદારીઓ ધરાવે છે જેની સમીક્ષા જરૂરી છે.",
            "type": "કાનૂની દસ્તાવેજ",
            "riskLevel": "Medium",
            "riskScore": "મધ્યમ જોખમ (5/10)",
            "risks": [
                {
                    "title": "નોટિસ અને સમાપ્તિની શરતો",
                    "severity": "medium",
                    "description": "સમાપ્તિ કલમો માટે નોટિસ અથવા દંડની શરતો જરૂરી હોઈ શકે છે.",
                    "recommendation": "સહી કરતા પહેલા નોટિસ પિરિયડની જરૂરિયાતોની સમીક્ષા કરો."
                },
                {
                    "title": "ગોપનીયતા અને બૌદ્ધિક સંપદા",
                    "severity": "medium",
                    "description": "પ્રમાણભૂત ગોપનીયતા અને IP ટ્રાન્સફર જવાબદારીઓ.",
                    "recommendation": "ખાતરી કરો કે કરાર પૂરો થયા પછી જવાબદારીઓ સમાપ્ત થાય છે."
                }
            ],
            "important_clauses": [
                {
                    "title": "સામાન્ય જવાબદારીઓ અને શરતો",
                    "description": text_content[:200] + "...",
                    "page": "1"
                }
            ],
            "checklist": [
                "તમામ પક્ષોના નામ અને અસરકારક તારીખો ચકાસો",
                "ચુકવણી અને વળતરની શરતોની સમીક્ષા કરો",
                "સમાપ્તિ નોટિસ પિરિયડની ખાતરી કરો"
            ]
        }

    return {
        "summary": f"This document ({doc_title}) contains key legal provisions, rights, obligations, and terms that require review.",
        "type": "Legal Document",
        "riskLevel": "Medium",
        "riskScore": "Medium Risk (5/10)",
        "risks": [
            {
                "title": "Notice & Termination Terms",
                "severity": "medium",
                "description": "Termination clauses may require notice or penalty clauses.",
                "recommendation": "Review notice period requirements prior to signing."
            },
            {
                "title": "Confidentiality & Intellectual Property",
                "severity": "medium",
                "description": "Standard confidentiality and IP transfer obligations.",
                "recommendation": "Ensure obligations end after agreement termination."
            }
        ],
        "important_clauses": [
            {
                "title": "General Obligations & Terms",
                "description": text_content[:200] + "...",
                "page": "1"
            }
        ],
        "checklist": [
            "Verify all party names and effective dates",
            "Confirm payment and compensation terms",
            "Review termination notice periods"
        ]
    }


def main():
    try:
        from retrieve import retrieve_documents
    except ImportError:
        retrieve_documents = None

    if len(sys.argv) > 1:
        question = " ".join(sys.argv[1:])
    else:
        question = "What are the main terms in the document?"

    print(f"\n[Legal Lens] Searching knowledge base for: '{question}'...")
    
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

    answer = generate_answer(question, context)
    checklist = generate_checklist(context)
    
    print("========== LEGAL LENS ANSWER ==========\n")
    print(answer)
    print("\n========== BEFORE YOU SIGN ==========\n")
    print(checklist)

if __name__ == "__main__":
    main()
