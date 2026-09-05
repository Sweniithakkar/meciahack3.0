import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HeroUpload from './components/HeroUpload';
import ProcessingView from './components/ProcessingView';
import DocumentHeader from './components/DocumentHeader';
import DocumentSidebar from './components/DocumentSidebar';
import SummaryHighlight from './components/SummaryHighlight';
import ImportantClauses from './components/ImportantClauses';
import PotentialRisks from './components/PotentialRisks';
import BeforeYouSign from './components/BeforeYouSign';
import SuggestedQuestions from './components/SuggestedQuestions';
import FloatingChatbot from './components/FloatingChatbot';
import MyDocumentsView from './components/MyDocumentsView';
import ClauseDetailModal from './components/ClauseDetailModal';
import ReportModal from './components/ReportModal';
import AuthView from './components/AuthView';
import { apiService } from './services/apiService';
import { SAMPLE_DOCUMENTS } from './data/mockData';

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState(() => apiService.getCurrentUser());
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(true);

  // Navigation & View State: 'home' | 'analysis' | 'my-documents'
  const [activeNav, setActiveNav] = useState('home');
  const [hasUploadedDoc, setHasUploadedDoc] = useState(false);
  const [currentDocId, setCurrentDocId] = useState(null);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [documentsList, setDocumentsList] = useState([]);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState(null);
  const [processingFileName, setProcessingFileName] = useState('');

  const [chatInitialQuestion, setChatInitialQuestion] = useState('');

  // Modals
  const [selectedClause, setSelectedClause] = useState(null);
  const [reportModalDoc, setReportModalDoc] = useState(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState('');

  // Verify auth session on initial load
  useEffect(() => {
    let isMounted = true;
    apiService.verifyAuthServer().then((user) => {
      if (isMounted) {
        setCurrentUser(user);
        setIsVerifyingAuth(false);
      }
    }).catch(() => {
      if (isMounted) setIsVerifyingAuth(false);
    });
    return () => { isMounted = false; };
  }, []);

  // Load user document history whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      apiService.getDocumentsList().then((docs) => {
        setDocumentsList(docs);
        if (docs.length > 0) {
          setCurrentDoc(docs[0]);
          setCurrentDocId(docs[0].id);
          setHasUploadedDoc(true);
        } else {
          setCurrentDoc(null);
          setCurrentDocId(null);
          setHasUploadedDoc(false);
        }
      });
    }
  }, [currentUser?.email, currentUser?.id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setActiveNav('home');
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    apiService.logoutUser();
    setCurrentUser(null);
    setCurrentDoc(null);
    setCurrentDocId(null);
    setHasUploadedDoc(false);
    setDocumentsList([]);
    setActiveNav('home');
    showToast('Logged out successfully.');
  };

  // Switch or load document
  const handleSelectDocument = async (docId) => {
    const doc = await apiService.getDocumentById(docId);
    if (doc) {
      setCurrentDoc(doc);
      setCurrentDocId(doc.id);
      setHasUploadedDoc(true);
      setActiveNav('analysis');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle file upload from user with real RAG backend
  const handleFileUpload = async (file, language = 'en') => {
    setIsProcessing(true);
    setProcessingFileName(file.name);
    setCurrentStage({ name: 'Uploading PDF to secure analysis sandbox...', progress: 15 });

    try {
      const newDoc = await apiService.uploadDocument(file, language, (stage) => {
        setCurrentStage(stage);
      });

      const updatedList = await apiService.getDocumentsList();
      setDocumentsList(updatedList);
      setCurrentDoc(newDoc);
      setCurrentDocId(newDoc.id);
      setHasUploadedDoc(true);
      setIsProcessing(false);
      setActiveNav('analysis');
      const langName = language === 'gu' ? 'Gujarati' : language === 'hi' ? 'Hindi' : 'English';
      showToast(`Analyzed ${newDoc.name} successfully in ${langName}!`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setIsProcessing(false);
      console.error('Upload Error:', err);
      alert(err.message || 'Error uploading document. Please check your backend connection.');
    }
  };

  // Re-analyze document in a different language
  const handleReanalyzeDocument = async (docId, language = 'en') => {
    if (!docId) return;
    setIsProcessing(true);
    setProcessingFileName(currentDoc?.name || 'Document');
    const langName = language === 'gu' ? 'Gujarati' : language === 'hi' ? 'Hindi' : 'English';
    setCurrentStage({ name: `Re-analyzing document in ${langName}...`, progress: 50 });

    try {
      const updatedDoc = await apiService.reanalyzeDocument(docId, language);
      const updatedList = await apiService.getDocumentsList();
      setDocumentsList(updatedList);
      setCurrentDoc(updatedDoc);
      setCurrentDocId(updatedDoc.id);
      setIsProcessing(false);
      showToast(`Re-analyzed in ${langName}!`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setIsProcessing(false);
      console.error('Re-analysis error:', err);
      alert(err.message || 'Error re-analyzing document.');
    }
  };

  // Sample doc picker from Landing Hero (for demo/quick preview)
  const handleSelectSample = (sampleId) => {
    const doc = SAMPLE_DOCUMENTS.find((d) => d.id === sampleId) || SAMPLE_DOCUMENTS[0];
    setCurrentDoc(doc);
    setCurrentDocId(doc.id);
    setHasUploadedDoc(true);
    setActiveNav('analysis');
    showToast(`Loaded demo: ${doc.displayName}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigation router
  const handleNavigate = (targetNav) => {
    if (targetNav === 'home') {
      setActiveNav('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetNav === 'my-documents') {
      setActiveNav('my-documents');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetNav === 'analysis') {
      if (!hasUploadedDoc) {
        showToast('Please upload or select a document first.');
        return;
      }
      setActiveNav('analysis');
      setTimeout(() => {
        const el = document.getElementById('document-analysis-root');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    } else if (targetNav === 'before-you-sign') {
      if (!hasUploadedDoc) {
        showToast('Please upload or select a document first.');
        return;
      }
      setActiveNav('analysis');
      setTimeout(() => {
        const el = document.getElementById('before-you-sign');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Direct trigger to open chatbot with a specific question
  const handleOpenChatWithQuestion = (question) => {
    setChatInitialQuestion(question);
  };

  // Reset state to home
  const handleReset = () => {
    setHasUploadedDoc(false);
    setActiveNav('home');
    showToast('Reset view.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isVerifyingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-3 border-[#01162B] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#00385A]">Verifying Legal Lens Session...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated route guard
  if (!currentUser) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#01162B]">
      
      {/* Global Header */}
      <Header
        activeNav={activeNav}
        onNavigate={handleNavigate}
        currentDoc={currentDoc}
        hasUploadedDoc={hasUploadedDoc}
        documentsList={documentsList}
        onSwitchDocument={handleSelectDocument}
        onOpenChat={() => document.getElementById('legal-lens-assistant')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
        onReset={handleReset}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* Processing State View */}
        {isProcessing ? (
          <ProcessingView
            currentStage={currentStage}
            fileName={processingFileName}
            onCancel={() => setIsProcessing(false)}
          />
        ) : activeNav === 'home' ? (
          /* View 1: Home / Landing Upload Experience (Clean full-width, NO sidebar) */
          <HeroUpload
            onUpload={handleFileUpload}
            onSelectSample={handleSelectSample}
          />
        ) : activeNav === 'my-documents' ? (
          /* View 2: My Documents Library */
          <MyDocumentsView
            documentsList={documentsList}
            currentDoc={currentDoc}
            onSelectDocument={handleSelectDocument}
            onNewDocument={() => setActiveNav('home')}
            onDownloadReport={(doc) => setReportModalDoc(doc || currentDoc)}
          />
        ) : (
          /* View 3 & 4: Continuous document analysis with an integrated assistant panel */
          <div id="document-analysis-root" className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">

              <section className="lg:col-span-8 xl:col-span-8 bg-white rounded-3xl shadow-xl border border-[#D2DBEB]/80 overflow-hidden flex flex-col md:flex-row min-h-[850px] min-w-0">
                {/* Document Sidebar (Flush left navigation drawer) */}
                <DocumentSidebar
                  currentDoc={currentDoc}
                  documentsList={documentsList}
                  onSelectDocument={handleSelectDocument}
                  onNewDocument={() => setActiveNav('home')}
                  onReset={handleReset}
                />

                {/* Main Analysis Continuous Content Container */}
                <div className="flex-1 p-6 lg:p-8 space-y-8 overflow-x-hidden min-w-0">
                
                {/* 1. Document Header */}
                <DocumentHeader
                  document={currentDoc}
                  onDownloadReport={() => setReportModalDoc(currentDoc)}
                  onOpenChat={() => document.getElementById('legal-lens-assistant')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  onReanalyze={handleReanalyzeDocument}
                />

                {/* 2. Plain-Language Summary & Highlights */}
                <SummaryHighlight
                  document={currentDoc}
                  onOpenChat={handleOpenChatWithQuestion}
                />

                {/* 3. Important Clauses (with mandatory #01162B hover effect) */}
                <ImportantClauses
                  clauses={currentDoc?.clauses}
                  onSelectClause={(clause) => setSelectedClause(clause)}
                />

                {/* 4. Potential Areas of Concern (Risks) */}
                <PotentialRisks
                  risks={currentDoc?.risks}
                  onOpenChat={handleOpenChatWithQuestion}
                />

                {/* 5. Before You Sign (Continuous Interactive Checklist) */}
                <BeforeYouSign
                  checklist={currentDoc?.checklist}
                  onOpenChat={handleOpenChatWithQuestion}
                />

                {/* 6. Questions You May Want to Ask */}
                <SuggestedQuestions
                  suggestedQuestions={currentDoc?.suggestedQuestions}
                  onSelectQuestion={handleOpenChatWithQuestion}
                />

                </div>
              </section>

              <aside id="legal-lens-assistant" className="lg:col-span-4 xl:col-span-4 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] min-h-[620px]">
                <FloatingChatbot
                  currentDoc={currentDoc}
                  initialQuestion={chatInitialQuestion}
                  onClearInitialQuestion={() => setChatInitialQuestion('')}
                />
              </aside>
            </div>
          </div>
        )}


      </main>

      {/* Clause Detail Inspector Modal */}
      {selectedClause && (
        <ClauseDetailModal
          clause={selectedClause}
          onClose={() => setSelectedClause(null)}
          onOpenChat={handleOpenChatWithQuestion}
        />
      )}

      {/* Printable Report Modal */}
      {reportModalDoc && (
        <ReportModal
          document={reportModalDoc}
          onClose={() => setReportModalDoc(null)}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-[#01162B] px-4 py-2 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          {toastMessage}
        </div>
      )}

      {/* Global Footer with Trust Badges & Legal Disclaimer */}
      <Footer />

    </div>
  );
}
