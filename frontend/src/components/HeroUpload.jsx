import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Briefcase, 
  Home as HomeIcon, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  Shield, 
  CheckCircle,
  FileCheck,
  AlertTriangle,
  Scale,
  Gavel,
  BookOpen,
  MessageSquare,
  BarChart3,
  HelpCircle,
  Clock,
  Download,
  Eye
} from 'lucide-react';
import { SUPPORTED_CATEGORIES, SAMPLE_DOCUMENTS } from '../data/mockData';
import { apiService } from '../services/apiService';

export default function HeroUpload({ 
  onUpload, 
  onSelectSample,
  currentUser,
  documentsList,
  onSelectDocument,
  onDownloadReport,
  onOpenChat
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const fileInputRef = useRef(null);

  const activeUser = currentUser || apiService.getCurrentUser();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setErrorMsg('');
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndUpload(files[0]);
    }
  };

  const handleFileInput = (e) => {
    setErrorMsg('');
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndUpload(files[0]);
    }
  };

  const validateAndUpload = (file) => {
    const validExtensions = ['.pdf', '.docx', '.txt', '.doc'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExt)) {
      setErrorMsg('Please upload a valid legal document (.PDF format recommended).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('File size exceeds 25 MB limit.');
      return;
    }

    onUpload(file, selectedLanguage);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-10 xl:px-12 animate-in fade-in duration-300 space-y-12">
      
      {/* HERO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl bg-white p-8 sm:p-12 border border-[#D2DBEB]/80 shadow-md relative overflow-hidden">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#6A90B4]/10 blur-3xl pointer-events-none" />

        {/* Left Hero Content */}
        <div className="lg:col-span-7 space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#6A90B4]/15 px-3.5 py-1 text-xs font-bold text-[#00385A] border border-[#6A90B4]/30">
            <Sparkles className="h-3.5 w-3.5 text-[#00385A]" />
            <span>AI-Powered Legal Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#01162B] leading-tight">
            Hello, {activeUser?.name || 'Legal Lens User'} 👋
          </h1>

          <p className="text-base sm:text-lg text-[#00385A]/80 font-normal leading-relaxed max-w-xl">
            Turn complex legal documents into clear insights. Upload any contract, agreement, or lease to detect risks and know your next steps.
          </p>

          {/* Upload Primary Button */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2.5 rounded-2xl bg-[#01162B] hover:bg-[#00385A] px-7 py-3.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
            >
              <UploadCloud className="h-5 w-5 text-[#6A90B4]" />
              <span>Upload Document</span>
            </button>

            {/* Language Selector */}
            <div className="inline-flex rounded-xl bg-[#F0F4F8] p-1 border border-[#D2DBEB]">
              <button
                type="button"
                onClick={() => setSelectedLanguage('en')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedLanguage === 'en' ? 'bg-[#01162B] text-white shadow-2xs' : 'text-[#00385A]'
                }`}
              >
                🇺🇸 English
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('hi')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedLanguage === 'hi' ? 'bg-[#01162B] text-white shadow-2xs' : 'text-[#00385A]'
                }`}
              >
                🇮🇳 हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('gu')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedLanguage === 'gu' ? 'bg-[#01162B] text-white shadow-2xs' : 'text-[#00385A]'
                }`}
              >
                🇮🇳 ગુજરાતી
              </button>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
          />

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right Hero Illustration SVG (Scales + Legal Books + Document + Gavel) */}
        <div className="lg:col-span-5 relative z-10 flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm aspect-square rounded-3xl legal-pattern-bg border border-[#6A90B4]/30 shadow-xl flex flex-col items-center justify-center p-6 text-center text-white overflow-hidden">
            
            {/* Legal Symbolism Icons Floating Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00223D] border border-[#6A90B4]/40 text-[#6A90B4]">
                <Scale className="h-7 w-7 text-[#6A90B4]" />
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00223D] border border-[#6A90B4]/40 text-[#6A90B4]">
                <Gavel className="h-7 w-7 text-[#6A90B4]" />
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00223D] border border-[#6A90B4]/40 text-[#6A90B4]">
                <BookOpen className="h-7 w-7 text-[#6A90B4]" />
              </div>
            </div>

            <h3 className="text-lg font-extrabold text-white tracking-tight">LEGAL LENS AI</h3>
            <p className="text-xs text-[#A2C4D9] mt-1 max-w-xs leading-relaxed">
              Drag &amp; drop your agreement below or click to analyze.
            </p>

            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`mt-5 w-full rounded-2xl border-2 border-dashed p-4 transition-all cursor-pointer ${
                isDragOver ? 'border-white bg-[#00385A]/80' : 'border-[#6A90B4]/50 bg-[#00223D]/60 hover:bg-[#00223D]'
              }`}
            >
              <FileText className="h-6 w-6 text-[#6A90B4] mx-auto mb-1" />
              <span className="text-xs font-bold text-white">Drop PDF Contract Here</span>
            </div>

          </div>
        </div>

      </div>

      {/* 3 FEATURE CARDS */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-[#01162B] tracking-tight">
          What Legal Lens Does For You
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Document Analysis */}
          <div className="rounded-3xl bg-white p-6 border border-[#D2DBEB]/80 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0F4F8] text-[#01162B] border border-[#D2DBEB]">
              <BarChart3 className="h-6 w-6 text-[#00385A]" />
            </div>
            <h3 className="text-lg font-bold text-[#01162B]">Document Analysis</h3>
            <p className="text-xs text-[#00385A]/80 leading-relaxed">
              Get risk scores, key clauses, plain-language summaries, and detailed legal insights instantly.
            </p>
          </div>

          {/* Card 2: Chat with Document */}
          <div className="rounded-3xl bg-white p-6 border border-[#D2DBEB]/80 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0F4F8] text-[#01162B] border border-[#D2DBEB]">
              <MessageSquare className="h-6 w-6 text-[#00385A]" />
            </div>
            <h3 className="text-lg font-bold text-[#01162B]">Chat with Document</h3>
            <p className="text-xs text-[#00385A]/80 leading-relaxed">
              Ask questions and get accurate, grounded answers backed by specific page citations.
            </p>
          </div>

          {/* Card 3: Recommended Questions */}
          <div className="rounded-3xl bg-white p-6 border border-[#D2DBEB]/80 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0F4F8] text-[#01162B] border border-[#D2DBEB]">
              <HelpCircle className="h-6 w-6 text-[#00385A]" />
            </div>
            <h3 className="text-lg font-bold text-[#01162B]">Recommended Questions</h3>
            <p className="text-xs text-[#00385A]/80 leading-relaxed">
              Explore important contract questions tailored automatically to your uploaded document.
            </p>
          </div>

        </div>
      </div>

      {/* RECENT DOCUMENTS SECTION */}
      {documentsList && documentsList.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#01162B] tracking-tight">
              Recent Documents
            </h2>
            <span className="text-xs font-semibold text-[#6A90B4]">
              {documentsList.length} Analyzed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {documentsList.slice(0, 6).map((doc) => {
              const isHigh = doc.riskLevel === 'High' || doc.risk_classification === 'High Risk' || (doc.risk_level >= 8);
              const isMed = doc.riskLevel === 'Medium' || doc.risk_classification === 'Medium Risk' || (doc.risk_level >= 5 && doc.risk_level <= 7);

              return (
                <div
                  key={doc.id}
                  className="rounded-3xl bg-white p-5 border border-[#D2DBEB]/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0F4F8] text-[#00385A] border border-[#D2DBEB]">
                        <FileText className="h-5 w-5 text-[#6A90B4]" />
                      </div>

                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        isHigh ? 'bg-red-50 text-red-700 border border-red-200' : isMed ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {doc.riskScore || `${doc.riskLevel || 'Low'} Risk`}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#01162B] mb-1 truncate" title={doc.name}>
                      {doc.name}
                    </h3>
                    <p className="text-xs text-[#6A90B4] font-medium mb-3">
                      {doc.type} · {doc.uploadDate || 'Recently analyzed'}
                    </p>

                    <p className="text-xs text-[#00385A]/80 line-clamp-2 leading-relaxed mb-4">
                      {doc.executiveSummary || doc.summaryHighlight?.takeaway || 'Legal document analyzed by Legal Lens RAG Engine.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#D2DBEB]/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectDocument(doc.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#01162B] hover:bg-[#00385A] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Report</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          onSelectDocument(doc.id);
                          setTimeout(() => {
                            document.getElementById('legal-lens-assistant')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 100);
                        }}
                        className="p-1.5 text-[#6A90B4] hover:text-[#01162B] rounded-lg hover:bg-[#F0F4F8] transition-colors cursor-pointer"
                        title="Chat with document"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDownloadReport(doc)}
                        className="p-1.5 text-[#6A90B4] hover:text-[#01162B] rounded-lg hover:bg-[#F0F4F8] transition-colors cursor-pointer"
                        title="Download report"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SAMPLE DEMO CONTRACTS */}
      <div className="rounded-3xl bg-white p-8 border border-[#D2DBEB]/80 shadow-xs text-center space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[#6A90B4]">
          Or explore sample pre-analyzed agreements:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SAMPLE_DOCUMENTS.map((doc) => (
            <button
              key={doc.id}
              onClick={() => onSelectSample(doc.id)}
              className="flex flex-col items-center p-3.5 rounded-2xl bg-[#F0F4F8] border border-[#D2DBEB] hover:border-[#01162B] hover:bg-white transition-all text-left shadow-2xs group cursor-pointer"
            >
              <FileCheck className="h-5 w-5 text-[#00385A] mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-[#01162B] truncate w-full text-center">
                {doc.displayName}
              </span>
              <span className="text-[10px] text-[#6A90B4] font-medium">
                {doc.riskLevel} Risk
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
