import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Briefcase, 
  Home, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  Shield, 
  CheckCircle,
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import { SUPPORTED_CATEGORIES, SAMPLE_DOCUMENTS } from '../data/mockData';

export default function HeroUpload({ onUpload, onSelectSample }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const fileInputRef = useRef(null);

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
      setErrorMsg('Please upload a valid legal document (.PDF, .DOCX, or .TXT format).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('File size exceeds 25 MB. Please upload a smaller document.');
      return;
    }

    onUpload(file, selectedLanguage);
  };

  // Helper icon selector
  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Briefcase': return <Briefcase className="h-4 w-4 text-[#6A90B4]" />;
      case 'Home': return <Home className="h-4 w-4 text-[#6A90B4]" />;
      case 'ShieldCheck': return <ShieldCheck className="h-4 w-4 text-[#6A90B4]" />;
      case 'AlertCircle': return <AlertCircle className="h-4 w-4 text-[#6A90B4]" />;
      default: return <FileText className="h-4 w-4 text-[#6A90B4]" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-10 xl:px-12 animate-in fade-in duration-300">
      
      {/* Hero Headline */}

      <div className="text-center space-y-3 mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#6A90B4]/15 px-3.5 py-1 text-xs font-semibold text-[#00385A] border border-[#6A90B4]/30">
          <Sparkles className="h-3.5 w-3.5 text-[#00385A]" />
          <span>AI-Powered Legal Clarity</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#01162B]">
          Know <span className="text-[#00385A] relative underline decoration-[#6A90B4]/40 decoration-4 underline-offset-8">Before You Sign</span>.
        </h1>
        
        <p className="mx-auto max-w-2xl text-sm sm:text-base text-[#00385A]/80 font-normal leading-relaxed">
          Upload any legal document and get AI-powered insights, plain-language explanations, and actionable next steps.
        </p>
      </div>

      {/* Language Selection Bar */}
      <div className="mb-6 flex flex-col items-center gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#6A90B4]">
          Select Analysis Language:
        </label>
        <div className="inline-flex rounded-xl bg-[#F0F4F8] p-1 border border-[#D2DBEB] shadow-2xs">
          <button
            type="button"
            onClick={() => setSelectedLanguage('en')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              selectedLanguage === 'en'
                ? 'bg-[#01162B] text-white shadow-xs'
                : 'text-[#00385A] hover:bg-white'
            }`}
          >
            <span>🇺🇸</span> English
          </button>
          <button
            type="button"
            onClick={() => setSelectedLanguage('hi')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              selectedLanguage === 'hi'
                ? 'bg-[#01162B] text-white shadow-xs'
                : 'text-[#00385A] hover:bg-white'
            }`}
          >
            <span>🇮🇳</span> हिन्दी (Hindi)
          </button>
          <button
            type="button"
            onClick={() => setSelectedLanguage('gu')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              selectedLanguage === 'gu'
                ? 'bg-[#01162B] text-white shadow-xs'
                : 'text-[#00385A] hover:bg-white'
            }`}
          >
            <span>🇮🇳</span> ગુજરાતી (Gujarati)
          </button>
        </div>
      </div>

      {/* Main Upload Drop Zone Card */}
      <div className="mx-auto max-w-2xl">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 bg-white ${
            isDragOver
              ? 'border-[#00385A] bg-[#6A90B4]/10 shadow-lg scale-[1.01]'
              : 'border-[#94A2BF]/60 hover:border-[#6A90B4] hover:bg-[#F0F4F8]/60 shadow-xs'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
          />

          {/* Upload Icon Container */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0F4F8] border border-[#D2DBEB] text-[#00385A] mb-4 shadow-2xs group-hover:scale-105 transition-transform">
            <UploadCloud className="h-8 w-8 text-[#00385A]" />
          </div>

          <p className="text-base font-semibold text-[#01162B]">
            Drag &amp; drop your document here
          </p>
          <p className="text-xs text-[#94A2BF] mt-1 mb-5">
            or click to browse from your computer (PDF, DOCX up to 25MB)
          </p>

          {/* Upload Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00385A] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#01162B] focus:outline-hidden focus:ring-2 focus:ring-[#6A90B4] transition-all"
          >
            <UploadCloud className="h-4 w-4" />
            Upload PDF
          </button>
        </div>

        {/* Error message alert */}
        {errorMsg && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200 animate-in fade-in duration-200">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Quick Launch Sample Documents */}
      <div className="mt-8 mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-[#94A2BF] mb-3">
          Or explore with pre-analyzed sample agreements:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SAMPLE_DOCUMENTS.map((doc) => (
            <button
              key={doc.id}
              onClick={() => onSelectSample(doc.id)}
              className="flex flex-col items-center p-3 rounded-xl bg-white border border-[#D2DBEB] hover:border-[#6A90B4] hover:bg-[#F0F4F8] transition-all text-left shadow-2xs group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0F4F8] group-hover:bg-[#01162B] group-hover:text-white transition-colors mb-2 text-[#00385A]">
                <FileCheck className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-[#01162B] truncate w-full text-center">
                {doc.displayName}
              </span>
              <span className="text-[10px] text-[#6A90B4] mt-0.5 font-medium">
                {doc.pages} pages · {doc.riskLevel}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Supported Documents Categories Grid */}
      <div className="mt-12">
        <div className="text-center mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#94A2BF]">
            Supported Documents
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {SUPPORTED_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2.5 rounded-xl border border-[#D2DBEB]/80 bg-white p-3 shadow-2xs hover:border-[#6A90B4] hover:bg-[#F0F4F8]/50 transition-all"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F0F4F8] border border-[#D2DBEB]/60">
                {getCategoryIcon(cat.icon)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-[#01162B] truncate">
                  {cat.name}
                </p>
                <p className="text-[10px] text-[#6A90B4] truncate">
                  {cat.count}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Privacy Assurance Notice */}
      <div className="mt-8 rounded-xl bg-white/70 p-4 border border-[#D2DBEB]/70 text-center flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-[#00385A]">
        <div className="flex items-center gap-1.5 font-semibold text-[#01162B]">
          <Shield className="h-4 w-4 text-[#6A90B4]" />
          <span>Your documents are secure and private.</span>
        </div>
        <span className="hidden sm:inline text-[#94A2BF]">·</span>
        <span>We do not store your files. This tool provides information, not legal advice.</span>
      </div>

    </div>
  );
}

