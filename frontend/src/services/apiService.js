import { SAMPLE_DOCUMENTS } from '../data/mockData';

/**
 * ============================================================================
 * LEGAL LENS — API SERVICE LAYER (Flask Backend + Multi-Tenant JWT Auth)
 * ============================================================================
 */

const envApiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
const defaultApiUrl = import.meta.env.PROD 
  ? 'https://legal-lens-backend.onrender.com/api' 
  : 'http://localhost:5000/api';
const rawApiUrl = envApiUrl || defaultApiUrl;
const normalizedApiUrl = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`;

export const RAG_CONFIG = {
  USE_REAL_BACKEND: true,
  API_BASE_URL: normalizedApiUrl,
};

class LegalLensAPIService {
  constructor() {
    this.documents = [...SAMPLE_DOCUMENTS];
  }

  // ============================================================
  // JWT TOKEN & AUTHENTICATION HELPERS
  // ============================================================

  getAuthToken() {
    try {
      return localStorage.getItem('legalLensAuthToken');
    } catch (e) {
      return null;
    }
  }

  getAuthHeaders(includeContentType = true) {
    const token = this.getAuthToken();
    const headers = {};
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  getCurrentUser() {
    try {
      const stored = localStorage.getItem('legalLensCurrentUser');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }

  async loginUser(email, password) {
    const response = await fetch(`${RAG_CONFIG.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Invalid email or password.');
    }

    if (data.token && data.user) {
      localStorage.setItem('legalLensAuthToken', data.token);
      localStorage.setItem('legalLensCurrentUser', JSON.stringify(data.user));
      return data.user;
    }

    throw new Error('Authentication failed.');
  }

  async registerUser(name, email, password) {
    const response = await fetch(`${RAG_CONFIG.API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed.');
    }

    if (data.token && data.user) {
      localStorage.setItem('legalLensAuthToken', data.token);
      localStorage.setItem('legalLensCurrentUser', JSON.stringify(data.user));
      return data.user;
    }

    throw new Error('Account creation failed.');
  }

  async verifyAuthServer() {
    const token = this.getAuthToken();
    if (!token) return null;

    try {
      const response = await fetch(`${RAG_CONFIG.API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        this.logoutUser();
        return null;
      }

      const data = await response.json();
      if (data.user) {
        localStorage.setItem('legalLensCurrentUser', JSON.stringify(data.user));
        return data.user;
      }
    } catch (err) {
      console.warn('Backend auth verify error:', err);
    }
    return this.getCurrentUser();
  }

  logoutUser() {
    localStorage.removeItem('legalLensAuthToken');
    localStorage.removeItem('legalLensCurrentUser');
  }

  // ============================================================
  // USER DOCUMENT MANAGEMENT (BACKEND SQLite + RAG)
  // ============================================================

  async getDocumentsList() {
    if (!this.getAuthToken()) {
      return [];
    }

    try {
      const response = await fetch(`${RAG_CONFIG.API_BASE_URL}/documents`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (response.status === 401) {
        this.logoutUser();
        window.location.reload();
        return [];
      }

      const data = await response.json();
      if (response.ok && Array.isArray(data.documents)) {
        return data.documents.map((d) => this.formatDocumentFromBackend(d));
      }
    } catch (e) {
      console.error('Failed to fetch documents from backend:', e);
    }

    return [];
  }

  async getDocumentById(id) {
    if (!this.getAuthToken()) return null;

    try {
      const response = await fetch(`${RAG_CONFIG.API_BASE_URL}/documents/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return this.formatDocumentFromBackend(data.document);
      }
    } catch (e) {
      console.error(`Failed to fetch document ${id}:`, e);
    }

    const docs = await this.getDocumentsList();
    return docs.find((d) => d.id === id) || docs[0] || null;
  }

  formatDocumentFromBackend(d) {
    const baseDoc = this.documents[0] || {};
    const risks = Array.isArray(d.risks) && d.risks.length > 0 ? d.risks : [];
    const clauses = Array.isArray(d.clauses) && d.clauses.length > 0 ? d.clauses : (Array.isArray(d.important_clauses) ? d.important_clauses : []);
    const checklist = Array.isArray(d.checklist) && d.checklist.length > 0 ? d.checklist : [];

    const beforeYouSign = checklist.map((item, index) => {
      if (typeof item === 'object' && item !== null) {
        return {
          id: item.id || `chk-${index}`,
          group: item.group || (index % 3 === 0 ? 'needsAttention' : index % 3 === 1 ? 'reviewCarefully' : 'goodToCheck'),
          item: item.item || item.text || 'Verify clause terms',
          text: item.text || item.item || 'Verify clause terms',
          impact: item.impact || 'Important verification item from document analysis.',
          clauseRef: item.clauseRef || 'Document analysis',
          page: String(item.page || '1'),
          checked: item.checked || false
        };
      }
      return {
        id: `chk-${index}`,
        group: index % 3 === 0 ? 'needsAttention' : index % 3 === 1 ? 'reviewCarefully' : 'goodToCheck',
        item: String(item),
        text: String(item),
        impact: 'Important verification item from document analysis.',
        clauseRef: 'Document analysis',
        page: '1',
        checked: false
      };
    });

    const summaryText = d.summary || d.executiveSummary || 'Document analyzed by Legal Lens RAG Pipeline.';

    return {
      id: d.id,
      name: d.name || d.filename,
      displayName: d.displayName || d.name || d.filename,
      fileSize: d.fileSize || '1.5 MB',
      uploadDate: d.uploadDate || 'Today',
      status: d.status || 'Document analyzed',
      type: d.type || 'Legal Document',
      riskLevel: d.riskLevel || (risks.some(r => r.level === 'high') ? 'High' : 'Medium'),
      riskScore: d.riskScore || (risks.some(r => r.level === 'high') ? 'High Risk (7/10)' : 'Medium Risk (4/10)'),
      executiveSummary: summaryText,
      simpleSummary: {
        text: summaryText,
        keyTakeaways: checklist.slice(0, 3).map(c => typeof c === 'object' ? (c.item || c.text) : String(c))
      },
      summaryHighlight: {
        takeaway: summaryText.length > 120 ? summaryText.substring(0, 120) + '...' : summaryText,
        source: d.name || d.filename,
        pageRef: 'Page 1',
        estimatedReadTime: '~2 mins summary'
      },
      risks: risks,
      clauses: clauses,
      checklist: checklist,
      beforeYouSign: beforeYouSign,
      sources: d.sources || [],
      suggestedQuestions: [
        'What is the notice period required?',
        'What are the payment and penalty conditions?',
        'What are the termination clauses?'
      ]
    };
  }

  async deleteDocument(id) {
    try {
      const response = await fetch(`${RAG_CONFIG.API_BASE_URL}/documents/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      const data = await response.json();
      return response.ok && data.success;
    } catch (e) {
      console.error(`Failed to delete document ${id}:`, e);
      return false;
    }
  }

  // Multi-stage upload with Flask RAG backend (/api/analyze)
  async uploadDocument(file, onStageChange = () => { }) {
    if (!file) {
      throw new Error('Please select a PDF file.');
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Only PDF files are supported.');
    }

    const stages = [
      { name: 'Uploading legal document to sandbox...', progress: 20 },
      { name: 'Extracting document text & page layout...', progress: 45 },
      { name: 'Generating EmbeddingGemma vector representations...', progress: 65 },
      { name: 'Performing grounded Ollama analysis...', progress: 85 },
      { name: 'Preparing plain-language analysis & checklist...', progress: 100 }
    ];

    onStageChange(stages[0]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      let currentStageIdx = 0;
      const stageTimer = setInterval(() => {
        if (currentStageIdx < stages.length - 2) {
          currentStageIdx++;
          onStageChange(stages[currentStageIdx]);
        }
      }, 1200);

      const response = await fetch(`${RAG_CONFIG.API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: this.getAuthHeaders(false),
        body: formData,
      });

      clearInterval(stageTimer);
      onStageChange(stages[3]);

      if (response.status === 401) {
        this.logoutUser();
        window.location.reload();
        throw new Error('Session expired. Please log in again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Document analysis failed.');
      }

      onStageChange(stages[4]);

      const formattedDoc = this.formatDocumentFromBackend({
        id: data.doc_id || `doc-${Date.now()}`,
        name: data.filename || file.name,
        displayName: (data.filename || file.name).replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        fileSize: file.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '1.5 MB',
        uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'Document analyzed',
        summary: data.summary,
        type: data.type,
        riskLevel: data.riskLevel,
        riskScore: data.riskScore,
        risks: data.risks,
        important_clauses: data.important_clauses,
        checklist: data.checklist,
        sources: data.sources
      });

      return formattedDoc;
    } catch (error) {
      console.error('Backend analysis error:', error);
      throw error;
    }
  }

  // Document-aware AI Q&A query engine (/api/ask)
  async queryDocumentAI(arg1, arg2) {
    let docId = null;
    let userQuestion = '';

    if (typeof arg2 === 'string') {
      docId = arg1;
      userQuestion = arg2;
    } else {
      userQuestion = arg1 || '';
    }

    if (!userQuestion || !userQuestion.trim()) {
      throw new Error('Please enter a question.');
    }

    try {
      const response = await fetch(`${RAG_CONFIG.API_BASE_URL}/ask`, {
        method: 'POST',
        headers: this.getAuthHeaders(true),
        body: JSON.stringify({
          question: userQuestion,
          doc_id: docId,
          document_id: docId
        }),
      });

      if (response.status === 401) {
        this.logoutUser();
        window.location.reload();
        throw new Error('Session expired. Please log in again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to answer the question.');
      }

      const sourcesList = Array.isArray(data.sources) ? data.sources : [];
      const sourceStr = sourcesList.length > 0
        ? sourcesList.map(s => typeof s === 'object' ? `${s.filename} (Page ${s.page})` : String(s)).join(', ')
        : 'Local RAG Pipeline';
      const pageStr = sourcesList.length > 0
        ? sourcesList.map(s => typeof s === 'object' ? s.page : '1').join(', ')
        : '1';

      return {
        answer: data.answer || 'No answer available.',
        source: sourceStr,
        page: pageStr,
        confidence: 'Grounded Ollama Answer',
        isMock: false
      };
    } catch (error) {
      console.error('Legal Lens Q&A backend error:', error.message);
      return {
        answer: error.message || 'Unable to connect to the Legal Lens backend server.',
        source: 'System Connection Error',
        page: null,
        confidence: null,
        isMock: false
      };
    }
  }
}

export const apiService = new LegalLensAPIService();
